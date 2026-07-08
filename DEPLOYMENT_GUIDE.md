# MediCare Plus | Production Deployment Guide

This guide provides step-by-step instructions for deploying the **MediCare Plus Doctor Appointment System** to modern cloud hosting environments. The platform consists of a **FastAPI / PostgreSQL** backend and a **Next.js 15 (App Router)** frontend.

---

## 1. Production Architecture & Prerequisites

### 1.1 Infrastructure Requirements
- **Database**: Managed PostgreSQL 15+ instance (e.g., Supabase, Neon, RDS, or Railway Postgres).
- **Backend Hosting**: Python 3.10+ container or serverless runtime (e.g., Render, Railway, Fly.io, or AWS ECS).
- **Frontend Hosting**: Edge-optimized Node.js 20+ runtime (e.g., Vercel or Netlify).

### 1.2 Security Prerequisites
- Generate a cryptographically strong 64-character secret key for JWT signing:
  ```bash
  openssl rand -hex 32
  ```
- Ensure SSL/TLS encryption (`https://`) is enforced across all endpoints.
- Configure strict CORS origins matching your exact production frontend domain.

---

## 2. Backend Deployment (Render / Railway / Docker)

### 2.1 Option A: Deploying to Railway or Render
1. **Create Database**: Provision a managed PostgreSQL database on Railway or Supabase and copy the connection string (`postgresql://user:pass@host:port/dbname`).
2. **Connect Repository**: Link your GitHub repository to Render/Railway and select the `/backend` root directory.
3. **Build Configuration**:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 4`
4. **Environment Variables**: Configure the following production secrets in the cloud dashboard:
   ```env
   PROJECT_NAME="Doctor Appointment System API"
   VERSION="1.0.0"
   API_V1_STR="/api/v1"
   LOG_LEVEL="INFO"
   SECRET_KEY="<paste-your-64-char-openssl-secret-here>"
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   REFRESH_TOKEN_EXPIRE_DAYS=14
   DATABASE_URL="postgresql://postgres:password@db.provider.com:5432/medicare_prod"
   BACKEND_CORS_ORIGINS='["https://medicare-plus.vercel.app","https://www.medicare-plus.com"]'
   ```
5. **Run Migrations / Schema Initialization**:
   - On deployment, execute the database schema setup or let SQLAlchemy auto-create tables on startup (configured in `app/db/init_db.py` or via `database_schema.sql`).

---

### 2.2 Option B: Docker Container Deployment
You can containerize the backend using the included production-ready Docker setup:

#### `backend/Dockerfile`
```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .

# Expose port and run uvicorn with worker scaling
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

#### Build & Run Command:
```bash
docker build -t medicare-backend:v1.0.0 ./backend
docker run -d -p 8000:8000 --env-file ./backend/.env --name medicare-api medicare-backend:v1.0.0
```

---

## 3. Frontend Deployment (Vercel)

Vercel provides native, edge-optimized hosting for Next.js 15 App Router applications.

### 3.1 Step-by-Step Vercel Setup
1. **Push to GitHub**: Ensure your latest codebase is pushed to your default branch (`main` or `master`).
2. **Import Project**: Log into [Vercel](https://vercel.com), click **Add New -> Project**, and import your repository.
3. **Configure Project Settings**:
   - **Framework Preset**: Next.js
   - **Root Directory**: Click *Edit* and select `frontend`.
   - **Build Command**: `next build` (default)
   - **Install Command**: `npm install` (default)
4. **Environment Variables**: Add the backend API URL in the Vercel Environment Variables section:
   | Key | Value | Environment |
   | :--- | :--- | :--- |
   | `NEXT_PUBLIC_API_URL` | `https://your-backend-api.onrender.com/api/v1` | Production, Preview |
5. **Deploy**: Click **Deploy**. Vercel will automatically build, optimize static chunks, and generate edge routes.

---

## 4. Production Verification & Audit Checklist

Before releasing to end users or submitting for evaluation, perform the following verification steps:

### 4.1 Backend Verification
- [x] **Health Check**: Hit `GET https://api.yourdomain.com/docs` to verify OpenAPI Swagger documentation loads cleanly.
- [x] **CORS Test**: Attempt an OPTIONS preflight request from an unauthorized domain to verify CORS blocks external origins.
- [x] **Database Persistence**: Register a test user, restart the backend server/container, and verify user record remains intact.
- [x] **Security Headers**: Ensure HTTP headers do not expose sensitive stack trace information on 500 exceptions.

### 4.2 Frontend Verification
- [x] **Production Build Test**: Run `npm run build` locally to verify zero TypeScript errors, zero ESLint warnings, and proper static pre-rendering.
- [x] **Token Persistence**: Log in as `PATIENT`, refresh the browser window, and verify session restores seamlessly without logging out.
- [x] **Responsive Layout**: Inspect Admin Dashboard and Doctor Directory on mobile (375px width) and desktop (1440px width) viewports.
- [x] **Error Fallback**: Navigate to a non-existent route (e.g., `/dashboard/invalid`) to verify custom `404 Not Found` page renders.

---

## 5. Troubleshooting Common Deployment Issues

### 5.1 `401 Unauthorized` Loop immediately after login
- **Cause**: The frontend is running on HTTPS while the backend is running on HTTP, or cookies/tokens are being stripped by browser CORS policies.
- **Fix**: Ensure `NEXT_PUBLIC_API_URL` uses `https://` and that `BACKEND_CORS_ORIGINS` in backend `.env` explicitly matches your frontend URL without trailing slashes.

### 5.2 Database Connection Refused (`SQLAlchemy OperationalError`)
- **Cause**: Cloud provider firewall is blocking port 5432 or SSL mode is required.
- **Fix**: Append `?sslmode=require` to your `DATABASE_URL` string in cloud environment variables:
  ```env
  DATABASE_URL="postgresql://user:pass@db.provider.com:5432/dbname?sslmode=require"
  ```

### 5.3 Next.js Build Failure: `Prerender Error`
- **Cause**: A component is attempting to access `window`, `localStorage`, or browser APIs during server-side rendering (SSR).
- **Fix**: Ensure any code accessing browser storage is wrapped inside `typeof window !== "undefined"` or inside a `useEffect` hook (as implemented in `src/lib/axios.ts` and `auth-context.tsx`).
