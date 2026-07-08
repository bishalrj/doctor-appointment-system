from typing import Any, Dict, Optional
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import logging

logger = logging.getLogger("app.core.exceptions")

class CustomHTTPException(Exception):
    """
    Centralized custom HTTP exception for standardized JSON error responses.
    """
    def __init__(
        self,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        code: str = "BAD_REQUEST",
        message: str = "An error occurred",
        details: Optional[Any] = None
    ):
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details

async def custom_http_exception_handler(request: Request, exc: CustomHTTPException) -> JSONResponse:
    logger.error(f"HTTPException [{exc.code}] ({exc.status_code}) on {request.method} {request.url.path}: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "code": exc.code,
            "message": exc.message,
            "details": exc.details
        }
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    logger.warning(f"ValidationError on {request.method} {request.url.path}: {exc.errors()}")
    errors = []
    for err in exc.errors():
        field = " -> ".join([str(loc) for loc in err.get("loc", []) if loc != "body"])
        errors.append({
            "field": field,
            "message": err.get("msg", "Invalid value"),
            "type": err.get("type")
        })
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": True,
            "code": "VALIDATION_ERROR",
            "message": "Input validation failed",
            "details": errors
        }
    )
