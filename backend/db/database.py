import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "rock_bee_detections.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS detections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            label TEXT,
            confidence REAL,
            latitude REAL,
            longitude REAL,
            user_role TEXT,
            timestamp TEXT
        )
    """)
    conn.commit()
    conn.close()

def save_detection(label, confidence, lat, lon, role):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO detections (label, confidence, latitude, longitude, user_role, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (label, confidence, lat, lon, role, datetime.now().isoformat()))
    conn.commit()
    conn.close()

def get_all_detections():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM detections ORDER BY timestamp DESC")
    rows = cursor.fetchall()
    conn.close()
    
    detections = []
    for row in rows:
        detections.append({
            "id": row[0],
            "label": row[1],
            "confidence": row[2],
            "latitude": row[3],
            "longitude": row[4],
            "user_role": row[5],
            "timestamp": row[6]
        })
    return detections

# Initialize database on import
init_db()
