"""
PulseIQ Login API Server (Standalone)
--------------------------------------
A minimal FastAPI server that provides only the authentication
endpoints extracted from the main PulseIQ API.

Usage:
    pip install fastapi uvicorn psycopg2-binary pydantic python-dotenv
    uvicorn api_auth:app --reload --port 8000
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Auth module
from auth import init_users_table, register_user, login_user, verify_token

load_dotenv(override=True)

# --- INITIALIZE API ---
app = FastAPI(title="PulseIQ Auth API", version="1.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize users table on startup
@app.on_event("startup")
def startup_event():
    try:
        init_users_table()
        print("✅ Users table initialized!")
    except Exception as e:
        print(f"⚠️ Could not initialize users table (DB may not be ready): {e}")


# --- AUTH MODELS ---
class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    full_name: str = ""

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenRequest(BaseModel):
    token: str


# --- AUTH ENDPOINTS ---
@app.get("/api/")
def read_root():
    return {"message": "Welcome to the PulseIQ Auth API!"}

@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

@app.post("/api/auth/register")
def api_register(request: RegisterRequest):
    """Register a new user."""
    if len(request.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    if len(request.username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters")
    
    result = register_user(request.username, request.email, request.password, request.full_name)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@app.post("/api/auth/login")
def api_login(request: LoginRequest):
    """Authenticate a user."""
    result = login_user(request.username, request.password)
    if not result["success"]:
        raise HTTPException(status_code=401, detail=result["error"])
    return result

@app.post("/api/auth/verify")
def api_verify(request: TokenRequest):
    """Verify a JWT token."""
    payload = verify_token(request.token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return {"valid": True, "user": payload}
