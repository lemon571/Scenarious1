#pragma once

#include <chrono>
#include <optional>
#include <string>
#include <userver/formats/bson/types.hpp>
#include <userver/formats/bson/value.hpp>
#include <userver/formats/json/value.hpp>
#include "user.hpp"

namespace scenariosus {

struct MetaInfo {
  using timedate = int64_t;

  userver::formats::bson::Oid creator;
  std::string name;
  timedate start = 0;
  timedate duration = 0;
  std::string location;
};

userver::formats::json::Value Serialize(
    const MetaInfo& meta,
    userver::formats::serialize::To<userver::formats::json::Value>);
MetaInfo Parse(const userver::formats::bson::Value& value,
               userver::formats::parse::To<MetaInfo>);
userver::formats::bson::Value Serialize(
    const MetaInfo& meta,
    userver::formats::serialize::To<userver::formats::bson::Value>);
}  // namespace scenariosus
