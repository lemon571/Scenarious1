#pragma once

#include <userver/components/component_list.hpp>

namespace middleware::auth {
void AppendAuthMiddleware(
    userver::components::ComponentList& component_list);
}  // namespace middleware::auth