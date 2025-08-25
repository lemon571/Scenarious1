#pragma once

#include <userver/components/component_list.hpp>

namespace auth::yandex {

void AppendGetTokenByYandexId(
    userver::components::ComponentList& component_list);

}  // namespace auth::yandex