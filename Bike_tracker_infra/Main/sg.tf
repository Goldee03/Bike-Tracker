module "security_groups" {
  source = "../Modules/Security Group"
  name   = "BT_sg"
  vpc_id = module.VPC.vpc_id

  ingress_rules = [
    {
      from_port   = 0
      to_port     = 65535
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  ]
}