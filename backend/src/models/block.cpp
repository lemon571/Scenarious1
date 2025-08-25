#include "block.hpp"

#include <userver/formats/bson/types.hpp>
#include <userver/formats/bson/value.hpp>
#include <userver/formats/bson/value_builder.hpp>
#include <userver/formats/json/inline.hpp>
#include <userver/formats/json/value_builder.hpp>
#include <userver/formats/serialize/common_containers.hpp>
#include <userver/formats/serialize/to.hpp>

namespace scenariosus {

userver::formats::json::Value Serialize(
    const Block& block,
    userver::formats::serialize::To<userver::formats::json::Value>) {
  userver::formats::json::ValueBuilder item;
  item["id"] = block.id.ToString();
  item["block_id"] = block.block_id.ToString();
  item["color"] = block.color;
  item["description"] = block.description;

  if (block.roles) {
    item["roles"] = *block.roles;
  }

  item["children"].Resize(0);
  for (const auto& child : block.children) {
    item["children"].PushBack(child.ToString());
  }

  if (block.comments) {
    item["comments"] = *block.comments;
  }

  if (block.metainfo) {
    item["title"] = block.metainfo->name;
    item["name"] = block.metainfo->name;
    item["location"] = block.metainfo->location;
    item["start"] = block.metainfo->start;
    item["duration"] = block.metainfo->duration;
  }

  return item.ExtractValue();
}

userver::formats::bson::Value Serialize(
    const Block& block,
    userver::formats::serialize::To<userver::formats::bson::Value>) {
  userver::formats::bson::ValueBuilder builder;

  builder["_id"] = block.id;
  builder["block_id"] = block.block_id;
  builder["color"] = block.color;
  builder["description"] = block.description;
  builder["children"] = block.children;

  if (block.roles) {
    builder["roles"] = *block.roles;
  }

  if (block.comments) {
    builder["comments"] = *block.comments;
  }

  if (block.metainfo) {
    builder["title"] = block.metainfo->name;
    builder["location"] = block.metainfo->location;
    builder["start"] = block.metainfo->start;
    builder["duration"] = block.metainfo->duration;
  }

  return builder.ExtractValue();
}

Block BlockFromBson(const userver::formats::bson::Document& block_bson) {
  auto block = Block();

  block.id = block_bson["_id"].As<userver::formats::bson::Oid>();
  block.block_id = block_bson["block_id"].As<userver::formats::bson::Oid>();
  block.description = block_bson["description"].As<std::string>();

  if (block_bson.HasMember("parent_id")) {
    block.parent_id = block_bson["parent_id"]
                          .As<std::optional<userver::formats::bson::Oid>>();
  }

  if (block_bson.HasMember("children")) {
    block.children =
        block_bson["children"].As<std::vector<userver::formats::bson::Oid>>();
  }

  if (block_bson.HasMember("comments")) {
    block.comments =
        block_bson["comments"].As<std::optional<std::vector<Comment>>>();
  }

  if (block_bson.HasMember("roles")) {
    block.roles =
        block_bson["roles"].As<std::optional<std::vector<std::string>>>();
  }

  MetaInfo meta;
  if (block_bson.HasMember("location")) {
    meta.location = block_bson["location"].As<std::string>();
  }

  if (block_bson.HasMember("start")) {
    meta.start = block_bson["start"].As<int64_t>();
  }

  if (block_bson.HasMember("duration")) {
    meta.duration = block_bson["duration"].As<int64_t>();
  }

  if (block_bson.HasMember("title")) {
    meta.name = block_bson["title"].As<std::string>();
  }

  block.metainfo = std::make_optional(meta);

  block.color = block_bson["color"].As<std::string>();

  return block;
}

Block Parse(const userver::formats::bson::Value& value,
            userver::formats::parse::To<Block>) {
  return BlockFromBson(value);
}

}  // namespace scenariosus
