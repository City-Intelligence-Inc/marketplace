variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "table_name" {
  description = "Name of the DynamoDB table for paper links"
  type        = string
  default     = "paper-links"
}

variable "environment" {
  description = "Environment name (e.g., dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "email_table_name" {
  description = "Name of the DynamoDB table for email signups"
  type        = string
  default     = "email-signups"
}

variable "podcasts_table_name" {
  description = "Name of the DynamoDB table for podcasts"
  type        = string
  default     = "podcasts"
}

variable "s3_bucket_name" {
  description = "Name of the S3 bucket for podcast audio files"
  type        = string
  default     = "40k-arr-saas-podcasts"
}

variable "paper_requests_table_name" {
  description = "Name of the DynamoDB table for paper requests"
  type        = string
  default     = "paper-requests"
}
