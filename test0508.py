# -*- coding: utf-8 -*-
"""
Created on Thu May  8 12:25:24 2025

@author: Administrator
"""

from flask import Flask, request, jsonify
import pyodbc
from datetime import datetime

app = Flask(__name__)

# SQL Server 配置，请根据实际情况修改
server = '10.44.203.101'
database = 'BaseDB'
username = 'jbuser_lj'
password = 'jbcj@2025_ptlj'
conn_str = f'DRIVER={{SQL Server}};SERVER={server};DATABASE={database};UID={username};PWD={password}'

def init_db():
    with pyodbc.connect(conn_str) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'inbound_records')
            CREATE TABLE inbound_records (
                id INT IDENTITY(1,1) PRIMARY KEY,
                product_id NVARCHAR(50) NOT NULL,
                boxes INT NOT NULL,
                in_date DATE NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()

@app.route('/api/inbound/create', methods=['POST'])
def create_inbound():
    data = request.get_json()
    product_id = data.get('product_id')
    boxes = data.get('boxes')
    in_date = data.get('in_date')

    if not product_id or not boxes or not in_date:
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        datetime.strptime(in_date, '%Y-%m-%d')
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400

    with pyodbc.connect(conn_str) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO inbound_records (product_id, boxes, in_date)
            VALUES (?, ?, ?)
        ''', (product_id, boxes, in_date))
        conn.commit()
    
    return jsonify({"message": "Inbound record created successfully!"}), 201

if __name__ == '__main__':
    #init_db()  # 初始化数据库表（如果不存在）
    app.run(debug=True,use_reloader=False)