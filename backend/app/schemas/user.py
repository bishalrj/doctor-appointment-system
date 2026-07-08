from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from app.models.user import UserRole

# Patient Profile Schemas
class PatientProfileBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    phone_number: Optional[str] = Field(None, max_length=50)
    date_of_birth: Optional[date] = None
    gender: Optional[str] = Field(None, max_length=20)
    blood_group: Optional[str] = Field(None, max_length=10)
    address: Optional[str] = None
    emergency_contact: Optional[str] = Field(None, max_length=100)

class PatientProfileCreate(PatientProfileBase):
    pass

class PatientProfileResponse(PatientProfileBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Doctor Profile Schemas
class DoctorProfileBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    specialization: str = Field(..., min_length=2, max_length=150)
    license_number: str = Field(..., min_length=3, max_length=100)
    qualification: str = Field(..., min_length=2, max_length=255)
    experience_years: int = Field(0, ge=0, le=70)
    consultation_fee: Decimal = Field(Decimal("0.00"), ge=0)
    bio: Optional[str] = None
    profile_photo: Optional[str] = Field(None, max_length=500)
    hospital_clinic: Optional[str] = Field(None, max_length=255)
    languages: Optional[str] = Field(None, max_length=255)
    address: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)

class DoctorProfileCreate(DoctorProfileBase):
    pass

class DoctorProfileResponse(DoctorProfileBase):
    id: UUID
    user_id: UUID
    is_verified: bool
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# User Schemas
class UserBase(BaseModel):
    email: EmailStr

class PatientRegisterRequest(UserBase):
    password: str = Field(..., min_length=8, max_length=128)
    profile: PatientProfileCreate

class DoctorRegisterRequest(UserBase):
    password: str = Field(..., min_length=8, max_length=128)
    profile: DoctorProfileCreate

class UserResponse(UserBase):
    id: UUID
    role: UserRole
    is_active: bool
    is_deleted: bool
    created_at: datetime
    updated_at: datetime
    patient_profile: Optional[PatientProfileResponse] = None
    doctor_profile: Optional[DoctorProfileResponse] = None

    model_config = ConfigDict(from_attributes=True)
