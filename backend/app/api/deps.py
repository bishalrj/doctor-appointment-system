from typing import List, Callable, Optional, Union
from fastapi import Depends, Header, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User, UserRole
from app.auth.jwt import decode_token
from app.core.exceptions import CustomHTTPException

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to authenticate and retrieve the current active user from JWT token.
    """
    payload = decode_token(token, expected_type="access")
    user_id = payload.get("sub")
    if not user_id:
        raise CustomHTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="INVALID_TOKEN_SUBJECT",
            message="Token payload invalid."
        )
    
    user = db.query(User).filter(User.id == user_id, User.is_deleted == False).first()
    if not user:
        raise CustomHTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="USER_NOT_FOUND",
            message="User associated with token not found."
        )
    if not user.is_active:
        raise CustomHTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            code="USER_INACTIVE",
            message="User account is deactivated."
        )
    return user

class RoleChecker:
    """
    Role-Based Access Control (RBAC) dependency factory.
    Usage: Depends(RoleChecker([UserRole.ADMIN, UserRole.DOCTOR]))
    """
    def __init__(self, allowed_roles: List[Union[str, UserRole]]):
        self.allowed_roles = [role.value if isinstance(role, UserRole) else role for role in allowed_roles]

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in self.allowed_roles:
            raise CustomHTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                code="INSUFFICIENT_PERMISSIONS",
                message=f"Access denied. Required roles: {self.allowed_roles}, Your role: {current_user.role}"
            )
        return current_user
