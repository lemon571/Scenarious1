#pragma once

#include <optional>
#include <string>
#include <userver/formats/bson/types.hpp>
#include <vector>

#include "comment.hpp"
#include "metainfo.hpp"

#include <userver/formats/bson/document.hpp>
#include <userver/formats/json/value.hpp>
#include <userver/formats/json/value_builder.hpp>
#include <userver/formats/parse/common_containers.hpp>
#include <userver/formats/serialize/common_containers.hpp>

namespace scenariosus {

struct Block {
  using uuid = userver::formats::bson::Oid;

  uuid id;
  uuid block_id;
  std::string description;

  std::optional<uuid> parent_id = std::nullopt;
  std::vector<uuid> children;
  std::optional<std::vector<Comment>> comments = std::nullopt;
  std::optional<std::vector<std::string>> roles = std::nullopt;
  std::string color;

  std::optional<MetaInfo> metainfo;
};

Block BlockFromBson(const userver::formats::bson::Document& block_bson);

userver::formats::json::Value Serialize(
    const Block& block,
    userver::formats::serialize::To<userver::formats::json::Value>);

Block Parse(const userver::formats::bson::Value& value,
            userver::formats::parse::To<Block>);

userver::formats::bson::Value Serialize(
    const Block& block,
    userver::formats::serialize::To<userver::formats::bson::Value>);
}  // namespace scenariosus
