#include "../src/models/user.hpp"

#include <userver/formats/bson/value_builder.hpp>
#include <userver/formats/json/value_builder.hpp>
#include <userver/formats/parse/common_containers.hpp>
#include <userver/utest/using_namespace_userver.hpp>
#include <userver/utils/uuid4.hpp>

#include <userver/utest/utest.hpp>

namespace scenariosus {

UTEST(UserSerializationTest, SerializeToJson) {
  User user;
  user.id = userver::formats::bson::Oid("111111111111111111111111");

  user.scenario = std::vector<userver::formats::bson::Oid>{
      userver::formats::bson::Oid("100000000000000000000001"),
      userver::formats::bson::Oid("200000000000000000000002")
  };

  auto json = Serialize(user, userver::formats::serialize::To<userver::formats::json::Value>{});

  EXPECT_EQ(json["id"].As<std::string>(), "111111111111111111111111");

  ASSERT_TRUE(json["scenarios"].IsArray());
  auto scenarios = json["scenarios"].As<std::vector<std::string>>();
  auto scenarios_vector = std::vector<std::string>{
                            "100000000000000000000001",
                            "200000000000000000000002"};
  EXPECT_EQ(scenarios, scenarios_vector);
}

UTEST(UserSerializationTest, SerializeToJson_EmptyScenarios) {
  User user;
  user.id = userver::formats::bson::Oid("222222222222222222222222");
  user.scenario = std::vector<userver::formats::bson::Oid>{};

  auto json = Serialize(user, userver::formats::serialize::To<userver::formats::json::Value>{});

  EXPECT_EQ(json["id"].As<std::string>(), "222222222222222222222222");
  ASSERT_TRUE(json["scenarios"].IsArray());
  EXPECT_EQ(json["scenarios"].GetSize(), 0);
}

UTEST(UserSerializationTest, SerializeToJson_NoScenarios) {
  User user;
  user.id = userver::formats::bson::Oid("333333333333333333333333");

  auto json = Serialize(user, userver::formats::serialize::To<userver::formats::json::Value>{});

  EXPECT_EQ(json["id"].As<std::string>(), "333333333333333333333333");
  EXPECT_FALSE(json.HasMember("scenarios"));
}

UTEST(UserSerializationTest, SerializeToBson) {
  User user;
  user.id = userver::formats::bson::Oid("111111111111111111111111");

  user.scenario = std::vector<userver::formats::bson::Oid>{
      userver::formats::bson::Oid("100000000000000000000001"),
      userver::formats::bson::Oid("200000000000000000000002")
  };

  auto bson = Serialize(user, userver::formats::serialize::To<userver::formats::bson::Value>{});

  EXPECT_EQ(bson["_id"].As<userver::formats::bson::Oid>(), user.id);

  ASSERT_TRUE(bson.HasMember("scenarios"));
  auto scenarios_bson = bson["scenarios"].As<std::vector<userver::formats::bson::Oid>>();
  EXPECT_EQ(scenarios_bson, *user.scenario);
}

UTEST(UserSerializationTest, SerializeToBson_NoScenarios) {
  User user;
  user.id = userver::formats::bson::Oid("222222222222222222222222");

  auto bson = Serialize(user, userver::formats::serialize::To<userver::formats::bson::Value>{});

  EXPECT_EQ(bson["_id"].As<userver::formats::bson::Oid>(), user.id);
  EXPECT_FALSE(bson.HasMember("scenarios")); 
}

UTEST(UserParsingTest, ParseFromBsonValue) {
  userver::formats::bson::ValueBuilder builder;
  builder["_id"] = userver::formats::bson::Oid("111111111111111111111111");

  auto scenarios = userver::formats::bson::ValueBuilder();
  scenarios.PushBack(userver::formats::bson::Oid("100000000000000000000001"));
  scenarios.PushBack(userver::formats::bson::Oid("200000000000000000000002"));

  builder["scenarios"] = scenarios.ExtractValue();

  User user = Parse(builder.ExtractValue(), userver::formats::parse::To<User>{});

  EXPECT_EQ(user.id, userver::formats::bson::Oid("111111111111111111111111"));
  ASSERT_TRUE(user.scenario.has_value());
  EXPECT_EQ(user.scenario->size(), 2);
  EXPECT_EQ((*user.scenario)[0], userver::formats::bson::Oid("100000000000000000000001"));
  EXPECT_EQ((*user.scenario)[1], userver::formats::bson::Oid("200000000000000000000002"));
}

UTEST(UserParsingTest, ParseFromBsonValue_NoScenarios) {
  userver::formats::bson::ValueBuilder builder;
  builder["_id"] = userver::formats::bson::Oid("222222222222222222222222");

  auto bson_value = builder.ExtractValue();

  User user = Parse(bson_value, userver::formats::parse::To<User>{});

  EXPECT_EQ(user.id, userver::formats::bson::Oid("222222222222222222222222"));
  EXPECT_FALSE(user.scenario.has_value());
}

UTEST(UserRoundtripTest, BsonRoundtrip) {
  User original;
  original.id = userver::formats::bson::Oid("111111111111111111111111");
  original.scenario = std::vector<userver::formats::bson::Oid>{
      userver::formats::bson::Oid("100000000000000000000001"),
      userver::formats::bson::Oid("200000000000000000000002")
  };
  auto bson = Serialize(original, userver::formats::serialize::To<userver::formats::bson::Value>{});

  User parsed = Parse(bson, userver::formats::parse::To<User>{});

  EXPECT_EQ(parsed.id, original.id);
  ASSERT_TRUE(parsed.scenario.has_value());
  ASSERT_TRUE(original.scenario.has_value());
  EXPECT_EQ(*parsed.scenario, *original.scenario);
}

UTEST(UserRoundtripTest, BsonRoundtrip_NoScenarios) {
  User original;
  original.id = userver::formats::bson::Oid("222222222222222222222222");

  auto bson = Serialize(original, userver::formats::serialize::To<userver::formats::bson::Value>{});
  User parsed = Parse(bson, userver::formats::parse::To<User>{});

  EXPECT_EQ(parsed.id, original.id);
  EXPECT_FALSE(parsed.scenario.has_value());
}

}  // namespace scenariosus