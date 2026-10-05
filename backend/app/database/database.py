"""
SQLite Database Connection and Lifecycle Management for CivicFlow.
Provides zero-setup, thread-safe database connections, table initialization,
indexing, and transaction context managers using Python's standard sqlite3 module.
"""

import os
import sqlite3
from typing import Generator, List, Dict, Any, Optional
from contextlib import contextmanager

from app.database.models import ALL_TABLE_SCHEMAS, INDEXES

# Default database location inside backend/data/
DEFAULT_DB_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))
DEFAULT_DB_PATH = os.path.join(DEFAULT_DB_DIR, "civicflow.db")

_DB_PATH = os.environ.get("DATABASE_PATH", DEFAULT_DB_PATH)


def get_db_path() -> str:
    """Returns the currently configured SQLite database file path."""
    return _DB_PATH


def set_db_path(custom_path: str) -> None:
    """Overrides the database path (useful for automated testing)."""
    global _DB_PATH
    _DB_PATH = custom_path


def create_connection(db_path: Optional[str] = None) -> sqlite3.Connection:
    """
    Creates a new SQLite connection with foreign keys enabled
    and row_factory configured for dictionary-style attribute access.
    """
    target_path = db_path or get_db_path()
    os.makedirs(os.path.dirname(os.path.abspath(target_path)), exist_ok=True)
    
    conn = sqlite3.connect(target_path, timeout=10.0, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = WAL;")  # Fast concurrent reads/writes
    return conn


@contextmanager
def get_db_connection(db_path: Optional[str] = None) -> Generator[sqlite3.Connection, None, None]:
    """
    Context manager providing a transactional SQLite connection.
    Automatically commits on success or rolls back on exception.
    """
    conn = create_connection(db_path)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db(db_path: Optional[str] = None, auto_seed: bool = True) -> bool:
    """
    Initializes SQLite tables and indexes if they do not exist.
    If the assets table is empty and auto_seed is True, populates
    the database using the seed datasets.
    """
    target_path = db_path or get_db_path()
    os.makedirs(os.path.dirname(os.path.abspath(target_path)), exist_ok=True)

    with get_db_connection(target_path) as conn:
        cursor = conn.cursor()
        for ddl in ALL_TABLE_SCHEMAS:
            cursor.execute(ddl)
        for idx in INDEXES:
            cursor.execute(idx)

    if auto_seed:
        # Check if assets table has data
        with get_db_connection(target_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) AS cnt FROM assets;")
            row = cursor.fetchone()
            count = row["cnt"] if row else 0

        if count == 0:
            from app.services.seed_loader import seed_database
            seed_database(target_path)

    return True


# ==============================================================================
# GENERAL EXECUTION UTILITIES
# ==============================================================================

def query_all(sql: str, params: tuple = (), db_path: Optional[str] = None) -> List[Dict[str, Any]]:
    """Executes a SELECT query and returns all matching rows as dictionaries."""
    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(sql, params)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]


def query_one(sql: str, params: tuple = (), db_path: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Executes a SELECT query and returns a single row as a dictionary or None."""
    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(sql, params)
        row = cursor.fetchone()
        return dict(row) if row else None


def execute_write(sql: str, params: tuple = (), db_path: Optional[str] = None) -> int:
    """Executes an INSERT, UPDATE, or DELETE query and returns affected rows or lastrowid."""
    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(sql, params)
        return cursor.lastrowid
