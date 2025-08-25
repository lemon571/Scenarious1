#include "view.hpp"
#include <userver/server/handlers/http_handler_base.hpp>

namespace auth {

namespace {

class AuthCheckHandler final
    : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "handler-auth-check";
  using HttpHandlerBase::HttpHandlerBase;

  std::string HandleRequestThrow(
      const userver::server::http::HttpRequest&,
      userver::server::request::RequestContext&) const {
    return {};
  }
};

}  // namespace

void AppendAuthCheck(userver::components::ComponentList& component_list) {
  component_list.Append<AuthCheckHandler>();
}

}  // namespace auth