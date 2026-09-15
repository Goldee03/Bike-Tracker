resource "aws_instance" "BT_instance" {
    ami           = "resolve:ssm:/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
    instance_type = "t3.micro"
    subnet_id     = module.VPC.BT_pub_Subnet_id
    
  
}