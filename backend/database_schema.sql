-- Doctor Appointment System - Phase 1 Database DDL
-- PostgreSQL Schema for Users, Patient Profiles, Doctor Profiles, and Authentication

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Core Auth & RBAC)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('PATIENT', 'DOCTOR', 'ADMIN')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_deleted ON users(is_deleted);

-- 2. Patient Profiles Table
CREATE TABLE IF NOT EXISTS patient_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(50),
    date_of_birth DATE,
    gender VARCHAR(20),
    blood_group VARCHAR(10),
    address TEXT,
    emergency_contact VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patient_profiles_user_id ON patient_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_patient_profiles_name ON patient_profiles(last_name, first_name);

-- 3. Doctor Profiles Table (Updated for Phase 2 Management & Discovery)
CREATE TABLE IF NOT EXISTS doctor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    specialization VARCHAR(150) NOT NULL,
    license_number VARCHAR(100) NOT NULL UNIQUE,
    qualification VARCHAR(255) NOT NULL,
    experience_years INTEGER NOT NULL DEFAULT 0,
    consultation_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    bio TEXT,
    profile_photo VARCHAR(500),
    hospital_clinic VARCHAR(255),
    languages VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doctor_profiles_user_id ON doctor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_specialization ON doctor_profiles(specialization);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_license_number ON doctor_profiles(license_number);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_city ON doctor_profiles(city);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_is_active ON doctor_profiles(is_active);

-- 4. Doctor Availability Table (Phase 2 Scheduling)
CREATE TABLE IF NOT EXISTS doctor_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctor_profiles(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    slot_duration INTEGER NOT NULL DEFAULT 30,
    break_start VARCHAR(10),
    break_end VARCHAR(10),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doctor_availability_doctor_id ON doctor_availability(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_availability_day_of_week ON doctor_availability(day_of_week);

-- Trigger function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_patient_profiles_updated_at
    BEFORE UPDATE ON patient_profiles
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_doctor_profiles_updated_at
    BEFORE UPDATE ON doctor_profiles
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_doctor_availability_updated_at
    BEFORE UPDATE ON doctor_availability
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
