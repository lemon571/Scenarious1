#include "view.hpp"

#include <cstdint>
#include <string>
#include <userver/formats/bson/types.hpp>
#include <vector>

#include <userver/components/component_config.hpp>
#include <userver/components/component_context.hpp>
#include <userver/formats/bson/inline.hpp>
#include <userver/formats/json.hpp>
#include <userver/server/handlers/http_handler_base.hpp>
#include <userver/storages/mongo/component.hpp>
#include <userver/storages/mongo/options.hpp>
#include <userver/storages/mongo/pool.hpp>

#include "../../../lib/get_user_role_by_scenario_id.hpp"

namespace comments::get_comments {

namespace {

class GetComments final : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "handler-get-comments";

  GetComments(const userver::components::ComponentConfig& config,
              const userver::components::ComponentContext& component_context)
      : HttpHandlerBase(config, component_context),
        mongo_pool_(component_context
                        .FindComponent<userver::components::Mongo>("mongo-db-1")
                        .GetPool()) {}

  std::string HandleRequestThrow(
      const userver::server::http::HttpRequest& request,
      userver::server::request::RequestContext& context) const override {
    using userver::formats::bson::MakeDoc;
    using userver::formats::json::ToString;
    using userver::formats::json::ValueBuilder;

    auto& response = request.GetHttpResponse();
    response.SetContentType(userver::http::content_type::kApplicationJson);


    try {
      const auto& scenario_id = request.GetPathArg("scenario_id");
      const auto& block_id = request.GetPathArg("block_id");

      if (scenario_id.empty()) {
        request.SetResponseStatus(
            userver::server::http::HttpStatus::kBadRequest);
        ValueBuilder response_json;
        response_json["error"] = "scenario_id is required";
        return ToString(response_json.ExtractValue());
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

      bool is_scenario_comments = (block_id.empty() || block_id == "-1");

      auto scenarios_collection = mongo_pool_->GetCollection("scenarios");

      auto scenario_doc = scenarios_collection.FindOne(
          MakeDoc("_id", userver::formats::bson::Oid(scenario_id)));
      if (!scenario_doc) {
        request.SetResponseStatus(userver::server::http::HttpStatus::kNotFound);
        ValueBuilder response_json;
        response_json["error"] = "Scenario not found";
        return ToString(response_json.ExtractValue());
      }

      ValueBuilder response_builder(userver::formats::json::Type::kObject);
      ValueBuilder comments_array(userver::formats::json::Type::kArray);

      if (is_scenario_comments) {
        auto scenario_with_comments = scenarios_collection.FindOne(
            MakeDoc("_id", userver::formats::bson::Oid(scenario_id)));

        if (scenario_with_comments &&
            scenario_with_comments->HasMember("comments")) {
          auto comments_bson = (*scenario_with_comments)["comments"];
          if (comments_bson.IsArray()) {
            for (const auto& comment_bson : comments_bson) {
              comments_array.PushBack(ConvertBsonCommentToJson(comment_bson));
            }
          }
        }
      } else {
        auto blocks_collection = mongo_pool_->GetCollection("blocks");
        auto maybe_block = blocks_collection.FindOne(
            MakeDoc("block_id", userver::formats::bson::Oid(block_id)));

        if (!maybe_block) {
          request.SetResponseStatus(
              userver::server::http::HttpStatus::kNotFound);
          ValueBuilder response_json;
          response_json["error"] = "Block not found";
          return ToString(response_json.ExtractValue());
        }

        if (maybe_block->HasMember("comments") &&
            (*maybe_block)["comments"].IsArray()) {
          for (const auto& comment_bson : (*maybe_block)["comments"]) {
            comments_array.PushBack(ConvertBsonCommentToJson(comment_bson));
          }
        }
      }

      response_builder["success"] = true;
      response_builder["scenario_id"] = scenario_id;
      if (is_scenario_comments) {
        response_builder["block_id"] = userver::formats::json::Value{};
      } else {
        response_builder["block_id"] = block_id;
      }
      response_builder["comments"] = comments_array.ExtractValue();

      request.SetResponseStatus(userver::server::http::HttpStatus::kOk);
      return ToString(response_builder.ExtractValue());

    } catch (const std::exception& e) {
      request.SetResponseStatus(
          userver::server::http::HttpStatus::kInternalServerError);
      ValueBuilder response_json;
      response_json["error"] = e.what();
      return ToString(response_json.ExtractValue());
    }
  }

 private:
  userver::storages::mongo::PoolPtr mongo_pool_;

  userver::formats::json::Value ConvertBsonCommentToJson(
      const userver::formats::bson::Value& comment_bson) const {
    using userver::formats::json::ValueBuilder;

    ValueBuilder comment_json(userver::formats::json::Type::kObject);

    if (comment_bson.HasMember("_id")) {
      comment_json["_id"] =
          comment_bson["_id"].As<userver::formats::bson::Oid>().ToString();
    }

    if (comment_bson.HasMember("description")) {
      comment_json["description"] = comment_bson["description"].As<std::string>();
    }

    if (comment_bson.HasMember("time")) {
      comment_json["time"] = comment_bson["time"].As<int64_t>();
    }

    if (comment_bson.HasMember("line_position")) {
      comment_json["line_position"] = comment_bson["line_position"].As<int>();
    }

    if (comment_bson.HasMember("creator")) {
      ValueBuilder creator_json(userver::formats::json::Type::kObject);
      // auto creator_bson = comment_bson["creator"];
      // if (creator_bson.HasMember("_id")) {
      //   creator_json["_id"] = creator_bson["_id"].As<std::string>();
      // }
      // comment_json["creator"] = creator_json.ExtractValue();
      comment_json["creator"] =
          comment_bson["creator"].As<userver::formats::bson::Oid>().ToString();
    }

    if (comment_bson.HasMember("children") &&
        comment_bson["children"].IsArray()) {
      ValueBuilder children_array(userver::formats::json::Type::kArray);
      for (const auto& child_bson : comment_bson["children"]) {
        children_array.PushBack(ConvertBsonCommentToJson(child_bson));
      }
      comment_json["children"] = children_array.ExtractValue();
    } else {
      ValueBuilder empty_children(userver::formats::json::Type::kArray);
      comment_json["children"] = empty_children.ExtractValue();
    }

    return comment_json.ExtractValue();
  }
};

}  // namespace

void AppendGetComments(userver::components::ComponentList& component_list) {
  component_list.Append<GetComments>();
}

}  // namespace comments::get_comments
