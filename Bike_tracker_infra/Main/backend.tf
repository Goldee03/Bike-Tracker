terraform {
  backend "s3" {
    bucket       = "bike-tracker-tf-state-file"
    key          = "project/terraform.tfstate"
    region       = "ap-south-2"
    use_lockfile = true
    encrypt      = true

  }
}