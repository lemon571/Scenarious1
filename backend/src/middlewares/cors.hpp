#pragma once

#include <string>
#include <string_view>

#include <userver/components/component_list.hpp>

namespace middleware {

void AppendCORSComponents(userver::components::ComponentList& component_list);

}  // namespace middleware