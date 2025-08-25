#include "../src/models/comment.hpp"

#include <userver/formats/bson/document.hpp>
#include <userver/formats/bson/inline.hpp>
#include <userver/formats/bson/types.hpp>
#include <userver/formats/bson/value_builder.hpp>
#include <userver/formats/json/value_builder.hpp>
#include <userver/formats/parse/common_containers.hpp>
#include <userver/utest/using_namespace_userver.hpp>

#include <userver/utest/utest.hpp>

namespace scenariosus {

UTEST(CommentSerializationTest, SerializeToJson_Value) {
  Comment comment;
  comment.id = userver::formats::bson::Oid("111111111111111111111111");
  comment.creator = formats::bson::Oid("222222222222222222222222");
  comment.description = "This is a comment";
  comment.time = 1700000000;
  comment.line_position = 42;

  auto json = Serialize(comment, userver::formats::serialize::To<userver::formats::json::Value>{});

  EXPECT_EQ(json["id"].As<std::string>(), "111111111111111111111111");
  EXPECT_EQ(json["creator"].As<std::string>(), "222222222222222222222222");
  EXPECT_EQ(json["description"].As<std::string>(), "This is a comment");
  EXPECT_EQ(json["time"].As<int64_t>(), 1700000000);
  EXPECT_EQ(json["line_position"].As<int>(), 42);
  EXPECT_FALSE(json.HasMember("children"));
}

UTEST(CommentSerializationTest, SerializeToJson_ToJson) {
  Comment comment;
  comment.id = userver::formats::bson::Oid("111111111111111111111111");
  comment.creator = formats::bson::Oid("222222222222222222222222");
  comment.description = "Formatted comment";
  comment.time = 1600000000;
  comment.line_position = 10;

  Comment reply;
  reply.id = userver::formats::bson::Oid("333333333333333333333333");
  reply.creator = formats::bson::Oid("444444444444444444444444");
  reply.description  = "Reply";
  reply.time = 1600000001;
  reply.line_position = 0;

  comment.children = std::vector<Comment>{reply};

  auto json = Serialize(comment, userver::formats::serialize::To<userver::formats::json::Value>{});

  EXPECT_EQ(json["id"].As<std::string>(), "111111111111111111111111");
  EXPECT_EQ(json["creator"].As<std::string>(), "222222222222222222222222");

  EXPECT_EQ(json["description"].As<std::string>(), "Formatted comment");
  EXPECT_EQ(json["time"].As<int64_t>(), 1600000000);
  EXPECT_EQ(json["line_position"].As<int>(), 10);

  ASSERT_TRUE(json["children"].IsArray());
  auto children = json["children"].As<std::vector<Comment>>();
  EXPECT_EQ(children.size(), 1);
  EXPECT_EQ(children[0].id, userver::formats::bson::Oid("333333333333333333333333"));
  EXPECT_EQ(children[0].creator, userver::formats::bson::Oid("444444444444444444444444"));
  EXPECT_EQ(children[0].description, "Reply");
}

UTEST(CommentSerializationTest, SerializeToBson) {
  Comment comment;
  comment.id = userver::formats::bson::Oid("111111111111111111111111");
  comment.creator = formats::bson::Oid("222222222222222222222222");
  comment.description = "BSON comment";
  comment.time = 1500000000;
  comment.line_position = 5;

  Comment reply;
  reply.id = userver::formats::bson::Oid("333333333333333333333333");
  reply.creator = formats::bson::Oid("444444444444444444444444");
  reply.description = "Nested reply";
  reply.time = 1500000001;
  reply.line_position = 1;

  comment.children = std::vector<Comment>{reply};

  auto bson = Serialize(comment, userver::formats::serialize::To<userver::formats::bson::Value>{});

  EXPECT_EQ(bson["_id"].As<userver::formats::bson::Oid>(), comment.id);
  EXPECT_EQ(bson["creator"].As<userver::formats::bson::Oid>(), userver::formats::bson::Oid("222222222222222222222222"));
  EXPECT_EQ(bson["description"].As<std::string>(), "BSON comment");
  EXPECT_EQ(bson["time"].As<int64_t>(), 1500000000);
  EXPECT_EQ(bson["line_position"].As<int>(), 5);

  ASSERT_TRUE(bson["children"].IsArray());
  auto children_bson = bson["children"].As<std::vector<Comment>>();
  ASSERT_EQ(children_bson.size(), 1);
  EXPECT_EQ(children_bson[0].id, userver::formats::bson::Oid("333333333333333333333333"));
  EXPECT_EQ(children_bson[0].creator, userver::formats::bson::Oid("444444444444444444444444"));
  EXPECT_EQ(children_bson[0].description, "Nested reply");
}

UTEST(CommentParsingTest, ParseFromBsonValue) {
  userver::formats::bson::ValueBuilder builder;
  builder["_id"] = userver::formats::bson::Oid("111111111111111111111111");
  builder["creator"] = userver::formats::bson::Oid("222222222222222222222222");
  builder["description"] = "Parsed comment";
  builder["time"] = 1400000000;
  builder["line_position"] = 100;

  auto reply = formats::bson::MakeDoc(
    "_id", userver::formats::bson::Oid("555555555555555555555555"),
    "creator", userver::formats::bson::Oid("666666666666666666666666"),
    "description", "Child comment",
    "time", 1400000001,
    "line_position", 3
  );

  builder["children"].PushBack(reply);

  auto bson_value = builder.ExtractValue();

  Comment comment = Parse(bson_value, userver::formats::parse::To<Comment>{});

  EXPECT_EQ(comment.id, userver::formats::bson::Oid("111111111111111111111111"));
  EXPECT_EQ(comment.creator, userver::formats::bson::Oid("222222222222222222222222"));
  EXPECT_EQ(comment.description, "Parsed comment");
  EXPECT_EQ(comment.time, 1400000000);
  EXPECT_EQ(comment.line_position, 100);

  ASSERT_TRUE(comment.children.has_value());
  const auto& children = *comment.children;
  ASSERT_EQ(children.size(), 1);
  EXPECT_EQ(children[0].id, userver::formats::bson::Oid("555555555555555555555555"));
  EXPECT_EQ(children[0].creator, userver::formats::bson::Oid("666666666666666666666666"));
  EXPECT_EQ(children[0].description, "Child comment");
  EXPECT_EQ(children[0].time, 1400000001);
  EXPECT_EQ(children[0].line_position, 3);
}

UTEST(CommentParsingTest, ParseWithoutChildren) {
  userver::formats::bson::ValueBuilder builder;
  builder["_id"] = userver::formats::bson::Oid("111111111111111111111111");
  builder["creator"] = userver::formats::bson::Oid("222222222222222222222222");
  builder["description"] = "No children";
  builder["time"] = 1300000000;
  builder["line_position"] = 50;

  auto bson_value = builder.ExtractValue();

  Comment comment = Parse(bson_value, userver::formats::parse::To<Comment>{});

  EXPECT_EQ(comment.id, userver::formats::bson::Oid("111111111111111111111111"));
  EXPECT_EQ(comment.creator, userver::formats::bson::Oid("222222222222222222222222"));
  EXPECT_EQ(comment.description, "No children");
  EXPECT_EQ(comment.time, 1300000000);
  EXPECT_EQ(comment.line_position, 50);
  EXPECT_FALSE(comment.children.has_value());
}

UTEST(CommentRoundtripTest, BsonRoundtrip) {
  Comment original;
  original.id = userver::formats::bson::Oid("111111111111111111111111");
  original.creator = formats::bson::Oid("222222222222222222222222");
  original.description = "Roundtrip UTEST";
  original.time = 1234567890;
  original.line_position = 7;

  Comment reply;
  reply.id = userver::formats::bson::Oid("333333333333333333333333");
  reply.creator = formats::bson::Oid("444444444444444444444444");
  reply.description = "Reply";
  reply.time = 1234567891;
  reply.line_position = 1;

  original.children = std::vector<Comment>{reply};

  auto bson = Serialize(original, userver::formats::serialize::To<userver::formats::bson::Value>{});

  Comment parsed = Parse(bson, userver::formats::parse::To<Comment>{});

  EXPECT_EQ(parsed.id, original.id);
  EXPECT_EQ(parsed.creator, original.creator);
  EXPECT_EQ(parsed.description, original.description);
  EXPECT_EQ(parsed.time, original.time);
  EXPECT_EQ(parsed.line_position, original.line_position);
  ASSERT_TRUE(parsed.children.has_value());
  ASSERT_EQ(parsed.children->size(), 1);
  EXPECT_EQ((*parsed.children)[0].id, (*original.children)[0].id);
  EXPECT_EQ((*parsed.children)[0].creator, (*original.children)[0].creator);
  EXPECT_EQ((*parsed.children)[0].description, (*original.children)[0].description);
  EXPECT_EQ((*parsed.children)[0].time, (*original.children)[0].time);
  EXPECT_EQ((*parsed.children)[0].line_position, (*original.children)[0].line_position);
}

}  // namespace scenariosus