terraform {
  backend "s3" {
    bucket       = "bike-tracker-tf-state-file-355294616522-ap-south-2-an"
    key          = "project/terraform.tfstate"
    region       = "ap-south-2"
    use_lockfile = true
    encrypt      = true

  }
}