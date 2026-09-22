output "instance_id" {
    value = aws_instance.BT_instance.id
  
}

output "private_ip" {
  value = aws_instance.BT_instance.private_ip
}

output "public_ip" {
    value = aws_instance.BT_instance.public_ip
  
}

output "aws_key_pair" {
    value = aws_key_pair.key.key_name
  
}