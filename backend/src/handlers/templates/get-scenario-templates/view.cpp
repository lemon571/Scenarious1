#include "view.hpp"

#include <userver/formats/bson/inline.hpp>
#include <userver/formats/bson/serialize.hpp>
#include <userver/formats/bson/value_builder.hpp>
#include <userver/formats/json/value_builder.hpp>
#include <userver/storages/mongo/component.hpp>
#include <userver/storages/mongo/options.hpp>
#include "../../../models/block.hpp"


namespace scenario::get_scenario_templates {

namespace {

GetScenarioTemplates::GetScenarioTemplates(
    const userver::components::ComponentConfig& config,
    const userver::components::ComponentContext& component_context)
    : HttpHandlerBase(config, component_context),
      mongo_pool_(component_context
                      .FindComponent<userver::components::Mongo>("mongo-db-1")
                      .GetPool()) {}

std::string GetScenarioTemplates::HandleRequestThrow(
    const userver::server::http::HttpRequest& request,
    userver::server::request::RequestContext&) const {
  using userver::formats::bson::MakeDoc;
  using userver::formats::bson::Oid;
  using userver::formats::bson::ValueBuilder;

  bool is_popular = false;
  if (request.HasArg("is_popular")) {
    is_popular = request.GetArg("is_popular") == "true";
  }

  std::string category;
  if (request.HasArg("category")) {
    category = request.GetArg("category");
  }


  try {
    auto blocks_coll = mongo_pool_->GetCollection("scenarios");
    
    userver::formats::bson::ValueBuilder query_builder;
    query_builder["is_template"] = true;

    if (is_popular) {
        query_builder["is_popular"] = true;
    }

    if (!category.empty()) {
        query_builder["category"] = category;
    }

    auto pipeline = userver::formats::bson::MakeArray(
        userver::formats::bson::MakeDoc("$match", query_builder.ExtractValue()),
        userver::formats::bson::MakeDoc("$lookup",
            userver::formats::bson::MakeDoc(
                "from", "blocks",
                "localField", "blocks",
                "foreignField", "_id",
                "as", "attached_documents"
            )
        )
    );

    auto cursor = blocks_coll.Aggregate(pipeline);

    auto blocks_collection = mongo_pool_->GetCollection("blocks");

    userver::formats::json::ValueBuilder vb(userver::formats::json::Type::kArray);
    for (const auto& scenario_bson : cursor) { 
        auto scenario_json = userver::formats::json::ValueBuilder();

        scenario_json["_id"] = scenario_bson["_id"].As<userver::formats::bson::Oid>().ToString();
        scenario_json["name"] = scenario_bson["name"].As<std::string>();
        scenario_json["description"] = scenario_bson["description"].As<std::string>();
        scenario_json["location"] = scenario_bson["location"].As<std::string>();

        userver::formats::json::ValueBuilder blocks_json(userver::formats::json::Type::kArray);
        std::size_t blocks_count = 0;

        if (scenario_bson.HasMember("attached_documents") && scenario_bson["attached_documents"].IsArray()) {
            for (const auto& block_bson : scenario_bson["attached_documents"]) {
                userver::formats::bson::ValueBuilder normalized_block(block_bson);
                if (block_bson.HasMember("children") && block_bson["children"].IsArray()) {
                    userver::formats::bson::ValueBuilder children_builder;
                    for (const auto& ch : block_bson["children"]) {
                        try {
                            if (ch.IsDocument()) {
                                const auto& ch_doc = ch;
                                if (ch_doc.HasMember("_id")) {
                                    if (ch_doc["_id"].IsString()) {
                                        children_builder.PushBack(userver::formats::bson::Oid(ch_doc["_id"].As<std::string>()));
                                    } else {
                                        children_builder.PushBack(ch_doc["_id"].As<userver::formats::bson::Oid>());
                                    }
                                }
                            } else if (ch.IsString()) {
                                children_builder.PushBack(userver::formats::bson::Oid(ch.As<std::string>()));
                            } else if (ch.IsOid()) {
                                children_builder.PushBack(ch.As<userver::formats::bson::Oid>());
                            }
                        } catch (...) {
                            // skip
                        }
                    }
                    normalized_block["children"] = children_builder.ExtractValue();
                }

                userver::formats::bson::ValueBuilder children_bson;
                if(normalized_block.HasMember("children")){
                    children_bson = normalized_block["children"];
                }

                userver::formats::json::ValueBuilder block_json(scenariosus::BlockFromBson(normalized_block.ExtractValue()));

                if(!children_bson.IsEmpty()){
                    auto children = blocks_collection.Find(userver::formats::bson::MakeDoc("_id", userver::formats::bson::MakeDoc("$in", children_bson.ExtractValue())));
                    block_json["children"] = userver::formats::json::MakeArray();
                    for(const auto& kid: children){
                        block_json["children"].PushBack(scenariosus::BlockFromBson(kid));
                    }
                }

                blocks_json.PushBack(block_json.ExtractValue());
                ++blocks_count;
            }
        }

        scenario_json["num_blocks"] = static_cast<int>(blocks_count);
        scenario_json["blocks"] = blocks_json.ExtractValue();

        vb.PushBack(scenario_json.ExtractValue());
    }
      
    return ToString(vb.ExtractValue());
  } catch (const std::exception& e) {
    auto& response = request.GetHttpResponse();
    response.SetStatus(userver::server::http::HttpStatus::kInternalServerError);
    return std::string{"{\"error\": \""} + e.what() + "\"}";
  }
}

}  // namespace

void AppendGetScenarioTemplates(userver::components::ComponentList& component_list) {
  component_list.Append<GetScenarioTemplates>();
}

}  // namespace scenario::get_scenario_templates
