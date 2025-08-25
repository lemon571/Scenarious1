#pragma once

#include <string>
#include <string_view>
#include <userver/components/component_list.hpp>

namespace scenario::get_versions_by_id {

void AppendGetVersionsById(userver::components::ComponentList& component_list);

}  // namespace scenario::get_versions_by_id
