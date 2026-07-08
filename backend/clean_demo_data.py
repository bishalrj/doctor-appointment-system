import sys
import os
import uuid
from decimal import Decimal

# Add current directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.session import SessionLocal
from app.models.user import User, UserRole, DoctorProfile, DoctorAvailability, PatientProfile
from app.auth.security import get_password_hash

def clean_and_refactor_demo_data():
    db = SessionLocal()
    try:
        print("Starting refactoring of Doctor Appointment System demo data...")

        # -------------------------------------------------------------
        # 1. ADMIN CLEANUP & SETUP
        # -------------------------------------------------------------
        print("\n--- Processing Admin Accounts ---")
        # Remove all test/demo admin accounts (such as admin_p4_...@test.com) except admin@medicare.com
        admin_users = db.query(User).filter(User.role == UserRole.ADMIN).all()
        for au in admin_users:
            if au.email != "admin@medicare.com":
                print(f"Removing demo/test admin: {au.email}")
                db.delete(au)
        
        # Ensure exactly one permanent administrator: admin@medicare.com / Admin@123
        perm_admin = db.query(User).filter(User.email == "admin@medicare.com").first()
        if not perm_admin:
            print("Creating permanent administrator: admin@medicare.com")
            perm_admin = User(
                id=uuid.uuid4(),
                email="admin@medicare.com",
                hashed_password=get_password_hash("Admin@123"),
                role=UserRole.ADMIN,
                is_active=True,
                is_deleted=False
            )
            db.add(perm_admin)
        else:
            print("Permanent administrator admin@medicare.com already exists. Updating password & status...")
            perm_admin.hashed_password = get_password_hash("Admin@123")
            perm_admin.is_active = True
            perm_admin.is_deleted = False

        # -------------------------------------------------------------
        # 2. DOCTOR CLEANUP & SETUP
        # -------------------------------------------------------------
        print("\n--- Processing Doctor Accounts ---")
        kept_doctor_emails = [
            "dr.aravind.sharma@medicare.com",
            "dr.vikram.aditya@medicare.com",
            "dr.ananya.deka@medicare.com",
            "dr.alok.kumar@medicare.com",
            "dr.arvind.srinivasan@medicare.com",
            "dr.shalini.verma@medicare.com"
        ]

        # Remove remaining demo/test doctors (either @medicare.com not in kept list or @test.com test accounts)
        # Do NOT delete doctors created manually by users (non-demo domains like @gmail.com)
        all_doctors = db.query(User).filter(User.role == UserRole.DOCTOR).all()
        for doc_user in all_doctors:
            if doc_user.email.endswith("@test.com") or (doc_user.email.endswith("@medicare.com") and doc_user.email not in kept_doctor_emails):
                print(f"Removing seeded/test doctor: {doc_user.email}")
                db.delete(doc_user)

        db.flush()

        # Unique availability definitions for each of the 6 doctors
        doctors_unique_availabilities = {
            "dr.aravind.sharma@medicare.com": [
                {"day_of_week": "MONDAY", "start_time": "09:00", "end_time": "13:00", "break_start": "11:00", "break_end": "11:15"},
                {"day_of_week": "WEDNESDAY", "start_time": "09:00", "end_time": "13:00", "break_start": "11:00", "break_end": "11:15"}
            ],
            "dr.vikram.aditya@medicare.com": [
                {"day_of_week": "TUESDAY", "start_time": "10:00", "end_time": "18:00", "break_start": "13:00", "break_end": "14:00"},
                {"day_of_week": "THURSDAY", "start_time": "10:00", "end_time": "18:00", "break_start": "13:00", "break_end": "14:00"}
            ],
            "dr.ananya.deka@medicare.com": [
                {"day_of_week": "MONDAY", "start_time": "08:30", "end_time": "14:30", "break_start": "12:00", "break_end": "12:30"},
                {"day_of_week": "FRIDAY", "start_time": "08:30", "end_time": "14:30", "break_start": "12:00", "break_end": "12:30"}
            ],
            "dr.alok.kumar@medicare.com": [
                {"day_of_week": "WEDNESDAY", "start_time": "11:00", "end_time": "17:00", "break_start": "13:30", "break_end": "14:30"},
                {"day_of_week": "SATURDAY", "start_time": "11:00", "end_time": "17:00", "break_start": "13:30", "break_end": "14:30"}
            ],
            "dr.arvind.srinivasan@medicare.com": [
                {"day_of_week": "TUESDAY", "start_time": "14:00", "end_time": "20:00", "break_start": "17:00", "break_end": "17:30"},
                {"day_of_week": "FRIDAY", "start_time": "14:00", "end_time": "20:00", "break_start": "17:00", "break_end": "17:30"}
            ],
            "dr.shalini.verma@medicare.com": [
                {"day_of_week": "THURSDAY", "start_time": "09:00", "end_time": "15:00", "break_start": "12:00", "break_end": "13:00"},
                {"day_of_week": "SATURDAY", "start_time": "09:00", "end_time": "15:00", "break_start": "12:00", "break_end": "13:00"}
            ]
        }

        # Update availability slots for the 6 kept doctors
        for email, slots in doctors_unique_availabilities.items():
            doc_user = db.query(User).filter(User.email == email).first()
            if doc_user and doc_user.doctor_profile:
                # Delete existing availability records for this doctor to ensure clean unique schedules
                db.query(DoctorAvailability).filter(DoctorAvailability.doctor_id == doc_user.doctor_profile.id).delete()
                for slot in slots:
                    avail = DoctorAvailability(
                        id=uuid.uuid4(),
                        doctor_id=doc_user.doctor_profile.id,
                        day_of_week=slot["day_of_week"],
                        start_time=slot["start_time"],
                        end_time=slot["end_time"],
                        slot_duration=30,
                        break_start=slot["break_start"],
                        break_end=slot["break_end"],
                        is_available=True
                    )
                    db.add(avail)
                print(f"Updated unique availability for {email}")

        # -------------------------------------------------------------
        # 3. PATIENT CLEANUP & SETUP
        # -------------------------------------------------------------
        print("\n--- Processing Patient Accounts ---")
        # Remove all autogenerated test accounts (@test.com)
        all_patients = db.query(User).filter(User.role == UserRole.PATIENT).all()
        for pat_user in all_patients:
            if pat_user.email.endswith("@test.com"):
                print(f"Removing autogenerated test patient: {pat_user.email}")
                db.delete(pat_user)

        db.flush()

        # Define 8 realistic Indian demo patients
        demo_patients_data = [
            {"email": "aarav.patel@medicare.com", "first_name": "Aarav", "last_name": "Patel", "phone": "9876543210", "gender": "Male", "blood_group": "O+"},
            {"email": "diya.mehta@medicare.com", "first_name": "Diya", "last_name": "Mehta", "phone": "9876543211", "gender": "Female", "blood_group": "B+"},
            {"email": "rohit.verma@medicare.com", "first_name": "Rohit", "last_name": "Verma", "phone": "9876543212", "gender": "Male", "blood_group": "A+"},
            {"email": "neha.singh@medicare.com", "first_name": "Neha", "last_name": "Singh", "phone": "9876543213", "gender": "Female", "blood_group": "AB+"},
            {"email": "karan.joshi@medicare.com", "first_name": "Karan", "last_name": "Joshi", "phone": "9876543214", "gender": "Male", "blood_group": "O-"},
            {"email": "pooja.deshmukh@medicare.com", "first_name": "Pooja", "last_name": "Deshmukh", "phone": "9876543215", "gender": "Female", "blood_group": "B-"},
            {"email": "aditya.nair@medicare.com", "first_name": "Aditya", "last_name": "Nair", "phone": "9876543216", "gender": "Male", "blood_group": "A-"},
            {"email": "sanya.kapoor@medicare.com", "first_name": "Sanya", "last_name": "Kapoor", "phone": "9876543217", "gender": "Female", "blood_group": "AB-"}
        ]

        for pdata in demo_patients_data:
            p_user = db.query(User).filter(User.email == pdata["email"]).first()
            if not p_user:
                print(f"Creating demo patient: {pdata['email']}")
                p_user = User(
                    id=uuid.uuid4(),
                    email=pdata["email"],
                    hashed_password=get_password_hash("Patient@123"),
                    role=UserRole.PATIENT,
                    is_active=True,
                    is_deleted=False
                )
                db.add(p_user)
                db.flush()

                p_profile = PatientProfile(
                    id=uuid.uuid4(),
                    user_id=p_user.id,
                    first_name=pdata["first_name"],
                    last_name=pdata["last_name"],
                    phone_number=pdata["phone"],
                    gender=pdata["gender"],
                    blood_group=pdata["blood_group"],
                    address="Sector 14, Main Boulevard"
                )
                db.add(p_profile)
            else:
                p_user.is_active = True
                p_user.is_deleted = False

        db.commit()
        print("\n[SUCCESS] Demo data refactoring completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error during demo data cleanup: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    clean_and_refactor_demo_data()
