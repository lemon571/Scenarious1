#include "view.hpp"

#include <fmt/format.h>
#include <algorithm>
#include <cstddef>
#include <userver/formats/bson/serialize.hpp>
#include <userver/storages/mongo/bulk_ops.hpp>
#include <vector>

#include <userver/clients/dns/component.hpp>
#include <userver/components/component.hpp>
#include <userver/formats/bson/bson_builder.hpp>
#include <userver/formats/bson/inline.hpp>
#include <userver/formats/bson/types.hpp>
#include <userver/formats/bson/value.hpp>
#include <userver/formats/bson/value_builder.hpp>
#include <userver/formats/json.hpp>
#include <userver/formats/json/value.hpp>
#include <userver/formats/json/value_builder.hpp>
#include <userver/http/status_code.hpp>
#include <userver/logging/log.hpp>
#include <userver/server/handlers/http_handler_base.hpp>
#include <userver/storages/mongo/component.hpp>
#include <userver/storages/mongo/options.hpp>
#include <userver/storages/mongo/pool.hpp>
#include <userver/storages/mongo/write_result.hpp>

#include "../../../lib/create_new_version.hpp"
#include "../../../lib/get_children_blocks.hpp"
#include "../../../lib/get_latest_version.hpp"
#include "../../../lib/update_block_with_json.hpp"
#include "../../../lib/get_user_role_by_scenario_id.hpp"
#include "../../../models/block.hpp"

