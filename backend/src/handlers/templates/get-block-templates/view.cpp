#include "view.hpp"

#include <userver/formats/bson/inline.hpp>
#include <userver/formats/bson/serialize.hpp>
#include <userver/formats/bson/value_builder.hpp>
#include <userver/storages/mongo/component.hpp>
#include <userver/storages/mongo/options.hpp>
#include "../../../models/block.hpp"


namespace scenario::get_block_templates {

namespace {

GetBlockTemplates::GetBlockTemplates(
    const userver::components::ComponentConfig& config,
    const userver::components::ComponentContext& component_context)
    : HttpHandlerBase(config, component_context),
      mongo_pool_(component_context
                      .FindComponent<userver::components::Mongo>("mongo-db-1")
                      .GetPool()) {}

std::string GetBlockTemplates::HandleRequestThrow(
    const userver::server::http::HttpRequest& request,
    userver::server::request::RequestContext&) const {
  using userver::formats::bson::MakeDoc;
  using userver::formats::bson::MakeArray;
  using userver::formats::bson::Oid;
  using userver::formats::bson::ValueBuilder;

  std::vector<std::string> tags;
  if (request.HasArg("tag")) {
    tags = request.GetArgVector("tag");
  }

  try {

    auto blocks_coll = mongo_pool_->GetCollection("blocks");

    auto query_builder = userver::formats::bson::ValueBuilder(
        userver::formats::bson::MakeDoc("is_template", true)
    );

    if (!tags.empty()) {
        // query_builder["tags"] = userver::formats::bson::ValueBuilder(
        //     userver::formats::bson::MakeDoc("$all", 
        //         userver::formats::bson::MakeArray(tags))
        // );


        userver::formats::bson::ValueBuilder tags_array_builder;
        for (const auto& tag : tags) {
            tags_array_builder.PushBack(tag);
        }
        
        query_builder["tags"] = userver::formats::bson::MakeDoc(
            "$all", tags_array_builder.ExtractValue()
        );
    }

    auto cursor = blocks_coll.Find(query_builder.ExtractValue());

    // if (!cursor) {
    //   request.SetResponseStatus(userver::server::http::HttpStatus::kOk);
    //   return userver::formats::json::ToString(
    //     userver::formats::json::MakeObject()
    //   );
    // }

    userver::formats::json::ValueBuilder vb(userver::formats::json::Type::kArray);
    for(const auto& block: cursor) {
        auto block_data = scenariosus::BlockFromBson(block);
        if(block_data.comments) block_data.comments->resize(0);
        auto block_json = userver::formats::json::ValueBuilder(block_data);

        if(!block_data.children.empty()){
          auto children = blocks_coll.Find(userver::formats::bson::MakeDoc("_id", userver::formats::bson::MakeDoc("$in", block_data.children)));
          block_json["children"] = userver::formats::json::MakeArray();
          for(const auto& kid: children){
            block_json["children"].PushBack(scenariosus::BlockFromBson(kid));
          }
        }
        vb.PushBack(block_json.ExtractValue());
    }
      
    return ToString(vb.ExtractValue());
  } catch (const std::exception& e) {
    auto& response = request.GetHttpResponse();
    response.SetStatus(userver::server::http::HttpStatus::kInternalServerError);
    return std::string{"{\"error\": \""} + e.what() + "\"}";
  }
}

}  // namespace

void AppendGetBlockTemplates(userver::components::ComponentList& component_list) {
  component_list.Append<GetBlockTemplates>();
}

}  // namespace scenario::get_block_templates
