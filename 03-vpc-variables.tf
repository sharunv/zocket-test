variable "vpc_name" {
  description = "VPC Name"
  type = string 
  default = "test-vpc"
}


variable "vpc_cidr_block" {
  description = "VPC CIDR Block"
  type = string 
  default = "10.0.0.0/16"
}


variable "vpc_availability_zones" {
  description = "VPC Availability Zones"
  type = list(string)
  default = ["us-east-1a"]
}