namespace blocks::update_block {

namespace {

class UpdateBlockChildren final
    : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "handler-update-block-children";
  UpdateBlockChildren(
      const userver::components::ComponentConfig& config,
      const userver::components::ComponentContext& component_context)
      : HttpHandlerBase(config, component_context),
        mongo_pool_(component_context
                        .FindComponent<userver::components::Mongo>("mongo-db-1")
                        .GetPool()) {}
  std::string HandleRequestThrow(
      const userver::server::http::HttpRequest& request,
      userver::server::request::RequestContext& context) const override {
    auto request_body =
        userver::formats::json::FromString(request.RequestBody());
    auto scenario_id =
        request_body["scenario_id"].As<std::optional<std::string>>();
    auto block_id = request.GetPathArg("block_id");

    if (!scenario_id.has_value() && !request_body.HasMember("blocks") &&
        !request_body["blocks"].IsArray()) {
      auto& error_response = request.GetHttpResponse();
      error_response.SetStatus(userver::http::kBadRequest);
      return {};
    }

    std::unordered_map<userver::formats::bson::Oid,
                       userver::formats::json::Value>
        blocks_json_data;
    for (const auto& single_block_json : request_body["blocks"]) {
      if (!single_block_json.HasMember("id")) {
        auto& error_response = request.GetHttpResponse();
        error_response.SetStatus(userver::http::kBadRequest);
        return {};
      }
      userver::formats::bson::Oid block_oid_from_json;
      try {
        block_oid_from_json = userver::formats::bson::Oid(
            single_block_json["id"].As<std::string>());
      } catch (const userver::formats::bson::BsonException&) {
        auto& error_response = request.GetHttpResponse();
        error_response.SetStatus(userver::http::kBadRequest);
        return {};
      }
      blocks_json_data[block_oid_from_json] = single_block_json;
    }

    userver::formats::bson::Oid scenario_oid;
    userver::formats::bson::Oid parent_oid;
    try {
      scenario_oid = userver::formats::bson::Oid(scenario_id.value());
      parent_oid = userver::formats::bson::Oid(block_id);
    } catch (userver::formats::bson::BsonException&) {
      auto& error_response = request.GetHttpResponse();
      error_response.SetStatus(userver::http::kBadRequest);
      return {};
    }

    context.SetData("user_id", std::string("68a0ae31f69abf476d01db69"));
  std::string user_id_str = context.GetData<std::string>("user_id");
    auto user_oid = userver::formats::bson::Oid(user_id_str);

    auto user_role = scenariosus::GetUserRoleBySceanrioId(scenario_oid, user_oid, mongo_pool_);
    if (!user_role) {
        auto& error_response = request.GetHttpResponse();
        error_response.SetStatus(userver::server::http::HttpStatus::kForbidden);
        return std::string(R"({"error": "this scenario is not available for this user."})");
    } else if (user_role.value() != scenario::models::Role::Lead &&
               user_role.value() != scenario::models::Role::ScreenWriter) {
        auto& error_response = request.GetHttpResponse();
        error_response.SetStatus(userver::server::http::HttpStatus::kForbidden);
        return std::string(R"({"error": "access denied, user role does not grant this permission."})");
    }

    auto scenario_collection = mongo_pool_->GetCollection("scenarios");
    auto scenario_count_result = scenario_collection.Count(
        userver::formats::bson::MakeDoc("_id", scenario_oid));
    auto blocks_collection = mongo_pool_->GetCollection("blocks");

    if (!scenario_count_result) {
      auto& error_response = request.GetHttpResponse();
      error_response.SetStatus(userver::http::kNotFound);
      return {};
    }

    auto latest_version =
        scenariosus::GetLatestVersion(scenario_oid, mongo_pool_);

    if (!latest_version.has_value()) {
      auto& error_response = request.GetHttpResponse();
      error_response.SetStatus(userver::http::kInternalServerError);
      return {};
    }

    std::optional<userver::formats::bson::Value> parent_block_bson;
    auto parent_block_find = blocks_collection.FindOne(MakeDoc(
        "_id", MakeDoc("$in", latest_version.value()), "block_id", parent_oid));
    if (!parent_block_find.has_value()) {
      auto& error_response = request.GetHttpResponse();
      error_response.SetStatus(userver::http::kInternalServerError);
      return {};
    }
    parent_block_bson = std::move(parent_block_find);
    auto blocks_to_work_with =
        parent_block_bson.value()["children"]
            .As<std::vector<userver::formats::bson::Oid>>();

    auto blocks_vec = blocks_to_work_with;
    std::vector<userver::formats::bson::Oid> blocks_to_search;
    blocks_to_search.reserve(blocks_vec.size());
    for (const auto& block_oid : blocks_vec) {
      if (blocks_json_data.count(block_oid)) {
        blocks_to_search.push_back(block_oid);
      }
    }

    if (blocks_to_search.size() != blocks_json_data.size()) {
      auto& error_response = request.GetHttpResponse();
      error_response.SetStatus(userver::http::kNotFound);
      return {};
    }

    auto blocks_search_result =
        blocks_collection.Find(userver::formats::bson::MakeDoc(
            "_id", userver::formats::bson::MakeDoc("$in", blocks_to_search)));

    std::vector<userver::formats::bson::Document> updated_blocks_bson;
    updated_blocks_bson.reserve(blocks_vec.size() + 1);

    for (const auto& single_block_bson : blocks_search_result) {
      auto block_oid =
          single_block_bson["_id"].As<userver::formats::bson::Oid>();
      if (!blocks_json_data.count(block_oid)) continue;

      auto new_block_data = scenariosus::BlockFromBson(single_block_bson);
      scenariosus::UpdateBlockWithJson(new_block_data,
                                       blocks_json_data[block_oid]);
      auto new_block_bson =
          userver::formats::bson::ValueBuilder(new_block_data).ExtractValue();

      auto changed_iter =
          std::find(blocks_vec.begin(), blocks_vec.end(), block_oid);
      if (changed_iter == blocks_vec.end()) continue;
      updated_blocks_bson.push_back(new_block_bson);
      *changed_iter = new_block_data.id;
    }

    userver::formats::bson::ValueBuilder updated_blocks_builder;
    for (const auto& single_block_oid : blocks_vec) {
      updated_blocks_builder.PushBack(single_block_oid);
    }
    auto updated_children_bson = updated_blocks_builder.ExtractValue();

    userver::formats::bson::ValueBuilder new_parent_block_builder(
        parent_block_bson.value());
    auto new_parent_oid = userver::formats::bson::Oid();
    new_parent_block_builder["_id"] = new_parent_oid;
    new_parent_block_builder["children"] = updated_children_bson;

    updated_blocks_bson.push_back(new_parent_block_builder.ExtractValue());
    auto parent_block_insert =
        blocks_collection.InsertMany(updated_blocks_bson);
    if (parent_block_insert.InsertedCount() != updated_blocks_bson.size()) {
      auto& error_response = request.GetHttpResponse();
      LOG_ERROR() << "Can't insert blocks with oid";
      error_response.SetStatus(userver::http::kInternalServerError);
      return {};
    }

    {
      auto parent_block_iter = std::find(
          latest_version->begin(), latest_version->end(),
          parent_block_bson.value()["_id"].As<userver::formats::bson::Oid>());
      if (parent_block_iter != latest_version->end()) {
        LOG_INFO() << "Creating new version";
        *parent_block_iter = new_parent_oid;
        scenariosus::CreateNewVersion(scenario_oid, user_oid, latest_version.value(),
                                      mongo_pool_);
      }
    }

    return "success";
  }

 private:
  userver::storages::mongo::PoolPtr mongo_pool_;
};

}  // namespace
void AppendUpdateBlockChildren(
    userver::components::ComponentList& component_list) {
  component_list.Append<UpdateBlockChildren>();
}

}  // namespace blocks::update_block
