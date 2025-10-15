terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# DynamoDB table for storing paper links
resource "aws_dynamodb_table" "paper_links" {
  name           = var.table_name
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "paper_id"

  attribute {
    name = "paper_id"
    type = "S"
  }

  attribute {
    name = "created_at"
    type = "N"
  }

  # GSI for querying by creation date
  global_secondary_index {
    name            = "CreatedAtIndex"
    hash_key        = "created_at"
    projection_type = "ALL"
  }

  tags = {
    Name        = var.table_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# DynamoDB table for storing email signups
resource "aws_dynamodb_table" "email_signups" {
  name           = var.email_table_name
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "email"

  attribute {
    name = "email"
    type = "S"
  }

  attribute {
    name = "signup_timestamp"
    type = "N"
  }

  # GSI for querying by signup timestamp
  global_secondary_index {
    name            = "SignupTimestampIndex"
    hash_key        = "signup_timestamp"
    projection_type = "ALL"
  }

  tags = {
    Name        = var.email_table_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}
