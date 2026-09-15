module "VPC" {
  source          = "../Modules/VPC"
  vpc_cidr        = var.vpc_cidr
  pub_subnet_cidr = var.pub_subnet_cidr
  pvt_subnet_cidr = var.pvt_subnet_cidr

}