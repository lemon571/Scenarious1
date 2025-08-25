#include "user.hpp"

#include <userver/formats/bson/types.hpp>
#include <userver/formats/bson/value.hpp>
#include <userver/formats/bson/value_builder.hpp>
#include <userver/formats/json/inline.hpp>
#include <userver/formats/json/value_builder.hpp>
#include <userver/formats/serialize/common_containers.hpp>
#include <userver/formats/bson/value.hpp>
#include <userver/formats/bson/value_builder.hpp>
#include <userver/formats/serialize/to.hpp>

namespace scenariosus {

userver::formats::bson::Value Serialize(
    const User& user,
    userver::formats::serialize::To<userver::formats::bson::Value>) {
  userver::formats::bson::ValueBuilder builder;
  builder["_id"] = user.id;

  if (user.scenario) {
    builder["scenarios"] = *user.scenario;
  }
  return builder.ExtractValue();
}

User Parse(const userver::formats::bson::Value& value,
           userver::formats::parse::To<User>) {
  User user;
  user.id = value["_id"].As<userver::formats::bson::Oid>();

  if (value.HasMember("scenarios")) {
    user.scenario =
        value["scenarios"].As<std::optional<std::vector<User::uuid>>>();
  }

  return user;
}

userver::formats::json::Value Serialize(
    const User& user,
    userver::formats::serialize::To<userver::formats::json::Value>) {
  userver::formats::json::ValueBuilder builder;
  builder["id"] = user.id.ToString();
  if (user.scenario.has_value()) {
    builder["scenarios"].Resize(0);
    for (const auto& scenario_id : user.scenario.value()) {
      builder["scenarios"].PushBack(scenario_id.ToString());
    }
  }
  return builder.ExtractValue();
}

}  // namespace scenariosus
