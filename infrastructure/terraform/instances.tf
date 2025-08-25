data "yandex_compute_image" "container-optimized-image" {
  family = "container-optimized-image"
}

resource "yandex_compute_instance" "vm-test" {
  name        = "vm-static"
  zone        = "ru-central1-a"
  platform_id = "standard-v3"
  hostname = "vm-static"
  allow_stopping_for_update = true    

  resources {
    cores         = 2
    memory        = 4
    core_fraction = 20
  }

  boot_disk {
    initialize_params {
      description = "hdd"
      size = 15
      image_id = data.yandex_compute_image.container-optimized-image.id
    }
  }

  network_interface {
    subnet_id          = yandex_vpc_subnet.subnet-a.id
    nat                = true 
    security_group_ids = [yandex_vpc_security_group.vm_sg.id]
  }

  metadata = {
    user-data = file("cloud-init.yaml")

    ssh-keys = <<EOT
user:${file("~/.ssh/id_ed25519.pub")}
user:${file("~/.ssh/id_sourcecraft.pub")}
user:${file("~/.ssh/teammates/id_svyat.pub")}
user:${file("~/.ssh/teammates/id_matvei.pub")}
EOT
  }
  
}

resource "yandex_compute_instance" "vm-static" {
  name        = "vm-static"
  zone        = "ru-central1-d"
  platform_id = "standard-v3"
  hostname = "vm-static"
  allow_stopping_for_update = true    

  resources {
    cores         = 2
    memory        = 6
    core_fraction = 50
  }

  boot_disk {
    initialize_params {
      description = "hdd"
      size = 30
      image_id = data.yandex_compute_image.container-optimized-image.id
    }
  }

  network_interface {
    subnet_id          = yandex_vpc_subnet.subnet-d.id
    nat                = true 
    nat_ip_address =  yandex_vpc_address.static_ip.external_ipv4_address[0].address
    security_group_ids = [yandex_vpc_security_group.vm_sg.id]
  }

  metadata = {
    user-data = file("cloud-init.yaml")

    ssh-keys = <<EOT
user:${file("~/.ssh/id_ed25519.pub")}
user:${file("~/.ssh/id_sourcecraft.pub")}
user:${file("~/.ssh/teammates/id_svyat.pub")}
user:${file("~/.ssh/teammates/id_matvei.pub")}
EOT
  }
  
}