#pragma once

#include <userver/components/component.hpp>
#include <userver/components/component_list.hpp>
#include <userver/server/handlers/http_handler_base.hpp>
#include <userver/storages/mongo/pool.hpp>

namespace scenario::get_block_templates {

namespace {

class GetBlockTemplates final : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "handler-get-block-templates";

  GetBlockTemplates(const userver::components::ComponentConfig&,
                 const userver::components::ComponentContext&);
  std::string HandleRequestThrow(
      const userver::server::http::HttpRequest&,
      userver::server::request::RequestContext&) const override;

 private:
  userver::storages::mongo::PoolPtr mongo_pool_;
};

}  // namespace

void AppendGetBlockTemplates(userver::components::ComponentList& component_list);

}  // namespace scenario::get_block_templates
