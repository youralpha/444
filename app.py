from flask import Flask, request, jsonify
import sqlite3
import json
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Allow React dev server to communicate with Flask

# Save database in user profile
user_home = os.path.expanduser('~')
app_dir = os.path.join(user_home, '.perimeter_app')
if not os.path.exists(app_dir):
    os.makedirs(app_dir)

DB_FILE = os.path.join(app_dir, 'data.db')

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS app_data (
            app_name TEXT PRIMARY KEY,
            data TEXT
        )
    ''')
    conn.commit()
    conn.close()

def get_data(app_name):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('SELECT data FROM app_data WHERE app_name = ?', (app_name,))
    row = c.fetchone()
    conn.close()
    if row:
        return json.loads(row[0])
    return {}

def save_data(app_name, data):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('REPLACE INTO app_data (app_name, data) VALUES (?, ?)', (app_name, json.dumps(data)))
    conn.commit()
    conn.close()

@app.route('/api/data/<app_name>', methods=['GET'])
def api_get_data(app_name):
    data = get_data(app_name)
    return jsonify(data)

@app.route('/api/data/<app_name>', methods=['POST'])
def api_save_data(app_name):
    data = request.json
    save_data(app_name, data)
    return jsonify({'status': 'success'})

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='127.0.0.1', port=5000)
