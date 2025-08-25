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

#include "../../../lib/create_new_version.hpp"
#include "../../../lib/get_children_blocks.hpp"
#include "../../../lib/get_latest_version.hpp"

namespace blocks::move_block {

namespace {
class MoveBlock final : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "handler-move-block";

  MoveBlock(const userver::components::ComponentConfig& config,
            const userver::components::ComponentContext& component_context)
      : HttpHandlerBase(config, component_context),
        mongo_pool_(component_context
                        .FindComponent<userver::components::Mongo>("mongo-db-1")
                        .GetPool()) {}

  std::string HandleRequestThrow(
      const userver::server::http::HttpRequest& request,
      userver::server::request::RequestContext&) const override {
    auto request_body =
        userver::formats::json::FromString(request.RequestBody());
    auto scenario_id =
        request_body["scenario_id"].As<std::optional<std::string>>();
    auto block_id = request_body["block_id"].As<std::optional<std::string>>();
    auto parent_block_id =
        request_body["parent_block_id"].As<std::optional<std::string>>();
    auto new_pos = request_body["position"].As<std::optional<size_t>>();

    if (!scenario_id.has_value() || !block_id.has_value() ||
        !new_pos.has_value() || new_pos.value() < 1) {
      auto& error_response = request.GetHttpResponse();
      error_response.SetStatus(userver::http::kBadRequest);
      return {};
    }

    userver::formats::bson::Oid scenario_oid;
    userver::formats::bson::Oid block_oid;
    try {
      scenario_oid = userver::formats::bson::Oid(scenario_id.value());
      block_oid = userver::formats::bson::Oid(block_id.value());
    } catch (userver::formats::bson::BsonException&) {
      auto& error_response = request.GetHttpResponse();
      error_response.SetStatus(userver::http::kBadRequest);
      return {};
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

    std::optional<std::vector<userver::formats::bson::Oid>> blocks_to_work_with;
    userver::formats::bson::Oid parent_oid;
    std::optional<userver::formats::bson::Value> parent_block_bson;

    if (parent_block_id.has_value()) {
      try {
        parent_oid = userver::formats::bson::Oid(parent_block_id.value());
      } catch (userver::formats::bson::BsonException&) {
        auto& error_response = request.GetHttpResponse();
        error_response.SetStatus(userver::http::kBadRequest);
        return {};
      }
      blocks_to_work_with =
          scenariosus::GetChildrenBlocks(parent_oid, mongo_pool_);
    } else {
      blocks_to_work_with =
          scenariosus::GetLatestVersion(scenario_oid, mongo_pool_);
    }

    if (!blocks_to_work_with.has_value()) {
      auto& error_response = request.GetHttpResponse();
      error_response.SetStatus(userver::http::kInternalServerError);
      return {};
    }

    LOG_INFO() << "Got blocks to update";

    auto blocks_vec = blocks_to_work_with.value();
    auto target_block_iter =
        std::find(blocks_vec.begin(), blocks_vec.end(), block_oid);

    if (target_block_iter == blocks_vec.end()) {
      auto& error_response = request.GetHttpResponse();
      error_response.SetStatus(userver::http::kNotFound);
      return {};
    }

    if (new_pos.value() > blocks_vec.size()) {
      auto& error_response = request.GetHttpResponse();
      error_response.SetStatus(userver::http::kBadRequest);
      return {};
    }

    blocks_vec.erase(target_block_iter);
    blocks_vec.insert(blocks_vec.begin() + new_pos.value() - 1, block_oid);

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
      auto old_blocks_vec =
          scenariosus::GetLatestVersion(scenario_oid, mongo_pool_);
      if (!old_blocks_vec.has_value()) {
        auto& error_response = request.GetHttpResponse();
        error_response.SetStatus(userver::http::kInternalServerError);
        return {};
      }
      auto parent_block_iter =
          std::find(old_blocks_vec->begin(), old_blocks_vec->end(), parent_oid);
      if (parent_block_iter != old_blocks_vec->end()) {
        LOG_INFO() << "Creating new version";
        *parent_block_iter = new_parent_oid;
        scenariosus::CreateNewVersion(scenario_oid, userver::formats::bson::Oid(), old_blocks_vec.value(),
                                      mongo_pool_);
      }
    } else {
      LOG_INFO() << "Creating new version";
      scenariosus::CreateNewVersion(scenario_oid, userver::formats::bson::Oid(), blocks_vec, mongo_pool_);
    }

    return "success";
  }

 private:
  userver::storages::mongo::PoolPtr mongo_pool_;
};

}  // namespace

void AppendMoveBlock(userver::components::ComponentList& component_list) {
  component_list.Append<MoveBlock>();
}

}  // namespace blocks::move_block
