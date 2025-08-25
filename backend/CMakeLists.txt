cmake_minimum_required(VERSION 3.12)
project(scenariosus CXX)


# Adding userver dependency
find_package(userver COMPONENTS core mongo QUIET)
if(NOT userver_FOUND)  # Fallback to subdirectory usage
# Enable userver libraries that are needed in this project
set(USERVER_FEATURE_POSTGRESQL OFF CACHE BOOL "" FORCE)

# Compatibility mode: some systems don't support these features
set(USERVER_FEATURE_CRYPTOPP_BLAKE2 OFF CACHE BOOL "" FORCE)
set(USERVER_FEATURE_GRPC_CHANNELZ OFF CACHE BOOL "" FORCE)
set(USERVER_FEATURE_REDIS_HI_MALLOC ON CACHE BOOL "" FORCE)

if (EXISTS third_party/userver)
message(STATUS "Using userver framework from third_party/userver")
add_subdirectory(
  ${CMAKE_CURRENT_SOURCE_DIR}/third_party/userver
  ${CMAKE_CURRENT_BINARY_DIR}/userver
)
else()
message(FATAL_ERROR "Either install the userver or provide a path to it")
endif()
endif()

userver_setup_environment()

# Common sources
add_library(${PROJECT_NAME}_objs OBJECT
  src/handlers/blocks/get_block_by_id/view.hpp
  src/handlers/blocks/get_block_by_id/view.cpp
  src/handlers/blocks/get_blocks_by_scenario_id/view.hpp
  src/handlers/blocks/get_blocks_by_scenario_id/view.cpp
  src/handlers/blocks/latest_get_block/view.hpp
  src/handlers/blocks/latest_get_block/view.cpp
  src/handlers/blocks/create_block/view.hpp
  src/handlers/blocks/create_block/view.cpp
  src/handlers/blocks/move_block/view.hpp
  src/handlers/blocks/move_block/view.cpp

  src/handlers/blocks/update_block_by_id/view.hpp
  src/handlers/blocks/update_block_by_id/view.cpp
  src/handlers/blocks/update_children/view.hpp
  src/handlers/blocks/update_children/view.cpp

  src/handlers/blocks/delete_block_by_id/view.hpp
  src/handlers/blocks/delete_block_by_id/view.cpp

  src/models/block.hpp
  src/models/block.cpp
  src/models/metainfo.hpp
  src/models/metainfo.cpp
  src/models/comment.hpp
  src/models/comment.cpp
  src/models/user.hpp
  src/models/user.cpp

  src/handlers/templates/get-block-templates/view.hpp
  src/handlers/templates/get-block-templates/view.cpp
  src/handlers/templates/get-scenario-templates/view.hpp
  src/handlers/templates/get-scenario-templates/view.cpp

  src/handlers/comments/post_comment/view.hpp
  src/handlers/comments/post_comment/view.cpp
  src/handlers/comments/comment_reply/view.hpp
  src/handlers/comments/comment_reply/view.cpp
  src/handlers/comments/get_comments/view.hpp
  src/handlers/comments/get_comments/view.cpp
  src/handlers/scenarios/create_scenario/view.hpp
  src/handlers/scenarios/create_scenario/view.cpp
  src/handlers/scenarios/update_scenario/view.hpp
  src/handlers/scenarios/update_scenario/view.cpp

  src/handlers/scenarios/delete_scenario/view.hpp
  src/handlers/scenarios/delete_scenario/view.cpp

  src/handlers/scenarios/get_versions_by_id/view.hpp
  src/handlers/scenarios/get_versions_by_id/view.cpp
  src/handlers/scenarios/get_scenario_by_id/view.hpp
  src/handlers/scenarios/get_scenario_by_id/view.cpp
  src/handlers/scenarios/get_scenarios_by_user_id/view.hpp
  src/handlers/scenarios/get_scenarios_by_user_id/view.cpp
  src/lib/create_new_version.hpp
  src/lib/create_new_version.cpp
  src/lib/get_children_blocks.hpp
  src/lib/get_children_blocks.cpp
  src/lib/get_latest_version.hpp
  src/lib/get_latest_version.cpp

  src/handlers/user/info/view.cpp
  src/handlers/user/info/view.hpp

  src/handlers/scenarios/update_blocks/view.hpp
  src/handlers/scenarios/update_blocks/view.cpp

  src/handlers/auth/yandex/view.cpp
  src/handlers/auth/yandex/view.hpp
  src/handlers/auth/check/view.cpp
  src/handlers/auth/check/view.hpp
  src/middlewares/auth.cpp
  src/middlewares/auth.hpp
  src/handlers/scenarios/get_scenario_by_id/view.hpp
  src/handlers/scenarios/get_scenario_by_id/view.cpp
  src/lib/create_new_version.hpp
  src/lib/create_new_version.cpp
  src/lib/get_children_blocks.hpp
  src/lib/get_children_blocks.cpp
  src/lib/get_latest_version.hpp
  src/lib/get_latest_version.cpp
  src/lib/update_block_with_json.hpp
  src/lib/update_block_with_json.cpp
  src/lib/get_user_role_by_scenario_id.hpp
  src/lib/get_user_role_by_scenario_id.cpp

  src/middlewares/cors.hpp
  src/middlewares/cors.cpp
)
target_link_libraries(${PROJECT_NAME}_objs PUBLIC userver::core userver::mongo)

# The Service
add_executable(${PROJECT_NAME} src/main.cpp)
target_link_libraries(${PROJECT_NAME} PRIVATE ${PROJECT_NAME}_objs)

# # Unit Tests
# add_executable(${PROJECT_NAME}_unittest src/greeting_test.cpp)
# target_link_libraries(${PROJECT_NAME}_unittest PRIVATE ${PROJECT_NAME}_objs userver::utest)
# add_google_tests(${PROJECT_NAME}_unittest)

# # Benchmarks
# add_executable(${PROJECT_NAME}_benchmark src/greeting_benchmark.cpp)
# target_link_libraries(${PROJECT_NAME}_benchmark PRIVATE ${PROJECT_NAME}_objs userver::ubench)
# add_google_benchmark_tests(${PROJECT_NAME}_benchmark)

# Functional testing
userver_testsuite_add_simple()


include(GNUInstallDirs)

if(DEFINED ENV{PREFIX})
  message(STATUS "Set install prefix: $ENV{PREFIX}")
  file(TO_CMAKE_PATH "$ENV{PREFIX}" PREFIX_PATH)
  set(CMAKE_INSTALL_PREFIX ${PREFIX_PATH})
endif()

file(GLOB CONFIGS_FILES ${CMAKE_CURRENT_SOURCE_DIR}/configs/*.yaml ${CMAKE_CURRENT_SOURCE_DIR}/configs/*.json)

install(TARGETS ${PROJECT_NAME} DESTINATION ${CMAKE_INSTALL_BINDIR} COMPONENT ${PROJECT_NAME})
install(FILES ${CONFIGS_FILES} DESTINATION ${CMAKE_INSTALL_SYSCONFDIR}/${PROJECT_NAME} COMPONENT ${PROJECT_NAME})
