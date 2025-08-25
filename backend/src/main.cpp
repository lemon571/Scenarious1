#include <userver/clients/dns/component.hpp>
#include <userver/clients/http/component.hpp>
#include <userver/components/component.hpp>
#include <userver/components/component_list.hpp>
#include <userver/components/minimal_server_component_list.hpp>
#include <userver/congestion_control/component.hpp>
#include <userver/server/handlers/ping.hpp>
#include <userver/server/handlers/server_monitor.hpp>
#include <userver/server/handlers/tests_control.hpp>
#include <userver/testsuite/testsuite_support.hpp>

#include <userver/storages/mongo/component.hpp>

#include <userver/utils/daemon_run.hpp>

#include "handlers/auth/check/view.hpp"
#include "handlers/auth/yandex/view.hpp"
#include "handlers/blocks/create_block/view.hpp"
#include "handlers/blocks/get_block_by_id/view.hpp"
#include "handlers/blocks/get_blocks_by_scenario_id/view.hpp"
#include "handlers/blocks/latest_get_block/view.hpp"
#include "handlers/blocks/move_block/view.hpp"
#include "handlers/blocks/update_block_by_id/view.hpp"
#include "handlers/blocks/update_children/view.hpp"
#include "handlers/comments/post_comment/view.hpp"
#include "handlers/comments/comment_reply/view.hpp"
#include "handlers/comments/get_comments/view.hpp"
#include "handlers/scenarios/create_scenario/view.hpp"
#include "handlers/scenarios/update_scenario/view.hpp"
#include "handlers/scenarios/get_versions_by_id/view.hpp"
#include "handlers/scenarios/get_scenario_by_id/view.hpp"
#include "handlers/scenarios/get_scenarios_by_user_id/view.hpp"
#include "handlers/scenarios/delete_scenario/view.hpp"
#include "handlers/scenarios/update_blocks/view.hpp"
#include "handlers/templates/get-block-templates/view.hpp"
#include "handlers/templates/get-scenario-templates/view.hpp"
  
#include "handlers/blocks/delete_block_by_id/view.hpp"

#include "handlers/user/info/view.hpp"
#include "middlewares/auth.hpp"
#include "middlewares/cors.hpp"

int main(int argc, char* argv[]) {
  auto component_list = userver::components::MinimalServerComponentList()
                            .Append<userver::server::handlers::Ping>()
                            .Append<userver::components::TestsuiteSupport>()
                            .Append<userver::components::HttpClient>()
                            .Append<userver::server::handlers::TestsControl>()
                            .Append<userver::components::Mongo>("mongo-db-1")
                            .Append<scenariosus::GetBlockById>()
                            .Append<scenariosus::CreateBlock>()
                            .Append<userver::server::handlers::ServerMonitor>(
                                "handler-server-monitor");

  middleware::AppendCORSComponents(component_list);
  blocks::get_blocks_by_scenario_id::AppendGetBlocksByScenarioId(
      component_list);
  blocks::latest_get_block::AppendLatestGetBlock(component_list);
  blocks::move_block::AppendMoveBlock(component_list);
  comments::post_comment::AppendPostComment(component_list);
  comments::comment_reply::AppendCommentReply(component_list);
  comments::get_comments::AppendGetComments(component_list);
  scenario::create::AppendCreateScenario(component_list);
  scenario::update::AppendUpdateScenario(component_list);
  scenario::get_versions_by_id::AppendGetVersionsById(component_list);
  scenario::get_scenario_by_id::AppendGetScenarioById(component_list);
  scenario::get_scenarios_by_user_id::AppendGetScenariosByUserId(component_list);
  scenario::update_blocks::AppendUpdateScenarioBlocks(component_list);

  scenario::get_scenario_templates::AppendGetScenarioTemplates(component_list);
  scenario::get_block_templates::AppendGetBlockTemplates(component_list);

  scenariosus::handlers::AppendGetUserInfo(component_list);

  auth::yandex::AppendGetTokenByYandexId(component_list);
  middleware::auth::AppendAuthMiddleware(component_list);
  auth::AppendAuthCheck(component_list);
  blocks::update_block::AppendUpdateBlockById(component_list);
  blocks::update_block::AppendUpdateBlockChildren(component_list);

  blocks::delete_block::AppendDeleteBlockById(component_list);

  scenario::delete_scenario::AppendDeleteScenario(component_list);

  return userver::utils::DaemonMain(argc, argv, component_list);
}
