output "table_name" {
  description = "Name of the DynamoDB table"
  value       = aws_dynamodb_table.paper_links.name
}

output "table_arn" {
  description = "ARN of the DynamoDB table"
  value       = aws_dynamodb_table.paper_links.arn
}

output "table_id" {
  description = "ID of the DynamoDB table"
  value       = aws_dynamodb_table.paper_links.id
}

output "email_table_name" {
  description = "Name of the email signups DynamoDB table"
  value       = aws_dynamodb_table.email_signups.name
}

output "email_table_arn" {
  description = "ARN of the email signups DynamoDB table"
  value       = aws_dynamodb_table.email_signups.arn
}

output "podcasts_table_name" {
  description = "Name of the podcasts DynamoDB table"
  value       = aws_dynamodb_table.podcasts.name
}

output "podcasts_table_arn" {
  description = "ARN of the podcasts DynamoDB table"
  value       = aws_dynamodb_table.podcasts.arn
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket for podcast audio"
  value       = aws_s3_bucket.podcasts_audio.bucket
}

output "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.podcasts_audio.arn
}

output "paper_requests_table_name" {
  description = "Name of the paper requests DynamoDB table"
  value       = aws_dynamodb_table.paper_requests.name
}

output "paper_requests_table_arn" {
  description = "ARN of the paper requests DynamoDB table"
  value       = aws_dynamodb_table.paper_requests.arn
}
