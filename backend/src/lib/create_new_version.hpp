#pragma once

#include <optional>
#include <userver/formats/bson/types.hpp>
#include <userver/formats/bson/value.hpp>
#include <userver/storages/mongo/pool.hpp>
#include <vector>

namespace scenariosus {

bool CreateNewVersion(
    const userver::formats::bson::Oid& scenario_oid,
    const userver::formats::bson::Oid& user_oid,
    const std::vector<userver::formats::bson::Oid>& updated_blocks,
    userver::storages::mongo::PoolPtr mongo_pool);

bool CreateNewVersion(const userver::formats::bson::Oid& scenario_oid,
                      const userver::formats::bson::Oid& user_oid,
                      userver::formats::bson::Value updated_blocks,
                      userver::storages::mongo::PoolPtr mongo_pool);

}  // namespace scenariosus
