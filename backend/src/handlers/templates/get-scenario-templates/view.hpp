#pragma once

#include <userver/components/component.hpp>
#include <userver/components/component_list.hpp>
#include <userver/server/handlers/http_handler_base.hpp>
#include <userver/storages/mongo/pool.hpp>

namespace scenario::get_scenario_templates {

namespace {

class GetScenarioTemplates final : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "handler-get-scenario-templates";

  GetScenarioTemplates(const userver::components::ComponentConfig&,
                 const userver::components::ComponentContext&);
  std::string HandleRequestThrow(
      const userver::server::http::HttpRequest&,
      userver::server::request::RequestContext&) const override;

 private:
  userver::storages::mongo::PoolPtr mongo_pool_;
};

}  // namespace

void AppendGetScenarioTemplates(userver::components::ComponentList& component_list);

}  // namespace scenario::get_scenario_templates
