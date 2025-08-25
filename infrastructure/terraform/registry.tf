resource "yandex_container_registry" "registry" {
  name      = "registry"
  folder_id = var.folder_id
}

resource "yandex_container_repository" "bakend-repository" {
  name = "${yandex_container_registry.registry.id}/bakend"
}


resource "yandex_container_repository" "frontend-repository" {
  name = "${yandex_container_registry.registry.id}/frontend"
}

resource "yandex_container_repository_lifecycle_policy" "backend-policy" {
  name          = "registry-cleaner"
  status        = "active"
  repository_id = yandex_container_repository.bakend-repository.id

  rule {
    description   = "Delete every image after 24h except two latest"
    untagged      = true
    tag_regexp    = ".*"
    retained_top  = 2
    expire_period = "24h"
  }
}

resource "yandex_container_repository_lifecycle_policy" "frontend-policy" {
  name          = "registry-cleaner"
  status        = "active"
  repository_id = yandex_container_repository.frontend-repository.id

  rule {
    description   = "Delete every image after 24h except two latest"
    untagged      = true
    tag_regexp    = ".*"
    retained_top  = 2
    expire_period = "24h"
  }
}