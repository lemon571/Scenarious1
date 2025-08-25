#include "scenario.hpp"

#include <userver/formats/bson/types.hpp>
#include <userver/formats/bson/value.hpp>
#include <userver/formats/bson/value_builder.hpp>
#include <userver/formats/json/inline.hpp>
#include <userver/formats/json/value_builder.hpp>
#include <userver/formats/serialize/common_containers.hpp>
#include <userver/formats/bson/value.hpp>
#include <userver/formats/bson/value_builder.hpp>
#include <userver/formats/serialize/to.hpp>

#include "comment.hpp"
#include "metainfo.hpp"
#include "user.hpp"

namespace scenariosus {

userver::formats::json::Value Serialize(
    const Scenario& scenario,
    userver::formats::serialize::To<userver::formats::json::Value>) {
  userver::formats::json::ValueBuilder builder;

  builder["id"] = scenario.id;

  {
    userver::formats::json::ValueBuilder users_builder;
    for (const auto& [user, roles] : scenario.users) {
      userver::formats::json::ValueBuilder user_builder;
      user_builder["user"] = user;
      user_builder["roles"] = roles;
    }
    builder["users"] = users_builder.ExtractValue();
  }

  builder["comments"] = scenario.comments;

  builder["metainfo"] = scenario.metainfo;

  return builder.ExtractValue();
}

Scenario Parse(const userver::formats::bson::Value& value,
               userver::formats::parse::To<Scenario>) {
  Scenario scenario;

  scenario.id = value["_id"].As<userver::formats::bson::Oid>();

  {
    auto users_obj = value["users"];
    std::unordered_map<Scenario::uuid, std::vector<Scenario::Role>> users_map;
    for (const auto& json_value : users_obj) {
      User user = json_value["user"].As<User>();
      if (json_value.HasMember("roles")) {
        std::vector<Scenario::Role> roles =
            json_value["roles"].As<std::vector<Scenario::Role>>();
        users_map[user.id] = std::move(roles);
      } else {
        users_map[user.id];
      }
    }
    scenario.users = std::move(users_map);
  }

  scenario.comments = value["comments"].As<std::vector<Comment>>();
  scenario.metainfo = value["metainfo"].As<MetaInfo>();

  return scenario;
}

Scenario Parse(const userver::formats::bson::Value& value,
               userver::formats::parse::To<std::optional<Scenario>>) {
  return value.As<Scenario>();
}

}  // namespace scenariosus
