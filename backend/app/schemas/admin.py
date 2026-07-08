from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from app.schemas.user import DoctorProfileResponse, PatientProfileResponse
from app.schemas.appointment import AppointmentResponse

class MonthlyAppointmentCount(BaseModel):
    month: str  # Format: YYYY-MM
    count: int

class StatusAppointmentCount(BaseModel):
    status: str
    count: int

class SpecializationDoctorCount(BaseModel):
    specialization: str
    count: int

class AdminDashboardResponse(BaseModel):
    total_doctors: int
    total_patients: int
    total_appointments: int
    today_appointments: int
    pending_appointments: int
    completed_appointments: int
    cancelled_appointments: int
    verified_doctors: int
    unverified_doctors: int
    recent_appointments: List[AppointmentResponse] = []

class AdminAnalyticsResponse(BaseModel):
    total_doctors: int
    total_patients: int
    total_appointments: int
    today_appointments: int
    pending_appointments: int
    completed_appointments: int
    cancelled_appointments: int
    verified_doctors: int
    appointments_by_month: List[MonthlyAppointmentCount]
    appointments_by_status: List[StatusAppointmentCount]
    doctors_by_specialization: List[SpecializationDoctorCount]

class AdminDoctorResponse(DoctorProfileResponse):
    email: EmailStr
    is_deleted: bool
    total_appointments: int = 0

    model_config = ConfigDict(from_attributes=True)

class AdminPatientResponse(PatientProfileResponse):
    email: EmailStr
    is_active: bool
    is_deleted: bool
    total_appointments: int = 0

    model_config = ConfigDict(from_attributes=True)

class AdminPaginatedDoctorResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    data: List[AdminDoctorResponse]

class AdminPaginatedPatientResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    data: List[AdminPatientResponse]

class DoctorVerifyRequest(BaseModel):
    is_verified: Optional[bool] = True
