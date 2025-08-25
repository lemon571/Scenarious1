#include "auth.hpp"
#include <cstring>
#include <string>
#include <userver/components/component_context.hpp>
#include <userver/crypto/private_key.hpp>
#include <userver/formats/bson/inline.hpp>
#include <userver/formats/bson/types.hpp>
#include <userver/server/handlers/handler_base.hpp>
#include <userver/server/middlewares/configuration.hpp>
#include <userver/server/middlewares/http_middleware_base.hpp>
#include <userver/server/request/request_context.hpp>
#include <userver/storages/mongo/component.hpp>
#include <userver/storages/mongo/cursor.hpp>
#include <userver/storages/mongo/pool.hpp>
#include <userver/utils/datetime_light.hpp>

namespace middleware::auth {

namespace {

class AuthMiddleware final
    : public userver::server::middlewares::HttpMiddlewareBase {
 public:
  explicit AuthMiddleware(userver::storages::mongo::PoolPtr mongo_pool)
      : mongo_pool_(std::move(mongo_pool)) {}

 private:
  void HandleRequest(
      userver::server::http::HttpRequest& request,
      userver::server::request::RequestContext& context) const override {
    Next(request, context);
    // auto cookie_header = request.GetHeader("Cookie");
    // if (cookie_header.empty()) {
    //   ReplyUnauthorized(request);
    //   return;
    // }

    // auto pos = cookie_header.find("token=");
    // auto end = cookie_header.find(";");
    // if (pos == std::string::npos) {
    //   ReplyUnauthorized(request);
    //   return;
    // }
    // auto token = cookie_header.substr(
    //     pos + strlen("token="),
    //     end != std::string::npos ? end - (pos + strlen("token=")) : end);

    // auto sessions_coll = mongo_pool_->GetCollection("auth_sessions");
    // auto session_doc_opt =
    //     sessions_coll.FindOne(userver::formats::bson::MakeDoc("token", token));

    // if (!session_doc_opt.has_value()) {
    //   ReplyUnauthorized(request);
    //   return;
    // }

    // auto session_doc = session_doc_opt.value();
    // auto now = userver::utils::datetime::Now();
    // auto expires_at =
    //     session_doc["expires_at"].As<std::chrono::system_clock::time_point>();
    // if (expires_at < now) {
    //   ReplyUnauthorized(request);
    //   return;
    // }

    // auto user_id = session_doc["user_id"].As<userver::formats::bson::Oid>().ToString();

    // // temporal

    // // context.SetData("user_id", user_id);
    
    // Next(request, context);
  }

  static void ReplyUnauthorized(userver::server::http::HttpRequest& request) {
    request.SetResponseStatus(userver::server::http::HttpStatus::kUnauthorized);
  }

  userver::storages::mongo::PoolPtr mongo_pool_;
};

class AuthMiddlewareFactory final
    : public userver::server::middlewares::HttpMiddlewareFactoryBase {
 public:
  static constexpr std::string_view kName = "auth-middleware";

  explicit AuthMiddlewareFactory(
      const userver::components::ComponentConfig& config,
      const userver::components::ComponentContext& context)
      : HttpMiddlewareFactoryBase(config, context),
        mongo_pool_(
            context.FindComponent<userver::components::Mongo>("mongo-db-1")
                .GetPool()) {}

  std::unique_ptr<userver::server::middlewares::HttpMiddlewareBase> Create(
      const userver::server::handlers::HttpHandlerBase&,
      userver::yaml_config::YamlConfig) const override {
    return std::make_unique<AuthMiddleware>(mongo_pool_);
  }

 private:
  userver::storages::mongo::PoolPtr mongo_pool_;
};

class AuthHandlerPipelineBuilder final
    : public userver::server::middlewares::HandlerPipelineBuilder {
 public:
  using HandlerPipelineBuilder::HandlerPipelineBuilder;

  userver::server::middlewares::MiddlewaresList BuildPipeline(
      userver::server::middlewares::MiddlewaresList server_middleware_pipeline)
      const override {
    auto& pipeline = server_middleware_pipeline;
    pipeline.emplace_back(AuthMiddlewareFactory::kName);
    return pipeline;
  }
};

}  // namespace

void AppendAuthMiddleware(userver::components::ComponentList& component_list) {
  component_list.Append<middleware::auth::AuthMiddlewareFactory>();
  component_list.Append<middleware::auth::AuthHandlerPipelineBuilder>(
      "auth-pipeline-builder");
}

}  // namespace middleware::auth