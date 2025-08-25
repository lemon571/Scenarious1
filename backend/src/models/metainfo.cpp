#include "metainfo.hpp"

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
MetaInfo Parse(const userver::formats::bson::Value& value,
               userver::formats::parse::To<MetaInfo>) {
  MetaInfo meta;

  meta.creator = value["creator"].As<userver::formats::bson::Oid>();
  meta.name = value["name"].As<std::string>();
  meta.start = value["start"].As<int64_t>();
  meta.duration = value["duration"].As<int64_t>();
  meta.location = value["location"].As<std::string>();

  return meta;
}

userver::formats::bson::Value Serialize(
    const MetaInfo& meta,
    userver::formats::serialize::To<userver::formats::bson::Value>) {
  userver::formats::bson::ValueBuilder builder;
  builder["name"] = meta.name;
  builder["location"] = meta.location;
  builder["start"] = meta.start;
  builder["duration"] = meta.duration;
  builder["creator"] = meta.creator;
  return builder.ExtractValue();
}

userver::formats::json::Value Serialize(
    const MetaInfo& meta,
    userver::formats::serialize::To<userver::formats::json::Value>) {
  userver::formats::json::ValueBuilder builder;
  builder["name"] = meta.name;
  builder["location"] = meta.location;
  builder["start"] = meta.start;
  builder["duration"] = meta.duration;
  builder["creator"] = meta.creator.ToString();
  return builder.ExtractValue();
}

}  // namespace scenariosus
