#include "view.hpp"
#include <iostream>
#include <string>
#include <userver/formats/bson.hpp>
#include <userver/formats/bson/document.hpp>
#include <userver/formats/bson/inline.hpp>
#include <userver/formats/bson/types.hpp>
#include <userver/formats/json.hpp>
#include <userver/formats/json/value.hpp>
#include <userver/formats/serialize/common_containers.hpp>
#include <userver/http/status_code.hpp>
#include <userver/storages/mongo/collection.hpp>
#include <userver/storages/mongo/component.hpp>
#include <userver/storages/mongo/options.hpp>

#include "../../../lib/create_new_version.hpp"
#include "../../../lib/get_children_blocks.hpp"
#include "../../../lib/get_latest_version.hpp"
#include "../../../lib/get_user_role_by_scenario_id.hpp"
#include "../../../models/block.hpp"

namespace bson = userver::formats::bson;

namespace scenariosus {

struct BlockRequest {
  std::string title;
  std::string color;
  std::string location;
  int64_t start;  // timestamp in milliseconds
  int64_t duration;
  std::vector<std::string> roles;
  std::string description;
};

BlockRequest ParseRequest(const userver::server::http::HttpRequest& request) {
  const auto& json = userver::formats::json::FromString(request.RequestBody());

  BlockRequest block;
  block.title = json["title"].As<std::string>();
  block.color = json["color"].As<std::string>();
  block.location = json["location"].As<std::string>();
  block.start = json["start"].As<int64_t>();
  block.duration = json["duration"].As<int64_t>();
  block.roles = json["roles"].As<std::vector<std::string>>();
  block.description = json["description"].As<std::string>();

  return block;
}

CreateBlock::CreateBlock(
    const userver::components::ComponentConfig& config,
    const userver::components::ComponentContext& component_context)
    : HttpHandlerBase(config, component_context),
      mongo_pool_(component_context
                      .FindComponent<userver::components::Mongo>("mongo-db-1")
                      .GetPool()) {}

std::string CreateBlock::HandleRequestThrow(
    const userver::server::http::HttpRequest& request,
    userver::server::request::RequestContext& context) const {
  using userver::formats::bson::MakeArray;
  using userver::formats::bson::MakeDoc;
  const auto& scenario_id = request.GetPathArg("scenario_id");
  const auto& block_id = request.GetPathArg("block_id");

  if (scenario_id.empty()) {
    request.SetResponseStatus(userver::server::http::HttpStatus::kBadRequest);
    return std::string(R"({"error": "scenario_id is required"})");
  }

  context.SetData("user_id", std::string("68a0ae31f69abf476d01db69"));
  std::string user_id_str = context.GetData<std::string>("user_id");
  auto user_oid = userver::formats::bson::Oid(user_id_str);

  auto user_role = scenariosus::GetUserRoleBySceanrioId(
      userver::formats::bson::Oid(scenario_id), user_oid, mongo_pool_);
  if(!user_role.has_value()) {
    auto& error_response = request.GetHttpResponse();
    error_response.SetStatus(userver::http::kForbidden);
    return {};
  }
  if(!(user_role.value() == scenario::models::Role::Lead)){
    auto& error_response = request.GetHttpResponse();
    error_response.SetStatus(userver::http::kForbidden);
    return {};
  }

  bool is_scenario_root = (block_id.empty() || block_id == "-1");

  auto block = ParseRequest(request);
  auto oid = userver::formats::bson::Oid();
  std::vector<Block> new_cb;

  // If using template
  if (request.HasArg("template_id")) {
    auto template_id = request.GetArg("template_id");

    auto blocks_coll = mongo_pool_->GetCollection("blocks");
    auto doc = blocks_coll.FindOne(MakeDoc("_id", oid));

    if (doc.has_value()) {
      auto block_bson = doc.value();
      block.description = block_bson["description"].As<std::string>();

      if (block_bson.HasMember("roles")) {
        block.roles = block_bson["roles"].As<std::vector<std::string>>();
      }

      if (block_bson.HasMember("location")) {
        block.location = block_bson["location"].As<std::string>();
      }

      if (block_bson.HasMember("start")) {
        block.start = block_bson["start"].As<int64_t>();
      }

      if (block_bson.HasMember("duration")) {
        block.duration = block_bson["duration"].As<int64_t>();
      }

      if (block_bson.HasMember("title")) {
        block.title = block_bson["title"].As<std::string>();
      }

      block.color = block_bson["color"].As<std::string>();

      std::optional<std::vector<Block>> children;
      if (block_bson.HasMember("children")) {
        children =
            block_bson["children"].As<std::optional<std::vector<Block>>>();
      }

      if (children.has_value()) {
        auto c_blocks = children.value();

        for (auto& it : c_blocks) {
          it.id = userver::formats::bson::Oid();
        }
        new_cb = c_blocks;

        //add as id
      }
    } else {
      request.SetResponseStatus(userver::server::http::HttpStatus::kBadRequest);
      return std::string(
          R"({"status": "error", "message": "Template with such id not found"})");
    }
  }

  auto document = MakeDoc(
      "_id", oid, "block_id", userver::formats::bson::Oid(), "title", block.title, "location",
      block.location, "start", block.start, "duration", block.duration,
      "color", block.color, "roles", block.roles, "comments", MakeArray(),
      "children", new_cb, "description", block.description);

  auto in_coll = mongo_pool_->GetCollection("blocks");

  auto res = in_coll.InsertOne(document);

  if (!res.InsertedCount()) {
    request.SetResponseStatus(userver::server::http::HttpStatus::kBadRequest);
    return std::string(R"({"status": "error", "message": "Failed to insert"})");
  }

  // TODO: Log

  auto sc_coll = mongo_pool_->GetCollection("scenarios");

  auto scenario = sc_coll.Count(bson::MakeDoc("_id", bson::Oid(scenario_id)));

  if (!scenario) {
    request.SetResponseStatus(userver::server::http::HttpStatus::kBadRequest);
    return std::string(
        R"({"status": "error", "message": "Scenario not found"})");
  }

  auto latest_version = GetLatestVersion(bson::Oid(scenario_id), mongo_pool_);

  if (!latest_version) {
    request.SetResponseStatus(userver::server::http::HttpStatus::kBadRequest);
    return std::string(
        R"({"status": "error", "message": "Version not found"})");
  }

  if (is_scenario_root) {
    // find scenario in scenario list, push_back
    latest_version->push_back(oid);

    auto new_version_result = CreateNewVersion(
        bson::Oid(scenario_id), user_oid, latest_version.value(), mongo_pool_);

    if (!new_version_result) {
      request.SetResponseStatus(
          userver::server::http::HttpStatus::kInternalServerError);
      return std::string(
          R"({"status": "error", "message": "Failed to update versions array"})");
    }

  } else {
    // find parent scenario in scenario list, push_back
    auto parent_block_bson =
        in_coll.FindOne(MakeDoc("_id", MakeDoc("$in", latest_version),
                                "block_id", bson::Oid(block_id)));

    if (!parent_block_bson) {
      request.SetResponseStatus(
          userver::server::http::HttpStatus::kInternalServerError);
      return std::string(
          R"({"status": "error", "message": "Failed to find parent block"})");
    }

    auto children = parent_block_bson.value()["children"]
                        .As<std::vector<userver::formats::bson::Oid>>();
    children.push_back(oid);

    userver::formats::bson::ValueBuilder new_parent_block_builder(
        parent_block_bson.value());
    auto new_parent_oid = userver::formats::bson::Oid();
    new_parent_block_builder["_id"] = new_parent_oid;
    new_parent_block_builder["children"] = children;

    auto result = in_coll.InsertOne(new_parent_block_builder.ExtractValue());

    if (result.InsertedCount() == 0) {
      request.SetResponseStatus(
          userver::server::http::HttpStatus::kInternalServerError);
      return std::string(
          R"({"status": "error", "message": "Failed to update parent block's children"})");
    }

    auto parent_block_iter =
        std::find(latest_version->begin(), latest_version->end(),
                  parent_block_bson.value()["_id"].As<bson::Oid>());
    if (parent_block_iter != latest_version->end()) {
      LOG_INFO() << "Creating new version";
      *parent_block_iter = new_parent_oid;
      scenariosus::CreateNewVersion(bson::Oid(scenario_id), user_oid,
                                    latest_version.value(), mongo_pool_);
    }
  }

  auto res_find = in_coll.FindOne(MakeDoc("_id", oid));

  if (!res_find) {
    request.SetResponseStatus(userver::server::http::HttpStatus::kBadRequest);
    return userver::formats::json::ToString(userver::formats::json::MakeObject(
        "status", "error", "message", "Failed to insert"));
  }

  auto added_block = scenariosus::BlockFromBson(res_find.value());

  return userver::formats::json::ToString(scenariosus::Serialize(
      added_block,
      userver::formats::serialize::To<userver::formats::json::Value>{}));
}

}  // namespace scenariosus