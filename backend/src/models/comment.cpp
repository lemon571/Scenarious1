#include "comment.hpp"

#include <userver/formats/bson/types.hpp>
#include <userver/formats/bson/value.hpp>
#include <userver/formats/bson/value_builder.hpp>
#include <userver/formats/json/inline.hpp>
#include <userver/formats/json/value_builder.hpp>
#include <userver/formats/serialize/common_containers.hpp>
#include <userver/formats/bson/value.hpp>
#include <userver/formats/bson/value_builder.hpp>
#include <userver/formats/serialize/to.hpp>

namespace scenariosus {

userver::formats::json::Value Serialize(
    const Comment& comment,
    userver::formats::serialize::To<userver::formats::json::Value>) {
  userver::formats::json::ValueBuilder builder;
  builder["id"] = comment.id.ToString();
  builder["creator"] = comment.creator.ToString();
  builder["description"] = comment.description;
  builder["time"] = comment.time;
  if(comment.line_position){
    builder["line_position"] = comment.line_position;
  }
  if (comment.children.has_value()) {
    builder["children"] = comment.children.value();
  }
  return builder.ExtractValue();
}

userver::formats::bson::Value Serialize(
    const Comment& comment,
    userver::formats::serialize::To<userver::formats::bson::Value>) {
  userver::formats::bson::ValueBuilder builder;
  builder["_id"] = comment.id;
  builder["creator"] = comment.creator;
  builder["description"] = comment.description;
  builder["time"] = comment.time;
  if(comment.line_position){
    builder["line_position"] = comment.line_position;
  }
  if (comment.children.has_value()) {
    builder["children"] = comment.children.value();
  }
  return builder.ExtractValue();
}

Comment Parse(const userver::formats::bson::Value& value,
              userver::formats::parse::To<Comment>) {
  Comment comment;
  comment.id = value["_id"].As<userver::formats::bson::Oid>();
  comment.creator = value["creator"].As<userver::formats::bson::Oid>();
  comment.description = value["description"].As<std::string>();
  comment.time = value["time"].As<int64_t>();
  if(value.HasMember("line_position")){
    comment.line_position = value["line_position"].As<int>();
  }

  if (value.HasMember("children")) {
    comment.children =
        value["children"].As<std::optional<std::vector<Comment>>>();
  }

  return comment;
}

Comment Parse(const userver::formats::json::Value& value,
              userver::formats::parse::To<Comment>) {
  Comment comment;
  comment.id = userver::formats::bson::Oid(value["id"].As<std::string>());
  comment.creator = userver::formats::bson::Oid(value["creator"].As<std::string>());
  comment.description = value["description"].As<std::string>();
  comment.time = value["time"].As<int64_t>();
  if(value.HasMember("line_position")){
    comment.line_position = value["line_position"].As<int>();
  }


  if (value.HasMember("children")) {
    comment.children =
        value["children"].As<std::optional<std::vector<Comment>>>();
  }

  return comment;
}

}  // namespace scenariosus