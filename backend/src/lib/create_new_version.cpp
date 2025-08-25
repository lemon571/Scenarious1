#include "create_new_version.hpp"

#include <optional>
#include <userver/formats/bson/inline.hpp>
#include <userver/formats/bson/types.hpp>
#include <userver/formats/bson/value.hpp>
#include <userver/formats/bson/value_builder.hpp>

namespace scenariosus {

bool CreateNewVersion(
    const userver::formats::bson::Oid& scenario_oid,
    const userver::formats::bson::Oid& user_oid,
    const std::vector<userver::formats::bson::Oid>& updated_blocks,
    userver::storages::mongo::PoolPtr mongo_pool) {
  auto scenario_collection = mongo_pool->GetCollection("scenarios");

  userver::formats::bson::ValueBuilder updated_blocks_builder;
  for (const auto& single_block_oid : updated_blocks) {
    updated_blocks_builder.PushBack(single_block_oid);
  }
  auto updated_blocks_bson = updated_blocks_builder.ExtractValue();

  auto now = std::chrono::system_clock::now();
  auto now_ms = std::chrono::duration_cast<std::chrono::milliseconds>(
                  now.time_since_epoch())
                  .count();

  auto blocks_update = scenario_collection.UpdateOne(
      userver::formats::bson::MakeDoc("_id", scenario_oid),
      userver::formats::bson::MakeDoc(
          "$push",
          userver::formats::bson::MakeDoc(
              "versions",
              userver::formats::bson::MakeDoc(
                  "timestamp", now_ms, "author",
                  user_oid, "used_blocks", updated_blocks_bson))));

  return blocks_update.ModifiedCount() != 0;
}

bool CreateNewVersion(const userver::formats::bson::Oid& scenario_oid,
                      const userver::formats::bson::Oid& user_oid,
                      userver::formats::bson::Value updated_blocks,
                      userver::storages::mongo::PoolPtr mongo_pool) {
  auto scenario_collection = mongo_pool->GetCollection("scenarios");

  auto now = std::chrono::system_clock::now();
  auto now_ms = std::chrono::duration_cast<std::chrono::milliseconds>(
                now.time_since_epoch())
                .count();

  auto blocks_update = scenario_collection.UpdateOne(
      userver::formats::bson::MakeDoc("_id", scenario_oid),
      userver::formats::bson::MakeDoc(
          "$push", userver::formats::bson::MakeDoc(
                       "versions",
                       userver::formats::bson::MakeDoc(
                           "timestamp", now_ms,
                           "author", user_oid, "used_blocks", updated_blocks))));

  return blocks_update.ModifiedCount() != 0;
}

}  // namespace scenariosus
