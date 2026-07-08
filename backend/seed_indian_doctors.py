import sys
import os
import uuid
from decimal import Decimal

# Add current directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.session import SessionLocal
from app.models.user import User, UserRole, DoctorProfile, DoctorAvailability
from app.auth.security import get_password_hash

def seed_indian_doctors():
    db = SessionLocal()
    try:
        print("Starting seeding of Indian Doctor Profiles...")

        # 1. Check if doctors already exist in the database (preserve user data across restarts)
        existing_doctors_count = db.query(User).filter(User.role == UserRole.DOCTOR).count()
        if existing_doctors_count > 0:
            print(f"Database already contains {existing_doctors_count} doctor account(s).")
            print("Skipping demo data seeding to preserve existing user accounts and data.")
            return

        print("No existing doctor profiles found. Proceeding with initial demo data seeding...")

        # Common password hash for all seeded doctors
        default_password_hash = get_password_hash("Doctor@1234")

        # 2. Define 6 unique realistic Indian doctors with unique specializations, cities, hospitals, fees, and experiences
        doctors_data = [
            {
                "first_name": "Aravind", "last_name": "Sharma",
                "email": "dr.aravind.sharma@medicare.com",
                "specialization": "Cardiology", "license_number": "MED-IND-2010-0001",
                "qualification": "MBBS, MD (General Medicine), DM (Cardiology)",
                "experience_years": 16, "consultation_fee": Decimal("1200.00"),
                "bio": "Senior Consultant Cardiologist specializing in interventional cardiology, coronary angioplasty, and preventive cardiovascular healthcare. He has over 16 years of clinical experience leading cardiac care units.",
                "profile_photo": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80",
                "hospital_clinic": "Manipal Hospital", "languages": "English, Hindi, Kannada",
                "address": "98 Hal Airport Road, Kodihalli", "city": "Bengaluru", "state": "Karnataka", "country": "India",
                "availabilities": [
                    {"day_of_week": "MONDAY", "start_time": "09:00", "end_time": "13:00", "break_start": "11:00", "break_end": "11:15"},
                    {"day_of_week": "WEDNESDAY", "start_time": "09:00", "end_time": "13:00", "break_start": "11:00", "break_end": "11:15"}
                ]
            },
            {
                "first_name": "Vikram", "last_name": "Aditya",
                "email": "dr.vikram.aditya@medicare.com",
                "specialization": "Orthopedics", "license_number": "MED-IND-2008-0005",
                "qualification": "MBBS, MS (Orthopedics), M.Ch (Ortho)",
                "experience_years": 18, "consultation_fee": Decimal("1500.00"),
                "bio": "Leading joint replacement surgeon and sports medicine specialist. He performs robotic knee and hip arthroplasties and arthroscopic reconstructive surgeries.",
                "profile_photo": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",
                "hospital_clinic": "Lilavati Hospital", "languages": "English, Marathi, Hindi",
                "address": "A-791, Bandra Reclamation, Bandra West", "city": "Mumbai", "state": "Maharashtra", "country": "India",
                "availabilities": [
                    {"day_of_week": "TUESDAY", "start_time": "10:00", "end_time": "18:00", "break_start": "13:00", "break_end": "14:00"},
                    {"day_of_week": "THURSDAY", "start_time": "10:00", "end_time": "18:00", "break_start": "13:00", "break_end": "14:00"}
                ]
            },
            {
                "first_name": "Ananya", "last_name": "Deka",
                "email": "dr.ananya.deka@medicare.com",
                "specialization": "Pediatrics", "license_number": "MED-IND-2016-0009",
                "qualification": "MBBS, MD (Pediatrics)",
                "experience_years": 10, "consultation_fee": Decimal("700.00"),
                "bio": "Compassionate pediatrician specializing in newborn care, childhood immunization, developmental assessments, and pediatric respiratory illnesses.",
                "profile_photo": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
                "hospital_clinic": "Apollo Clinic", "languages": "English, Assamese, Hindi, Bengali",
                "address": "GS Road, Bhangagarh", "city": "Guwahati", "state": "Assam", "country": "India",
                "availabilities": [
                    {"day_of_week": "MONDAY", "start_time": "08:30", "end_time": "14:30", "break_start": "12:00", "break_end": "12:30"},
                    {"day_of_week": "FRIDAY", "start_time": "08:30", "end_time": "14:30", "break_start": "12:00", "break_end": "12:30"}
                ]
            },
            {
                "first_name": "Alok", "last_name": "Kumar",
                "email": "dr.alok.kumar@medicare.com",
                "specialization": "Neurology", "license_number": "MED-IND-2009-0018",
                "qualification": "MBBS, MD (Medicine), DM (Neurology)",
                "experience_years": 17, "consultation_fee": Decimal("1400.00"),
                "bio": "Consultant neurologist specializing in headache disorders, migraine therapy, neuropathic pain, and multiple sclerosis management.",
                "profile_photo": None,
                "hospital_clinic": "Max Super Speciality Hospital", "languages": "English, Hindi",
                "address": "1, Press Enclave Road, Saket", "city": "Delhi", "state": "Delhi NCR", "country": "India",
                "availabilities": [
                    {"day_of_week": "WEDNESDAY", "start_time": "11:00", "end_time": "17:00", "break_start": "13:30", "break_end": "14:30"},
                    {"day_of_week": "SATURDAY", "start_time": "11:00", "end_time": "17:00", "break_start": "13:30", "break_end": "14:30"}
                ]
            },
            {
                "first_name": "Arvind", "last_name": "Srinivasan",
                "email": "dr.arvind.srinivasan@medicare.com",
                "specialization": "Ophthalmology", "license_number": "MED-IND-2004-0029",
                "qualification": "MBBS, DO, DNB (Ophthalmology), FRCSEd",
                "experience_years": 22, "consultation_fee": Decimal("1000.00"),
                "bio": "Senior vitreo-retinal surgeon with extensive experience in treating diabetic retinopathy, retinal detachment, macular degeneration, and ocular trauma.",
                "profile_photo": None,
                "hospital_clinic": "Aravind Eye Hospital", "languages": "English, Tamil",
                "address": "Poonamallee High Road, Noombal", "city": "Chennai", "state": "Tamil Nadu", "country": "India",
                "availabilities": [
                    {"day_of_week": "TUESDAY", "start_time": "14:00", "end_time": "20:00", "break_start": "17:00", "break_end": "17:30"},
                    {"day_of_week": "FRIDAY", "start_time": "14:00", "end_time": "20:00", "break_start": "17:00", "break_end": "17:30"}
                ]
            },
            {
                "first_name": "Shalini", "last_name": "Verma",
                "email": "dr.shalini.verma@medicare.com",
                "specialization": "Gynecology", "license_number": "MED-IND-2012-0015",
                "qualification": "MBBS, MS (OBG), Fellowship in IVF",
                "experience_years": 14, "consultation_fee": Decimal("900.00"),
                "bio": "Dedicated gynecologist and fertility expert. She assists couples with advanced assisted reproductive technologies (ART), ovulation induction, and maternal health.",
                "profile_photo": None,
                "hospital_clinic": "CK Birla Hospital", "languages": "English, Hindi, Marwari",
                "address": "Gopalpura Bypass Road, Near Triveni Flyover", "city": "Jaipur", "state": "Rajasthan", "country": "India",
                "availabilities": [
                    {"day_of_week": "THURSDAY", "start_time": "09:00", "end_time": "15:00", "break_start": "12:00", "break_end": "13:00"},
                    {"day_of_week": "SATURDAY", "start_time": "09:00", "end_time": "15:00", "break_start": "12:00", "break_end": "13:00"}
                ]
            }
        ]

        print(f"Seeding {len(doctors_data)} Indian doctor profiles...")
        for doc_data in doctors_data:
            # 3. Create User account
            user = User(
                id=uuid.uuid4(),
                email=doc_data["email"],
                hashed_password=default_password_hash,
                role=UserRole.DOCTOR,
                is_active=True,
                is_deleted=False
            )
            db.add(user)
            db.flush() # Get user.id

            # 4. Create DoctorProfile
            profile = DoctorProfile(
                id=uuid.uuid4(),
                user_id=user.id,
                first_name=doc_data["first_name"],
                last_name=doc_data["last_name"],
                specialization=doc_data["specialization"],
                license_number=doc_data["license_number"],
                qualification=doc_data["qualification"],
                experience_years=doc_data["experience_years"],
                consultation_fee=doc_data["consultation_fee"],
                bio=doc_data["bio"],
                profile_photo=doc_data["profile_photo"],
                hospital_clinic=doc_data["hospital_clinic"],
                languages=doc_data["languages"],
                address=doc_data["address"],
                city=doc_data["city"],
                state=doc_data["state"],
                country=doc_data["country"],
                is_verified=True,
                is_active=True
            )
            db.add(profile)
            db.flush() # Get profile.id

            # 5. Create DoctorAvailability slots
            for slot in doc_data["availabilities"]:
                avail = DoctorAvailability(
                    id=uuid.uuid4(),
                    doctor_id=profile.id,
                    day_of_week=slot["day_of_week"],
                    start_time=slot["start_time"],
                    end_time=slot["end_time"],
                    slot_duration=30,
                    break_start=slot["break_start"],
                    break_end=slot["break_end"],
                    is_available=True
                )
                db.add(avail)

        db.commit()
        print("Successfully seeded 6 Indian Doctor profiles with unique availability schedules!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding Indian doctors: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_indian_doctors()
