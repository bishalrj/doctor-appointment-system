import enum
import uuid
from sqlalchemy import Column, String, Text, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin

class AppointmentStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    REJECTED = "REJECTED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class Appointment(Base, TimestampMixin):
    __tablename__ = "appointments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patient_profiles.id", ondelete="CASCADE"), index=True, nullable=False)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctor_profiles.id", ondelete="CASCADE"), index=True, nullable=False)
    appointment_date = Column(Date, index=True, nullable=False)
    start_time = Column(String(10), nullable=False)  # e.g., "09:00"
    end_time = Column(String(10), nullable=False)    # e.g., "09:30"
    reason_for_visit = Column(Text, nullable=False)
    status = Column(String(20), default=AppointmentStatus.PENDING.value, index=True, nullable=False)
    notes = Column(Text, nullable=True)              # Optional doctor notes or cancellation reason

    patient = relationship("PatientProfile", back_populates="appointments")
    doctor = relationship("DoctorProfile", back_populates="appointments")
