"""
database.py
Lightweight embedded SQLite database management for prediction history & statistics.
Automatically creates schema/tables on startup.
"""

import os
import sqlite3

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)
DB_PATH = os.path.join(DATA_DIR, "predictions.db")


def get_connection():
    """Returns a thread-safe connection to the local SQLite database file."""
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initializes the database schema and tables automatically if they do not exist."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            input_data TEXT NOT NULL,
            result TEXT NOT NULL,
            prediction INTEGER NOT NULL,
            confidence REAL NOT NULL,
            fraud_probability REAL NOT NULL,
            accident_site TEXT,
            status TEXT DEFAULT 'completed',
            ip_address TEXT DEFAULT 'unknown',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Indexes for fast querying and dashboard aggregations
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_predictions_created ON predictions (created_at DESC)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_predictions_pred ON predictions (prediction)")

    conn.commit()
    conn.close()
    print(f"[Database] SQLite database initialized at: {DB_PATH}")


# Auto-initialize on module load
init_db()
