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
