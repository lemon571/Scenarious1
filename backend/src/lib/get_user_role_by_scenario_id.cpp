#include "get_user_role_by_scenario_id.hpp"

#include <optional>
#include <userver/formats/bson/inline.hpp>
#include <userver/formats/bson/types.hpp>
#include <userver/logging/log.hpp>

namespace scenariosus {

std::optional<scenario::models::Role> GetUserRoleBySceanrioId(
    const userver::formats::bson::Oid& scenario_oid,
    const userver::formats::bson::Oid& user_oid,
    userver::storages::mongo::PoolPtr mongo_pool) {
  auto scenario_collection = mongo_pool->GetCollection("scenarios");

  auto scenario_search_result = scenario_collection.FindOne(
      userver::formats::bson::MakeDoc("_id", scenario_oid),
      userver::storages::mongo::options::Projection{"_id", "creator_id"}.ElemMatch(
          "participants", userver::formats::bson::MakeDoc("id", user_oid)));

  if(scenario_search_result.has_value() && scenario_search_result.value()["creator_id"].As<userver::formats::bson::Oid>() == user_oid){
    return scenario::models::Role::Lead;
  }

  if (!scenario_search_result.has_value() ||
      !scenario_search_result.value().HasMember("participants") ||
      !scenario_search_result.value()["participants"][0].HasMember("role")) {
    return std::nullopt;
  }

  return scenario::models::RoleFromString(
      scenario_search_result.value()["participants"][0]["role"]
          .As<std::string>());
}

}  // namespace scenariosus
