#include "view.hpp"

#include <algorithm>
#include <userver/formats/bson/document.hpp>
#include <userver/formats/bson/inline.hpp>
#include <userver/formats/bson/serialize.hpp>
#include <userver/formats/bson/value.hpp>
#include <userver/formats/bson/value_builder.hpp>
#include <userver/formats/json/serialize.hpp>
#include <userver/storages/mongo/component.hpp>
#include <userver/storages/mongo/options.hpp>
#include <userver/formats/serialize/common_containers.hpp>

#include "../../../lib/create_new_version.hpp"
#include "../../../models/role.hpp"

namespace scenario::create {

namespace {

namespace bson = userver::formats::bson;

CreateScenario::CreateScenario(
    const userver::components::ComponentConfig& config,
    const userver::components::ComponentContext& component_context)
    : HttpHandlerBase(config, component_context),
      mongo_pool_(component_context
                      .FindComponent<userver::components::Mongo>("mongo-db-1")
                      .GetPool()) {}

std::string CreateScenario::HandleRequestThrow(
    const userver::server::http::HttpRequest& request,
    userver::server::request::RequestContext& context) const {
  using userver::formats::bson::MakeDoc;
  using userver::formats::bson::MakeArray;
  using userver::formats::bson::Oid;
  using userver::formats::bson::ValueBuilder;

  try {
    context.SetData("user_id", std::string("68a0ae31f69abf476d01db69"));
    auto user_id = context.GetData<std::string>("user_id");

    auto bson_document =
        userver::formats::bson::FromJsonString(request.RequestBody());

    if (!bson_document.HasMember("participants")) {
        userver::formats::bson::ValueBuilder builder(bson_document);
        builder["participants"] = userver::formats::bson::MakeArray();
        bson_document = builder.ExtractValue();
    }

    std::vector<bson::Value> users_docs;
    /* builder scope */ {
      userver::formats::bson::ValueBuilder builder(bson_document);

      auto users_coll = mongo_pool_->GetCollection("users");
      auto users_meta_coll = mongo_pool_->GetCollection("users_meta");
      auto participants = bson_document["participants"];

      std::unordered_set<std::string> users;
      users.insert(user_id);
      for (const auto& p : participants) {
        if (!p.HasMember("email") || !p.HasMember("role")) {
          request.SetResponseStatus(
              userver::server::http::HttpStatus::kBadRequest);
          return R"({"error": "Participant must have email and role"})";
        }

        std::string email = p["email"].As<std::string>();
        std::string role = p["role"].As<std::string>();

        std::transform(email.begin(), email.end(), email.begin(),
               [](unsigned char c){ return std::tolower(c); });

        std::transform(role.begin(), role.end(), role.begin(),
               [](unsigned char c){ return std::tolower(c); });

        if (!models::RoleFromString(role).has_value()) {
          request.SetResponseStatus(
              userver::server::http::HttpStatus::kBadRequest);
          return R"({"error": "Invalid role: )" + role + "\"}";
        }

        auto user_meta = users_meta_coll.FindOne(MakeDoc("email", email));
        if (!user_meta.has_value()) {
          request.SetResponseStatus(
              userver::server::http::HttpStatus::kBadRequest);
          return R"({"error": "User not found: )" + email + "\"}";
        }

        auto p_id = user_meta.value()["user_id"].As<Oid>();
        if (!users.insert(p_id.ToString()).second) {
          request.SetResponseStatus(userver::server::http::HttpStatus::kBadRequest);
          return R"({"error": "User cannot be added twice: )" + email + "\"}";
        }

        users_docs.push_back(MakeDoc("id", p_id, "role", role));
      }

      builder["participants"] = users_docs;
      bson_document = builder.ExtractValue();
    }
    
    // Default role for creator
    users_docs.push_back(
        MakeDoc("id", Oid(user_id), "role", models::RoleToString(models::Role::Lead)));

    /* builder scope */ {
      userver::formats::bson::ValueBuilder builder(bson_document);
      builder["creator_id"] = Oid(user_id);
      bson_document = builder.ExtractValue();
    }

    {
      userver::formats::bson::ValueBuilder builder(bson_document);
      builder["status"] = "draft";
      bson_document = builder.ExtractValue();
    }

    if (!bson_document.HasMember("_id")) {
      ValueBuilder builder;
      builder = bson_document;

      auto generated_oid = Oid();

      builder["_id"] = generated_oid;
      bson_document = builder.ExtractValue();
    }

