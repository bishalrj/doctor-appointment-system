import enum
import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey, Integer, Numeric, Date, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin

class UserRole(str, enum.Enum):
    PATIENT = "PATIENT"
    DOCTOR = "DOCTOR"
    ADMIN = "ADMIN"

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False, index=True)

    patient_profile = relationship("PatientProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    doctor_profile = relationship("DoctorProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")

class PatientProfile(Base, TimestampMixin):
    __tablename__ = "patient_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone_number = Column(String(50), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(20), nullable=True)
    blood_group = Column(String(10), nullable=True)
    address = Column(Text, nullable=True)
    emergency_contact = Column(String(100), nullable=True)

    user = relationship("User", back_populates="patient_profile")
    appointments = relationship("Appointment", back_populates="patient", cascade="all, delete-orphan")

class DoctorProfile(Base, TimestampMixin):
    __tablename__ = "doctor_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    specialization = Column(String(150), nullable=False, index=True)
    license_number = Column(String(100), unique=True, index=True, nullable=False)
    qualification = Column(String(255), nullable=False)
    experience_years = Column(Integer, default=0, nullable=False)
    consultation_fee = Column(Numeric(10, 2), default=0.00, nullable=False)
    bio = Column(Text, nullable=True)
    profile_photo = Column(String(500), nullable=True)
    hospital_clinic = Column(String(255), nullable=True)
    languages = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True, index=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    is_verified = Column(Boolean, default=False, nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)

    user = relationship("User", back_populates="doctor_profile")
    availabilities = relationship("DoctorAvailability", back_populates="doctor", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="doctor", cascade="all, delete-orphan")

class DoctorAvailability(Base, TimestampMixin):
    __tablename__ = "doctor_availability"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctor_profiles.id", ondelete="CASCADE"), index=True, nullable=False)
    day_of_week = Column(String(20), nullable=False, index=True)
    start_time = Column(String(10), nullable=False)
    end_time = Column(String(10), nullable=False)
    slot_duration = Column(Integer, default=30, nullable=False)
    break_start = Column(String(10), nullable=True)
    break_end = Column(String(10), nullable=True)
    is_available = Column(Boolean, default=True, nullable=False)

    doctor = relationship("DoctorProfile", back_populates="availabilities")
