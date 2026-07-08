from datetime import date, datetime
from typing import Optional, List, Dict, Any
from uuid import UUID
import logging
from sqlalchemy import or_, and_, desc, asc, func
from sqlalchemy.orm import Session, joinedload
from fastapi import status

from app.models.user import User, PatientProfile, DoctorProfile, UserRole
from app.models.appointment import Appointment, AppointmentStatus
from app.schemas.user import DoctorProfileResponse, PatientProfileResponse
from app.schemas.appointment import AppointmentResponse, PaginatedAppointmentResponse
from app.schemas.admin import (
    AdminDashboardResponse,
    AdminAnalyticsResponse,
    MonthlyAppointmentCount,
    StatusAppointmentCount,
    SpecializationDoctorCount,
    AdminDoctorResponse,
    AdminPatientResponse,
    AdminPaginatedDoctorResponse,
    AdminPaginatedPatientResponse,
)
from app.core.exceptions import CustomHTTPException

logger = logging.getLogger("app.services.admin")

class AdminService:
    def __init__(self, db: Session):
        self.db = db

    def _get_doctor_profile(self, identifier: UUID) -> DoctorProfile:
        doc = (
            self.db.query(DoctorProfile)
            .options(joinedload(DoctorProfile.user))
            .filter(or_(DoctorProfile.id == identifier, DoctorProfile.user_id == identifier))
            .first()
        )
        if not doc or not doc.user:
            raise CustomHTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                code="DOCTOR_NOT_FOUND",
                message="Doctor profile not found.",
            )
        return doc

    def _get_patient_profile(self, identifier: UUID) -> PatientProfile:
        pat = (
            self.db.query(PatientProfile)
            .options(joinedload(PatientProfile.user))
            .filter(or_(PatientProfile.id == identifier, PatientProfile.user_id == identifier))
            .first()
        )
        if not pat or not pat.user:
            raise CustomHTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                code="PATIENT_NOT_FOUND",
                message="Patient profile not found.",
            )
        return pat

    def _to_admin_doctor_response(self, doc: DoctorProfile, count_map: Dict[UUID, int]) -> AdminDoctorResponse:
        data = DoctorProfileResponse.model_validate(doc).model_dump()
        data["email"] = doc.user.email
        data["is_deleted"] = doc.user.is_deleted
        data["total_appointments"] = count_map.get(doc.id, 0)
        return AdminDoctorResponse(**data)

    def _to_admin_patient_response(self, pat: PatientProfile, count_map: Dict[UUID, int]) -> AdminPatientResponse:
        data = PatientProfileResponse.model_validate(pat).model_dump()
        data["email"] = pat.user.email
        data["is_active"] = pat.user.is_active
        data["is_deleted"] = pat.user.is_deleted
        data["total_appointments"] = count_map.get(pat.id, 0)
        return AdminPatientResponse(**data)

    def get_dashboard_stats(self) -> AdminDashboardResponse:
        total_doctors = self.db.query(DoctorProfile).join(User).filter(User.is_deleted == False).count()
        verified_doctors = self.db.query(DoctorProfile).join(User).filter(User.is_deleted == False, DoctorProfile.is_verified == True).count()
        unverified_doctors = total_doctors - verified_doctors
        
        total_patients = self.db.query(PatientProfile).join(User).filter(User.is_deleted == False).count()
        
        total_appointments = self.db.query(Appointment).count()
        today_val = date.today()
        today_appointments = self.db.query(Appointment).filter(Appointment.appointment_date == today_val).count()
        
        pending_appointments = self.db.query(Appointment).filter(Appointment.status == AppointmentStatus.PENDING.value).count()
        completed_appointments = self.db.query(Appointment).filter(Appointment.status == AppointmentStatus.COMPLETED.value).count()
        cancelled_appointments = self.db.query(Appointment).filter(Appointment.status == AppointmentStatus.CANCELLED.value).count()

        recent = (
            self.db.query(Appointment)
            .options(joinedload(Appointment.patient), joinedload(Appointment.doctor))
            .order_by(desc(Appointment.created_at))
            .limit(5)
            .all()
        )

        return AdminDashboardResponse(
            total_doctors=total_doctors,
            total_patients=total_patients,
            total_appointments=total_appointments,
            today_appointments=today_appointments,
            pending_appointments=pending_appointments,
            completed_appointments=completed_appointments,
            cancelled_appointments=cancelled_appointments,
            verified_doctors=verified_doctors,
            unverified_doctors=unverified_doctors,
            recent_appointments=[AppointmentResponse.model_validate(a) for a in recent],
        )

    def get_analytics(self) -> AdminAnalyticsResponse:
        stats = self.get_dashboard_stats()

        # Group by specialization
        spec_counts = (
            self.db.query(DoctorProfile.specialization, func.count(DoctorProfile.id))
            .join(User)
            .filter(User.is_deleted == False)
            .group_by(DoctorProfile.specialization)
            .all()
        )
        doctors_by_spec = [
            SpecializationDoctorCount(specialization=spec or "General", count=cnt)
            for spec, cnt in spec_counts
        ]

        # Group by status
        status_counts = (
            self.db.query(Appointment.status, func.count(Appointment.id))
            .group_by(Appointment.status)
            .all()
        )
        appointments_by_stat = [
            StatusAppointmentCount(status=stat, count=cnt)
            for stat, cnt in status_counts
        ]
        # Ensure all statuses are present
        existing_stats = {item.status for item in appointments_by_stat}
        for s in AppointmentStatus:
            if s.value not in existing_stats:
                appointments_by_stat.append(StatusAppointmentCount(status=s.value, count=0))

        # Group by month (in Python for database independence across Postgres/SQLite)
        all_appts = self.db.query(Appointment.appointment_date).all()
        month_map: Dict[str, int] = {}
        for (appt_date,) in all_appts:
            if appt_date:
                m_str = appt_date.strftime("%Y-%m")
                month_map[m_str] = month_map.get(m_str, 0) + 1

        # Sort chronologically
        sorted_months = sorted(month_map.keys())
        appointments_by_month = [
            MonthlyAppointmentCount(month=m, count=month_map[m])
            for m in sorted_months
        ]

        return AdminAnalyticsResponse(
            total_doctors=stats.total_doctors,
            total_patients=stats.total_patients,
            total_appointments=stats.total_appointments,
            today_appointments=stats.today_appointments,
            pending_appointments=stats.pending_appointments,
            completed_appointments=stats.completed_appointments,
            cancelled_appointments=stats.cancelled_appointments,
            verified_doctors=stats.verified_doctors,
            appointments_by_month=appointments_by_month,
            appointments_by_status=appointments_by_stat,
            doctors_by_specialization=doctors_by_spec,
        )

    def search_doctors(
        self,
        page: int = 1,
        page_size: int = 10,
        specialization: Optional[str] = None,
        is_verified: Optional[bool] = None,
        is_active: Optional[bool] = None,
        city: Optional[str] = None,
        search_query: Optional[str] = None,
        sort_by: str = "created_desc",
        include_deleted: bool = False,
    ) -> AdminPaginatedDoctorResponse:
        query = self.db.query(DoctorProfile).join(User).options(joinedload(DoctorProfile.user))

        if not include_deleted:
            query = query.filter(User.is_deleted == False)

        if specialization and specialization.strip():
            query = query.filter(DoctorProfile.specialization.ilike(f"%{specialization.strip()}%"))
        if is_verified is not None:
            query = query.filter(DoctorProfile.is_verified == is_verified)
        if is_active is not None:
            query = query.filter(DoctorProfile.is_active == is_active)
        if city and city.strip():
            query = query.filter(DoctorProfile.city.ilike(f"%{city.strip()}%"))

        if search_query and search_query.strip():
            kw = f"%{search_query.strip()}%"
            query = query.filter(
                or_(
                    DoctorProfile.first_name.ilike(kw),
                    DoctorProfile.last_name.ilike(kw),
                    DoctorProfile.specialization.ilike(kw),
                    DoctorProfile.license_number.ilike(kw),
                    DoctorProfile.hospital_clinic.ilike(kw),
                    User.email.ilike(kw),
                )
            )

        if sort_by == "name_asc":
            query = query.order_by(asc(DoctorProfile.first_name), asc(DoctorProfile.last_name))
        elif sort_by == "name_desc":
            query = query.order_by(desc(DoctorProfile.first_name), desc(DoctorProfile.last_name))
        elif sort_by == "exp_desc":
            query = query.order_by(desc(DoctorProfile.experience_years))
        elif sort_by == "fee_asc":
            query = query.order_by(asc(DoctorProfile.consultation_fee))
        elif sort_by == "fee_desc":
            query = query.order_by(desc(DoctorProfile.consultation_fee))
        else:
            query = query.order_by(desc(DoctorProfile.created_at))

        total = query.count()
        total_pages = (total + page_size - 1) // page_size if total > 0 else 0
        offset = (page - 1) * page_size
        data = query.offset(offset).limit(page_size).all()

        doc_ids = [d.id for d in data]
        count_map: Dict[UUID, int] = {}
        if doc_ids:
            counts = (
                self.db.query(Appointment.doctor_id, func.count(Appointment.id))
                .filter(Appointment.doctor_id.in_(doc_ids))
                .group_by(Appointment.doctor_id)
                .all()
            )
            count_map = {doc_id: cnt for doc_id, cnt in counts}

        return AdminPaginatedDoctorResponse(
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            data=[self._to_admin_doctor_response(doc, count_map) for doc in data],
        )

    def search_patients(
        self,
        page: int = 1,
        page_size: int = 10,
        gender: Optional[str] = None,
        blood_group: Optional[str] = None,
        is_active: Optional[bool] = None,
        search_query: Optional[str] = None,
        sort_by: str = "created_desc",
        include_deleted: bool = False,
    ) -> AdminPaginatedPatientResponse:
        query = self.db.query(PatientProfile).join(User).options(joinedload(PatientProfile.user))

        if not include_deleted:
            query = query.filter(User.is_deleted == False)

        if gender and gender.strip():
            query = query.filter(PatientProfile.gender.ilike(f"%{gender.strip()}%"))
        if blood_group and blood_group.strip():
            query = query.filter(PatientProfile.blood_group.ilike(f"%{blood_group.strip()}%"))
        if is_active is not None:
            query = query.filter(User.is_active == is_active)

        if search_query and search_query.strip():
            kw = f"%{search_query.strip()}%"
            query = query.filter(
                or_(
                    PatientProfile.first_name.ilike(kw),
                    PatientProfile.last_name.ilike(kw),
                    PatientProfile.phone_number.ilike(kw),
                    User.email.ilike(kw),
                )
            )

        if sort_by == "name_asc":
            query = query.order_by(asc(PatientProfile.first_name), asc(PatientProfile.last_name))
        elif sort_by == "name_desc":
            query = query.order_by(desc(PatientProfile.first_name), desc(PatientProfile.last_name))
        else:
            query = query.order_by(desc(PatientProfile.created_at))

        total = query.count()
        total_pages = (total + page_size - 1) // page_size if total > 0 else 0
        offset = (page - 1) * page_size
        data = query.offset(offset).limit(page_size).all()

        pat_ids = [p.id for p in data]
        count_map: Dict[UUID, int] = {}
        if pat_ids:
            counts = (
                self.db.query(Appointment.patient_id, func.count(Appointment.id))
                .filter(Appointment.patient_id.in_(pat_ids))
                .group_by(Appointment.patient_id)
                .all()
            )
            count_map = {pat_id: cnt for pat_id, cnt in counts}

        return AdminPaginatedPatientResponse(
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            data=[self._to_admin_patient_response(pat, count_map) for pat in data],
        )

    def search_appointments(
        self,
        page: int = 1,
        page_size: int = 10,
        status_filter: Optional[str] = None,
        doctor_id: Optional[UUID] = None,
        patient_id: Optional[UUID] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        search_query: Optional[str] = None,
        sort_by: str = "date_desc",
    ) -> PaginatedAppointmentResponse:
        query = (
            self.db.query(Appointment)
            .options(joinedload(Appointment.patient), joinedload(Appointment.doctor))
            .join(PatientProfile, Appointment.patient_id == PatientProfile.id)
            .join(DoctorProfile, Appointment.doctor_id == DoctorProfile.id)
        )

        if status_filter and status_filter.strip() and status_filter.lower() != "all":
            query = query.filter(Appointment.status == status_filter.upper())
        if doctor_id:
            query = query.filter(or_(Appointment.doctor_id == doctor_id, DoctorProfile.user_id == doctor_id))
        if patient_id:
            query = query.filter(or_(Appointment.patient_id == patient_id, PatientProfile.user_id == patient_id))
        if date_from:
            query = query.filter(Appointment.appointment_date >= date_from)
        if date_to:
            query = query.filter(Appointment.appointment_date <= date_to)

        if search_query and search_query.strip():
            kw = f"%{search_query.strip()}%"
            query = query.filter(
                or_(
                    Appointment.reason_for_visit.ilike(kw),
                    PatientProfile.first_name.ilike(kw),
                    PatientProfile.last_name.ilike(kw),
                    DoctorProfile.first_name.ilike(kw),
                    DoctorProfile.last_name.ilike(kw),
                )
            )

        if sort_by == "date_asc":
            query = query.order_by(asc(Appointment.appointment_date), asc(Appointment.start_time))
        else:
            query = query.order_by(desc(Appointment.appointment_date), desc(Appointment.start_time))

        total = query.count()
        total_pages = (total + page_size - 1) // page_size if total > 0 else 0
        offset = (page - 1) * page_size
        data = query.offset(offset).limit(page_size).all()

        return PaginatedAppointmentResponse(
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            data=[AppointmentResponse.model_validate(a) for a in data],
        )

    def verify_doctor(self, doctor_id: UUID, is_verified: bool = True) -> AdminDoctorResponse:
        doc = self._get_doctor_profile(doctor_id)
        doc.is_verified = is_verified
        self.db.commit()
        self.db.refresh(doc)
        logger.info(f"Admin verified doctor {doc.id} (is_verified={is_verified})")
        
        count = self.db.query(Appointment).filter(Appointment.doctor_id == doc.id).count()
        return self._to_admin_doctor_response(doc, {doc.id: count})

    def activate_doctor(self, doctor_id: UUID) -> AdminDoctorResponse:
        doc = self._get_doctor_profile(doctor_id)
        doc.is_active = True
        if doc.user:
            doc.user.is_active = True
        self.db.commit()
        self.db.refresh(doc)
        logger.info(f"Admin activated doctor {doc.id}")

        count = self.db.query(Appointment).filter(Appointment.doctor_id == doc.id).count()
        return self._to_admin_doctor_response(doc, {doc.id: count})

    def deactivate_doctor(self, doctor_id: UUID) -> AdminDoctorResponse:
        doc = self._get_doctor_profile(doctor_id)
        doc.is_active = False
        if doc.user:
            doc.user.is_active = False
        self.db.commit()
        self.db.refresh(doc)
        logger.info(f"Admin deactivated doctor {doc.id}")

        count = self.db.query(Appointment).filter(Appointment.doctor_id == doc.id).count()
        return self._to_admin_doctor_response(doc, {doc.id: count})

    def activate_patient(self, patient_id: UUID) -> AdminPatientResponse:
        pat = self._get_patient_profile(patient_id)
        if pat.user:
            pat.user.is_active = True
        self.db.commit()
        self.db.refresh(pat)
        logger.info(f"Admin activated patient {pat.id}")

        count = self.db.query(Appointment).filter(Appointment.patient_id == pat.id).count()
        return self._to_admin_patient_response(pat, {pat.id: count})

    def deactivate_patient(self, patient_id: UUID) -> AdminPatientResponse:
        pat = self._get_patient_profile(patient_id)
        if pat.user:
            pat.user.is_active = False
        self.db.commit()
        self.db.refresh(pat)
        logger.info(f"Admin deactivated patient {pat.id}")

        count = self.db.query(Appointment).filter(Appointment.patient_id == pat.id).count()
        return self._to_admin_patient_response(pat, {pat.id: count})

    def delete_doctor(self, doctor_id: UUID) -> AdminDoctorResponse:
        doc = self._get_doctor_profile(doctor_id)
        doc.is_active = False
        if doc.user:
            doc.user.is_active = False
            doc.user.is_deleted = True
        self.db.commit()
        self.db.refresh(doc)
        logger.info(f"Admin soft-deleted doctor {doc.id}")

        count = self.db.query(Appointment).filter(Appointment.doctor_id == doc.id).count()
        return self._to_admin_doctor_response(doc, {doc.id: count})

    def delete_patient(self, patient_id: UUID) -> AdminPatientResponse:
        pat = self._get_patient_profile(patient_id)
        if pat.user:
            pat.user.is_active = False
            pat.user.is_deleted = True
        self.db.commit()
        self.db.refresh(pat)
        logger.info(f"Admin soft-deleted patient {pat.id}")

        count = self.db.query(Appointment).filter(Appointment.patient_id == pat.id).count()
        return self._to_admin_patient_response(pat, {pat.id: count})
