from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict, model_validator
from app.schemas.user import DoctorProfileResponse

class DoctorProfileUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    specialization: Optional[str] = Field(None, min_length=2, max_length=150)
    qualification: Optional[str] = Field(None, min_length=2, max_length=255)
    experience_years: Optional[int] = Field(None, ge=0, le=70)
    consultation_fee: Optional[Decimal] = Field(None, ge=0)
    bio: Optional[str] = None
    profile_photo: Optional[str] = Field(None, max_length=500)
    hospital_clinic: Optional[str] = Field(None, max_length=255)
    languages: Optional[str] = Field(None, max_length=255)
    address: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = None

class DoctorAvailabilityBase(BaseModel):
    day_of_week: str = Field(..., min_length=3, max_length=20)
    start_time: str = Field(..., min_length=5, max_length=10)  # e.g., "09:00"
    end_time: str = Field(..., min_length=5, max_length=10)    # e.g., "17:00"
    slot_duration: int = Field(30, ge=5, le=240)
    break_start: Optional[str] = Field(None, max_length=10)
    break_end: Optional[str] = Field(None, max_length=10)
    is_available: bool = True

    @model_validator(mode="after")
    def validate_times(self) -> "DoctorAvailabilityBase":
        if self.start_time >= self.end_time:
            raise ValueError("start_time must be earlier than end_time")
        if self.break_start or self.break_end:
            if not (self.break_start and self.break_end):
                raise ValueError("Both break_start and break_end must be provided if one is set")
            if self.break_start >= self.break_end:
                raise ValueError("break_start must be earlier than break_end")
            if self.start_time > self.break_start or self.break_end > self.end_time:
                raise ValueError("break time must fall within start_time and end_time")
        return self

class DoctorAvailabilityCreate(DoctorAvailabilityBase):
    pass

class DoctorAvailabilityUpdate(BaseModel):
    day_of_week: Optional[str] = Field(None, min_length=3, max_length=20)
    start_time: Optional[str] = Field(None, min_length=5, max_length=10)
    end_time: Optional[str] = Field(None, min_length=5, max_length=10)
    slot_duration: Optional[int] = Field(None, ge=5, le=240)
    break_start: Optional[str] = Field(None, max_length=10)
    break_end: Optional[str] = Field(None, max_length=10)
    is_available: Optional[bool] = None

    @model_validator(mode="after")
    def validate_times_if_both_set(self) -> "DoctorAvailabilityUpdate":
        if self.start_time and self.end_time and self.start_time >= self.end_time:
            raise ValueError("start_time must be earlier than end_time")
        if self.break_start and self.break_end and self.break_start >= self.break_end:
            raise ValueError("break_start must be earlier than break_end")
        return self

class DoctorAvailabilityResponse(DoctorAvailabilityBase):
    id: UUID
    doctor_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DoctorDetailResponse(DoctorProfileResponse):
    availabilities: List[DoctorAvailabilityResponse] = []

class PaginatedDoctorResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    data: List[DoctorProfileResponse]
