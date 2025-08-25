#include "view.hpp"

#include <string>
#include <userver/components/component.hpp>
#include <userver/components/component_context.hpp>
#include <userver/components/component_list.hpp>
#include <userver/formats/bson/inline.hpp>
#include <userver/formats/bson/serialize.hpp>
#include <userver/formats/serialize/common_containers.hpp>
#include <userver/server/handlers/http_handler_base.hpp>
#include <userver/storages/mongo/component.hpp>
#include <userver/storages/mongo/options.hpp>
#include <userver/storages/mongo/pool.hpp>

namespace scenario::get_scenarios_by_user_id {

namespace {

class GetScenariosByUserId final : public userver::server::handlers::HttpHandlerBase {
  public:
    static constexpr std::string_view kName = "handler-get-scenarios-by-user-id";

    GetScenariosByUserId(const userver::components::ComponentConfig& config,
                         const userver::components::ComponentContext& component_context)
        : HttpHandlerBase(config, component_context),
          mongo_pool_(component_context.FindComponent<userver::components::Mongo>("mongo-db-1").GetPool()) {}

    std::string HandleRequestThrow(const userver::server::http::HttpRequest& request,
                                   userver::server::request::RequestContext& context) const override {
        using userver::formats::bson::MakeArray;
        using userver::formats::bson::MakeDoc;
        using userver::formats::bson::Oid;
        using userver::formats::bson::ValueBuilder;

        Oid user_id;
        try {
            context.SetData("user_id", std::string("68a0ae31f69abf476d01db69"));
            std::string user_id_str = context.GetData<std::string>("user_id");
            user_id = Oid(user_id_str);
        } catch (const std::exception& e) {
            auto& response = request.GetHttpResponse();
            response.SetStatus(userver::server::http::HttpStatus::kInternalServerError);
            return "{\"error\": \"Failed to retrieve user_id from context\"}";
        }

        auto users_coll = mongo_pool_->GetCollection("users");
        auto users_meta_coll = mongo_pool_->GetCollection("users_meta");
        auto scenarios_coll = mongo_pool_->GetCollection("scenarios");

        auto user_doc = users_coll.FindOne(MakeDoc("_id", user_id));
        if (!user_doc) {
            auto& response = request.GetHttpResponse();
            response.SetStatus(userver::server::http::HttpStatus::kUnauthorized);
            return "{\"error\": \"User not found\"}";
        }

        auto project_ids_value = (*user_doc)["project_ids"];
        if (project_ids_value.IsEmpty()) {
            auto& response = request.GetHttpResponse();
            response.SetStatus(userver::server::http::HttpStatus::kNotFound);
            return "[]";
        }

        auto query = MakeDoc("_id", MakeDoc("$in", project_ids_value));

        userver::storages::mongo::options::Projection projection;
        projection.Exclude("blocks");

        auto cursor = scenarios_coll.Find(query, projection);

        std::string result_json_string = "[ ";
        for (const auto& doc : cursor) {
            ValueBuilder bson_doc(doc);
            bson_doc["_id"] = doc["_id"].As<Oid>().ToString();

            auto user_meta = users_meta_coll.FindOne(MakeDoc("_id", user_id));
            if(user_meta){
                bson_doc["updatedBy"] = user_meta;
            }

            bson_doc["updatedAT"] = doc["versions"][doc["versions"].GetSize()-1]["timestamp"].As<int64_t>();
            bson_doc["blocksCount"] = doc["versions"][doc["versions"].GetSize()-1]["used_blocks"].GetSize();
            // JIC
            if (doc.HasMember("director_id")) {
                bson_doc["creator_id"] = doc["director_id"].As<Oid>().ToString();
            }
            if (doc.HasMember("creator_id")) {
                bson_doc["creator_id"] = doc["creator_id"].As<Oid>().ToString();
            }

            auto participants = doc["participants"];
            if (!participants.IsEmpty()) {
                for (const auto& participant : participants) {
                    if (participant["id"].As<Oid>() == user_id) {
                        bson_doc["role"] = participant["role"];
                        break;
                    }
                }
            }

            if(!bson_doc.HasMember("role")){
                bson_doc["role"] = "lead";
            }

            if (result_json_string.size() != 2) {
                result_json_string += ", ";
            }
            result_json_string += userver::formats::bson::ToLegacyJsonString(bson_doc.ExtractValue());
        }
        result_json_string += " ]";

        return result_json_string;
    }

  private:
    userver::storages::mongo::PoolPtr mongo_pool_;
};

}  // namespace

void AppendGetScenariosByUserId(userver::components::ComponentList& component_list) {
    component_list.Append<GetScenariosByUserId>();
}

}  // namespace scenario::get_scenarios_by_user_id
