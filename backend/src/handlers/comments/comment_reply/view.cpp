#include "view.hpp"

#include <chrono>
#include <optional>
#include <string>

#include <userver/components/component_config.hpp>
#include <userver/components/component_context.hpp>
#include <userver/formats/bson/inline.hpp>
#include <userver/formats/json.hpp>
#include <userver/server/handlers/http_handler_base.hpp>
#include <userver/storages/mongo/component.hpp>
#include <userver/storages/mongo/options.hpp>
#include <userver/storages/mongo/pool.hpp>
#include <userver/utils/uuid4.hpp>

namespace comments::comment_reply {

namespace {

class CommentReply final : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "handler-comment-reply";

  CommentReply(const userver::components::ComponentConfig& config,
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

    context.SetData("user_id", std::string("68a0ae31f69abf476d01db69"));
    std::string user_id_str = context.GetData<std::string>("user_id");
    auto user_oid = userver::formats::bson::Oid(user_id_str);

    auto& response = request.GetHttpResponse();
    response.SetContentType(userver::http::content_type::kApplicationJson);

    try {
      const auto& comment_id = request.GetPathArg("comment_id");

      if (comment_id.empty()) {
        request.SetResponseStatus(
            userver::server::http::HttpStatus::kBadRequest);
        ValueBuilder response_json;
        response_json["error"] = "comment_id is required";
        return ToString(response_json.ExtractValue());
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

      auto reply_id = userver::formats::bson::Oid();

      auto now = std::chrono::system_clock::now();
      auto now_ms = std::chrono::duration_cast<std::chrono::milliseconds>(
                        now.time_since_epoch())
                        .count();

      auto reply_doc =
          MakeDoc("_id", reply_id, "description", description, "time", now_ms,
                  "creator", user_oid);
      if (line_position.has_value()) {
                    reply_doc = MakeDoc("_id", reply_id, "description", description, "time", now_ms,
                            "creator", user_oid,
                            "line_position", *line_position);
      }

      auto scenarios_collection = mongo_pool_->GetCollection("scenarios");

      auto scenario_update_result = scenarios_collection.FindAndModify(
          MakeDoc("comments._id", userver::formats::bson::Oid(comment_id)),
          MakeDoc("$push", MakeDoc("comments.$[comment].children", reply_doc)),
          userver::storages::mongo::options::ArrayFilters({MakeDoc(
              "comment._id", userver::formats::bson::Oid(comment_id))}));

      if (scenario_update_result.ModifiedCount() > 0) {
        request.SetResponseStatus(userver::server::http::HttpStatus::kOk);
        ValueBuilder response_json;
        response_json["success"] = true;
        response_json["id"] = reply_id.ToString();
        response_json["parent_type"] = "scenario";
        return ToString(response_json.ExtractValue());
      }

      auto blocks_collection = mongo_pool_->GetCollection("blocks");

      auto block_update_result = blocks_collection.UpdateMany(
          MakeDoc("comments._id", userver::formats::bson::Oid(comment_id)),
          MakeDoc("$push", MakeDoc("comments.$[comment].children", reply_doc)),
          userver::storages::mongo::options::ArrayFilters({MakeDoc(
              "comment._id", userver::formats::bson::Oid(comment_id))}));

      if (block_update_result.ModifiedCount() > 0) {
        request.SetResponseStatus(userver::server::http::HttpStatus::kOk);
        ValueBuilder response_json;
        response_json["success"] = true;
        response_json["id"] = reply_id.ToString();
        response_json["parent_type"] = "block";
        return ToString(response_json.ExtractValue());
      }

      request.SetResponseStatus(userver::server::http::HttpStatus::kNotFound);
      ValueBuilder response_json;
      response_json["error"] = "Comment not found";
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

void AppendCommentReply(userver::components::ComponentList& component_list) {
  component_list.Append<CommentReply>();
}

}  // namespace comments::comment_reply