#include "view.hpp"

#include <userver/formats/bson/inline.hpp>
#include <userver/formats/bson/serialize.hpp>
#include <userver/storages/mongo/component.hpp>
#include <userver/storages/mongo/options.hpp>

#include "../../../lib/get_user_role_by_scenario_id.hpp"

namespace scenario::update {

namespace {

UpdateScenario::UpdateScenario(const userver::components::ComponentConfig& config,
                               const userver::components::ComponentContext& component_context)
    : HttpHandlerBase(config, component_context),
      mongo_pool_(component_context.FindComponent<userver::components::Mongo>("mongo-db-1").GetPool()) {}

std::string UpdateScenario::HandleRequestThrow(const userver::server::http::HttpRequest& request,
                                               userver::server::request::RequestContext& context) const {
    using userver::formats::bson::MakeDoc;
    using userver::formats::bson::Oid;
    using userver::formats::bson::ValueBuilder;

    auto scenarios_coll = mongo_pool_->GetCollection("scenarios");

    const auto scenario_oid = Oid{request.GetPathArg("id")};

    context.SetData("user_id", std::string("68a0ae31f69abf476d01db69"));
    std::string user_id_str = context.GetData<std::string>("user_id");
    const auto user_oid = userver::formats::bson::Oid{user_id_str};

    auto user_role = scenariosus::GetUserRoleBySceanrioId(scenario_oid, user_oid, mongo_pool_);
    if (!user_role || user_role.value() != scenario::models::Role::Lead) {
        auto& error_response = request.GetHttpResponse();
        error_response.SetStatus(userver::server::http::HttpStatus::kForbidden);
        return {};
    }

    auto updated_doc = userver::formats::bson::FromJsonString(request.RequestBody());

    userver::formats::bson::ValueBuilder update_builder;

    for (const auto& [key, value] : Items(updated_doc)) {
        if (key != "scenario") {
            update_builder[key] = value;
        }
    }

    auto filter = MakeDoc("_id", scenario_oid);
    auto update = MakeDoc("$set", update_builder.ExtractValue());

    auto result = scenarios_coll.UpdateOne(filter, update);

    if (result.MatchedCount() == 0) {
        auto& response = request.GetHttpResponse();
        response.SetStatus(userver::server::http::HttpStatus::kNotFound);
        return "{\"error\": \"No scenario found with such ID.\"}";
    }

    auto maybe_doc = scenarios_coll.FindOne(MakeDoc("_id", scenario_oid));

    if (!maybe_doc) {
        auto& response = request.GetHttpResponse();
        response.SetStatus(userver::server::http::HttpStatus::kNotFound);
        return "{\"error\": \"Failed to retrieve inserted scenario.\"}";
    }

    auto& doc = *maybe_doc;
    auto string_id = doc["_id"].As<Oid>().ToString();

    userver::formats::bson::ValueBuilder builder(doc);
    builder["_id"] = string_id;

    auto modified_doc = builder.ExtractValue();
    return userver::formats::bson::ToLegacyJsonString(modified_doc);
}

}  // namespace

void AppendUpdateScenario(userver::components::ComponentList& component_list) {
    component_list.Append<UpdateScenario>();
}

}  // namespace scenario::update
