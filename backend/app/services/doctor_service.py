from typing import Optional, List, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_, and_
from fastapi import status
import logging
from uuid import UUID

from app.models.user import User, DoctorProfile, DoctorAvailability
from app.schemas.doctor import (
    DoctorProfileUpdate,
    DoctorAvailabilityCreate,
    DoctorAvailabilityUpdate,
    PaginatedDoctorResponse,
    DoctorDetailResponse,
)
from app.core.exceptions import CustomHTTPException

logger = logging.getLogger("app.services.doctor")

DAY_ORDER = {
    "MONDAY": 1,
    "TUESDAY": 2,
    "WEDNESDAY": 3,
    "THURSDAY": 4,
    "FRIDAY": 5,
    "SATURDAY": 6,
    "SUNDAY": 7,
}

class DoctorService:
    def __init__(self, db: Session):
        self.db = db

    def get_doctor_profile_by_user_id(self, user_id: UUID) -> DoctorProfile:
        profile = (
            self.db.query(DoctorProfile)
            .options(joinedload(DoctorProfile.availabilities))
            .filter(DoctorProfile.user_id == user_id)
            .first()
        )
        if not profile:
            raise CustomHTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                code="DOCTOR_PROFILE_NOT_FOUND",
                message="Doctor profile not found for this user.",
            )
        # Sort availabilities in memory by day of week and start time
        profile.availabilities.sort(
            key=lambda a: (DAY_ORDER.get(a.day_of_week.upper(), 8), a.start_time)
        )
        return profile

    def update_doctor_profile(
        self, user_id: UUID, update_data: DoctorProfileUpdate
    ) -> DoctorProfile:
        profile = self.get_doctor_profile_by_user_id(user_id)
        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(profile, key, value)
        self.db.commit()
        self.db.refresh(profile)
        logger.info(f"Updated doctor profile for user {user_id}")
        return profile

    def _check_schedule_overlap(
        self,
        doctor_id: UUID,
        day_of_week: str,
        start_time: str,
        end_time: str,
        exclude_slot_id: Optional[UUID] = None,
    ):
        query = self.db.query(DoctorAvailability).filter(
            DoctorAvailability.doctor_id == doctor_id,
            DoctorAvailability.day_of_week == day_of_week.upper(),
        )
        if exclude_slot_id:
            query = query.filter(DoctorAvailability.id != exclude_slot_id)
        
        existing_slots = query.all()
        for slot in existing_slots:
            # Overlap condition: max(start1, start2) < min(end1, end2)
            if max(slot.start_time, start_time) < min(slot.end_time, end_time):
                raise CustomHTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    code="OVERLAPPING_SCHEDULE",
                    message=f"This time slot ({start_time}-{end_time}) overlaps with existing availability ({slot.start_time}-{slot.end_time}) on {day_of_week}.",
                )

    def create_availability(
        self, user_id: UUID, create_data: DoctorAvailabilityCreate
    ) -> DoctorAvailability:
        profile = self.get_doctor_profile_by_user_id(user_id)
        day_upper = create_data.day_of_week.upper()
        if day_upper not in DAY_ORDER:
            raise CustomHTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                code="INVALID_DAY_OF_WEEK",
                message=f"Invalid day of week: {create_data.day_of_week}. Must be Monday-Sunday.",
            )

        self._check_schedule_overlap(
            doctor_id=profile.id,
            day_of_week=day_upper,
            start_time=create_data.start_time,
            end_time=create_data.end_time,
        )

        slot = DoctorAvailability(
            doctor_id=profile.id,
            day_of_week=day_upper,
            start_time=create_data.start_time,
            end_time=create_data.end_time,
            slot_duration=create_data.slot_duration,
            break_start=create_data.break_start,
            break_end=create_data.break_end,
            is_available=create_data.is_available,
        )
        self.db.add(slot)
        self.db.commit()
        self.db.refresh(slot)
        logger.info(f"Created availability slot {slot.id} for doctor {profile.id}")
        return slot

    def get_availabilities_by_user_id(self, user_id: UUID) -> List[DoctorAvailability]:
        profile = self.get_doctor_profile_by_user_id(user_id)
        return profile.availabilities

    def update_availability(
        self, user_id: UUID, slot_id: UUID, update_data: DoctorAvailabilityUpdate
    ) -> DoctorAvailability:
        profile = self.get_doctor_profile_by_user_id(user_id)
        slot = (
            self.db.query(DoctorAvailability)
            .filter(
                DoctorAvailability.id == slot_id,
                DoctorAvailability.doctor_id == profile.id,
            )
            .first()
        )
        if not slot:
            raise CustomHTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                code="AVAILABILITY_NOT_FOUND",
                message="Availability slot not found.",
            )

        new_day = update_data.day_of_week.upper() if update_data.day_of_week else slot.day_of_week
        if new_day not in DAY_ORDER:
            raise CustomHTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                code="INVALID_DAY_OF_WEEK",
                message=f"Invalid day of week: {new_day}.",
            )
        new_start = update_data.start_time if update_data.start_time else slot.start_time
        new_end = update_data.end_time if update_data.end_time else slot.end_time

        if new_start >= new_end:
            raise CustomHTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                code="INVALID_TIME_RANGE",
                message="start_time must be earlier than end_time.",
            )

        self._check_schedule_overlap(
            doctor_id=profile.id,
            day_of_week=new_day,
            start_time=new_start,
            end_time=new_end,
            exclude_slot_id=slot.id,
        )

        update_dict = update_data.model_dump(exclude_unset=True)
        if "day_of_week" in update_dict:
            update_dict["day_of_week"] = update_dict["day_of_week"].upper()
        for key, value in update_dict.items():
            setattr(slot, key, value)

        self.db.commit()
        self.db.refresh(slot)
        logger.info(f"Updated availability slot {slot.id} for doctor {profile.id}")
        return slot

    def delete_availability(self, user_id: UUID, slot_id: UUID) -> None:
        profile = self.get_doctor_profile_by_user_id(user_id)
        slot = (
            self.db.query(DoctorAvailability)
            .filter(
                DoctorAvailability.id == slot_id,
                DoctorAvailability.doctor_id == profile.id,
            )
            .first()
        )
        if not slot:
            raise CustomHTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                code="AVAILABILITY_NOT_FOUND",
                message="Availability slot not found.",
            )
        self.db.delete(slot)
        self.db.commit()
        logger.info(f"Deleted availability slot {slot_id} for doctor {profile.id}")

    def search_doctors(
        self,
        page: int = 1,
        page_size: int = 10,
        specialization: Optional[str] = None,
        city: Optional[str] = None,
        max_fee: Optional[float] = None,
        min_experience: Optional[int] = None,
        language: Optional[str] = None,
        search_query: Optional[str] = None,
        sort_by: str = "exp_desc",
    ) -> PaginatedDoctorResponse:
        query = (
            self.db.query(DoctorProfile)
            .join(User, DoctorProfile.user_id == User.id)
            .filter(User.is_deleted == False, DoctorProfile.is_active == True)
        )

        if search_query:
            sq = f"%{search_query}%"
            query = query.filter(
                or_(
                    DoctorProfile.first_name.ilike(sq),
                    DoctorProfile.last_name.ilike(sq),
                    DoctorProfile.specialization.ilike(sq),
                    DoctorProfile.hospital_clinic.ilike(sq),
                )
            )
        if specialization and specialization.strip() != "" and specialization.lower() != "all":
            query = query.filter(DoctorProfile.specialization.ilike(f"%{specialization}%"))
        if city and city.strip() != "" and city.lower() != "all":
            query = query.filter(DoctorProfile.city.ilike(f"%{city}%"))
        if max_fee is not None and max_fee > 0:
            query = query.filter(DoctorProfile.consultation_fee <= max_fee)
        if min_experience is not None and min_experience > 0:
            query = query.filter(DoctorProfile.experience_years >= min_experience)
        if language and language.strip() != "" and language.lower() != "all":
            query = query.filter(DoctorProfile.languages.ilike(f"%{language}%"))

        # Sorting
        if sort_by == "fee_asc":
            query = query.order_by(DoctorProfile.consultation_fee.asc())
        elif sort_by == "fee_desc":
            query = query.order_by(DoctorProfile.consultation_fee.desc())
        elif sort_by == "exp_asc":
            query = query.order_by(DoctorProfile.experience_years.asc())
        else:
            query = query.order_by(DoctorProfile.experience_years.desc(), DoctorProfile.is_verified.desc())

        total = query.count()
        total_pages = (total + page_size - 1) // page_size if total > 0 else 0
        offset = (page - 1) * page_size
        data = query.offset(offset).limit(page_size).all()

        return PaginatedDoctorResponse(
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            data=data,
        )

    def get_public_doctor_detail(self, doctor_id: UUID) -> DoctorDetailResponse:
        # Can lookup by doctor profile ID or user ID
        profile = (
            self.db.query(DoctorProfile)
            .options(joinedload(DoctorProfile.availabilities))
            .join(User, DoctorProfile.user_id == User.id)
            .filter(
                or_(DoctorProfile.id == doctor_id, DoctorProfile.user_id == doctor_id),
                User.is_deleted == False,
                DoctorProfile.is_active == True,
            )
            .first()
        )
        if not profile:
            raise CustomHTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                code="DOCTOR_NOT_FOUND",
                message="Doctor profile not found or inactive.",
            )
        profile.availabilities.sort(
            key=lambda a: (DAY_ORDER.get(a.day_of_week.upper(), 8), a.start_time)
        )
        return DoctorDetailResponse.model_validate(profile)
