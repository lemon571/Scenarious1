#pragma once

#include <userver/formats/json/value.hpp>
#include "../models/block.hpp"

namespace scenariosus {

void UpdateBlockWithJson(Block& block,
                         const userver::formats::json::Value& json_values);

}  // namespace scenariosus