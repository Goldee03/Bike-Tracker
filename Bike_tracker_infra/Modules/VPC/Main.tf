resource "aws_vpc" "BT_VPC" {
  cidr_block           = var.vpc_cidr
  
}

resource "aws_subnet" "BT_pub_Subnet" {
  vpc_id            = aws_vpc.BT_VPC.id
  cidr_block        = var.pub_subnet_cidr
  map_public_ip_on_launch = true
 
}

resource "aws_subnet" "BT_pvt_Subnet" {
  vpc_id            = aws_vpc.BT_VPC.id
  cidr_block        = var.pvt_subnet_cidr
  map_public_ip_on_launch = false
 
}


resource "aws_internet_gateway" "BT_IGW" {
  vpc_id = aws_vpc.BT_VPC.id
}


resource "aws_route_table" "BT_igw_route_table" {
  vpc_id = aws_vpc.BT_VPC.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.BT_IGW.id
  }
}


resource "aws_route_table_association" "BT_IGW_Route_Association" {
  subnet_id      = aws_subnet.BT_pub_Subnet.id
  route_table_id = aws_route_table.BT_igw_route_table.id
}

resource "aws_eip" "BT_EIP" {
  domain = "vpc"
}

resource "aws_nat_gateway" "BT_NAT_Gateway" {
  subnet_id = aws_subnet.BT_pub_Subnet.id
  allocation_id = aws_eip.BT_EIP.id
  depends_on = [aws_internet_gateway.BT_IGW]
}

resource "aws_route_table" "BT_nat_route_table" {
  vpc_id = aws_vpc.BT_VPC.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.BT_NAT_Gateway.id
  }
}

resource "aws_route_table_association" "BT_NAT_Route_Association" {
  subnet_id      = aws_subnet.BT_pvt_Subnet.id
  route_table_id = aws_route_table.BT_nat_route_table.id
}

