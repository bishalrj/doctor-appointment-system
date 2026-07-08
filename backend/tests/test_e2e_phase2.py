import sys
import os
import uuid
import pytest
from fastapi.testclient import TestClient

# Add parent dir to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.database.session import SessionLocal

client = TestClient(app)

def test_e2e_verification():
    print("\n--- Starting E2E Verification for Doctor Appointment System (Phase 2) ---")

    # 1. Health check
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("✓ Health check returned 200 OK")

    # Generate unique emails for test run
    unique_id = str(uuid.uuid4())[:8]
    patient_email = f"patient_{unique_id}@test.com"
    doctor_email = f"doctor_{unique_id}@test.com"
    password = "Password123!"

    # 2. Create Patient
    patient_payload = {
        "email": patient_email,
        "password": password,
        "profile": {
            "first_name": "John",
            "last_name": "Doe",
            "phone_number": "1234567890",
            "gender": "Male",
            "blood_group": "O+"
        }
    }
    res = client.post("/api/v1/auth/register/patient", json=patient_payload)
    assert res.status_code == 201, f"Patient registration failed: {res.text}"
    patient_data = res.json()
    print(f"✓ Patient registered successfully: {patient_data['email']}")

    # 3. Create Doctor
    doctor_payload = {
        "email": doctor_email,
        "password": password,
        "profile": {
            "first_name": "Sarah",
            "last_name": "Jenkins",
            "specialization": "Cardiology",
            "license_number": f"LIC-{unique_id}",
            "qualification": "MD, FACC",
            "experience_years": 12,
            "consultation_fee": 150.00,
            "city": "Boston",
            "state": "MA",
            "country": "USA",
            "bio": "Experienced cardiologist specializing in heart failure."
        }
    }
    res = client.post("/api/v1/auth/register/doctor", json=doctor_payload)
    assert res.status_code == 201, f"Doctor registration failed: {res.text}"
    doctor_data = res.json()
    print(f"✓ Doctor registered successfully: {doctor_data['email']}")

    # 4. Login Patient
    res = client.post("/api/v1/auth/login", json={"email": patient_email, "password": password})
    assert res.status_code == 200, f"Patient login failed: {res.text}"
    patient_token = res.json()["access_token"]
    patient_headers = {"Authorization": f"Bearer {patient_token}"}
    print("✓ Patient logged in successfully")

    # 5. Login Doctor
    res = client.post("/api/v1/auth/login", json={"email": doctor_email, "password": password})
    assert res.status_code == 200, f"Doctor login failed: {res.text}"
    doctor_token = res.json()["access_token"]
    doctor_headers = {"Authorization": f"Bearer {doctor_token}"}
    print("✓ Doctor logged in successfully")

    # 6. Fetch Doctor Profile
    res = client.get("/api/v1/doctor/profile", headers=doctor_headers)
    assert res.status_code == 200, f"Fetch profile failed: {res.text}"
    profile_res = res.json()
    assert profile_res["specialization"] == "Cardiology"
    print("✓ Doctor fetched own profile successfully")

    # 7. Update Doctor Profile
    update_payload = {
        "consultation_fee": 175.50,
        "bio": "Updated bio: Senior Cardiologist with 12+ years experience.",
        "languages": "English, Spanish"
    }
    res = client.put("/api/v1/doctor/profile", headers=doctor_headers, json=update_payload)
    assert res.status_code == 200, f"Update profile failed: {res.text}"
    updated_profile = res.json()
    assert float(updated_profile["consultation_fee"]) == 175.50
    assert updated_profile["languages"] == "English, Spanish"
    print("✓ Doctor updated profile successfully")

    # 8. Create Availability
    slot_payload = {
        "day_of_week": "MONDAY",
        "start_time": "09:00",
        "end_time": "13:00",
        "slot_duration": 30,
        "is_available": True
    }
    res = client.post("/api/v1/doctor/availability", headers=doctor_headers, json=slot_payload)
    assert res.status_code == 201, f"Create availability failed: {res.text}"
    slot_1 = res.json()
    slot_1_id = slot_1["id"]
    print(f"✓ Doctor created availability slot: {slot_1['day_of_week']} {slot_1['start_time']}-{slot_1['end_time']}")

    # 9. Verify Overlapping Availability Rejection
    overlap_payload = {
        "day_of_week": "MONDAY",
        "start_time": "11:00",
        "end_time": "15:00",
        "slot_duration": 30,
        "is_available": True
    }
    res = client.post("/api/v1/doctor/availability", headers=doctor_headers, json=overlap_payload)
    assert res.status_code == 409, f"Expected 409 Conflict for overlapping slot, got {res.status_code}: {res.text}"
    print("✓ Overlapping schedule correctly rejected with HTTP 409 Conflict")

    # 10. Verify Invalid Time Range Rejection
    invalid_time_payload = {
        "day_of_week": "TUESDAY",
        "start_time": "16:00",
        "end_time": "14:00",
        "slot_duration": 30
    }
    res = client.post("/api/v1/doctor/availability", headers=doctor_headers, json=invalid_time_payload)
    assert res.status_code in [400, 422], f"Expected 400 or 422 for invalid time range, got {res.status_code}"
    print("✓ Invalid time range (start >= end) correctly rejected")

    # 11. Update Availability
    update_slot_payload = {
        "end_time": "14:00"
    }
    res = client.put(f"/api/v1/doctor/availability/{slot_1_id}", headers=doctor_headers, json=update_slot_payload)
    assert res.status_code == 200, f"Update availability failed: {res.text}"
    assert res.json()["end_time"] == "14:00"
    print("✓ Doctor updated availability slot successfully")

    # 12. Search & Filter Doctors (Public/Patient)
    res = client.get("/api/v1/doctors/?specialization=Cardiology&city=Boston", headers=patient_headers)
    assert res.status_code == 200, f"Search doctors failed: {res.text}"
    search_res = res.json()
    assert search_res["total"] >= 1
    assert any(doc["specialization"] == "Cardiology" for doc in search_res["data"])
    print("✓ Search & filter doctors returned correct results")

    # 13. Verify Role Restrictions (Patient trying to edit doctor profile)
    res = client.put("/api/v1/doctor/profile", headers=patient_headers, json={"bio": "Hacked"})
    assert res.status_code == 403, f"Expected 403 Forbidden for patient editing doctor profile, got {res.status_code}"
    print("✓ Patient blocked from editing doctor profile (HTTP 403 Forbidden)")

    # 14. Verify Unauthorized Requests (No token)
    res = client.put("/api/v1/doctor/profile", json={"bio": "No auth"})
    assert res.status_code == 401, f"Expected 401 Unauthorized, got {res.status_code}"
    print("✓ Unauthorized request blocked (HTTP 401 Unauthorized)")

    # 15. Delete Availability
    res = client.delete(f"/api/v1/doctor/availability/{slot_1_id}", headers=doctor_headers)
    assert res.status_code == 204, f"Delete availability failed: {res.status_code}"
    print("✓ Doctor deleted availability slot successfully")

    print("\n🎉 ALL 15 END-TO-END VERIFICATION CHECKS PASSED WITH 100% SUCCESS!")

if __name__ == "__main__":
    test_e2e_verification()
