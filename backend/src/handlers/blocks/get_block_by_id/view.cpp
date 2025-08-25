#include "view.hpp"

#include <fmt/format.h>

#include <iostream>
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

#include "../../../models/block.hpp"

namespace scenariosus {

GetBlockById::GetBlockById(
    const userver::components::ComponentConfig& config,
    const userver::components::ComponentContext& component_context)
    : HttpHandlerBase(config, component_context),
      mongo_pool_(component_context
                      .FindComponent<userver::components::Mongo>("mongo-db-1")
                      .GetPool()) {}

std::string GetBlockById::HandleRequestThrow(
    const userver::server::http::HttpRequest& request,
    userver::server::request::RequestContext&) const {
  using userver::formats::bson::MakeArray;
  using userver::formats::bson::MakeDoc;
  namespace bson = userver::formats::bson;

  const auto& block_id = request.GetPathArg("block_id");
  const auto oid = bson::Oid(block_id);

  auto in_coll = mongo_pool_->GetCollection("blocks");

  auto res_find = in_coll.FindOne(MakeDoc("_id", oid));

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