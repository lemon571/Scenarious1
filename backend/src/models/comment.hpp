#pragma once

#include <optional>
#include <string>
#include <userver/formats/bson/types.hpp>
#include <vector>

#include <userver/formats/bson/value.hpp>
#include <userver/formats/json/value.hpp>
#include <userver/formats/serialize/common_containers.hpp>

namespace scenariosus {

struct Comment {
  using timedate = int64_t;

  userver::formats::bson::Oid id;
  userver::formats::bson::Oid creator;
  std::string description;
  timedate time = 0;
  std::optional<int> line_position = 0;

  std::optional<std::vector<Comment>> children = std::nullopt;
};

userver::formats::json::Value Serialize(
    const Comment& comment,
    userver::formats::serialize::To<userver::formats::json::Value>);

Comment Parse(const userver::formats::bson::Value& value,
              userver::formats::parse::To<Comment>);

Comment Parse(const userver::formats::json::Value& value,
              userver::formats::parse::To<Comment>);

userver::formats::bson::Value Serialize(
    const Comment& comment,
    userver::formats::serialize::To<userver::formats::bson::Value>);

}  // namespace scenariosus
