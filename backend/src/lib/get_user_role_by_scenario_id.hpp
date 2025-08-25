#pragma once

#include <optional>
#include <userver/formats/bson/types.hpp>
#include <userver/storages/mongo/pool.hpp>
#include <vector>

#include "../models/role.hpp"

namespace scenariosus {

std::optional<scenario::models::Role> GetUserRoleBySceanrioId(
    const userver::formats::bson::Oid& scenario_oid,
    const userver::formats::bson::Oid& user_oid,
    userver::storages::mongo::PoolPtr mongo_pool);

}  // namespace scenariosus
