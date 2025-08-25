#include "../src/models/block.hpp"

#include <userver/formats/bson/document.hpp>
#include <userver/formats/bson/inline.hpp>
#include <userver/formats/bson/types.hpp>
#include <userver/formats/bson/value_builder.hpp>
#include <userver/formats/json/value_builder.hpp>
#include <userver/formats/parse/common_containers.hpp>
#include <userver/formats/serialize/common_containers.hpp>
#include <userver/utest/using_namespace_userver.hpp>

#include <userver/utest/utest.hpp>
#include <vector>

namespace scenariosus {

UTEST(BlockSerializationTest, SerializeToJson) {
  Block block;
  block.id = userver::formats::bson::Oid("111111111111111111111111");
  block.description = "Hello World";
  block.color = "red";
  block.children = std::vector<formats::bson::Oid>{userver::formats::bson::Oid("222222222222222222222222"),
                    userver::formats::bson::Oid("333333333333333333333333")};
  block.roles = std::vector<std::string>{"admin", "user"};
  MetaInfo meta;
  meta.name = "Meeting";
  meta.location = "Room 101";
  meta.start_time = 1700000000;
  meta.duration = 3600;
  block.metainfo = meta;

  auto json = Serialize(block, userver::formats::serialize::To<userver::formats::json::Value>{});

  EXPECT_EQ(json["id"].As<std::string>(), "111111111111111111111111");
  EXPECT_EQ(json["color"].As<std::string>(), "red");
  EXPECT_EQ(json["description"].As<std::string>(), "Hello World");

  EXPECT_TRUE(json["roles"].IsArray());
  auto roles = json["roles"].As<std::vector<std::string>>();
  EXPECT_EQ(roles, block.roles);

  EXPECT_TRUE(json["children"].IsArray());
  auto children = json["children"].As<std::vector<std::string>>();
  auto children_text = std::vector<std::string>{"222222222222222222222222",
                  "333333333333333333333333"};
  EXPECT_EQ(children, children_text);
  EXPECT_EQ(json["title"].As<std::string>(), "Meeting");
  EXPECT_EQ(json["location"].As<std::string>(), "Room 101");
  EXPECT_EQ(json["start"].As<int64_t>(), 1700000000);
  EXPECT_EQ(json["duration"].As<int64_t>(), 3600);
}

UTEST(BlockSerializationTest, SerializeToBson) {
  Block block;
  block.id = userver::formats::bson::Oid("111111111111111111111111");
  block.description = "Hello World";
  block.color = "blue";
  block.children = {userver::formats::bson::Oid("222222222222222222222222")};
  block.roles = std::vector<std::string>{"guest"};

  MetaInfo meta;
  meta.name = "Event";
  meta.location = "Online";
  meta.start_time = 1600000000;
  meta.duration = 7200;
  block.metainfo = meta;

  auto bson = Serialize(block, userver::formats::serialize::To<userver::formats::bson::Value>{});

  EXPECT_EQ(bson["_id"].As<userver::formats::bson::Oid>(), block.id);
  EXPECT_EQ(bson["description"].As<std::string>(), "Hello World");
  EXPECT_EQ(bson["color"].As<std::string>(), "blue");

  EXPECT_TRUE(bson["children"].IsArray());
  auto children = bson["children"].As<std::vector<userver::formats::bson::Oid>>();
  EXPECT_EQ(children, block.children);

  EXPECT_TRUE(bson["roles"].IsArray());
  auto roles = bson["roles"].As<std::vector<std::string>>();
  EXPECT_EQ(roles, *block.roles);
  EXPECT_EQ(bson["title"].As<std::string>(), "Event");
  EXPECT_EQ(bson["location"].As<std::string>(), "Online");
  EXPECT_EQ(bson["start"].As<int64_t>(), 1600000000);
  EXPECT_EQ(bson["duration"].As<int64_t>(), 7200);
}

UTEST(BlockParsingTest, ParseFromBsonValue) {
  userver::formats::bson::ValueBuilder builder;
  builder["_id"] = userver::formats::bson::Oid("111111111111111111111111");
  builder["description"] = "Sample description";
  builder["color"] = "green";
  builder["children"] = std::vector<userver::formats::bson::Oid>{userver::formats::bson::Oid("222222222222222222222222")};
  builder["roles"] = std::vector<std::string>{"moderator"};
  auto bson_value = builder.ExtractValue();

  Block block = Parse(bson_value, userver::formats::parse::To<Block>{});

  EXPECT_EQ(block.id, userver::formats::bson::Oid("111111111111111111111111"));
  EXPECT_EQ(block.description, "Sample description");
  EXPECT_EQ(block.color, "green");
  EXPECT_EQ(block.children.size(), 1);
  EXPECT_EQ(block.children[0], userver::formats::bson::Oid("222222222222222222222222"));
  ASSERT_TRUE(block.roles.has_value());
  EXPECT_EQ(*block.roles, std::vector<std::string>{"moderator"});
}

UTEST(BlockParsingTest, BlockFromBsonWithMeta) {
  userver::formats::bson::ValueBuilder doc;
  doc["_id"] = userver::formats::bson::Oid("111111111111111111111111");
  doc["description"] = "Final block";
  doc["color"] = "purple";
  auto children = std::vector<userver::formats::bson::Oid>{userver::formats::bson::Oid("222222222222222222222222"), userver::formats::bson::Oid("333333333333333333333333")};
  doc["children"] = children;
  auto roles = std::vector<std::string>{"viewer", "editor"};
  doc["roles"] = std::vector<std::string>{"viewer", "editor"};
  doc["title"] = "Workshop";
  doc["location"] = "Building A";
  doc["start_time"] = 1500000000;
  doc["duration"] = 5400;

  auto block = BlockFromBson(doc.ExtractValue());

  EXPECT_EQ(block.id, userver::formats::bson::Oid("111111111111111111111111"));
  EXPECT_EQ(block.description, "Final block");
  EXPECT_EQ(block.color, "purple");
  EXPECT_EQ(block.children.size(), 2);
  EXPECT_EQ(block.children, children);
  ASSERT_TRUE(block.roles.has_value());
  EXPECT_EQ(*block.roles, roles);
  ASSERT_TRUE(block.metainfo.has_value());
  EXPECT_EQ(block.metainfo->name, "Workshop");
  EXPECT_EQ(block.metainfo->location, "Building A");
  EXPECT_EQ(block.metainfo->start_time, 1500000000);
  EXPECT_EQ(block.metainfo->duration, 5400);
}

UTEST(BlockParsingTest, BlockFromBsonMissingOptionalFields) {
  userver::formats::bson::ValueBuilder doc;
  doc["_id"] = userver::formats::bson::Oid("111111111111111111111111");
  doc["description"] = "Minimal block";
  doc["color"] = "black";

  auto block = BlockFromBson(doc.ExtractValue());

  EXPECT_EQ(block.id, userver::formats::bson::Oid("111111111111111111111111"));
  EXPECT_EQ(block.description, "Minimal block");
  EXPECT_EQ(block.color, "black");
  EXPECT_TRUE(block.children.empty());
  EXPECT_FALSE(block.roles.has_value());
  ASSERT_TRUE(block.metainfo.has_value());
  EXPECT_TRUE(block.metainfo->name.empty());
  EXPECT_TRUE(block.metainfo->location.empty());
  EXPECT_EQ(block.metainfo->start_time, 0);
  EXPECT_EQ(block.metainfo->duration, 0);
}

UTEST(BlockParsingTest, ParseWithParentId) {
  userver::formats::bson::ValueBuilder builder;
  builder["_id"] = userver::formats::bson::Oid("111111111111111111111111");
  builder["description"] = "Child block";
  builder["color"] = "yellow";
  builder["parent_id"] = userver::formats::bson::Oid("000000000000000000000001");

  auto bson_value = builder.ExtractValue();

  Block block = Parse(bson_value, userver::formats::parse::To<Block>{});

  EXPECT_EQ(block.id, userver::formats::bson::Oid("111111111111111111111111"));
  EXPECT_EQ(block.description, "Child block");
  EXPECT_EQ(block.color, "yellow");
  ASSERT_TRUE(block.parent_id.has_value());
  EXPECT_EQ(*block.parent_id, userver::formats::bson::Oid("000000000000000000000001"));
}

}  // namespace scenariosus