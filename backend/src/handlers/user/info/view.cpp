#include "view.hpp"
#include <userver/components/component_context.hpp>
#include <userver/formats/bson/inline.hpp>
#include <userver/formats/json/serialize.hpp>
#include <userver/server/handlers/http_handler_base.hpp>
#include <userver/storages/mongo/component.hpp>

namespace scenariosus::handlers {

namespace {

const std::string kAvatarUrl = "https://avatars.yandex.net/get-yapic/";
const std::string kAvatarSize = "/islands-200";

class GetUserInfo final : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "handler-get-user-info";
  GetUserInfo(const userver::components::ComponentConfig& config,
              const userver::components::ComponentContext& context)
      : HttpHandlerBase(config, context),
        mongo_pool_(
            context.FindComponent<userver::components::Mongo>("mongo-db-1")
                .GetPool()) {}

  std::string HandleRequestThrow(
      const userver::server::http::HttpRequest&,
      userver::server::request::RequestContext& context) const {
    using userver::formats::bson::Oid;
    context.SetData("user_id", std::string("68a0ae31f69abf476d01db69"));
    auto user_id = context.GetData<std::string>("user_id");

    auto meta =  mongo_pool_->GetCollection("users_meta").FindOne(
        userver::formats::bson::MakeDoc("user_id", Oid(user_id))).value();
    
    userver::formats::json::ValueBuilder result;
    result["name"] = meta["display_name"].As<std::string>();
    result["email"] = meta["email"].As<std::string>();
    result["avatar_url"] =
        kAvatarUrl + meta["avatar_id"].As<std::string>() + kAvatarSize;

    return userver::formats::json::ToString(result.ExtractValue());
  }

 private:
  userver::storages::mongo::PoolPtr mongo_pool_;
};

}  // namespace

void AppendGetUserInfo(userver::components::ComponentList& component_list) {
  component_list.Append<GetUserInfo>();
}

}  // namespace scenariosus::handlers