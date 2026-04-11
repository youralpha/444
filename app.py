import os
import sys
import json
import sqlite3
import threading
import time

# Flask imports
from flask import Flask, render_template, request, jsonify

# Pywebview fallback
try:
    import webview
    USE_WEBVIEW = True
except ImportError:
    USE_WEBVIEW = False

# Setup App Dir and DB
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

# PyInstaller sets sys.frozen, so we need to point Flask to the correct bundled templates dir
if getattr(sys, 'frozen', False):
    template_folder = os.path.join(sys._MEIPASS, 'templates')
    app = Flask(__name__, template_folder=template_folder, static_folder=template_folder)
else:
    app = Flask(__name__)

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

def start_flask(port):
    # Run the server with werkzeug serving logic
    from werkzeug.serving import make_server
    import logging
    # Disable werkzeug logs to prevent console spam in exe
    log = logging.getLogger('werkzeug')
    log.setLevel(logging.ERROR)

    server = make_server('127.0.0.1', port, app)
    server.serve_forever()

if __name__ == '__main__':
    init_db()
    port = 5000

    if USE_WEBVIEW:
        # Start Flask server in a daemon thread so it closes when webview closes
        flask_thread = threading.Thread(target=start_flask, args=(port,), daemon=True)
        flask_thread.start()

        # Wait a second to ensure server is bound
        time.sleep(1)

        # Start PyWebView UI
        webview.create_window('Оперативный Дашборд (ПЕРИМЕТР / КПТ / ТАЙМЕР)', f'http://127.0.0.1:{port}', width=1280, height=800)
        webview.start()
    else:
        # Fallback if pywebview isn't installed
        app.run(debug=True, host='127.0.0.1', port=port)