    //If using template
    if (request.HasArg("template_id")) {
      auto template_id = request.GetArg("template_id");

      auto sc_coll = mongo_pool_->GetCollection("scenarios");
      auto oid = userver::formats::bson::Oid(template_id);
      auto doc = sc_coll.FindOne(MakeDoc("_id", oid));

      LOG_CRITICAL() << "KEK: " << template_id;

      if (doc.has_value()) {
        auto sc_bson = doc.value();

        userver::formats::bson::ValueBuilder builder(bson_document);
        builder["name"] = sc_bson["name"].As<std::string>();
        builder["description"] = sc_bson["description"].As<std::string>();
        if(sc_bson.HasMember("location")){
          builder["location"] = sc_bson["location"].As<std::string>();
        } else{
          builder["location"] = "";
        }
        builder["status"] = "draft";

        auto now = std::chrono::system_clock::now();
        auto now_ms = std::chrono::duration_cast<std::chrono::milliseconds>(
                now.time_since_epoch())
                .count();

        builder["blocks"] = MakeArray();

        builder["versions"] = MakeArray(MakeDoc(
                "timestamp", now_ms,
                "author", Oid(user_id),
                "used_blocks", sc_bson["blocks"].As<std::vector<Oid>>()));
        bson_document = builder.ExtractValue();
      } else {
        request.SetResponseStatus(userver::server::http::HttpStatus::kBadRequest);
        return std::string(R"({"status": "error", "message": "Template with such id not found"})");
      }
    }

    const auto inserted_id = bson_document["_id"];
    

    auto scenarios_coll = mongo_pool_->GetCollection("scenarios");
    const auto result = scenarios_coll.InsertOne(bson_document);

    auto maybe_doc = scenarios_coll.FindOne(MakeDoc("_id", inserted_id));

    if (!maybe_doc) {
      request.SetResponseStatus(
          userver::server::http::HttpStatus::kInternalServerError);
      return std::string(
          R"({"status": "error", "message": "Failed to retrieve inserted scenario"})");
    }

    auto users_coll = mongo_pool_->GetCollection("users");
    for (const auto& udoc : users_docs) {
      auto result = users_coll.UpdateOne(
          MakeDoc("_id", udoc["id"]),
          MakeDoc("$push",
                  MakeDoc("project_ids", inserted_id)));
    }

    auto& doc = *maybe_doc;
    auto string_id = doc["_id"].As<Oid>().ToString();
    auto creator_id = doc["creator_id"].As<Oid>().ToString();
    userver::formats::bson::ValueBuilder builder(doc);
    builder["_id"] = string_id;
    builder["creator_id"] = creator_id;
    builder["status"] = "draft";

    if (!request.HasArg("template_id")) {
      auto new_version_result = scenariosus::CreateNewVersion(
        bson::Oid(string_id), Oid(user_id), MakeArray(), mongo_pool_);
      
      if (!new_version_result) {
        request.SetResponseStatus(
            userver::server::http::HttpStatus::kInternalServerError);
        return std::string(
            R"({"status": "error", "message": "Failed to update versions array"})");
      }
    }

    userver::formats::bson::ValueBuilder ps_builder;
    for (const auto& p : doc["participants"]) {
      userver::formats::bson::ValueBuilder p_builder(p);
      p_builder["id"] = p["id"].As<bson::Oid>().ToString();
      p_builder["role"] = p["role"].As<std::string>();
      ps_builder.PushBack(p_builder.ExtractValue());
    }
    {
      userver::formats::bson::ValueBuilder p_builder;
      p_builder["id"] = Oid(user_id);
      p_builder["role"] = "lead";
      ps_builder.PushBack(p_builder.ExtractValue());
    }
    builder["participants"] = ps_builder.ExtractValue();
    builder["status"] = "draft";

    auto modified_doc = builder.ExtractValue();
    return userver::formats::bson::ToLegacyJsonString(modified_doc);
  } catch (const std::exception& e) {
    auto& response = request.GetHttpResponse();
    response.SetStatus(userver::server::http::HttpStatus::kInternalServerError);
    return std::string{"{\"error\": \""} + e.what() + "\"}";
  }
}

}  // namespace

void AppendCreateScenario(userver::components::ComponentList& component_list) {
  component_list.Append<CreateScenario>();
}

}  // namespace scenario::create