#pragma once

#include <userver/components/component_list.hpp>

namespace auth {

void AppendAuthCheck(
    userver::components::ComponentList& component_list);

}  // namespace ya_auth::get_token