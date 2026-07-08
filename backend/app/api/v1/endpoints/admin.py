from datetime import date
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, RoleChecker
from app.models.user import User, UserRole
from app.services.admin_service import AdminService
from app.schemas.admin import (
    AdminDashboardResponse,
    AdminAnalyticsResponse,
    AdminDoctorResponse,
    AdminPatientResponse,
    AdminPaginatedDoctorResponse,
    AdminPaginatedPatientResponse,
    DoctorVerifyRequest,
)
from app.schemas.appointment import PaginatedAppointmentResponse

router = APIRouter()

admin_only = RoleChecker([UserRole.ADMIN])

@router.get("/stats", response_model=AdminDashboardResponse)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_admin: User = Depends(admin_only),
):
    """
    Get high-level dashboard statistics for admin.
    """
    service = AdminService(db)
    return service.get_dashboard_stats()

@router.get("/analytics", response_model=AdminAnalyticsResponse)
def get_analytics(
    db: Session = Depends(get_db),
    current_admin: User = Depends(admin_only),
):
    """
    Get detailed platform analytics (monthly trends, status distributions, specializations).
    """
    service = AdminService(db)
    return service.get_analytics()

@router.get("/doctors", response_model=AdminPaginatedDoctorResponse)
def list_doctors(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    specialization: Optional[str] = Query(None),
    is_verified: Optional[bool] = Query(None),
    is_active: Optional[bool] = Query(None),
    city: Optional[str] = Query(None),
    search_query: Optional[str] = Query(None),
    sort_by: str = Query("created_desc"),
    include_deleted: bool = Query(False),
    db: Session = Depends(get_db),
    current_admin: User = Depends(admin_only),
):
    """
    List and filter all doctors across the platform with pagination and search.
    """
    service = AdminService(db)
    return service.search_doctors(
        page=page,
        page_size=page_size,
        specialization=specialization,
        is_verified=is_verified,
        is_active=is_active,
        city=city,
        search_query=search_query,
        sort_by=sort_by,
        include_deleted=include_deleted,
    )

@router.patch("/doctors/{doctor_id}/verify", response_model=AdminDoctorResponse)
def verify_doctor(
    doctor_id: UUID,
    req: DoctorVerifyRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(admin_only),
):
    """
    Verify or unverify a doctor profile.
    """
    service = AdminService(db)
    is_verified = req.is_verified if req.is_verified is not None else True
    return service.verify_doctor(doctor_id=doctor_id, is_verified=is_verified)

@router.patch("/doctors/{doctor_id}/activate", response_model=AdminDoctorResponse)
def activate_doctor(
    doctor_id: UUID,
    db: Session = Depends(get_db),
    current_admin: User = Depends(admin_only),
):
    """
    Activate a doctor account.
    """
    service = AdminService(db)
    return service.activate_doctor(doctor_id=doctor_id)

@router.patch("/doctors/{doctor_id}/deactivate", response_model=AdminDoctorResponse)
def deactivate_doctor(
    doctor_id: UUID,
    db: Session = Depends(get_db),
    current_admin: User = Depends(admin_only),
):
    """
    Deactivate a doctor account.
    """
    service = AdminService(db)
    return service.deactivate_doctor(doctor_id=doctor_id)

@router.delete("/doctors/{doctor_id}", response_model=AdminDoctorResponse)
def delete_doctor(
    doctor_id: UUID,
    db: Session = Depends(get_db),
    current_admin: User = Depends(admin_only),
):
    """
    Soft-delete a doctor account.
    """
    service = AdminService(db)
    return service.delete_doctor(doctor_id=doctor_id)

@router.get("/patients", response_model=AdminPaginatedPatientResponse)
def list_patients(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    gender: Optional[str] = Query(None),
    blood_group: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    search_query: Optional[str] = Query(None),
    sort_by: str = Query("created_desc"),
    include_deleted: bool = Query(False),
    db: Session = Depends(get_db),
    current_admin: User = Depends(admin_only),
):
    """
    List and filter all patients across the platform with pagination and search.
    """
    service = AdminService(db)
    return service.search_patients(
        page=page,
        page_size=page_size,
        gender=gender,
        blood_group=blood_group,
        is_active=is_active,
        search_query=search_query,
        sort_by=sort_by,
        include_deleted=include_deleted,
    )

@router.patch("/patients/{patient_id}/activate", response_model=AdminPatientResponse)
def activate_patient(
    patient_id: UUID,
    db: Session = Depends(get_db),
    current_admin: User = Depends(admin_only),
):
    """
    Activate a patient account.
    """
    service = AdminService(db)
    return service.activate_patient(patient_id=patient_id)

@router.patch("/patients/{patient_id}/deactivate", response_model=AdminPatientResponse)
def deactivate_patient(
    patient_id: UUID,
    db: Session = Depends(get_db),
    current_admin: User = Depends(admin_only),
):
    """
    Deactivate a patient account.
    """
    service = AdminService(db)
    return service.deactivate_patient(patient_id=patient_id)

@router.delete("/patients/{patient_id}", response_model=AdminPatientResponse)
def delete_patient(
    patient_id: UUID,
    db: Session = Depends(get_db),
    current_admin: User = Depends(admin_only),
):
    """
    Soft-delete a patient account.
    """
    service = AdminService(db)
    return service.delete_patient(patient_id=patient_id)

@router.get("/appointments", response_model=PaginatedAppointmentResponse)
def list_appointments(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    doctor_id: Optional[UUID] = Query(None),
    patient_id: Optional[UUID] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    search_query: Optional[str] = Query(None),
    sort_by: str = Query("date_desc"),
    db: Session = Depends(get_db),
    current_admin: User = Depends(admin_only),
):
    """
    List and filter all appointments across the platform for admin oversight.
    """
    service = AdminService(db)
    return service.search_appointments(
        page=page,
        page_size=page_size,
        status_filter=status_filter,
        doctor_id=doctor_id,
        patient_id=patient_id,
        date_from=date_from,
        date_to=date_to,
        search_query=search_query,
        sort_by=sort_by,
    )
