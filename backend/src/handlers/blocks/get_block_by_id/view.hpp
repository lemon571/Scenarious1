#pragma once

#include <string>
#include <string_view>

#include <userver/components/component.hpp>
#include <userver/components/component_list.hpp>
#include <userver/server/handlers/http_handler_base.hpp>

#include <userver/formats/bson_fwd.hpp>
#include <userver/formats/json_fwd.hpp>
#include <userver/storages/mongo/pool.hpp>

namespace scenariosus {

class GetBlockById final : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "handler-get-block-by-id";

  GetBlockById(const userver::components::ComponentConfig&,
               const userver::components::ComponentContext&);

  std::string HandleRequestThrow(
      const userver::server::http::HttpRequest&,
      userver::server::request::RequestContext&) const override;

 private:
  userver::storages::mongo::PoolPtr mongo_pool_;
};

}  // namespace scenariosus