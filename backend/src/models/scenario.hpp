#pragma once

#include <string>
#include <unordered_map>
#include <userver/formats/bson/types.hpp>
#include <vector>

#include "block.hpp"
#include "metainfo.hpp"

namespace scenariosus {

struct Scenario {
  using uuid = userver::formats::bson::Oid;
  using Role = std::string;

  uuid id;
  std::unordered_map<uuid, std::vector<Role>> users;
  std::vector<Comment> comments;

  MetaInfo metainfo;
  std::string content;
};

userver::formats::json::Value Serialize(
    const Scenario& scenario,
    userver::formats::serialize::To<userver::formats::json::Value>);

Scenario Parse(const userver::formats::bson::Value& value,
               userver::formats::parse::To<Scenario>);

Scenario Parse(const userver::formats::bson::Value& value,
               userver::formats::parse::To<Scenario>);

}  // namespace scenariosus
