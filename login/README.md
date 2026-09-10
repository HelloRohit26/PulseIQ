# PulseIQ Login Page

A standalone, reusable login/signup page extracted from the [PulseIQ](https://github.com/HelloRohit26/PulseIQ) project.

![Preview](frontend/v.mp4)

## ✨ Features

- **Glassmorphism UI** — Dark nebula-themed glass panel with rotating mesh gradients
- **Interactive Rain Effect** — Canvas-based rain with mouse forcefield physics, lightning flashes, and splash ripples
- **3D Spline Robot** — Embedded Spline 3D model on the left panel
- **Typewriter Text** — Animated typing/deleting overlay text
- **Login & Signup Toggle** — Seamless switch between Sign In and Sign Up modes
- **JWT Authentication** — Lightweight token-based auth (no PyJWT dependency)
- **Password Hashing** — PBKDF2-HMAC-SHA256 with random salt
- **Fully Responsive** — Optimized for desktop, tablet, and mobile (down to 360px)

---

## 📁 Folder Structure

```
login/
├── frontend/
│   ├── index.html      # Main login page (HTML + inline JS)
│   ├── style.css       # All styles (glassmorphism, animations, responsive)
│   ├── script.js       # Standalone rain canvas effect (alternative version)
│   └── v.mp4           # Background video for left panel
├── backend/
│   ├── auth.py         # Authentication module (hashing, JWT, DB operations)
│   ├── api_auth.py     # Standalone FastAPI server (auth endpoints only)
│   └── requirements.txt
└── README.md
```

---

## 🚀 Quick Start

### Frontend Only (Static)

Just open `frontend/index.html` in your browser. The login UI will render with all animations. Backend calls will fail gracefully with an alert.

### Full Stack (with Backend)

1. **Setup PostgreSQL** (or use Docker):
   ```bash
   # Example with Docker
   docker run -d --name pulseiq-db \
     -e POSTGRES_USER=pulseiq_user \
     -e POSTGRES_PASSWORD=mysecretpassword \
     -e POSTGRES_DB=pulseiq_db \
     -p 5432:5432 postgres:15
   ```

2. **Install Python dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Update DB connection** in `backend/auth.py` — change `host="postgres"` to `host="localhost"` (or your DB host).

4. **Run the API server**:
   ```bash
   cd backend
   uvicorn api_auth:app --reload --port 8000
   ```

5. **Update frontend API URLs** in `frontend/index.html` — change `fetch(url, ...)` calls to point to `http://localhost:8000/api/auth/...`.

---

## 🔌 API Endpoints

| Method | Endpoint             | Description         |
|--------|----------------------|---------------------|
| POST   | `/api/auth/register` | Register a new user |
| POST   | `/api/auth/login`    | Login (get JWT)     |
| POST   | `/api/auth/verify`   | Verify a JWT token  |
| GET    | `/api/health`        | Health check        |

### Register
```json
POST /api/auth/register
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "mypassword",
  "full_name": "John Doe"
}
```

### Login
```json
POST /api/auth/login
{
  "username": "john@example.com",
  "password": "mypassword"
}
```

---

## 🛠 Tech Stack

| Layer    | Technology                       |
|----------|----------------------------------|
| Frontend | HTML, CSS, JavaScript, Canvas API |
| 3D       | Spline (spline-viewer)           |
| Backend  | Python, FastAPI                  |
| Database | PostgreSQL                       |
| Auth     | PBKDF2 + custom JWT              |

---

## 📝 License

This login page is extracted from PulseIQ. Feel free to use and modify it for your own projects.
