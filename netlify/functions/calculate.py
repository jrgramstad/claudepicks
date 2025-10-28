"""Netlify serverless function to calculate edges."""
import json
import base64
import io
import pandas as pd
from datetime import datetime
from .utils import (
    SITE_NAMES,
    extract_date_from_filename,
    filter_nba_data,
    calculate_edges_for_site,
    rank_and_select_top_picks,
    format_output_for_site,
    generate_csv_output
)


def read_file_from_base64(file_data: dict) -> pd.DataFrame:
    """Read CSV or Excel file from base64 encoded data."""
    filename = file_data['filename'].lower()
    content = base64.b64decode(file_data['content'])

    if filename.endswith('.csv'):
        return pd.read_csv(io.BytesIO(content))
    elif filename.endswith(('.xls', '.xlsx')):
        return pd.read_excel(io.BytesIO(content))
    else:
        raise ValueError(f"Unsupported file format: {filename}")


def handler(event, context):
    """Handle calculate request."""
    try:
        # Parse request body
        if event['httpMethod'] != 'POST':
            return {
                'statusCode': 405,
                'body': json.dumps({'error': 'Method not allowed'})
            }

        body = json.loads(event['body'])
        files = body.get('files', {})

        # Check for required files
        required_files = ['prizepicks', 'underdog', 'pick6', 'sleeper', 'fanduel', 'bbm']
        for file_key in required_files:
            if file_key not in files:
                return {
                    'statusCode': 400,
                    'body': json.dumps({'error': f'Missing file: {file_key}'})
                }

        # Extract and validate dates
        dates = {}
        for key, file_data in files.items():
            if key != 'bbm':
                date = extract_date_from_filename(file_data['filename'])
                if date:
                    dates[key] = date

        # Check for date consistency
        unique_dates = set(dates.values())
        if len(unique_dates) > 1:
            return {
                'statusCode': 400,
                'body': json.dumps({
                    'error': f'Date mismatch detected: {dates}. All files should be from the same date.'
                })
            }

        date_str = list(unique_dates)[0] if unique_dates else datetime.now().strftime('%Y-%m-%d')

        # Read BBM file
        bbm_df = read_file_from_base64(files['bbm'])

        # Validate BBM columns
        required_bbm_cols = ['Name', 'p', 'r', 'a']
        missing_cols = [col for col in required_bbm_cols if col not in bbm_df.columns]
        if missing_cols:
            return {
                'statusCode': 400,
                'body': json.dumps({
                    'error': f'BBM file missing required columns: {missing_cols}'
                })
            }

        # Process each site
        all_picks = {}
        all_output = []

        for site_key in ['prizepicks', 'underdog', 'pick6', 'sleeper', 'fanduel']:
            site_name = SITE_NAMES.get(site_key, site_key.title())

            # Read and filter site data
            site_df = read_file_from_base64(files[site_key])
            site_df = filter_nba_data(site_df)

            # Validate site columns
            required_site_cols = ['Player', 'Market', 'Line']
            missing_cols = [col for col in required_site_cols if col not in site_df.columns]
            if missing_cols:
                return {
                    'statusCode': 400,
                    'body': json.dumps({
                        'error': f'{site_name} file missing required columns: {missing_cols}'
                    })
                }

            # Calculate edges
            edges = calculate_edges_for_site(site_df, bbm_df, site_name)

            # Rank and select top picks
            top_picks, best_under = rank_and_select_top_picks(edges)

            # Store results
            all_picks[site_name] = {
                'top_5': top_picks,
                'best_under': best_under
            }

            # Format output
            output = format_output_for_site(site_name, top_picks, best_under)
            all_output.append(output)

        # Generate CSV
        csv_output = generate_csv_output(all_picks)

        # Combine all output
        full_output = "\n".join(all_output)

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'output': full_output,
                'csv': csv_output,
                'date': date_str
            })
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
