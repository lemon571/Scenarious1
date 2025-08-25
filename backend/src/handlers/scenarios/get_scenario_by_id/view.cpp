#include "view.hpp"

#include <fmt/format.h>

#include <string>
#include <userver/clients/dns/component.hpp>
#include <userver/components/component.hpp>
#include <userver/formats/bson/bson_builder.hpp>
#include <userver/formats/bson/exception.hpp>
#include <userver/formats/bson/inline.hpp>
#include <userver/formats/bson/types.hpp>
#include <userver/formats/bson/value.hpp>
#include <userver/formats/bson/value_builder.hpp>
#include <userver/formats/json.hpp>
#include <userver/formats/json/value.hpp>
#include <userver/formats/json/value_builder.hpp>
#include <userver/http/status_code.hpp>
#include <userver/logging/log.hpp>
#include <userver/server/handlers/http_handler_base.hpp>
#include <userver/storages/mongo/component.hpp>
#include <userver/storages/mongo/options.hpp>
#include <userver/storages/mongo/pool.hpp>
#include <userver/storages/mongo/write_result.hpp>

#include "../../../models/comment.hpp"
#include "../../../models/user.hpp"

#include "../../../lib/get_user_role_by_scenario_id.hpp"

namespace scenario::get_scenario_by_id {

namespace {

class GetScenarioById final
    : public userver::server::handlers::HttpHandlerBase {
private:
  void getScenarioBasicInfo(std::optional<userver::formats::bson::Document> scenario_info, userver::formats::json::ValueBuilder& result) const {
    if (!scenario_info.has_value()) {
      return;
    }

    const auto& scenario_bson = scenario_info.value();
    if (!scenario_bson.HasMember("name")) {
      throw std::runtime_error("Scenario missing name");
    }
    result["name"] = scenario_bson["name"].As<std::string>();

    if (!scenario_bson.HasMember("status")) {
      throw std::runtime_error("Scenario missing status");
    }
    result["status"] = scenario_bson["status"].As<std::string>();

    if (scenario_bson.HasMember("start")) {
      result["start"] = scenario_bson["start"].As<int64_t>();
    } else if (scenario_bson.HasMember("start_time")){
      result["start"] = scenario_bson["start_time"].As<int64_t>();
    } else {
      throw std::runtime_error("Scenario missing start or start_time");
    }

    if (scenario_bson.HasMember("creator_id")) {
      result["creator_id"] = scenario_bson["creator_id"].As<userver::formats::bson::Oid>().ToString();
    } else if (scenario_bson.HasMember("director_id")){
      result["creator_id"] = scenario_bson["director_id"].As<userver::formats::bson::Oid>().ToString();
    } else {
      throw std::runtime_error("Scenario missing creator_id or director_id");
    }

    if (!scenario_bson.HasMember("location")) {
      throw std::runtime_error("Scenario missing location");
    }
    result["location"] = scenario_bson["location"].As<std::string>();

    if (scenario_bson.HasMember("comments")) {
        result["comments"] = scenario_bson["comments"].As<std::vector<scenariosus::Comment>>();
    } else {
        result["comments"] = userver::formats::json::MakeArray();
    }
    
    userver::formats::json::ValueBuilder participants_array;
    if (scenario_bson.HasMember("participants")) {
      for (const auto& participant : scenario_bson["participants"]) {
          participants_array.PushBack(
              userver::formats::json::MakeObject(
                  "id", participant["id"].As<userver::formats::bson::Oid>().ToString(),
                  "role", participant["role"].As<std::string>()
              )
          );
      }
    }
    result["participants"] = participants_array;
  }
 public:
  static constexpr std::string_view kName = "handler-get-scenario-by-id";

  GetScenarioById(
      const userver::components::ComponentConfig& config,
      const userver::components::ComponentContext& component_context)
      : HttpHandlerBase(config, component_context),
        mongo_pool_(component_context
          .FindComponent<userver::components::Mongo>("mongo-db-1")
          .GetPool()) {}

          std::string HandleRequestThrow(
      const userver::server::http::HttpRequest& request,
      userver::server::request::RequestContext& context) const override {
        const auto& scenario_id = request.GetPathArg("scenario_id");
        userver::formats::bson::Oid scenario_oid;
        try {
          scenario_oid = userver::formats::bson::Oid(scenario_id);
        } catch (const userver::formats::bson::BsonException&) {
          auto& response = request.GetHttpResponse();
          response.SetStatus(userver::http::kBadRequest);
          return {};
        }

        context.SetData("user_id", std::string("68a0ae31f69abf476d01db69"));
  std::string user_id_str = context.GetData<std::string>("user_id");
        auto user_oid = userver::formats::bson::Oid(user_id_str);
        auto user_role = scenariosus::GetUserRoleBySceanrioId(
            userver::formats::bson::Oid(scenario_id), user_oid, mongo_pool_);
        if(!user_role.has_value()) {
          auto& error_response = request.GetHttpResponse();
          error_response.SetStatus(userver::http::kForbidden);
          return {};
        }

        auto scenario_collection = mongo_pool_->GetCollection("scenarios");
        auto scenario_versions = scenario_collection.FindOne(
          userver::formats::bson::MakeDoc("_id", scenario_oid),
          userver::storages::mongo::options::Projection{"versions"});
        if(!scenario_versions.has_value()) {
          auto& response = request.GetHttpResponse();
          response.SetStatus(userver::http::kNotFound);
          return R"({"error": "Scenario doesn't have versions"})";
        }
    
        int version_count = scenario_versions.value()["versions"].GetSize();
        int version_id;
        if (request.HasArg("version_id")) {
          try {
            version_id = std::stoi(request.GetArg("version_id"));
          } catch (const std::exception&) {
            auto& response = request.GetHttpResponse();
            response.SetStatus(userver::http::kBadRequest);
            return R"({"error": "Invalid version_id format"})";
          }

          // if(!(user_role.value() == scenario::models::Role::Lead ||
          //   user_role.value() == scenario::models::Role::ScreenWriter)){
          //   auto& error_response = request.GetHttpResponse();
          //   error_response.SetStatus(userver::http::kForbidden);
          //   return {};
          // }

          if (version_id < 0) {
            auto& response = request.GetHttpResponse();
            response.SetStatus(userver::http::kBadRequest);
            return R"({"error": "version_id must be positive"})";
          }
        } else {
          version_id = version_count-1;
        }

        if (version_count <= version_id) {
          auto& response = request.GetHttpResponse();
          response.SetStatus(userver::http::kNotFound);
          return R"({"error": "Version not exist"})";
        }

    // This determins are we trying to simply get version by id 
    // or making request for shourt pulling
    bool short_pulling_flag = false;
    if (request.HasArg("short_pulling_flag")) {
      short_pulling_flag = request.GetArg("short_pulling_flag") == "true";
    }

    // If version is last return empty result (for short pulling)
    if (short_pulling_flag) {
      if (version_id == version_count-1) {
        return {};
      } else {
        version_id = version_count-1;
      }
    }

    userver::formats::json::ValueBuilder result;
    try {
    result["id"] = scenario_id;
    if (version_id == version_count-1) {
      auto scenario_basic_info = scenario_collection.FindOne(
        userver::formats::bson::MakeDoc("_id", scenario_oid),
        userver::storages::mongo::options::Projection{
            "name", "status", "start", "start_time", "creator_id", "director_id", "location", "comments", "participants"});
      getScenarioBasicInfo(scenario_basic_info, result);
    }
    else {
      getScenarioBasicInfo(scenario_versions.value()["versions"][version_id]["scenario_meta"], result);
    }
    result["blocksCount"] = scenario_versions.value()["versions"][version_id]["used_blocks"].GetSize();
    } catch (const std::exception& e) {
        return e.what();
    }

    return userver::formats::json::ToString(result.ExtractValue());
  }

 private:
  userver::storages::mongo::PoolPtr mongo_pool_;
};

}  // namespace

void AppendGetScenarioById(userver::components::ComponentList& component_list) {
  component_list.Append<GetScenarioById>();
}

}  // namespace blocks::get_scenario_by_id
