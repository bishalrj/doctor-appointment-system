from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.doctor import PaginatedDoctorResponse, DoctorDetailResponse
from app.services.doctor_service import DoctorService

router = APIRouter()

@router.get(
    "/",
    response_model=PaginatedDoctorResponse,
    summary="Browse and search doctors with filters and sorting",
)
def search_doctors(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    specialization: Optional[str] = Query(None, description="Filter by specialization"),
    city: Optional[str] = Query(None, description="Filter by city"),
    max_fee: Optional[float] = Query(None, ge=0, description="Maximum consultation fee"),
    min_experience: Optional[int] = Query(None, ge=0, description="Minimum experience in years"),
    language: Optional[str] = Query(None, description="Filter by language"),
    search: Optional[str] = Query(None, description="Search keyword in name, specialty, or clinic"),
    sort_by: str = Query("exp_desc", description="Sort order: exp_desc, fee_asc, fee_desc, exp_asc"),
    db: Session = Depends(get_db),
):
    """
    Public endpoint for patients and guests to discover, search, and filter active verified doctors.
    """
    service = DoctorService(db)
    return service.search_doctors(
        page=page,
        page_size=page_size,
        specialization=specialization,
        city=city,
        max_fee=max_fee,
        min_experience=min_experience,
        language=language,
        search_query=search,
        sort_by=sort_by,
    )

@router.get(
    "/{doctor_id}",
    response_model=DoctorDetailResponse,
    summary="Get public doctor profile and weekly availability",
)
def get_doctor_detail(
    doctor_id: UUID,
    db: Session = Depends(get_db),
):
    """
    Public endpoint to view detailed doctor profile and weekly schedule.
    """
    service = DoctorService(db)
    return service.get_public_doctor_detail(doctor_id)
