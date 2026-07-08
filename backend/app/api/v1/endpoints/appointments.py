from datetime import date
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User, UserRole
from app.api.deps import RoleChecker, get_current_user
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentReschedule,
    AppointmentStatusUpdate,
    AppointmentResponse,
    PaginatedAppointmentResponse,
    AvailableSlotsResponse,
)
from app.services.appointment_service import AppointmentService

router = APIRouter()

@router.get(
    "/slots",
    response_model=AvailableSlotsResponse,
    summary="Get available time slots for a doctor on a specific date",
)
def get_available_slots(
    doctor_id: UUID = Query(..., description="UUID of the doctor profile"),
    target_date: date = Query(..., description="Date to check availability (YYYY-MM-DD)", alias="date"),
    db: Session = Depends(get_db),
):
    """
    Retrieve discrete time slots for a doctor on a specific date, indicating whether each slot is available or booked.
    """
    service = AppointmentService(db)
    return service.get_available_slots(doctor_id, target_date)

@router.post(
    "/book",
    response_model=AppointmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Book a new appointment",
)
def book_appointment(
    req: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.PATIENT])),
):
    """
    Patient endpoint to book a new appointment with a verified doctor.
    """
    service = AppointmentService(db)
    return service.book_appointment(current_user.id, req)

@router.get(
    "/my",
    response_model=PaginatedAppointmentResponse,
    summary="View patient's own appointments",
)
def get_my_appointments(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    filter_type: Optional[str] = Query(None, alias="filter", description="'upcoming' or 'history'"),
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.PATIENT])),
):
    """
    Patient endpoint to list own appointments with pagination and status/time filters.
    """
    service = AppointmentService(db)
    return service.get_patient_appointments(current_user.id, page, page_size, status_filter, filter_type)

@router.get(
    "/doctor",
    response_model=PaginatedAppointmentResponse,
    summary="View doctor's assigned appointments",
)
def get_doctor_appointments(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    target_date: Optional[date] = Query(None, alias="date"),
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.DOCTOR])),
):
    """
    Doctor endpoint to list assigned appointments with pagination, status filter, and date filter.
    """
    service = AppointmentService(db)
    return service.get_doctor_appointments(current_user.id, page, page_size, status_filter, target_date)

@router.get(
    "/{appointment_id}",
    response_model=AppointmentResponse,
    summary="Get appointment details",
)
def get_appointment_detail(
    appointment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve full details of an appointment. Accessible only to the participating patient, doctor, or admin.
    """
    service = AppointmentService(db)
    return service.get_appointment_detail(current_user.id, current_user.role, appointment_id)

@router.put(
    "/{appointment_id}/cancel",
    response_model=AppointmentResponse,
    summary="Cancel an appointment",
)
def cancel_appointment(
    appointment_id: UUID,
    notes: Optional[str] = Query(None, description="Reason for cancellation"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Cancel an active appointment. Accessible to participating patient, doctor, or admin.
    """
    service = AppointmentService(db)
    return service.cancel_appointment(current_user.id, current_user.role, appointment_id, notes)

@router.put(
    "/{appointment_id}/reschedule",
    response_model=AppointmentResponse,
    summary="Reschedule an appointment",
)
def reschedule_appointment(
    appointment_id: UUID,
    req: AppointmentReschedule,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.PATIENT])),
):
    """
    Patient endpoint to reschedule an active appointment to a new date and time slot.
    """
    service = AppointmentService(db)
    return service.reschedule_appointment(current_user.id, current_user.role, appointment_id, req)

@router.put(
    "/{appointment_id}/status",
    response_model=AppointmentResponse,
    summary="Update appointment status (Confirm, Reject, Complete)",
)
def update_appointment_status(
    appointment_id: UUID,
    req: AppointmentStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.DOCTOR, UserRole.ADMIN])),
):
    """
    Doctor endpoint to change appointment status (e.g., CONFIRM, REJECT, or COMPLETE).
    """
    service = AppointmentService(db)
    return service.update_appointment_status(current_user.id, current_user.role, appointment_id, req)
