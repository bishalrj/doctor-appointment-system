from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.auth import Token, LoginRequest, RefreshTokenRequest
from app.schemas.user import UserResponse, PatientRegisterRequest, DoctorRegisterRequest
from app.services.auth_service import AuthService
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/register/patient", response_model=UserResponse, status_code=status.HTTP_201_CREATED, summary="Register a new Patient")
def register_patient(req: PatientRegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new patient account with profile details.
    """
    service = AuthService(db)
    return service.register_patient(req)

@router.post("/register/doctor", response_model=UserResponse, status_code=status.HTTP_201_CREATED, summary="Register a new Doctor")
def register_doctor(req: DoctorRegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new doctor account with specialization and license details.
    """
    service = AuthService(db)
    return service.register_doctor(req)

@router.post("/login", response_model=Token, summary="Authenticate user and get JWT tokens")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user by email and password. Returns JWT access and refresh tokens along with user data.
    """
    service = AuthService(db)
    result = service.authenticate_user(req.email, req.password)
    # Map user object for response schema
    result["user"] = UserResponse.model_validate(result["user"])
    return result

@router.post("/refresh", response_model=Token, summary="Refresh JWT access token")
def refresh(req: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Obtain a new access token and refresh token using a valid refresh token.
    """
    service = AuthService(db)
    result = service.refresh_access_token(req.refresh_token)
    result["user"] = UserResponse.model_validate(result["user"])
    return result

@router.post("/logout", status_code=status.HTTP_200_OK, summary="Logout user")
def logout(current_user: User = Depends(get_current_user)):
    """
    Acknowledge user logout. In stateless JWT architecture, frontend discards tokens.
    """
    return {"status": "success", "message": "Successfully logged out."}

@router.get("/me", response_model=UserResponse, summary="Get current authenticated user profile")
def get_me(current_user: User = Depends(get_current_user)):
    """
    Retrieve profile details of the currently authenticated user.
    """
    return current_user
