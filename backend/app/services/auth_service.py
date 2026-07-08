from typing import Optional
from sqlalchemy.orm import Session
from fastapi import status
import logging

from app.models.user import User, PatientProfile, DoctorProfile, UserRole
from app.schemas.user import PatientRegisterRequest, DoctorRegisterRequest
from app.auth.security import get_password_hash, verify_password
from app.auth.jwt import create_access_token, create_refresh_token, decode_token
from app.core.exceptions import CustomHTTPException

logger = logging.getLogger("app.services.auth")

class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def _check_email_unique(self, email: str):
        existing = self.db.query(User).filter(User.email == email, User.is_deleted == False).first()
        if existing:
            raise CustomHTTPException(
                status_code=status.HTTP_409_CONFLICT,
                code="EMAIL_ALREADY_EXISTS",
                message=f"A user with email '{email}' already exists."
            )

    def register_patient(self, req: PatientRegisterRequest) -> User:
        logger.info(f"Registering patient with email: {req.email}")
        self._check_email_unique(req.email)

        user = User(
            email=req.email,
            hashed_password=get_password_hash(req.password),
            role=UserRole.PATIENT.value
        )
        self.db.add(user)
        self.db.flush()  # Generate user.id

        profile = PatientProfile(
            user_id=user.id,
            first_name=req.profile.first_name,
            last_name=req.profile.last_name,
            phone_number=req.profile.phone_number,
            date_of_birth=req.profile.date_of_birth,
            gender=req.profile.gender,
            blood_group=req.profile.blood_group,
            address=req.profile.address,
            emergency_contact=req.profile.emergency_contact
        )
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(user)
        return user

    def register_doctor(self, req: DoctorRegisterRequest) -> User:
        logger.info(f"Registering doctor with email: {req.email}, license: {req.profile.license_number}")
        self._check_email_unique(req.email)

        # Check duplicate license number
        existing_license = self.db.query(DoctorProfile).filter(DoctorProfile.license_number == req.profile.license_number).first()
        if existing_license:
            raise CustomHTTPException(
                status_code=status.HTTP_409_CONFLICT,
                code="LICENSE_ALREADY_EXISTS",
                message="A doctor with this license number already exists."
            )

        user = User(
            email=req.email,
            hashed_password=get_password_hash(req.password),
            role=UserRole.DOCTOR.value
        )
        self.db.add(user)
        self.db.flush()

        profile = DoctorProfile(
            user_id=user.id,
            first_name=req.profile.first_name,
            last_name=req.profile.last_name,
            specialization=req.profile.specialization,
            license_number=req.profile.license_number,
            qualification=req.profile.qualification,
            experience_years=req.profile.experience_years,
            consultation_fee=req.profile.consultation_fee,
            bio=req.profile.bio,
            profile_photo=req.profile.profile_photo,
            hospital_clinic=req.profile.hospital_clinic,
            languages=req.profile.languages,
            address=req.profile.address,
            city=req.profile.city,
            state=req.profile.state,
            country=req.profile.country,
            is_verified=False
        )
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(user)
        return user

    def authenticate_user(self, email: str, password: str) -> dict:
        user = self.db.query(User).filter(User.email == email, User.is_deleted == False).first()
        if not user or not verify_password(password, user.hashed_password):
            raise CustomHTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                code="INVALID_CREDENTIALS",
                message="Invalid email or password."
            )
        if not user.is_active:
            raise CustomHTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                code="ACCOUNT_DISABLED",
                message="Your account has been deactivated."
            )

        access_token = create_access_token(subject=str(user.id), role=user.role)
        refresh_token = create_refresh_token(subject=str(user.id), role=user.role)

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": user
        }

    def refresh_access_token(self, refresh_token_str: str) -> dict:
        payload = decode_token(refresh_token_str, expected_type="refresh")
        user_id = payload.get("sub")
        
        user = self.db.query(User).filter(User.id == user_id, User.is_deleted == False).first()
        if not user or not user.is_active:
            raise CustomHTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                code="INVALID_REFRESH_USER",
                message="User account no longer active or found."
            )

        access_token = create_access_token(subject=str(user.id), role=user.role)
        new_refresh_token = create_refresh_token(subject=str(user.id), role=user.role)

        return {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
            "user": user
        }
