from flask import Flask, jsonify
import csv
import os
from datetime import datetime

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "data", "extracted_information.csv")

def read_csv_file():
    
    csv_data = []
    
    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(f"CSV not found at {CSV_PATH}")

    with open(CSV_PATH, 'r', encoding='utf-8') as file:
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            cleaned_row = {}
            for key, value in row.items():
                # Keep N/A as None/Null, empty strings as None
                if value == '' or value == 'N/A':
                    cleaned_row[key] = None
                else:
                    cleaned_row[key] = value
            csv_data.append(cleaned_row)
    
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
