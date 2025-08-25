#pragma once

#include <bson/bson.h>
#include <string>
#include <optional>

namespace scenario::models {

enum class Role {
    Lead,
    ScreenWriter,
    Technician,
    Speaker
};

inline std::optional<Role> RoleFromString(const std::string& role_str) {
    if (role_str == "lead") return Role::Lead;
    if (role_str == "screenWriter") return Role::ScreenWriter;
    if (role_str == "technician") return Role::Technician;
    if (role_str == "speaker") return Role::Speaker;
    return std::nullopt;
}

inline std::string RoleToString(Role role) {
    switch (role) {
        case Role::Lead: return "lead";
        case Role::ScreenWriter: return "screenWriter";
        case Role::Technician: return "technician";
        case Role::Speaker: return "speaker";
    }

    return "";
}

}  // namespace scenario
