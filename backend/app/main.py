from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
import logging

from app.core.config import settings
from app.core.logging import setup_logging
from app.core.exceptions import CustomHTTPException, custom_http_exception_handler, validation_exception_handler
from fastapi.exceptions import RequestValidationError
from app.database.session import get_db
from app.api.v1.router import api_router

# Initialize logging
setup_logging()
logger = logging.getLogger("app.main")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

# Register Custom Exception Handlers
app.add_exception_handler(CustomHTTPException, custom_http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)

# Include API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health Check"])
def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint to verify API server and database connectivity.
    """
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        db_status = "disconnected"
    
    return {
        "status": "ok" if db_status == "connected" else "degraded",
        "version": settings.VERSION,
        "database": db_status
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/health"
    }
