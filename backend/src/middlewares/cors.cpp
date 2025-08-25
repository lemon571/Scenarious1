#include <fmt/format.h>

#include <userver/components/component_config.hpp>
#include <userver/components/component_context.hpp>
#include <userver/formats/json.hpp>
#include <userver/server/handlers/handler_base.hpp>
#include <userver/server/middlewares/http_middleware_base.hpp>
#include <userver/server/middlewares/configuration.hpp>
#include <userver/server/http/http_method.hpp>
#include <userver/server/http/http_status.hpp>
#include <userver/yaml_config/yaml_config.hpp>

#include "cors.hpp"

namespace middleware {

using userver::server::http::HttpStatus;
using userver::server::http::HttpMethod;

namespace {

class CORSMiddleware final
    : public userver::server::middlewares::HttpMiddlewareBase {
 public:
  static constexpr std::string_view kName{"cors-middleware"};

  explicit CORSMiddleware(
      const userver::server::handlers::HttpHandlerBase& handler) {}

 private:
  void HandleRequest(
      userver::server::http::HttpRequest& request,
      userver::server::request::RequestContext& context) const override {
    if (request.GetMethod() == HttpMethod::kOptions) {
      request.GetHttpResponse().SetHeader(std::string_view("Access-Control-Allow-Origin"), "http://158.160.144.119");
      request.GetHttpResponse().SetHeader(std::string_view("Access-Control-Allow-Methods"), "GET,POST,PUT,PATCH,DELETE,OPTIONS");
      request.GetHttpResponse().SetHeader(std::string_view("Access-Control-Allow-Credentials"), "true");
      request.GetHttpResponse().SetHeader(std::string_view("Access-Control-Allow-Headers"), "authorization, origin, content-type, accept, cookie");
      request.GetHttpResponse().SetHeader(std::string_view("Access-Control-Expose-Headers"), "Set-Cookie");
      request.GetHttpResponse().SetHeader(std::string_view("Allow"), "HEAD,GET,POST,PUT,PATCH,DELETE,OPTIONS");
      request.SetResponseStatus(HttpStatus::kOk);
      return;
    }
    
    Next(request, context);
    
    // Устанавливаем CORS заголовки для всех ответов, включая ошибки
    request.GetHttpResponse().SetHeader(std::string_view("Access-Control-Allow-Origin"), "http://158.160.144.119");
    request.GetHttpResponse().SetHeader(std::string_view("Access-Control-Allow-Methods"), "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    request.GetHttpResponse().SetHeader(std::string_view("Access-Control-Allow-Credentials"), "true");
    request.GetHttpResponse().SetHeader(std::string_view("Access-Control-Allow-Headers"), "authorization, origin, content-type, accept, cookie");
    request.GetHttpResponse().SetHeader(std::string_view("Access-Control-Expose-Headers"), "Set-Cookie");
  }
};

class CORSMiddlewareFactory final
    : public userver::server::middlewares::HttpMiddlewareFactoryBase {
 public:
  static constexpr std::string_view kName{"cors-middleware"};

  explicit CORSMiddlewareFactory(
      const userver::components::ComponentConfig& config,
      const userver::components::ComponentContext& context)
      : userver::server::middlewares::HttpMiddlewareFactoryBase(config, context) {}

  std::unique_ptr<userver::server::middlewares::HttpMiddlewareBase> Create(
      const userver::server::handlers::HttpHandlerBase& handler,
      userver::yaml_config::YamlConfig) const override {
    return std::make_unique<CORSMiddleware>(handler);
  }
};

class CORSMiddlewarePipelineBuilder final
    : public userver::server::middlewares::HandlerPipelineBuilder {
 public:
  using userver::server::middlewares::HandlerPipelineBuilder::HandlerPipelineBuilder;

  userver::server::middlewares::MiddlewaresList BuildPipeline(
      userver::server::middlewares::MiddlewaresList server_middleware_pipeline)
      const override {
    auto& pipeline = server_middleware_pipeline;
    pipeline.emplace_back(CORSMiddlewareFactory::kName);
    return pipeline;
  }
};

class CORSAuthPipelineBuilder final
    : public userver::server::middlewares::HandlerPipelineBuilder {
 public:
  using userver::server::middlewares::HandlerPipelineBuilder::HandlerPipelineBuilder;

  userver::server::middlewares::MiddlewaresList BuildPipeline(
      userver::server::middlewares::MiddlewaresList server_middleware_pipeline)
      const override {
    auto& pipeline = server_middleware_pipeline;
    pipeline.emplace_back("auth-middleware");
    pipeline.emplace_back(CORSMiddlewareFactory::kName);
    return pipeline;
  }
};

}  // namespace

void AppendCORSComponents(userver::components::ComponentList& component_list) {
  component_list.Append<CORSMiddlewareFactory>();
  component_list.Append<CORSMiddlewarePipelineBuilder>("cors-pipeline-builder");
  component_list.Append<CORSAuthPipelineBuilder>("cors-auth-pipeline-builder");
}
}  // namespace middleware
