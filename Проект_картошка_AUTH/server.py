"""
Simple Python Flask server for KuzPotato authentication
Run: python server.py
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import bcrypt
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Database initialization
def init_db():
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )''')
    
    # Add admin user
    admin_email = 'fortter'
    admin_pass = bcrypt.hashpw('4205'.encode(), bcrypt.gensalt()).decode()
    
    try:
        c.execute('INSERT INTO users (email, password, role, status) VALUES (?, ?, ?, ?)',
                 (admin_email, admin_pass, 'admin', 'active'))
        conn.commit()
    except sqlite3.IntegrityError:
        pass
    
    conn.close()

init_db()

def get_db():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    
    conn = get_db()
    c = conn.cursor()
    
    try:
        hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
        # New users get status 'мирный'
        c.execute('INSERT INTO users (email, password, status) VALUES (?, ?, ?)',
             (email, hashed, 'мирный'))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'User registered successfully'}), 200
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': 'user exists'}), 400
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    conn = get_db()
    c = conn.cursor()
    
    try:
        c.execute('SELECT * FROM users WHERE email = ?', (email,))
        user = c.fetchone()
        
        if not user:
            conn.close()
            return jsonify({'error': 'no user'}), 400
        
        if user['status'] not in ('active', 'мирный'):
            conn.close()
            return jsonify({'error': 'user disabled'}), 403
        
        if not bcrypt.checkpw(password.encode(), user['password'].encode()):
            conn.close()
            return jsonify({'error': 'wrong pass'}), 400
        
        conn.close()
        return jsonify({
            'id': user['id'],
            'email': user['email'],
            'role': user['role'],
            'status': user['status']
        }), 200
    
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 500

@app.route('/api/me', methods=['GET'])
def get_user():
    # Simple endpoint - returns null since we're not using sessions
    return jsonify(None), 200

@app.route('/api/logout', methods=['POST'])
def logout():
    return jsonify({'ok': True}), 200

if __name__ == '__main__':
    print('Server running on http://localhost:3000')
    app.run(host='localhost', port=3000, debug=True)
