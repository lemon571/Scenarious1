#include "view.hpp"

#include <chrono>
#include <string>

#include <userver/components/component_config.hpp>
#include <userver/components/component_context.hpp>
#include <userver/formats/bson/inline.hpp>
#include <userver/formats/bson/types.hpp>
#include <userver/formats/json.hpp>
#include <userver/server/handlers/http_handler_base.hpp>
#include <userver/storages/mongo/component.hpp>
#include <userver/storages/mongo/options.hpp>
#include <userver/storages/mongo/pool.hpp>
#include <userver/utils/uuid4.hpp>
#include "../../../lib/get_user_role_by_scenario_id.hpp"

namespace comments::post_comment {

namespace {

class PostComment final : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "handler-post-comment";

  PostComment(const userver::components::ComponentConfig& config,
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
    using userver::formats::json::FromString;
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

      const auto& body = request.RequestBody();
      if (body.empty()) {
        request.SetResponseStatus(
            userver::server::http::HttpStatus::kBadRequest);
        ValueBuilder response_json;
        response_json["error"] = "Request body is empty";
        return ToString(response_json.ExtractValue());
      }

      auto json_body = FromString(body);
      std::string description = json_body["description"].As<std::string>();

      std::optional<int> line_position;
      if (json_body.HasMember("line_position")) {
        line_position = json_body["line_position"].As<int>();
      }

      auto comment_id = userver::formats::bson::Oid();

      auto now = std::chrono::system_clock::now();
      auto now_ms = std::chrono::duration_cast<std::chrono::milliseconds>(
                        now.time_since_epoch())
                        .count();
      // std::string time_str = std::to_string(now_ms);

      auto comment_doc =
          MakeDoc("_id", comment_id, "description", description, "time", now_ms,
                  "creator", user_oid);

      if (line_position.has_value()) {
        comment_doc =
            MakeDoc("_id", comment_id, "description", description, "time", now_ms,
                    "creator", user_oid,
                    "line_position", *line_position);
      }

      bool is_scenario_comment = (block_id.empty() || block_id == "-1");

      auto scenarios_collection = mongo_pool_->GetCollection("scenarios");

      auto scenario_doc = scenarios_collection.FindOne(
          MakeDoc("_id", userver::formats::bson::Oid(scenario_id)));
      if (!scenario_doc) {
        request.SetResponseStatus(userver::server::http::HttpStatus::kNotFound);
        ValueBuilder response_json;
        response_json["error"] = "Scenario not found";
        return ToString(response_json.ExtractValue());
      }

      if (is_scenario_comment) {
        auto update_result = scenarios_collection.FindAndModify(
            MakeDoc("_id", userver::formats::bson::Oid(scenario_id)),
            MakeDoc("$push", MakeDoc("comments", comment_doc)));

        if (update_result.ModifiedCount() == 0) {
          request.SetResponseStatus(
              userver::server::http::HttpStatus::kNotFound);
          ValueBuilder response_json;
          response_json["error"] = "Scenario not found";
          return ToString(response_json.ExtractValue());
        }
      } else {
        auto blocks_collection = mongo_pool_->GetCollection("blocks");

        auto block_exists = blocks_collection.Count(
            MakeDoc("block_id", userver::formats::bson::Oid(block_id)));

        if (!block_exists) {
          request.SetResponseStatus(
              userver::server::http::HttpStatus::kNotFound);
          ValueBuilder response_json;
          response_json["error"] = "Block not found in scenario";
          return ToString(response_json.ExtractValue());
        }

        auto update_result = blocks_collection.UpdateMany(
            MakeDoc("block_id", userver::formats::bson::Oid(block_id)),
            MakeDoc("$push", MakeDoc("comments", comment_doc)));

        if (update_result.ModifiedCount() == 0) {
          request.SetResponseStatus(
              userver::server::http::HttpStatus::kNotFound);
          ValueBuilder response_json;
          response_json["error"] = "Block not found in scenario";
          return ToString(response_json.ExtractValue());
        }
      }

      request.SetResponseStatus(userver::server::http::HttpStatus::kOk);
      ValueBuilder response_json;
      response_json["success"] = true;
      response_json["id"] = comment_id.ToString();
      return ToString(response_json.ExtractValue());

    } catch (const std::exception& e) {
      request.SetResponseStatus(userver::server::http::HttpStatus::kBadRequest);
      ValueBuilder response_json;
      response_json["error"] = e.what();
      return ToString(response_json.ExtractValue());
    }
  }

 private:
  userver::storages::mongo::PoolPtr mongo_pool_;
};

}  // namespace

void AppendPostComment(userver::components::ComponentList& component_list) {
  component_list.Append<PostComment>();
}

}  // namespace comments::post_comment