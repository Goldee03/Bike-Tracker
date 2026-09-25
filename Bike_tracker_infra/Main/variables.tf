variable "vpc_cidr" {
  description = "The CIDR block for the VPC"
  type        = string

}

variable "pub_subnet_cidr" {
  description = "The CIDR block for the public subnet"
  type        = string
}

variable "pvt_subnet_cidr" {
  description = "The CIDR block for the private subnet"
  type        = string

}


####################################################################

#variable "subnet_id" {
#    type = string
#  
#}
#
#variable "security_group_id" {
#    type = list(string)
#  
#}

variable "ami_id" {
  type = string
}

variable "instance_type" {
  type = string

}

variable "key_name" {
  type = string
}

variable "volume_size" {
  type = number

}

variable "volume_type" {
  type = string

}

####################################################
#app instance variables

variable "app_ami_id" {
  type = string
}

variable "app_instance_type" {
  type = string

}

variable "app_key_name" {
  type = string
}

variable "app_volume_size" {
  type = number

}

variable "app_volume_type" {
  type = string

}