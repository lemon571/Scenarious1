#include "view.hpp"

#include <fmt/format.h>
#include <algorithm>
#include <cstddef>

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

#include <vector>

#include "../../../lib/get_latest_version.hpp"
#include "../../../lib/get_user_role_by_scenario_id.hpp"
#include "../../../models/block.hpp"

namespace blocks::delete_block {

namespace {

class DeleteBlockById final
    : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "handler-delete-block";
  DeleteBlockById(
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
    auto parent_block_id =
        request_body["parent_block_id"].As<std::optional<std::string>>();

    if (!scenario_id.has_value()) {
      auto& error_response = request.GetHttpResponse();
      error_response.SetStatus(userver::http::kBadRequest);
      return {};
    }

    userver::formats::bson::Oid scenario_oid;
    userver::formats::bson::Oid block_oid;
    try {
      scenario_oid = userver::formats::bson::Oid(scenario_id.value());
      block_oid = userver::formats::bson::Oid(block_id);
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

    userver::formats::bson::Value blocks_to_work;
    userver::formats::bson::Oid parent_oid;
    std::optional<userver::formats::bson::Value> parent_block_bson;

    auto latest_version =
        scenariosus::GetLatestVersion(scenario_oid, mongo_pool_);

    if (parent_block_id.has_value()) {
      try {
        parent_oid = userver::formats::bson::Oid(parent_block_id.value());
      } catch (userver::formats::bson::BsonException&) {
        auto& error_response = request.GetHttpResponse();
        error_response.SetStatus(userver::http::kBadRequest);
        return {};
      }

      auto block_search =
          blocks_collection.FindOne(userver::formats::bson::MakeDoc(
              "_id", userver::formats::bson::MakeDoc("$in", latest_version),
              "block_id", parent_oid));
      if (!block_search.has_value()) {
        return "success";
      }
      parent_block_bson = block_search.value();
      blocks_to_work = parent_block_bson.value()["children"];
    } else {
      auto blocks_search = scenario_collection.FindOne(
          userver::formats::bson::MakeDoc("_id", scenario_oid),
          userver::storages::mongo::options::Projection{"_id"}.Slice("versions",
                                                                     1, -1));
      if (blocks_search->HasMember("versions")) {
        blocks_to_work = blocks_search.value()["versions"][0]["used_blocks"];
      }
    }
    std::string result;

    if (!blocks_to_work.IsArray()) {
      auto& error_response = request.GetHttpResponse();
      error_response.SetStatus(userver::http::kInternalServerError);
      return {};
    }

    auto blocks_vec =
        blocks_to_work.As<std::vector<userver::formats::bson::Oid>>();
    auto target_block =
        std::find(blocks_vec.begin(), blocks_vec.end(), block_oid);

    if (target_block == blocks_vec.end()) {
      return "success";
    }

    blocks_vec.erase(target_block);

    userver::formats::bson::ValueBuilder updated_blocks_builder;
    for (const auto& single_block_oid : blocks_vec) {
      updated_blocks_builder.PushBack(single_block_oid);
    }
    auto updated_blocks_bson = updated_blocks_builder.ExtractValue();

    if (parent_block_id.has_value()) {
      // create new block based on old one
      userver::formats::bson::ValueBuilder new_parent_block_builder(
          parent_block_bson.value());
      auto new_parent_oid = userver::formats::bson::Oid();
      new_parent_block_builder["_id"] = new_parent_oid;
      new_parent_block_builder["children"] = updated_blocks_bson;
      auto blocks_insert =
          blocks_collection.InsertOne(new_parent_block_builder.ExtractValue());
      if (!blocks_insert.InsertedCount()) {
        auto& error_response = request.GetHttpResponse();
        LOG_ERROR() << "Can't insert new block with oid "
                    << new_parent_oid.ToString();
        error_response.SetStatus(userver::http::kInternalServerError);
        return {};
      }

      // get last version
      auto blocks_search = scenario_collection.FindOne(
          userver::formats::bson::MakeDoc("_id", scenario_oid),
          userver::storages::mongo::options::Projection{"_id"}.Slice("versions",
                                                                     1, -1));
      userver::formats::bson::Value old_blocks;
      old_blocks = blocks_search.value()["versions"][0]["used_blocks"];
      auto old_blocks_vec =
          old_blocks.As<std::vector<userver::formats::bson::Oid>>();

      auto parent_block_iter = std::find(
          old_blocks_vec.begin(), old_blocks_vec.end(),
          parent_block_bson.value()["_id"].As<userver::formats::bson::Oid>());

      if (parent_block_iter != old_blocks_vec.end()) {
        LOG_INFO() << "Creating new version";
        *parent_block_iter = new_parent_oid;
        userver::formats::bson::ValueBuilder new_version_builder;
        for (const auto& single_block_oid : old_blocks_vec) {
          new_version_builder.PushBack(single_block_oid);
        }
        auto blocks_update = scenario_collection.UpdateOne(
            userver::formats::bson::MakeDoc("_id", scenario_oid),
            userver::formats::bson::MakeDoc(
                "$push",
                userver::formats::bson::MakeDoc(
                    "versions", userver::formats::bson::MakeDoc(
                                    "version", 1337, "used_blocks",
                                    new_version_builder.ExtractValue()))));
      }
    } else {
      LOG_INFO() << "Creating new version";
      auto blocks_update = scenario_collection.UpdateOne(
          userver::formats::bson::MakeDoc("_id", scenario_oid),
          userver::formats::bson::MakeDoc(
              "$push", userver::formats::bson::MakeDoc(
                           "versions", userver::formats::bson::MakeDoc(
                                           "version", 1337, "used_blocks",
                                           updated_blocks_bson))));
    }

    return "success";
  }

 private:
  userver::storages::mongo::PoolPtr mongo_pool_;
};

}  // namespace
void AppendDeleteBlockById(userver::components::ComponentList& component_list) {
  component_list.Append<DeleteBlockById>();
}

}  // namespace blocks::delete_block
