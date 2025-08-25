#include "view.hpp"
#include <chrono>
#include <userver/clients/http/client.hpp>
#include <userver/clients/http/component.hpp>
#include <userver/components/component_config.hpp>
#include <userver/components/component_context.hpp>
#include <userver/formats/bson/inline.hpp>
#include <userver/formats/bson/types.hpp>
#include <userver/formats/json.hpp>
#include <userver/formats/json/inline.hpp>
#include <userver/formats/json/serialize.hpp>
#include <userver/formats/json/value.hpp>
#include <userver/formats/json/value_builder.hpp>
#include <userver/formats/serialize/common_containers.hpp>
#include <userver/server/handlers/http_handler_base.hpp>
#include <userver/server/http/http_status.hpp>
#include <userver/server/request/request_context.hpp>
#include <userver/storages/mongo/component.hpp>
#include <userver/utils/uuid4.hpp>

namespace auth::yandex {

namespace {

const std::string kYandexTokenUrl = "https://oauth.yandex.ru/token";
const std::string kYandexUserInfoUrl = "https://login.yandex.ru/info";

class YaAuthHandler final : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "handler-auth-yandex";

  YaAuthHandler(const userver::components::ComponentConfig& config,
                const userver::components::ComponentContext& context)
      : HttpHandlerBase(config, context),
        http_client_(context.FindComponent<userver::components::HttpClient>()
                         .GetHttpClient()),
        mongo_pool_(
            context.FindComponent<userver::components::Mongo>("mongo-db-1")
                .GetPool()) {
    const char* client_id_c = std::getenv("YANDEX_CLIENT_ID");
    const char* client_secret_c = std::getenv("YANDEX_CLIENT_SECRET");

    if (!client_id_c || !client_secret_c) {
      throw std::runtime_error(
          "YANDEX_CLIENT_ID or YANDEX_CLIENT_SECRET env vars not set");
    }

    client_id_ = client_id_c;
    client_secret_ = client_secret_c;
  }

  std::string HandleRequestThrow(
      const userver::server::http::HttpRequest& request,
      userver::server::request::RequestContext&) const {
    using userver::formats::bson::MakeDoc;
    using userver::formats::bson::Oid;

    const auto code = request.GetArg("code");
    if (code.empty()) {
      request.SetResponseStatus(userver::server::http::HttpStatus::kBadRequest);
      return R"({"error": "Missing code parameter"})";
    }

    auto token_resp =
        http_client_.CreateRequest()
            .post(kYandexTokenUrl)
            .headers({{"Content-Type", "application/x-www-form-urlencoded"}})
            .data(
                "grant_type=authorization_code"
                "&code=" +
                code + "&client_id=" + client_id_ +
                "&client_secret=" + client_secret_)
            .timeout(std::chrono::seconds{5})
            .perform();

    auto token_json = userver::formats::json::FromString(token_resp->body());
    if (token_json.HasMember("error")) {
      request.SetResponseStatus(
          userver::server::http::HttpStatus::kInternalServerError);
      return userver::formats::json::ToString(
          userver::formats::json::MakeObject("error",
                                             token_json["error_description"]));
    }

    const auto access_token = token_json["access_token"].As<std::string>();

    auto user_resp = http_client_.CreateRequest()
                         .get(kYandexUserInfoUrl)
                         .headers({{"Authorization", "OAuth " + access_token}})
                         .timeout(std::chrono::seconds{5})
                         .perform();

    if (user_resp->status_code() != 200) {
      request.SetResponseStatus(
          userver::server::http::HttpStatus::kInternalServerError);
      return R"({"error": "Failed to get Yandex user info"})";
    }

    auto user_json = userver::formats::json::FromString(user_resp->body());
    const auto yandex_id = user_json["id"].As<std::string>();
    const auto display_name = user_json["real_name"].As<std::string>("");
    const auto email = user_json["default_email"].As<std::string>("");
    const auto avatar_id = user_json["default_avatar_id"].As<std::string>("");

    auto auth_prov_coll = mongo_pool_->GetCollection("auth_providers");
    auto users_coll = mongo_pool_->GetCollection("users");
    auto meta_coll = mongo_pool_->GetCollection("users_meta");

    auto auth_doc = auth_prov_coll.FindOne(
        MakeDoc("provider", "yandex", "provider_id", yandex_id));

    auto user_id = Oid();
    auto meta_id = Oid();
    if (auth_doc.has_value()) {
      user_id = auth_doc.value()["user_id"].As<Oid>();
    } else {

      meta_coll.InsertOne(MakeDoc("_id", meta_id, "user_id", user_id, "display_name", display_name,
                                  "email", email, "avatar_id", avatar_id));

      users_coll.InsertOne(MakeDoc("_id", user_id, "meta_id", meta_id,
                                   "project_ids",
                                   userver::formats::bson::MakeArray()));

      auth_prov_coll.InsertOne(MakeDoc("user_id", user_id, "provider", "yandex",
                                       "provider_id", yandex_id));
    }

    const auto token = userver::utils::generators::GenerateUuid();
    auto sessions_coll = mongo_pool_->GetCollection("auth_sessions");
    sessions_coll.InsertOne(
        MakeDoc("token", token, "user_id", user_id, "expires_at",
                userver::utils::datetime::Now() + std::chrono::minutes(10)));

    auto& response = request.GetHttpResponse();
    response.SetHeader(
        std::string("Set-Cookie"),
        std::string("token=" + token + "; Path=/; HttpOnly; SameSite=None; Secure"));
    
    return {};
  }

 private:
  userver::clients::http::Client& http_client_;
  userver::storages::mongo::PoolPtr mongo_pool_;
  std::string client_id_;
  std::string client_secret_;
};
}  // namespace

void AppendGetTokenByYandexId(
    userver::components::ComponentList& component_list) {
  component_list.Append<YaAuthHandler>();
}

}  // namespace auth::yandex