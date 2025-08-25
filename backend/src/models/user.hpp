#pragma once

#include <string>
#include <userver/formats/bson/types.hpp>
#include <vector>

#include <userver/formats/bson/value.hpp>
#include <userver/formats/json_fwd.hpp>
#include <userver/formats/serialize/common_containers.hpp>
#include <userver/utils/trivial_map.hpp>

namespace scenariosus {

struct User {
  using uuid = userver::formats::bson::Oid;

  uuid id;
  std::optional<std::vector<uuid>> scenario = std::nullopt;
};

userver::formats::json::Value Serialize(
    const User& user,
    userver::formats::serialize::To<userver::formats::json::Value>);

User Parse(const userver::formats::bson::Value& value,
           userver::formats::parse::To<User>);

userver::formats::bson::Value Serialize(
    const User& user,
    userver::formats::serialize::To<userver::formats::bson::Value>);
}  // namespace scenariosus