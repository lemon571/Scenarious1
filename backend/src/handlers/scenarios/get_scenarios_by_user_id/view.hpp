#pragma once

#include <string>
#include <string_view>
#include <userver/components/component_list.hpp>

namespace scenario::get_scenarios_by_user_id {

void AppendGetScenariosByUserId(userver::components::ComponentList& component_list);

}  // namespace scenario::get_scenarios_by_user_id
