#include "view.hpp"

#include <fmt/format.h>
#include <userver/clients/dns/component.hpp>
#include <userver/components/component.hpp>
#include <userver/formats/bson/value_builder.hpp>
#include <userver/formats/json.hpp>
#include <userver/formats/json/value_builder.hpp>
#include <userver/formats/json/inline.hpp>
#include <userver/server/handlers/http_handler_base.hpp>

#include <userver/formats/bson/inline.hpp>
#include <userver/formats/bson/binary.hpp>
#include <userver/formats/bson.hpp>
#include <userver/storages/mongo/component.hpp>
#include <userver/storages/mongo/options.hpp>
#include <userver/storages/mongo/operations.hpp>
#include <userver/formats/bson/serialize.hpp>
#include <userver/formats/serialize/common_containers.hpp>

#include "../../../models/block.hpp"
#include "../../../lib/get_user_role_by_scenario_id.hpp"

namespace blocks::get_blocks_by_scenario_id {

namespace {
class GetBlocksByScenarioId final
    : public userver::server::handlers::HttpHandlerBase {
private:
  void GetBlocksFromCursor(userver::storages::mongo::Cursor& cursor, userver::formats::json::ValueBuilder& vb) const {
    auto blocks_collection = mongo_pool_->GetCollection("blocks");
    
    for (const auto& doc : cursor) {
      bool blocks_exist = doc["blocks_exist"].As<bool>();
      if (!blocks_exist) {
        return;
      } else {
        auto versionBlocks = doc["versionBlocks"];
        for(const auto& block: versionBlocks) {
          auto block_data = scenariosus::BlockFromBson(block);
          LOG_INFO() << block_data.id;
          auto block_json = userver::formats::json::ValueBuilder(block_data);

          if(!block_data.children.empty()){
            auto children = blocks_collection.Find(userver::formats::bson::MakeDoc("_id", block_data.children));
            block_json["children"] = userver::formats::json::MakeArray();
            for(const auto& kid: children){
              block_json["children"].PushBack(scenariosus::BlockFromBson(kid));
            }
          }
          vb.PushBack(block_json.ExtractValue());
        }
      }
    }
  }
 public:
  static constexpr std::string_view kName = "handler-get-blocks-by-scenario-id";

  GetBlocksByScenarioId(
      const userver::components::ComponentConfig& config,
      const userver::components::ComponentContext& component_context)
      : HttpHandlerBase(config, component_context),
        mongo_pool_(component_context
          .FindComponent<userver::components::Mongo>("mongo-db-1")
          .GetPool()) {}

  std::string HandleRequestThrow(
      const userver::server::http::HttpRequest& request,
      userver::server::request::RequestContext& context) const override {

    using userver::formats::bson::MakeDoc;
    using userver::formats::bson::MakeArray;

    if (!request.HasPathArg("scenario_id")) {
      LOG_ERROR() << "GetBlocksByScenarioID: Request doen't have scenario id";
      request.SetResponseStatus(userver::server::http::HttpStatus::kBadRequest);
      return {"Missing scenario id"};
    }

    const auto& scenario_id = request.GetPathArg("scenario_id");

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
    
    userver::formats::json::ValueBuilder vb(userver::formats::json::Type::kArray);
    
    try {
      if(request.HasArg("timestamp")){
        if(!(user_role.value() == scenario::models::Role::Lead || 
                user_role.value() == scenario::models::Role::ScreenWriter)){
          auto& error_response = request.GetHttpResponse();
          error_response.SetStatus(userver::http::kForbidden);
          return {};
        }
        

        int timestamp;
        timestamp = std::stoi(request.GetArg("timestamp"));
        auto cursor = mongo_pool_->GetCollection("scenarios").Aggregate(
          MakeArray(
            MakeDoc("$match", MakeDoc("_id", userver::formats::bson::Oid(scenario_id) )),
            MakeDoc("$unwind", "$versions"),
            MakeDoc("$replaceRoot", MakeDoc("newRoot", "$versions")),
            MakeDoc("$match", MakeDoc("timestamp", timestamp)),
            MakeDoc("$lookup", MakeDoc(
              "from",  "blocks",
              "localField", "used_blocks",
              "foreignField", "_id",
              "as", "versionBlocks"
            )),
            MakeDoc("$project", MakeDoc(
              "blocks_exist", MakeDoc("$gt", MakeArray(MakeDoc("$size", "$versionBlocks"), 0)),
              "versionBlocks", 1
            ))
          )
        );

        if (!cursor) {
          return "[]";
          // request.SetResponseStatus(userver::server::http::HttpStatus::kBadRequest);
          // return userver::formats::json::ToString(
          //   userver::formats::json::MakeObject("status", "error", "message", "Can't find scenario")
          // );
        }

        GetBlocksFromCursor(cursor, vb);

      } else { 
        auto cursor = mongo_pool_->GetCollection("scenarios").Aggregate(
          userver::formats::bson::MakeArray(
            userver::formats::bson::MakeDoc("$match", userver::formats::bson::MakeDoc("_id", userver::formats::bson::Oid(scenario_id) )),
            userver::formats::bson::MakeDoc("$project", userver::formats::bson::MakeDoc("latestVersion", 
              userver::formats::bson::MakeDoc("$arrayElemAt", userver::formats::bson::MakeArray("$versions", -1))
            )),
            userver::formats::bson::MakeDoc("$unwind", "$latestVersion.used_blocks"),
            userver::formats::bson::MakeDoc("$lookup", userver::formats::bson::MakeDoc(
              "from",  "blocks",
              "localField", "latestVersion.used_blocks",
              "foreignField", "_id",
              "as", "versionBlocks"
            )),
            MakeDoc("$project", MakeDoc(
              "blocks_exist", MakeDoc("$gt", MakeArray(MakeDoc("$size", "$versionBlocks"), 0)),
              "versionBlocks", 1
            ))
          )
        );

        if (!cursor) {
          return "[]";
          // request.SetResponseStatus(userver::server::http::HttpStatus::kBadRequest);
          // return userver::formats::json::ToString(
          //   userver::formats::json::MakeObject("status", "error", "message", "Can't find scenario")
          // );
        }

        GetBlocksFromCursor(cursor, vb);
      }
    } catch (const std::exception& ex) {
        LOG_ERROR() << "MongoDB query failed: " << ex.what();
        request.SetResponseStatus(userver::server::http::HttpStatus::kInternalServerError);
        return ex.what();
    }
    return ToString(vb.ExtractValue());;
  }

  private:
    userver::storages::mongo::PoolPtr mongo_pool_;
};

}  // namespace

void AppendGetBlocksByScenarioId(
    userver::components::ComponentList& component_list) {
  component_list.Append<GetBlocksByScenarioId>();
  component_list.Append<userver::clients::dns::Component>();
}

}  // namespace blocks::get_blocks_by_scenario_id
