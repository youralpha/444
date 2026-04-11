from flask import Flask, render_template, request, jsonify
import sqlite3
import json
import os

app = Flask(__name__)
DB_FILE = 'data.db'

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

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/base')
def base():
    return render_template('BASE.html')

@app.route('/kpt')
def kpt():
    return render_template('KPT.html')

@app.route('/perimetr')
def perimetr():
    return render_template('PERIMETR.html')

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
    app.run(debug=True, host='0.0.0.0', port=5000)
