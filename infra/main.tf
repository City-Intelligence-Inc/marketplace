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

# DynamoDB table for storing podcasts
resource "aws_dynamodb_table" "podcasts" {
  name           = var.podcasts_table_name
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "podcast_id"

  attribute {
    name = "podcast_id"
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
    Name        = var.podcasts_table_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# DynamoDB table for storing paper requests
resource "aws_dynamodb_table" "paper_requests" {
  name           = var.paper_requests_table_name
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "request_id"

  attribute {
    name = "request_id"
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
    Name        = var.paper_requests_table_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# S3 bucket for storing podcast audio files
resource "aws_s3_bucket" "podcasts_audio" {
  bucket = var.s3_bucket_name

  tags = {
    Name        = "Podcast Audio Storage"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# S3 bucket public access settings
resource "aws_s3_bucket_public_access_block" "podcasts_audio" {
  bucket = aws_s3_bucket.podcasts_audio.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# S3 bucket policy for public read access
resource "aws_s3_bucket_policy" "podcasts_audio" {
  bucket = aws_s3_bucket.podcasts_audio.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.podcasts_audio.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.podcasts_audio]
}

# S3 bucket CORS configuration
resource "aws_s3_bucket_cors_configuration" "podcasts_audio" {
  bucket = aws_s3_bucket.podcasts_audio.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = []
    max_age_seconds = 3000
  }
}
