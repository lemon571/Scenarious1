#include "view.hpp"

#include <fmt/format.h>

#include <cstdint>
#include <optional>
#include <string>
#include <userver/components/component_config.hpp>
#include <userver/components/component_context.hpp>
#include <userver/formats/bson/inline.hpp>
#include <userver/formats/bson/types.hpp>
#include <userver/formats/json.hpp>
#include <userver/formats/json/inline.hpp>
#include <userver/formats/json/serialize.hpp>
#include <userver/http/status_code.hpp>
#include <userver/server/handlers/http_handler_base.hpp>
#include <userver/storages/mongo/collection.hpp>
#include <userver/storages/mongo/component.hpp>
#include <userver/storages/mongo/pool.hpp>
#include <userver/utils/assert.hpp>
#include <userver/utils/datetime.hpp>

#include "../../../models/invite.hpp"

namespace users::invite {

namespace {

class UserInviter final : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "handler-invite-user";

  UserInviter(const userver::components::ComponentConfig& config,
              const userver::components::ComponentContext& component_context)
      : HttpHandlerBase(config, component_context),
        mongo_pool_(
            component_context.FindComponent<userver::components::Mongo>("mongo-db-1")
                .GetPool()) {}

  std::string HandleRequestThrow(
      const userver::server::http::HttpRequest& request,
      userver::server::request::RequestContext&) const override {
    auto request_body =
        userver::formats::json::FromString(request.RequestBody());
    auto role = request_body["role"].As<std::optional<std::string>>();
    auto scenario_id =
        request_body["scenario_id"].As<std::optional<std::string>>();
    auto email = request_body["email"].As<std::optional<std::string>>();

    if (!role.has_value() || !scenario_id.has_value() || !email.has_value()) {
      auto& error_response = request.GetHttpResponse();
      error_response.SetStatus(userver::http::kBadRequest);
      return {};
    }

    const auto& scenario_collection = mongo_pool_->GetCollection("scenarios");
    userver::formats::bson::Oid scenario_oid;
    try {
      scenario_oid = userver::formats::bson::Oid(scenario_id.value());
    } catch (const userver::formats::bson::BsonException&) {
      auto& error_response = request.GetHttpResponse();
      error_response.SetStatus(userver::http::kBadRequest);
      return {};
    }
    const auto scenario_search_result =
        scenario_collection.FindOne(userver::formats::bson::MakeDoc(
            "_id", scenario_oid));

    if (!scenario_search_result.has_value()) {
      auto& error_response = request.GetHttpResponse();
      error_response.SetStatus(userver::http::kNotFound);
      return {};
    }

    auto invite_data = models::Invite();
    invite_data.scenario_id = scenario_id.value();
    invite_data.role = role.value();
    invite_data.email = email.value();

    auto invites_collection = mongo_pool_->GetCollection("invites");
    auto insert_result =
        invites_collection.InsertOne(models::ToBson(invite_data));

    if (!insert_result.InsertedCount()) {
      auto& error_response = request.GetHttpResponse();
      error_response.SetStatus(userver::http::kBadRequest);
      return {};
    }

    LOG_INFO() << "Created new invite for scenario with id " << scenario_id.value();

    userver::formats::json::ValueBuilder response;
    response["invite_id"] = invite_data.id.value().ToString();

    return userver::formats::json::ToString(response.ExtractValue());
  }

  userver::storages::mongo::PoolPtr mongo_pool_;
};

}  // namespace

void AppendInviteCreator(userver::components::ComponentList& component_list) {
  component_list.Append<UserInviter>();
}

}  // namespace users::invite