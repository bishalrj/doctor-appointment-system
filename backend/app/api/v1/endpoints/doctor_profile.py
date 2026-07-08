from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User, UserRole
from app.api.deps import RoleChecker
from app.schemas.doctor import (
    DoctorProfileUpdate,
    DoctorDetailResponse,
    DoctorAvailabilityCreate,
    DoctorAvailabilityUpdate,
    DoctorAvailabilityResponse,
)
from app.services.doctor_service import DoctorService

router = APIRouter()

@router.get(
    "/profile",
    response_model=DoctorDetailResponse,
    summary="Get current doctor profile and schedule",
)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.DOCTOR])),
):
    """
    Retrieve the authenticated doctor's full profile and weekly availability slots.
    """
    service = DoctorService(db)
    profile = service.get_doctor_profile_by_user_id(current_user.id)
    return DoctorDetailResponse.model_validate(profile)

@router.put(
    "/profile",
    response_model=DoctorDetailResponse,
    summary="Update current doctor profile",
)
def update_my_profile(
    update_data: DoctorProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.DOCTOR])),
):
    """
    Update profile details (photo, clinic, languages, fees, bio, location, active status).
    """
    service = DoctorService(db)
    profile = service.update_doctor_profile(current_user.id, update_data)
    return DoctorDetailResponse.model_validate(profile)

@router.post(
    "/availability",
    response_model=DoctorAvailabilityResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a weekly availability slot",
)
def create_availability_slot(
    create_data: DoctorAvailabilityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.DOCTOR])),
):
    """
    Create a new weekly availability schedule slot (prevents overlapping times on the same day).
    """
    service = DoctorService(db)
    return service.create_availability(current_user.id, create_data)

@router.get(
    "/availability",
    response_model=List[DoctorAvailabilityResponse],
    summary="List weekly availability slots",
)
def list_availability_slots(
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.DOCTOR])),
):
    """
    List all weekly schedule slots configured by the authenticated doctor.
    """
    service = DoctorService(db)
    return service.get_availabilities_by_user_id(current_user.id)

@router.put(
    "/availability/{slot_id}",
    response_model=DoctorAvailabilityResponse,
    summary="Update an availability slot",
)
def update_availability_slot(
    slot_id: UUID,
    update_data: DoctorAvailabilityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.DOCTOR])),
):
    """
    Update an existing availability schedule slot.
    """
    service = DoctorService(db)
    return service.update_availability(current_user.id, slot_id, update_data)

@router.delete(
    "/availability/{slot_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an availability slot",
)
def delete_availability_slot(
    slot_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.DOCTOR])),
):
    """
    Remove an availability schedule slot.
    """
    service = DoctorService(db)
    service.delete_availability(current_user.id, slot_id)
