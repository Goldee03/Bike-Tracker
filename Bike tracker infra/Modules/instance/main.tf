resource "tls_private_key" "key_pair" {
    algorithm = "RSA"
    rsa_bits = 4096
  
}

resource "aws_key_pair" "key" {
    key_name = var.key_name
    public_key = tls_private_key.key_pair.public_key_openssh
  
}

resource "local_sensitive_file" "instance_key" {
    filename = "${path.root}/${var.key_name}.pem"
    content = tls_private_key.key_pair.private_key_pem
    file_permission = "0400"
  
}

resource "aws_instance" "BT_instance" {
    ami           = var.ami_id
    instance_type = var.instance_type
    subnet_id     = module.VPC.BT_pub_Subnet_id
    key_name = aws_key_pair.key.key_name
    vpc_security_group_ids = module.security_group_id

    root_block_device {
      volume_size = var.volume_size
      volume_type = var.volume_type
      encrypted = true
      delete_on_termination = true
      
    }

}