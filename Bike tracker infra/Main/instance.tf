module "instance" {
    source = "../Modules/instance"
    ami_id = var.ami_id
    subnet_id = module.VPC.BT_pub_Subnet_id
    instance_type = var.instance_type
    key_name = var.key_name
    volume_size = var.volume_size
    volume_type = var.volume_type
    security_group_id = module.security_groups.id
  
}