from datetime import datetime, timedelta, timezone
from typing import Any, Dict
import jwt
from app.core.config import settings
from app.core.exceptions import CustomHTTPException
from fastapi import status

ALGORITHM = "HS256"

def create_access_token(subject: str, role: str) -> str:
    """
    Generate a JWT access token with user ID (sub) and role.
    """
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode: Dict[str, Any] = {
        "sub": str(subject),
        "role": role,
        "type": "access",
        "exp": expire,
        "iat": datetime.now(timezone.utc)
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(subject: str, role: str) -> str:
    """
    Generate a JWT refresh token with user ID (sub) and role.
    """
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode: Dict[str, Any] = {
        "sub": str(subject),
        "role": role,
        "type": "refresh",
        "exp": expire,
        "iat": datetime.now(timezone.utc)
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str, expected_type: str = "access") -> Dict[str, Any]:
    """
    Decode and validate a JWT token.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        token_type = payload.get("type")
        if token_type != expected_type:
            raise CustomHTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                code="INVALID_TOKEN_TYPE",
                message=f"Expected {expected_type} token, got {token_type}"
            )
        return payload
    except jwt.ExpiredSignatureError:
        raise CustomHTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="TOKEN_EXPIRED",
            message="Token has expired. Please authenticate again."
        )
    except jwt.InvalidTokenError:
        raise CustomHTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="INVALID_TOKEN",
            message="Invalid authentication credentials."
        )
