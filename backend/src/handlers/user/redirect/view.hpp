#pragma once

#include <string>
#include <string_view>

#include <userver/components/component_list.hpp>

namespace users::invite {

void AppendInviteRedirect(userver::components::ComponentList& component_list);

}  // namespace users::redirect