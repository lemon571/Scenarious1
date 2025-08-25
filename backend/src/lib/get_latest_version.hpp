#pragma once

#include <optional>
#include <userver/formats/bson/types.hpp>
#include <userver/storages/mongo/pool.hpp>
#include <vector>

namespace scenariosus {

std::optional<std::vector<userver::formats::bson::Oid>> GetLatestVersion(
    const userver::formats::bson::Oid& scenario_oid,
    userver::storages::mongo::PoolPtr mongo_pool);

}  // namespace scenariosus
