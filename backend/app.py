from flask import Flask, request, jsonify
from flask_cors import CORS
import boto3
from datetime import datetime
import os
import re

app = Flask(__name__)

# Configure CORS for production
allowed_origins = os.getenv('ALLOWED_ORIGINS', '*').split(',')
CORS(app, origins=allowed_origins)

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb', region_name=os.getenv('AWS_REGION', 'us-east-1'))
table = dynamodb.Table(os.getenv('EMAIL_TABLE_NAME', 'email-signups'))

def is_valid_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

@app.route('/api/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()

        if not data or 'email' not in data:
            return jsonify({'message': 'Email is required'}), 400

        email = data['email'].strip().lower()

        # Validate email format
        if not is_valid_email(email):
            return jsonify({'message': 'Invalid email format'}), 400

        # Get current timestamp
        timestamp = int(datetime.utcnow().timestamp())

        # Store in DynamoDB
        try:
            table.put_item(
                Item={
                    'email': email,
                    'signup_timestamp': timestamp,
                    'created_at': datetime.utcnow().isoformat()
                },
                ConditionExpression='attribute_not_exists(email)'
            )

            return jsonify({
                'message': 'Successfully added to waitlist!',
                'email': email
            }), 201

        except boto3.exceptions.Boto3Error as e:
            # Check if email already exists
            if 'ConditionalCheckFailedException' in str(e):
                return jsonify({'message': 'This email is already on the waitlist'}), 409
            raise

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'message': 'An error occurred. Please try again later.'}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    # Use environment variable for port (Render assigns this)
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') != 'production'
    app.run(debug=debug, host='0.0.0.0', port=port)
