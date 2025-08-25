#include "get_children_blocks.hpp"

#include <optional>
#include <userver/formats/bson/inline.hpp>

namespace scenariosus {

std::optional<std::vector<userver::formats::bson::Oid>> GetChildrenBlocks(
    const userver::formats::bson::Oid& parent_block_oid,
    userver::storages::mongo::PoolPtr mongo_pool) {
  auto blocks_collection = mongo_pool->GetCollection("blocks");

  auto children_search_result = blocks_collection.FindOne(
      userver::formats::bson::MakeDoc("_id", parent_block_oid),
      userver::storages::mongo::options::Projection{"children"});

  if (!children_search_result.has_value() ||
      !children_search_result.value().HasMember("children")) {
    return std::nullopt;
  }

  return std::make_optional(
      children_search_result.value()["children"]
          .As<std::vector<userver::formats::bson::Oid>>());
}

}  // namespace scenariosus
