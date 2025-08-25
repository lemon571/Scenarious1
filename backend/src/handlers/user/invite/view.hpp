#pragma once

#include <string>
#include <string_view>

#include <userver/components/component_list.hpp>

namespace users::invite {

void AppendInviteCreator(userver::components::ComponentList& component_list);

}  // namespace users::invite