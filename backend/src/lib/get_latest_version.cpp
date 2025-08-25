#include "get_latest_version.hpp"

#include <optional>
#include <userver/formats/bson/inline.hpp>

namespace scenariosus {

std::optional<std::vector<userver::formats::bson::Oid>> GetLatestVersion(
    const userver::formats::bson::Oid& scenario_oid,
    userver::storages::mongo::PoolPtr mongo_pool) {
  auto scenario_collection = mongo_pool->GetCollection("scenarios");

  auto scenario_search_result = scenario_collection.FindOne(
      userver::formats::bson::MakeDoc("_id", scenario_oid),
      userver::storages::mongo::options::Projection{"_id"}.Slice("versions", 1,
                                                                 -1));

  if (!scenario_search_result.has_value() ||
      !scenario_search_result.value().HasMember("versions") ||
      !scenario_search_result.value()["versions"][0].HasMember("used_blocks")) {
    return std::nullopt;
  }

  return scenario_search_result.value()["versions"][0]["used_blocks"]
      .As<std::vector<userver::formats::bson::Oid>>();
}

}  // namespace scenariosus
