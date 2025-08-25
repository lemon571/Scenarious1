resource "yandex_mdb_mongodb_cluster" "mongodb" {
  name                = "mongodb"
  environment         = "PRESTABLE"
  network_id          = yandex_vpc_network.network.id
  security_group_ids  = [yandex_vpc_security_group.mongo_sg.id]

  cluster_config {
    version = "7.0"
  }

  resources_mongod {
    resource_preset_id = "c3-c2-m4"
    disk_type_id       = "network-hdd"
    disk_size          = 20
  }

  host {
    zone_id          = "ru-central1-d"
    subnet_id        = yandex_vpc_subnet.subnet-d.id

    host_parameters {
      hidden               = false
      secondary_delay_secs = 0
      priority             = 1
    }
  }
}

resource "yandex_mdb_mongodb_database" "scenariousus" {
  cluster_id = yandex_mdb_mongodb_cluster.mongodb.id
  name       = "scenariousus"
}

resource "yandex_mdb_mongodb_user" "admin1" {
  cluster_id = yandex_mdb_mongodb_cluster.mongodb.id
  name       = var.mongodb-admin
  password   = var.mongodb-password
  permission {
    database_name = yandex_mdb_mongodb_database.scenariousus.name
    roles         = [ "mdbDbAdmin", "readWrite" ]
  }
  depends_on = [
    yandex_mdb_mongodb_database.scenariousus
  ]
}