from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict, model_validator

class AppointmentStatusEnum(str, Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    REJECTED = "REJECTED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class AppointmentCreate(BaseModel):
    doctor_id: UUID
    appointment_date: date
    start_time: str = Field(..., min_length=5, max_length=10)
    end_time: str = Field(..., min_length=5, max_length=10)
    reason_for_visit: str = Field(..., min_length=3, max_length=1000)

    @model_validator(mode="after")
    def validate_times(self) -> "AppointmentCreate":
        if self.start_time >= self.end_time:
            raise ValueError("start_time must be earlier than end_time")
        return self

class AppointmentReschedule(BaseModel):
    appointment_date: date
    start_time: str = Field(..., min_length=5, max_length=10)
    end_time: str = Field(..., min_length=5, max_length=10)
    reason_for_visit: Optional[str] = Field(None, min_length=3, max_length=1000)

    @model_validator(mode="after")
    def validate_times(self) -> "AppointmentReschedule":
        if self.start_time >= self.end_time:
            raise ValueError("start_time must be earlier than end_time")
        return self

class AppointmentStatusUpdate(BaseModel):
    status: AppointmentStatusEnum
    notes: Optional[str] = Field(None, max_length=1000)

class PatientSummary(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    phone_number: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class DoctorSummary(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    specialization: str
    qualification: Optional[str] = None
    hospital_clinic: Optional[str] = None
    profile_photo: Optional[str] = None
    consultation_fee: Decimal

    model_config = ConfigDict(from_attributes=True)

class AppointmentResponse(BaseModel):
    id: UUID
    patient_id: UUID
    doctor_id: UUID
    appointment_date: date
    start_time: str
    end_time: str
    reason_for_visit: str
    status: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    patient: Optional[PatientSummary] = None
    doctor: Optional[DoctorSummary] = None

    model_config = ConfigDict(from_attributes=True)

class PaginatedAppointmentResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    data: List[AppointmentResponse]

class TimeSlotResponse(BaseModel):
    start_time: str
    end_time: str
    is_available: bool

class AvailableSlotsResponse(BaseModel):
    date: str
    doctor_id: UUID
    day_of_week: str
    slots: List[TimeSlotResponse]
