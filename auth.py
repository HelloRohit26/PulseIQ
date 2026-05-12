"""
PulseIQ Authentication Module
------------------------------
Handles user registration, login, JWT token management,
and PostgreSQL users table creation.
"""

import os
import hashlib
import hmac
import json
import base64
import time
import psycopg2
from datetime import datetime


# --- CONFIG ---
JWT_SECRET = os.getenv("JWT_SECRET", "pulseiq_super_secret_key_2026")
JWT_EXPIRY_HOURS = 24


# --- DATABASE ---
def get_db_connection():
    return psycopg2.connect(
        host="postgres", port="5432",
        database="pulseiq_db", user="pulseiq_user",
        password="mysecretpassword"
    )


def init_users_table():
    """Create the users table if it doesn't exist. Retries on connection failure."""
    import time
    for attempt in range(5):
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    email VARCHAR(120) UNIQUE NOT NULL,
                    password_hash VARCHAR(256) NOT NULL,
                    full_name VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP
                );
            """)
            conn.commit()
            cur.close()
            conn.close()
            print("✅ Users table ready!")
            return
        except Exception as e:
            print(f"⏳ DB not ready for users table (attempt {attempt+1}/5): {e}")
            time.sleep(3)
    print("⚠️ Could not create users table after 5 attempts")


# --- PASSWORD HASHING (using hashlib — no extra dependency needed) ---
def hash_password(password: str) -> str:
    """Hash password with SHA-256 + salt."""
    salt = os.urandom(32)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return (salt + key).hex()


def verify_password(password: str, stored_hash: str) -> bool:
    """Verify a password against the stored hash."""
    stored_bytes = bytes.fromhex(stored_hash)
    salt = stored_bytes[:32]
    stored_key = stored_bytes[32:]
    new_key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return hmac.compare_digest(stored_key, new_key)


# --- JWT TOKEN (lightweight, no PyJWT dependency needed) ---
def _b64_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')


def _b64_decode(data: str) -> bytes:
    padding = 4 - len(data) % 4
    return base64.urlsafe_b64decode(data + '=' * padding)


def create_token(user_id: int, username: str, full_name: str = "") -> str:
    """Create a JWT-like token."""
    header = _b64_encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    payload_data = {
        "user_id": user_id,
        "username": username,
        "full_name": full_name,
        "exp": time.time() + (JWT_EXPIRY_HOURS * 3600)
    }
    payload = _b64_encode(json.dumps(payload_data).encode())
    signature = hmac.new(
        JWT_SECRET.encode(), f"{header}.{payload}".encode(), hashlib.sha256
    ).hexdigest()
    return f"{header}.{payload}.{signature}"


def verify_token(token: str) -> dict:
    """Verify and decode a JWT-like token. Returns payload or None."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header, payload, signature = parts
        expected_sig = hmac.new(
            JWT_SECRET.encode(), f"{header}.{payload}".encode(), hashlib.sha256
        ).hexdigest()
        if not hmac.compare_digest(signature, expected_sig):
            return None
        payload_data = json.loads(_b64_decode(payload))
        if payload_data.get("exp", 0) < time.time():
            return None
        return payload_data
    except Exception:
        return None


# --- AUTH OPERATIONS ---
def register_user(username: str, email: str, password: str, full_name: str = "") -> dict:
    """Register a new user. Returns dict with success status."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Check if user already exists
        cur.execute("SELECT id FROM users WHERE username = %s OR email = %s", (username, email))
        if cur.fetchone():
            return {"success": False, "error": "Username or email already exists"}
        
        password_hash = hash_password(password)
        cur.execute(
            "INSERT INTO users (username, email, password_hash, full_name) VALUES (%s, %s, %s, %s) RETURNING id",
            (username, email, password_hash, full_name)
        )
        user_id = cur.fetchone()[0]
        conn.commit()
        
        token = create_token(user_id, username, full_name)
        return {"success": True, "token": token, "user_id": user_id, "username": username, "full_name": full_name}
    except Exception as e:
        conn.rollback()
        return {"success": False, "error": str(e)}
    finally:
        cur.close()
        conn.close()


def login_user(username: str, password: str) -> dict:
    """Authenticate a user. Returns dict with success status and token."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "SELECT id, username, email, password_hash, full_name FROM users WHERE username = %s OR email = %s",
            (username, username)
        )
        user = cur.fetchone()
        if not user:
            return {"success": False, "error": "Invalid username or password"}
        
        user_id, db_username, email, stored_hash, full_name = user
        
        if not verify_password(password, stored_hash):
            return {"success": False, "error": "Invalid username or password"}
        
        # Update last login
        cur.execute("UPDATE users SET last_login = %s WHERE id = %s", (datetime.now(), user_id))
        conn.commit()
        
        token = create_token(user_id, db_username, full_name or "")
        return {"success": True, "token": token, "user_id": user_id, "username": db_username, "full_name": full_name or db_username}
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        cur.close()
        conn.close()
