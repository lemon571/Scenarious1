#include "view.hpp"

#include <userver/components/component.hpp>
#include <userver/components/component_list.hpp>
#include <userver/formats/bson/inline.hpp>
#include <userver/formats/bson/serialize.hpp>
#include <userver/server/handlers/http_handler_base.hpp>
#include <userver/storages/mongo/component.hpp>
#include <userver/storages/mongo/options.hpp>
#include <userver/storages/mongo/pool.hpp>
#include "../../../lib/get_user_role_by_scenario_id.hpp"

namespace scenario::get_versions_by_id {

namespace {

class GetVersionsById final : public userver::server::handlers::HttpHandlerBase {
  public:
    static constexpr std::string_view kName = "handler-get-versions-by-scenario-id";

    GetVersionsById(const userver::components::ComponentConfig& config,
                    const userver::components::ComponentContext& component_context)
        : HttpHandlerBase(config, component_context),
          mongo_pool_(component_context.FindComponent<userver::components::Mongo>("mongo-db-1").GetPool()) {}

    std::string HandleRequestThrow(const userver::server::http::HttpRequest& request,
                                   userver::server::request::RequestContext& context) const override {
        using userver::formats::bson::MakeDoc;
        using userver::formats::bson::Oid;

        const auto& scenario_id = request.GetPathArg("scenario_id");
        Oid scenario_oid;
        try {
            scenario_oid = Oid(scenario_id);
        } catch (const userver::formats::bson::BsonException&) {
            auto& response = request.GetHttpResponse();
            response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
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

        if(!(user_role.value() == scenario::models::Role::Lead ||
            user_role.value() == scenario::models::Role::ScreenWriter)){
          auto& error_response = request.GetHttpResponse();
          error_response.SetStatus(userver::http::kForbidden);
          return {};
        }

        auto scenarios_coll = mongo_pool_->GetCollection("scenarios");

        userver::storages::mongo::options::Projection projection;
        projection.Include("versions.timestamp").Include("versions.author").Exclude("_id");

        auto maybe_doc = scenarios_coll.FindOne(MakeDoc("_id", scenario_oid), projection);

        if (!maybe_doc) {
            auto& response = request.GetHttpResponse();
            response.SetStatus(userver::server::http::HttpStatus::kNotFound);
            return {};
        }

        return userver::formats::bson::ToLegacyJsonString(*maybe_doc);
    }

  private:
    userver::storages::mongo::PoolPtr mongo_pool_;
};

}  // namespace

void AppendGetVersionsById(userver::components::ComponentList& component_list) {
    component_list.Append<GetVersionsById>();
}

}  // namespace scenario::get_versions_by_id
