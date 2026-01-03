from flask import Flask, jsonify
from flask_cors import CORS  # Add this import
import csv
import os
from datetime import datetime

app = Flask(__name__)

def read_csv_file():
    """Read and parse the CSV file preserving original formats"""
    # Define possible paths for the CSV file
    possible_paths = [
        os.path.join(os.getcwd(), 'data', 'extracted_information.csv'),
        os.path.join(os.getcwd(), 'extracted_information.csv'),
        os.path.join(os.path.dirname(__file__), '..', 'data', 'extracted_information.csv'),
        os.path.join(os.path.dirname(__file__), '..', 'extracted_information.csv'),
        os.path.join(os.path.dirname(__file__), 'data', 'extracted_information.csv'),
    ]
    
    csv_data = []
    
    for csv_path in possible_paths:
        if os.path.exists(csv_path):
            try:
                print(f"Attempting to read CSV from: {csv_path}")
                with open(csv_path, 'r', encoding='utf-8') as file:
                    csv_reader = csv.DictReader(file)
                    for row in csv_reader:
                        # Keep original data as-is, just clean empty strings
                        cleaned_row = {}
                        for key, value in row.items():
                            # Keep N/A as None/Null, empty strings as None
                            if value == '' or value == 'N/A':
                                cleaned_row[key] = None
                            else:
                                cleaned_row[key] = value
                        csv_data.append(cleaned_row)
                
                print(f"Successfully loaded {len(csv_data)} records from: {csv_path}")
                break
            except Exception as e:
                print(f"Error reading CSV from {csv_path}: {e}")
                continue
    
    if not csv_data:
        print("Warning: No CSV data loaded from any location")
    
    return csv_data


@app.route('/api/schools', methods=['GET'])
def get_schools():
    print("API Call: /api/schools")
    try:
        schools_data = read_csv_file()
        return jsonify({
            'data': schools_data
        })
    except Exception as e:
        print(f"API Error: {e}")
        return jsonify({
            'error': f'Failed to load schools data: {str(e)}',
            'count': 0,
            'data': []
        }), 500


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy', 
        'timestamp': datetime.now().isoformat(),
        'service': 'Schools API'
    })


@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'Schools API is running',
        'endpoints': {
            'all_schools': '/api/schools',
            'summer_schools': '/api/schools/summer',
            'winter_schools': '/api/schools/winter',
            'health': '/health'
        }
    })

def handler(event, context):
    from flask import Flask
    return app(event, context)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5328))
    app.run(debug=True, host='0.0.0.0', port=port)