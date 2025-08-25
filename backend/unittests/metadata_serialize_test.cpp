#include "../src/models/metainfo.hpp"
#include "../src/models/user.hpp"

#include <userver/formats/bson/types.hpp>
#include <userver/formats/bson/value_builder.hpp>
#include <userver/formats/json/value_builder.hpp>
#include <userver/formats/parse/common_containers.hpp>
#include <userver/utest/using_namespace_userver.hpp>

#include <userver/utest/utest.hpp>

namespace scenariosus {

UTEST(MetaInfoSerializationTest, SerializeToBson) {
  MetaInfo meta;
  meta.creator = formats::bson::Oid("111111111111111111111111");
  meta.name = "Team Meeting";
  meta.location = "Conference Room A";
  meta.start_time = 1700000000;
  meta.duration = 3600;

  auto bson = Serialize(meta, userver::formats::serialize::To<userver::formats::bson::Value>{});

  EXPECT_EQ(bson["name"].As<std::string>(), "Team Meeting");
  EXPECT_EQ(bson["location"].As<std::string>(), "Conference Room A");
  EXPECT_EQ(bson["start_time"].As<int64_t>(), 1700000000);
  EXPECT_EQ(bson["duration"].As<int64_t>(), 3600);
  EXPECT_EQ(bson["creator"].As<formats::bson::Oid>(), formats::bson::Oid("111111111111111111111111"));
}

UTEST(MetaInfoSerializationTest, SerializeToJson) {
  MetaInfo meta;
  meta.creator = formats::bson::Oid("111111111111111111111111");
  meta.name = "Workshop";
  meta.location = "Online";
  meta.start_time = 1600000000;
  meta.duration = 7200;

  auto json = Serialize(meta, userver::formats::serialize::To<userver::formats::json::Value>{});

  EXPECT_EQ(json["name"].As<std::string>(), "Workshop");
  EXPECT_EQ(json["location"].As<std::string>(), "Online");
  EXPECT_EQ(json["start_time"].As<int64_t>(), 1600000000);
  EXPECT_EQ(json["duration"].As<int64_t>(), 7200);
  EXPECT_EQ(json["creator"].As<std::string>(), "111111111111111111111111");
}

UTEST(MetaInfoParsingTest, ParseFromBsonValue) {
  userver::formats::bson::ValueBuilder builder;
  builder["name"] = "Project Kickoff";
  builder["location"] = "Room 202";
  builder["start_time"] = 1500000000;
  builder["duration"] = 5400;

  builder["creator"] = userver::formats::bson::Oid("111111111111111111111111");

  auto bson_value = builder.ExtractValue();

  MetaInfo meta = Parse(bson_value, userver::formats::parse::To<MetaInfo>{});

  EXPECT_EQ(meta.name, "Project Kickoff");
  EXPECT_EQ(meta.location, "Room 202");
  EXPECT_EQ(meta.start_time, 1500000000);
  EXPECT_EQ(meta.duration, 5400);
  EXPECT_EQ(meta.creator, userver::formats::bson::Oid("111111111111111111111111"));
}

UTEST(MetaInfoParsingTest, ParseOptionalMetaInfo_Some) {
  userver::formats::bson::ValueBuilder builder;
  builder["name"] = "Valid Meta";
  builder["location"] = "Somewhere";
  builder["start_time"] = 1000000000;
  builder["duration"] = 1800;
  builder["creator"] = userver::formats::bson::Oid("111111111111111111111111");

  auto bson_value = builder.ExtractValue();

  auto opt_meta = Parse(bson_value, userver::formats::parse::To<std::optional<MetaInfo>>{});

  ASSERT_TRUE(opt_meta.has_value());
  EXPECT_EQ(opt_meta->name, "Valid Meta");
  EXPECT_EQ(opt_meta->location, "Somewhere");
  EXPECT_EQ(opt_meta->start_time, 1000000000);
  EXPECT_EQ(opt_meta->duration, 1800);
  EXPECT_EQ(opt_meta->creator, userver::formats::bson::Oid("111111111111111111111111"));
}

UTEST(MetaInfoParsingTest, ParseOptionalMetaInfo_Missing) {
  auto missing_value = userver::formats::bson::Value();

  auto opt_meta = Parse(missing_value, userver::formats::parse::To<std::optional<MetaInfo>>{});

  EXPECT_FALSE(opt_meta.has_value());
}

UTEST(MetaInfoRoundtripTest, BsonRoundtrip) {
  MetaInfo original;
  original.creator = formats::bson::Oid("111111111111111111111111");
  original.name = "Full Meta";
  original.location = "HQ";
  original.start_time = 1234567890;
  original.duration = 3000;

  auto bson = Serialize(original, userver::formats::serialize::To<userver::formats::bson::Value>{});
  MetaInfo parsed = Parse(bson, userver::formats::parse::To<MetaInfo>{});

  EXPECT_EQ(parsed.name, original.name);
  EXPECT_EQ(parsed.location, original.location);
  EXPECT_EQ(parsed.start_time, original.start_time);
  EXPECT_EQ(parsed.duration, original.duration);
  EXPECT_EQ(parsed.creator, original.creator);
}

}  // namespace scenariosus