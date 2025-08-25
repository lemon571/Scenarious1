#include "view.hpp"

#include <fmt/format.h>

#include <string>
#include <userver/components/component_config.hpp>
#include <userver/components/component_context.hpp>
#include <userver/formats/bson.hpp>
#include <userver/formats/bson/document.hpp>
#include <userver/formats/bson/inline.hpp>
#include <userver/formats/bson/types.hpp>
#include <userver/formats/json.hpp>
#include <userver/formats/json/value.hpp>
#include <userver/formats/serialize/common_containers.hpp>
#include <userver/server/handlers/http_handler_base.hpp>
#include <userver/storages/mongo/collection.hpp>
#include <userver/storages/mongo/component.hpp>
#include <userver/storages/mongo/options.hpp>
#include "../../../lib/get_user_role_by_scenario_id.hpp"

#include "../../../lib/get_latest_version.hpp"
#include "../../../models/block.hpp"

namespace scenariosus {

LatestGetBlock::LatestGetBlock(
    const userver::components::ComponentConfig& config,
    const userver::components::ComponentContext& component_context)
    : HttpHandlerBase(config, component_context),
      mongo_pool_(component_context
                      .FindComponent<userver::components::Mongo>("mongo-db-1")
                      .GetPool()) {}

std::string LatestGetBlock::HandleRequestThrow(
    const userver::server::http::HttpRequest& request,
    userver::server::request::RequestContext& context) const {
  using userver::formats::bson::MakeArray;
  using userver::formats::bson::MakeDoc;
  namespace bson = userver::formats::bson;

  const auto& scenario_id = request.GetPathArg("scenario_id");
  const auto& block_id = request.GetPathArg("block_id");
  const auto oid = bson::Oid(block_id);

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

  auto latest_version =
      GetLatestVersion(userver::formats::bson::Oid(scenario_id), mongo_pool_);

  auto in_coll = mongo_pool_->GetCollection("blocks");

  auto res_find = in_coll.FindOne(
      MakeDoc("_id", MakeDoc("$in", latest_version), "block_id", oid));

  if (!res_find) {
    request.SetResponseStatus(userver::server::http::HttpStatus::kBadRequest);
    return userver::formats::json::ToString(userver::formats::json::MakeObject(
        "status", "error", "message", "Block not found"));
  }

  auto found_block = scenariosus::BlockFromBson(res_find.value());

  auto block_json = userver::formats::json::ValueBuilder(found_block);
  if(!found_block.children.empty()){
    auto children = in_coll.Find(userver::formats::bson::MakeDoc("_id", userver::formats::bson::MakeDoc("$in", found_block.children)));
    block_json["children"] = userver::formats::json::MakeArray();
    for(const auto& kid: children){
      block_json["children"].PushBack(scenariosus::BlockFromBson(kid));
    }
  }

  return userver::formats::json::ToString(block_json.ExtractValue());
}

}  // namespace scenariosus

namespace blocks::latest_get_block {

void AppendLatestGetBlock(
    userver::components::ComponentList& component_list) {
  component_list.Append<scenariosus::LatestGetBlock>();
}

}