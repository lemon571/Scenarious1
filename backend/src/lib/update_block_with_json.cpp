#include "update_block_with_json.hpp"
#include <optional>
#include <userver/formats/bson/types.hpp>
#include <userver/formats/bson/value_builder.hpp>
#include <userver/formats/json/value_builder.hpp>
#include <userver/formats/parse/common_containers.hpp>
#include <userver/formats/serialize/common_containers.hpp>

#include "../models/metainfo.hpp"

namespace scenariosus {

void UpdateBlockWithJson(Block& block,
                         const userver::formats::json::Value& json_values) {
  block.id = userver::formats::bson::Oid();

  if (json_values.HasMember("description")) {
    block.description = json_values["description"].As<std::string>();
  }

  if (json_values.HasMember("color")) {
    block.color = json_values["color"].As<std::string>();
  }

  if (json_values.HasMember("parent_id")) {
    block.parent_id = std::make_optional(userver::formats::bson::Oid(
        json_values["parent_id"].As<std::string>()));
  }

  if (json_values.HasMember("roles")) {
    block.roles =
        json_values["roles"].As<std::optional<std::vector<std::string>>>();
  }

  if (json_values.HasMember("location")) {
    block.metainfo->location = json_values["location"].As<std::string>();
  }

  if (json_values.HasMember("start")) {
    block.metainfo->start = json_values["start"].As<int64_t>();
  }

  if (json_values.HasMember("duration")) {
    block.metainfo->duration = json_values["duration"].As<int64_t>();
  }

  if (json_values.HasMember("title")) {
    block.metainfo->name = json_values["title"].As<std::string>();
  }
}

}  // namespace scenariosus
