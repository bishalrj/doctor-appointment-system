from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.user import UserResponse
from app.models.user import User, UserRole
from app.api.deps import get_current_user, RoleChecker

router = APIRouter()

@router.get("/", response_model=List[UserResponse], summary="List all users (Admin Only)")
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.ADMIN]))
):
    """
    Protected endpoint accessible only to administrators to list all system users.
    """
    users = db.query(User).filter(User.is_deleted == False).all()
    return users
