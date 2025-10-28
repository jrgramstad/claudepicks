"""Netlify serverless function to download CSV."""
import json
import base64
from datetime import datetime


def handler(event, context):
    """Handle CSV download request."""
    try:
        # Parse request body
        if event['httpMethod'] != 'POST':
            return {
                'statusCode': 405,
                'body': json.dumps({'error': 'Method not allowed'})
            }

        body = json.loads(event['body'])
        csv_content = body.get('csv', '')
        date_str = body.get('date', datetime.now().strftime('%Y-%m-%d'))

        # Encode CSV as base64
        csv_bytes = csv_content.encode('utf-8')
        csv_base64 = base64.b64encode(csv_bytes).decode('utf-8')

        filename = f'top_picks_{date_str}.csv'

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'text/csv',
                'Content-Disposition': f'attachment; filename="{filename}"',
                'Access-Control-Allow-Origin': '*'
            },
            'body': csv_base64,
            'isBase64Encoded': True
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }
