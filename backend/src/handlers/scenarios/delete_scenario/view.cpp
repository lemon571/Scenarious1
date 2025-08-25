#include "view.hpp"

#include <fmt/format.h>
#include <algorithm>
#include <cstddef>

#include <userver/formats/serialize/common_containers.hpp>
#include <userver/clients/dns/component.hpp>
#include <userver/components/component.hpp>
#include <userver/formats/bson/bson_builder.hpp>
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
#include <userver/storages/mongo/bulk.hpp>

#include <vector>

#include "../../../lib/get_user_role_by_scenario_id.hpp"

namespace scenario::delete_scenario {

namespace {

class DeleteScenario final
    : public userver::server::handlers::HttpHandlerBase {

 public:
  static constexpr std::string_view kName = "handler-delete-scenario";
  DeleteScenario(
      const userver::components::ComponentConfig& config,
      const userver::components::ComponentContext& component_context)
      : HttpHandlerBase(config, component_context),
        mongo_pool_(component_context
                        .FindComponent<userver::components::Mongo>("mongo-db-1")
                        .GetPool()) {}

  std::string HandleRequestThrow(
      const userver::server::http::HttpRequest& request,
      userver::server::request::RequestContext& context) const override {
    using namespace userver::formats::bson;
    using namespace userver::storages::mongo;

    const auto scenario_id = request.GetPathArg("scenario_id");
    const auto scenario_oid = Oid{scenario_id};

    context.SetData("user_id", std::string("68a0ae31f69abf476d01db69"));
  std::string user_id_str = context.GetData<std::string>("user_id");
    const auto user_oid = Oid{user_id_str};

    auto user_role = scenariosus::GetUserRoleBySceanrioId(scenario_oid, user_oid, mongo_pool_);
    if (!user_role || user_role.value() != scenario::models::Role::Lead) {
        auto& error_response = request.GetHttpResponse();
        error_response.SetStatus(userver::server::http::HttpStatus::kForbidden);
        return {};
    }

    try {
      std::vector<Oid> blocks_to_delete;
      {
        auto cursor = mongo_pool_->GetCollection("scenarios").Find(
            MakeDoc("_id", Oid(scenario_id)));

        if (cursor) {
          for (const auto& doc : cursor) {
            const auto versions = doc["versions"];
            for (const auto& version : versions) {
              const auto used_blocks = version["used_blocks"].As<std::vector<Oid>>();
              for (const auto& block : used_blocks) {
                blocks_to_delete.push_back(block);
              }
            }
          }
        }
      }

      if (!blocks_to_delete.empty()) {
          mongo_pool_->GetCollection("blocks").DeleteMany(
              MakeDoc(
                  "$and",
                  MakeArray(
                      MakeDoc("_id", MakeDoc("$in", blocks_to_delete)),
                      MakeDoc("is_template", false)
                  )
              )
          );
      }

      auto delete_result = mongo_pool_->GetCollection("scenarios").DeleteOne(
          MakeDoc("_id", Oid(scenario_id)));

      if (delete_result.DeletedCount() == 0) {
        request.SetResponseStatus(userver::server::http::HttpStatus::kNotFound);
        return "Scenario not found";
      }

      return "Scenario deleted successfully";

    } catch (const std::exception& ex) {
      LOG_ERROR() << "Failed to delete scenario: " << ex.what();
      request.SetResponseStatus(userver::server::http::HttpStatus::kInternalServerError);
      return "Internal server error";
    }
  }

 private:
  userver::storages::mongo::PoolPtr mongo_pool_;
};

}  // namespace
void AppendDeleteScenario(userver::components::ComponentList& component_list) {
  component_list.Append<DeleteScenario>();
}

}  // namespace scenario::delete_scenario
