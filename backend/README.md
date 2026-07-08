# Doctor Appointment System - Backend (Phase 1: Foundation & Authentication)

Production-ready backend built with **FastAPI**, **SQLAlchemy 2.0**, **PostgreSQL**, **Alembic**, **Pydantic v2**, and **JWT Authentication**.

## Features
- **Clean Architecture** & SOLID principles
- **Role-Based Access Control (RBAC)**: Patient, Doctor, Admin
- **JWT Authentication**: Access token & Refresh token rotation
- **Password Security**: Direct `bcrypt` password hashing
- **Soft Delete Support**: Built into user models and database queries
- **Centralized Exception Handling**: Standardized HTTP JSON error responses
- **Structured Logging**: Production logging format

## Prerequisites
- Python 3.10+
- PostgreSQL 14+

## Setup & Installation
1. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows: venv\Scripts\activate
   # macOS/Linux: source venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure environment variables:
   Copy `.env.example` to `.env` and update `DATABASE_URL` with your PostgreSQL credentials.

4. Run database migrations:
   ```bash
   alembic upgrade head
   ```
   *(Alternatively, execute `database_schema.sql` directly in your PostgreSQL database).*

5. Start the development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

## API Documentation
- Interactive Swagger UI: `http://localhost:8000/docs`
- ReDoc UI: `http://localhost:8000/redoc`
- Health Check: `http://localhost:8000/health`
