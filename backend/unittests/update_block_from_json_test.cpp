#include "../src/lib/update_block_with_json.hpp"
#include "../src/models/block.hpp" 

#include <userver/formats/json/value.hpp>
#include <userver/formats/json/value_builder.hpp>
#include <userver/utest/using_namespace_userver.hpp>

#include <userver/utest/utest.hpp>

namespace scenariosus {

UTEST(UpdateBlockWithJsonTest, UpdateAllFields) {
  Block block;
  block.id = userver::formats::bson::Oid("111111111111111111111111");
  block.description = "Old description";
  block.color = "blue";
  block.parent_id = userver::formats::bson::Oid("000000000000000000000001");
  block.roles = std::vector<std::string>{"user"};
  block.metainfo = MetaInfo{};
  block.metainfo->name = "Old Title";
  block.metainfo->location = "Old Location";
  block.metainfo->start_time = 1000000000;
  block.metainfo->duration = 3600;

  userver::formats::json::ValueBuilder json_builder;
  json_builder["description"] = "Updated description";
  json_builder["color"] = "red";
  json_builder["parent_id"] = "222222222222222222222222";
  json_builder["roles"] = std::vector<std::string>{"admin", "moderator"};
  json_builder["title"] = "New Title";
  json_builder["location"] = "New Room";
  json_builder["start_time"] = 1700000000;
  json_builder["duration"] = 7200;

  auto json = json_builder.ExtractValue();

  UpdateBlockWithJson(block, json);

  EXPECT_NE(block.id, userver::formats::bson::Oid("111111111111111111111111")); 
  EXPECT_EQ(block.description, "Updated description");
  EXPECT_EQ(block.color, "red");
  ASSERT_TRUE(block.parent_id.has_value());
  EXPECT_EQ(*block.parent_id, userver::formats::bson::Oid("222222222222222222222222"));
  ASSERT_TRUE(block.roles.has_value());
  auto roles = std::vector<std::string>{"admin", "moderator"};
  EXPECT_EQ(*block.roles, roles);
  ASSERT_TRUE(block.metainfo.has_value());
  EXPECT_EQ(block.metainfo->name, "New Title");
  EXPECT_EQ(block.metainfo->location, "New Room");
  EXPECT_EQ(block.metainfo->start_time, 1700000000);
  EXPECT_EQ(block.metainfo->duration, 7200);
}

UTEST(UpdateBlockWithJsonTest, UpdateOnlySomeFields) {
  Block block;
  block.description = "Keep this";
  block.color = "green";
  block.metainfo = MetaInfo{};
  block.metainfo->name = "Event";
  block.metainfo->location = "Here";

  userver::formats::json::ValueBuilder json_builder;
  json_builder["color"] = "yellow";
  json_builder["title"] = "Updated Name";

  auto json = json_builder.ExtractValue();

  UpdateBlockWithJson(block, json);

  EXPECT_EQ(block.color, "yellow");       
  EXPECT_EQ(block.description, "Keep this");     
  EXPECT_EQ(block.metainfo->name, "Updated Name"); 
  EXPECT_EQ(block.metainfo->location, "Here");   
  EXPECT_FALSE(block.parent_id.has_value());  
  EXPECT_FALSE(block.roles.has_value());     
}

UTEST(UpdateBlockWithJsonTest, UpdateMetaInfoNullFields) {
  Block block;
  block.metainfo = MetaInfo{};
  block.metainfo->name = "Old";
  block.metainfo->start_time = 1000;

  userver::formats::json::ValueBuilder json_builder;
  json_builder["title"] = "";   
  json_builder["start_time"] = int64_t{0}; 
  json_builder["location"] = "Nowhere";

  auto json = json_builder.ExtractValue();

  UpdateBlockWithJson(block, json);

  EXPECT_EQ(block.metainfo->name, "");
  EXPECT_EQ(block.metainfo->start_time, 0);
  EXPECT_EQ(block.metainfo->location, "Nowhere");
}

UTEST(UpdateBlockWithJsonTest, MissingFields_NoChange) {
  Block block;
  block.description = "original";
  block.color = "blue";
  block.metainfo = MetaInfo{};
  block.metainfo->name = "Original Title";

  auto json = userver::formats::json::Value(); 

  UpdateBlockWithJson(block, json);

  EXPECT_EQ(block.description, "original");
  EXPECT_EQ(block.color, "blue");
  EXPECT_EQ(block.metainfo->name, "Original Title");
  EXPECT_FALSE(block.parent_id.has_value());
  EXPECT_FALSE(block.roles.has_value());
}

UTEST(UpdateBlockWithJsonTest, ResetId) {
  Block block;
  block.id = userver::formats::bson::Oid("111111111111111111111111");

  auto json = userver::formats::json::Value();

  UpdateBlockWithJson(block, json);

  EXPECT_NE(block.id, userver::formats::bson::Oid("111111111111111111111111")); 
  EXPECT_FALSE(block.id.ToString().empty());
}

}  // namespace scenariosus