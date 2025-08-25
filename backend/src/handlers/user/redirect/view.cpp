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
#include <userver/server/request/request_context.hpp>

#include "../../../models/invite.hpp"

namespace users::invite {

namespace {

const std::string kLocationHeader = "Location";

class InviteRedirect final : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "handler-redirect-invited-user";

  InviteRedirect(const userver::components::ComponentConfig& config,
                 const userver::components::ComponentContext& component_context)
      : HttpHandlerBase(config, component_context),
        mongo_pool_(
            component_context.FindComponent<userver::components::Mongo>("mongo-db-1")
                .GetPool()) {}

  std::string HandleRequestThrow(
      const userver::server::http::HttpRequest& request,
      userver::server::request::RequestContext& context) const override {
    const auto& invite_id = request.GetPathArg("invite_id");

    const auto& invite_collection = mongo_pool_->GetCollection("invites");
    const auto invite_search_result =
        invite_collection.FindOne(userver::formats::bson::MakeDoc(
            "_id", userver::formats::bson::Oid(invite_id)));

    auto& response = request.GetHttpResponse();

    if (!invite_search_result.has_value()) {
      response.SetStatus(userver::http::kNotFound);
      return {};
    }

    context.SetData("user_id", std::string("68a0ae31f69abf476d01db6a"));

    auto* user_id_ptr = context.GetDataOptional<std::string>("user_id");
    if (!user_id_ptr) {
      response.SetStatus(userver::http::kUnauthorized);
      return {};
    }
    const auto& user_id = *user_id_ptr;

    auto invite = models::InviteFromBson(invite_search_result.value());
    auto scenario_collection = mongo_pool_->GetCollection("scenarios");
    if (!invite.email.empty()) {
      auto users_meta = mongo_pool_->GetCollection("users_meta");
      auto users = mongo_pool_->GetCollection("users");
      auto user_doc_opt = users.FindOne(userver::formats::bson::MakeDoc("_id", formats::bson::Oid(user_id)));
      if (!user_doc_opt) {
        response.SetStatus(userver::http::kUnauthorized);
        return {};
      }
      const auto user_doc = user_doc_opt.value();
      auto meta_id = user_doc["meta_id"].As<std::string>();
      auto meta_doc_opt = users_meta.FindOne(userver::formats::bson::MakeDoc("_id", meta_id));
      if (!meta_doc_opt) {
        response.SetStatus(userver::http::kUnauthorized);
        return {};
      }
      const auto meta_doc = meta_doc_opt.value();
      auto user_email = meta_doc["email"].As<std::string>("");
      if (user_email != invite.email) {
        response.SetStatus(userver::http::kForbidden);
        return {};
      }
    }

    // Build BSON array of roles
    userver::formats::bson::ValueBuilder roles_builder;
    roles_builder = userver::formats::bson::MakeArray();
    roles_builder.PushBack(invite.role);

    auto update = userver::formats::bson::MakeDoc(
        "$set",
        userver::formats::bson::MakeDoc(
            fmt::format("users.{}", user_id),
            userver::formats::bson::MakeDoc(
                "user",
                userver::formats::bson::MakeDoc("id", user_id),
                "roles", roles_builder.ExtractValue())));

    const auto& scenario_update_result = scenario_collection.UpdateOne(
        userver::formats::bson::MakeDoc(
            "_id", userver::formats::bson::Oid(invite.scenario_id)),
        update);

    if (!scenario_update_result.ModifiedCount()) {
      response.SetStatus(userver::http::kNotFound);
      return {};
    }

    LOG_INFO() << "User with id " << user_id << " added to scenario with id "
               << invite.scenario_id;

    // TODO: NORMAL ROUTE
    response.SetHeader(kLocationHeader, "https://ya.ru");
    response.SetStatus(userver::server::http::HttpStatus::kMovedPermanently);

    return {};
  }

  userver::storages::mongo::PoolPtr mongo_pool_;
};

}  // namespace

void AppendInviteRedirect(userver::components::ComponentList& component_list) {
  component_list.Append<InviteRedirect>();
}

}  // namespace users::redirect