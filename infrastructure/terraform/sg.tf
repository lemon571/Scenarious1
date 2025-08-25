resource "yandex_vpc_security_group" "vm_sg" {
  name       = "sg-vm"
  network_id = yandex_vpc_network.network.id

  ingress {
    protocol       = "TCP"
    description    = "SSH access"
    port           = 22
    v4_cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    protocol       = "TCP"
    description    = "SSH access"
    port           = 22
    v4_cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    protocol       = "TCP"
    description    = "Backend access"
    port           = 8080
    v4_cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    protocol       = "TCP"
    description    = "HTTP access"
    port           = 80
    v4_cidr_blocks = ["0.0.0.0/0"]
  }


  egress {
    protocol       = "ANY"
    description    = "Allow all outbound"
    from_port      = 0
    to_port        = 65535
    v4_cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "yandex_vpc_security_group" "mongo_sg" {
  name       = "sg-mdb-mongo"
  network_id = yandex_vpc_network.network.id

  ingress {
    protocol          = "TCP"
    description       = "Allow MongoDB 27018 from VM SG"
    port              = 27018
    security_group_id = yandex_vpc_security_group.vm_sg.id
  }

  egress {
    protocol       = "ANY"
    description    = "Allow all outbound"
    from_port      = 0
    to_port        = 65535
    v4_cidr_blocks = ["0.0.0.0/0"]
  }
}
