from datetime import date, datetime
from typing import Optional, List, Tuple
from uuid import UUID
import logging
from sqlalchemy import or_, and_, desc, asc
from sqlalchemy.orm import Session, joinedload
from fastapi import status

from app.models.user import User, PatientProfile, DoctorProfile, DoctorAvailability, UserRole
from app.models.appointment import Appointment, AppointmentStatus
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentReschedule,
    AppointmentStatusUpdate,
    AppointmentResponse,
    PaginatedAppointmentResponse,
    AvailableSlotsResponse,
    TimeSlotResponse,
    AppointmentStatusEnum,
)
from app.core.exceptions import CustomHTTPException

logger = logging.getLogger("app.services.appointment")

class AppointmentService:
    def __init__(self, db: Session):
        self.db = db

    def _get_patient_by_user_id(self, user_id: UUID) -> PatientProfile:
        patient = self.db.query(PatientProfile).filter(PatientProfile.user_id == user_id).first()
        if not patient:
            raise CustomHTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                code="PATIENT_PROFILE_NOT_FOUND",
                message="Patient profile not found for this user.",
            )
        return patient

    def _get_doctor_by_user_id(self, user_id: UUID) -> DoctorProfile:
        doctor = self.db.query(DoctorProfile).filter(DoctorProfile.user_id == user_id).first()
        if not doctor:
            raise CustomHTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                code="DOCTOR_PROFILE_NOT_FOUND",
                message="Doctor profile not found for this user.",
            )
        return doctor

    def _generate_intervals(
        self, start_str: str, end_str: str, duration: int, break_start: Optional[str], break_end: Optional[str]
    ) -> List[Tuple[str, str]]:
        slots = []
        def to_min(t_str: str) -> int:
            h, m = map(int, t_str.split(':'))
            return h * 60 + m
        
        def to_str(m_int: int) -> str:
            return f"{m_int // 60:02d}:{m_int % 60:02d}"

        curr = to_min(start_str)
        end_min = to_min(end_str)
        b_start = to_min(break_start) if break_start else None
        b_end = to_min(break_end) if break_end else None

        while curr + duration <= end_min:
            next_time = curr + duration
            if b_start is not None and b_end is not None:
                if max(curr, b_start) < min(next_time, b_end):
                    curr = b_end if b_end > curr else next_time
                    continue
            slots.append((to_str(curr), to_str(next_time)))
            curr = next_time
        return slots

    def get_available_slots(self, doctor_id: UUID, target_date: date) -> AvailableSlotsResponse:
        doctor = self.db.query(DoctorProfile).filter(DoctorProfile.id == doctor_id, DoctorProfile.is_active == True).first()
        if not doctor:
            raise CustomHTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                code="DOCTOR_NOT_FOUND",
                message="Doctor not found or inactive.",
            )

        day_str = target_date.strftime("%A").upper()
        availabilities = (
            self.db.query(DoctorAvailability)
            .filter(
                DoctorAvailability.doctor_id == doctor_id,
                DoctorAvailability.day_of_week == day_str,
                DoctorAvailability.is_available == True,
            )
            .all()
        )

        existing_appts = (
            self.db.query(Appointment)
            .filter(
                Appointment.doctor_id == doctor_id,
                Appointment.appointment_date == target_date,
                Appointment.status.notin_([AppointmentStatus.CANCELLED.value, AppointmentStatus.REJECTED.value]),
            )
            .all()
        )

        today_val = date.today()
        now_time_str = datetime.now().strftime("%H:%M")
        is_past_day = target_date < today_val
        is_today = target_date == today_val

        all_slots: List[TimeSlotResponse] = []
        for avail in availabilities:
            intervals = self._generate_intervals(
                avail.start_time, avail.end_time, avail.slot_duration, avail.break_start, avail.break_end
            )
            for start_t, end_t in intervals:
                # Check past
                if is_past_day or (is_today and start_t <= now_time_str):
                    all_slots.append(TimeSlotResponse(start_time=start_t, end_time=end_t, is_available=False))
                    continue
                
                # Check overlap with booked appts
                is_booked = False
                for appt in existing_appts:
                    if max(start_t, appt.start_time) < min(end_t, appt.end_time):
                        is_booked = True
                        break
                
                all_slots.append(TimeSlotResponse(start_time=start_t, end_time=end_t, is_available=not is_booked))

        # Sort slots by start_time
        all_slots.sort(key=lambda x: x.start_time)
        return AvailableSlotsResponse(
            date=target_date.isoformat(),
            doctor_id=doctor_id,
            day_of_week=day_str,
            slots=all_slots,
        )

    def book_appointment(self, user_id: UUID, req: AppointmentCreate) -> AppointmentResponse:
        patient = self._get_patient_by_user_id(user_id)
        doctor = self.db.query(DoctorProfile).filter(DoctorProfile.id == req.doctor_id, DoctorProfile.is_active == True).first()
        if not doctor:
            raise CustomHTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                code="DOCTOR_NOT_FOUND",
                message="Doctor not found or inactive.",
            )

        today_val = date.today()
        now_time_str = datetime.now().strftime("%H:%M")
        if req.appointment_date < today_val or (req.appointment_date == today_val and req.start_time <= now_time_str):
            raise CustomHTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                code="PAST_DATE_BOOKING",
                message="Cannot book an appointment in the past.",
            )

        # Check patient double booking
        patient_overlap = (
            self.db.query(Appointment)
            .filter(
                Appointment.patient_id == patient.id,
                Appointment.appointment_date == req.appointment_date,
                Appointment.status.notin_([AppointmentStatus.CANCELLED.value, AppointmentStatus.REJECTED.value]),
            )
            .all()
        )
        for appt in patient_overlap:
            if max(req.start_time, appt.start_time) < min(req.end_time, appt.end_time):
                raise CustomHTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    code="PATIENT_DOUBLE_BOOKING",
                    message=f"You already have an appointment ({appt.start_time}-{appt.end_time}) on {req.appointment_date}.",
                )

        # Check doctor availability
        avail_resp = self.get_available_slots(req.doctor_id, req.appointment_date)
        matching_slot = None
        for s in avail_resp.slots:
            if s.start_time == req.start_time and s.end_time == req.end_time:
                matching_slot = s
                break

        if not matching_slot or not matching_slot.is_available:
            raise CustomHTTPException(
                status_code=status.HTTP_409_CONFLICT,
                code="SLOT_UNAVAILABLE",
                message="The selected time slot is either already booked or outside doctor working hours.",
            )

        appt = Appointment(
            patient_id=patient.id,
            doctor_id=doctor.id,
            appointment_date=req.appointment_date,
            start_time=req.start_time,
            end_time=req.end_time,
            reason_for_visit=req.reason_for_visit,
            status=AppointmentStatus.PENDING.value,
        )
        self.db.add(appt)
        self.db.commit()
        self.db.refresh(appt)
        
        # Load relationships for response
        appt = self.db.query(Appointment).options(joinedload(Appointment.patient), joinedload(Appointment.doctor)).filter(Appointment.id == appt.id).first()
        logger.info(f"Patient {patient.id} booked appointment {appt.id} with Doctor {doctor.id}")
        return AppointmentResponse.model_validate(appt)

    def get_patient_appointments(
        self, user_id: UUID, page: int = 1, page_size: int = 10, status_filter: Optional[str] = None, filter_type: Optional[str] = None
    ) -> PaginatedAppointmentResponse:
        patient = self._get_patient_by_user_id(user_id)
        query = (
            self.db.query(Appointment)
            .options(joinedload(Appointment.patient), joinedload(Appointment.doctor))
            .filter(Appointment.patient_id == patient.id)
        )

        if status_filter and status_filter.strip() != "" and status_filter.lower() != "all":
            query = query.filter(Appointment.status == status_filter.upper())

        today_val = date.today()
        if filter_type == "upcoming":
            query = query.filter(
                or_(
                    Appointment.appointment_date > today_val,
                    and_(Appointment.appointment_date == today_val, Appointment.status.notin_([AppointmentStatus.COMPLETED.value, AppointmentStatus.CANCELLED.value, AppointmentStatus.REJECTED.value])),
                )
            ).order_by(asc(Appointment.appointment_date), asc(Appointment.start_time))
        elif filter_type == "history":
            query = query.filter(
                or_(
                    Appointment.appointment_date < today_val,
                    Appointment.status.in_([AppointmentStatus.COMPLETED.value, AppointmentStatus.CANCELLED.value, AppointmentStatus.REJECTED.value]),
                )
            ).order_by(desc(Appointment.appointment_date), desc(Appointment.start_time))
        else:
            query = query.order_by(desc(Appointment.appointment_date), desc(Appointment.start_time))

        total = query.count()
        total_pages = (total + page_size - 1) // page_size if total > 0 else 0
        offset = (page - 1) * page_size
        data = query.offset(offset).limit(page_size).all()

        return PaginatedAppointmentResponse(
            total=total, page=page, page_size=page_size, total_pages=total_pages,
            data=[AppointmentResponse.model_validate(a) for a in data],
        )

    def get_doctor_appointments(
        self, user_id: UUID, page: int = 1, page_size: int = 10, status_filter: Optional[str] = None, target_date: Optional[date] = None
    ) -> PaginatedAppointmentResponse:
        doctor = self._get_doctor_by_user_id(user_id)
        query = (
            self.db.query(Appointment)
            .options(joinedload(Appointment.patient), joinedload(Appointment.doctor))
            .filter(Appointment.doctor_id == doctor.id)
        )

        if status_filter and status_filter.strip() != "" and status_filter.lower() != "all":
            query = query.filter(Appointment.status == status_filter.upper())
        if target_date:
            query = query.filter(Appointment.appointment_date == target_date)

        query = query.order_by(desc(Appointment.appointment_date), asc(Appointment.start_time))

        total = query.count()
        total_pages = (total + page_size - 1) // page_size if total > 0 else 0
        offset = (page - 1) * page_size
        data = query.offset(offset).limit(page_size).all()

        return PaginatedAppointmentResponse(
            total=total, page=page, page_size=page_size, total_pages=total_pages,
            data=[AppointmentResponse.model_validate(a) for a in data],
        )

    def get_appointment_detail(self, user_id: UUID, user_role: str, appointment_id: UUID) -> AppointmentResponse:
        appt = (
            self.db.query(Appointment)
            .options(joinedload(Appointment.patient), joinedload(Appointment.doctor))
            .filter(Appointment.id == appointment_id)
            .first()
        )
        if not appt:
            raise CustomHTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                code="APPOINTMENT_NOT_FOUND",
                message="Appointment not found.",
            )

        if user_role != UserRole.ADMIN.value:
            if user_role == UserRole.PATIENT.value and appt.patient.user_id != user_id:
                raise CustomHTTPException(status_code=status.HTTP_403_FORBIDDEN, code="FORBIDDEN", message="Not authorized to view this appointment.")
            if user_role == UserRole.DOCTOR.value and appt.doctor.user_id != user_id:
                raise CustomHTTPException(status_code=status.HTTP_403_FORBIDDEN, code="FORBIDDEN", message="Not authorized to view this appointment.")

        return AppointmentResponse.model_validate(appt)

    def cancel_appointment(self, user_id: UUID, user_role: str, appointment_id: UUID, notes: Optional[str] = None) -> AppointmentResponse:
        appt = (
            self.db.query(Appointment)
            .options(joinedload(Appointment.patient), joinedload(Appointment.doctor))
            .filter(Appointment.id == appointment_id)
            .first()
        )
        if not appt:
            raise CustomHTTPException(status_code=status.HTTP_404_NOT_FOUND, code="APPOINTMENT_NOT_FOUND", message="Appointment not found.")

        if user_role != UserRole.ADMIN.value:
            if user_role == UserRole.PATIENT.value and appt.patient.user_id != user_id:
                raise CustomHTTPException(status_code=status.HTTP_403_FORBIDDEN, code="FORBIDDEN", message="Not authorized to cancel this appointment.")
            if user_role == UserRole.DOCTOR.value and appt.doctor.user_id != user_id:
                raise CustomHTTPException(status_code=status.HTTP_403_FORBIDDEN, code="FORBIDDEN", message="Not authorized to cancel this appointment.")

        if appt.status in [AppointmentStatus.CANCELLED.value, AppointmentStatus.REJECTED.value, AppointmentStatus.COMPLETED.value]:
            raise CustomHTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                code="INVALID_STATUS_TRANSITION",
                message=f"Cannot cancel an appointment that is already {appt.status}.",
            )

        appt.status = AppointmentStatus.CANCELLED.value
        if notes:
            appt.notes = notes
        self.db.commit()
        self.db.refresh(appt)
        logger.info(f"Appointment {appt.id} cancelled by user {user_id}")
        return AppointmentResponse.model_validate(appt)

    def reschedule_appointment(self, user_id: UUID, user_role: str, appointment_id: UUID, req: AppointmentReschedule) -> AppointmentResponse:
        appt = (
            self.db.query(Appointment)
            .options(joinedload(Appointment.patient), joinedload(Appointment.doctor))
            .filter(Appointment.id == appointment_id)
            .first()
        )
        if not appt:
            raise CustomHTTPException(status_code=status.HTTP_404_NOT_FOUND, code="APPOINTMENT_NOT_FOUND", message="Appointment not found.")

        if user_role != UserRole.ADMIN.value:
            if user_role != UserRole.PATIENT.value or appt.patient.user_id != user_id:
                raise CustomHTTPException(status_code=status.HTTP_403_FORBIDDEN, code="FORBIDDEN", message="Only the patient can reschedule this appointment.")

        if appt.status in [AppointmentStatus.CANCELLED.value, AppointmentStatus.REJECTED.value, AppointmentStatus.COMPLETED.value]:
            raise CustomHTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                code="INVALID_STATUS_TRANSITION",
                message=f"Cannot reschedule an appointment that is {appt.status}.",
            )

        today_val = date.today()
        now_time_str = datetime.now().strftime("%H:%M")
        if req.appointment_date < today_val or (req.appointment_date == today_val and req.start_time <= now_time_str):
            raise CustomHTTPException(status_code=status.HTTP_400_BAD_REQUEST, code="PAST_DATE_BOOKING", message="Cannot reschedule to a past date/time.")

        # Check patient double booking excluding current appt
        patient_overlap = (
            self.db.query(Appointment)
            .filter(
                Appointment.patient_id == appt.patient_id,
                Appointment.appointment_date == req.appointment_date,
                Appointment.id != appt.id,
                Appointment.status.notin_([AppointmentStatus.CANCELLED.value, AppointmentStatus.REJECTED.value]),
            )
            .all()
        )
        for p_appt in patient_overlap:
            if max(req.start_time, p_appt.start_time) < min(req.end_time, p_appt.end_time):
                raise CustomHTTPException(status_code=status.HTTP_409_CONFLICT, code="PATIENT_DOUBLE_BOOKING", message="You already have an appointment at this time.")

        # Check doctor availability excluding current appt
        avail_resp = self.get_available_slots(appt.doctor_id, req.appointment_date)
        # Note: if the original appt was on the same date/time, get_available_slots might show it as unavailable if we don't exclude it, but let's check:
        # Let's check overlap directly against doctor's other appointments
        doc_overlap = (
            self.db.query(Appointment)
            .filter(
                Appointment.doctor_id == appt.doctor_id,
                Appointment.appointment_date == req.appointment_date,
                Appointment.id != appt.id,
                Appointment.status.notin_([AppointmentStatus.CANCELLED.value, AppointmentStatus.REJECTED.value]),
            )
            .all()
        )
        for d_appt in doc_overlap:
            if max(req.start_time, d_appt.start_time) < min(req.end_time, d_appt.end_time):
                raise CustomHTTPException(status_code=status.HTTP_409_CONFLICT, code="SLOT_UNAVAILABLE", message="The requested time slot is already booked.")

        appt.appointment_date = req.appointment_date
        appt.start_time = req.start_time
        appt.end_time = req.end_time
        if req.reason_for_visit:
            appt.reason_for_visit = req.reason_for_visit
        appt.status = AppointmentStatus.PENDING.value  # Requires doctor confirmation again

        self.db.commit()
        self.db.refresh(appt)
        logger.info(f"Appointment {appt.id} rescheduled by patient {user_id}")
        return AppointmentResponse.model_validate(appt)

    def update_appointment_status(self, user_id: UUID, user_role: str, appointment_id: UUID, req: AppointmentStatusUpdate) -> AppointmentResponse:
        appt = (
            self.db.query(Appointment)
            .options(joinedload(Appointment.patient), joinedload(Appointment.doctor))
            .filter(Appointment.id == appointment_id)
            .first()
        )
        if not appt:
            raise CustomHTTPException(status_code=status.HTTP_404_NOT_FOUND, code="APPOINTMENT_NOT_FOUND", message="Appointment not found.")

        if user_role != UserRole.ADMIN.value:
            if user_role != UserRole.DOCTOR.value or appt.doctor.user_id != user_id:
                raise CustomHTTPException(status_code=status.HTTP_403_FORBIDDEN, code="FORBIDDEN", message="Not authorized to manage this appointment.")

        current = appt.status
        new_stat = req.status.value

        if current in [AppointmentStatus.CANCELLED.value, AppointmentStatus.REJECTED.value, AppointmentStatus.COMPLETED.value]:
            raise CustomHTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                code="INVALID_STATUS_TRANSITION",
                message=f"Cannot change status of an appointment that is already {current}.",
            )

        if current == AppointmentStatus.PENDING.value and new_stat not in [AppointmentStatus.CONFIRMED.value, AppointmentStatus.REJECTED.value, AppointmentStatus.CANCELLED.value]:
            raise CustomHTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                code="INVALID_STATUS_TRANSITION",
                message=f"From PENDING, you can only transition to CONFIRMED, REJECTED, or CANCELLED.",
            )

        if current == AppointmentStatus.CONFIRMED.value and new_stat not in [AppointmentStatus.COMPLETED.value, AppointmentStatus.CANCELLED.value]:
            raise CustomHTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                code="INVALID_STATUS_TRANSITION",
                message=f"From CONFIRMED, you can only transition to COMPLETED or CANCELLED.",
            )

        appt.status = new_stat
        if req.notes:
            appt.notes = req.notes
        self.db.commit()
        self.db.refresh(appt)
        logger.info(f"Appointment {appt.id} status changed from {current} to {new_stat} by doctor {user_id}")
        return AppointmentResponse.model_validate(appt)
