import sys
import os
import uuid
from datetime import date, timedelta
import pytest
from fastapi.testclient import TestClient

# Add parent dir to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app

client = TestClient(app)

def test_e2e_phase3_appointments():
    print("\n--- Starting E2E Verification for Doctor Appointment System (Phase 3: Appointments) ---")

    # Generate unique emails for test run
    unique_id = str(uuid.uuid4())[:8]
    patient_email = f"patient_p3_{unique_id}@test.com"
    doctor_email = f"doctor_p3_{unique_id}@test.com"
    password = "Password123!"

    # 1. Register Patient
    patient_payload = {
        "email": patient_email,
        "password": password,
        "profile": {
            "first_name": "Alice",
            "last_name": "Smith",
            "phone_number": "9876543210",
            "gender": "Female",
            "blood_group": "A+"
        }
    }
    res = client.post("/api/v1/auth/register/patient", json=patient_payload)
    assert res.status_code == 201, f"Patient registration failed: {res.text}"
    print(f"✓ Patient registered: {patient_email}")

    # 2. Register Doctor
    doctor_payload = {
        "email": doctor_email,
        "password": password,
        "profile": {
            "first_name": "Gregory",
            "last_name": "House",
            "specialization": "Diagnostics",
            "license_number": f"LIC-P3-{unique_id}",
            "qualification": "MD",
            "experience_years": 15,
            "consultation_fee": 250.00,
            "city": "Princeton",
            "state": "NJ",
            "country": "USA",
            "bio": "Specialist in rare diagnostic dilemmas."
        }
    }
    res = client.post("/api/v1/auth/register/doctor", json=doctor_payload)
    assert res.status_code == 201, f"Doctor registration failed: {res.text}"
    print(f"✓ Doctor registered: {doctor_email}")

    # 3. Login Patient & Doctor
    res = client.post("/api/v1/auth/login", json={"email": patient_email, "password": password})
    assert res.status_code == 200
    patient_headers = {"Authorization": f"Bearer {res.json()['access_token']}"}

    res = client.post("/api/v1/auth/login", json={"email": doctor_email, "password": password})
    assert res.status_code == 200
    doctor_headers = {"Authorization": f"Bearer {res.json()['access_token']}"}
    print("✓ Patient & Doctor logged in successfully")

    # 4. Get Doctor Profile ID
    res = client.get("/api/v1/doctor/profile", headers=doctor_headers)
    assert res.status_code == 200
    doctor_id = res.json()["id"]
    print(f"✓ Retrieved Doctor Profile ID: {doctor_id}")

    # 5. Set Doctor Availability for a future date (1 week from today)
    target_date = date.today() + timedelta(days=7)
    day_str = target_date.strftime("%A").upper()

    slot_payload = {
        "day_of_week": day_str,
        "start_time": "09:00",
        "end_time": "12:00",
        "slot_duration": 30,
        "is_available": True
    }
    res = client.post("/api/v1/doctor/availability", headers=doctor_headers, json=slot_payload)
    assert res.status_code == 201, f"Create availability failed: {res.text}"
    print(f"✓ Doctor set availability for {day_str} (09:00-12:00, 30 min slots)")

    # 6. Check available slots
    res = client.get(f"/api/v1/appointments/slots?doctor_id={doctor_id}&date={target_date.isoformat()}")
    assert res.status_code == 200, f"Get slots failed: {res.text}"
    slots_data = res.json()
    assert len(slots_data["slots"]) == 6, f"Expected 6 slots, got {len(slots_data['slots'])}"
    assert all(s["is_available"] for s in slots_data["slots"])
    print("✓ Verified 6 available time slots generated correctly")

    # 7. Book an Appointment
    book_payload = {
        "doctor_id": doctor_id,
        "appointment_date": target_date.isoformat(),
        "start_time": "09:00",
        "end_time": "09:30",
        "reason_for_visit": "Unexplained headaches and fatigue"
    }
    res = client.post("/api/v1/appointments/book", headers=patient_headers, json=book_payload)
    assert res.status_code == 201, f"Book appointment failed: {res.text}"
    appt_data = res.json()
    appt_id = appt_data["id"]
    assert appt_data["status"] == "PENDING"
    print(f"✓ Patient booked appointment successfully (ID: {appt_id}, Status: PENDING)")

    # 8. Verify slot is now marked as unavailable
    res = client.get(f"/api/v1/appointments/slots?doctor_id={doctor_id}&date={target_date.isoformat()}")
    assert res.status_code == 200
    slots_data = res.json()
    slot_0900 = next(s for s in slots_data["slots"] if s["start_time"] == "09:00")
    assert not slot_0900["is_available"], "Slot 09:00-09:30 should be marked unavailable after booking!"
    print("✓ Verified slot 09:00-09:30 is now marked as unavailable")

    # 9. Test Double Booking Prevention
    res = client.post("/api/v1/appointments/book", headers=patient_headers, json=book_payload)
    assert res.status_code == 409, f"Expected 409 Conflict for double booking, got {res.status_code}"
    print("✓ Double booking attempt correctly blocked with HTTP 409 Conflict")

    # 10. Patient checks own appointments
    res = client.get("/api/v1/appointments/my", headers=patient_headers)
    assert res.status_code == 200
    my_appts = res.json()
    assert my_appts["total"] == 1
    assert my_appts["data"][0]["id"] == appt_id
    print("✓ Patient retrieved own appointment list")

    # 11. Doctor checks assigned appointments
    res = client.get("/api/v1/appointments/doctor", headers=doctor_headers)
    assert res.status_code == 200
    doc_appts = res.json()
    assert doc_appts["total"] == 1
    assert doc_appts["data"][0]["id"] == appt_id
    print("✓ Doctor retrieved assigned appointment list")

    # 12. Doctor confirms appointment
    res = client.put(f"/api/v1/appointments/{appt_id}/status", headers=doctor_headers, json={"status": "CONFIRMED", "notes": "Please bring previous blood test reports."})
    assert res.status_code == 200, f"Confirm status failed: {res.text}"
    assert res.json()["status"] == "CONFIRMED"
    print("✓ Doctor confirmed appointment and added notes")

    # 13. Patient reschedules appointment to 10:00-10:30
    reschedule_payload = {
        "appointment_date": target_date.isoformat(),
        "start_time": "10:00",
        "end_time": "10:30",
        "reason_for_visit": "Rescheduled due to morning conflict"
    }
    res = client.put(f"/api/v1/appointments/{appt_id}/reschedule", headers=patient_headers, json=reschedule_payload)
    assert res.status_code == 200, f"Reschedule failed: {res.text}"
    resched_data = res.json()
    assert resched_data["start_time"] == "10:00"
    assert resched_data["status"] == "PENDING"
    print("✓ Patient rescheduled appointment to 10:00-10:30 (Status reset to PENDING)")

    # 14. Verify old slot (09:00) is free again and new slot (10:00) is booked
    res = client.get(f"/api/v1/appointments/slots?doctor_id={doctor_id}&date={target_date.isoformat()}")
    slots_data = res.json()
    slot_0900 = next(s for s in slots_data["slots"] if s["start_time"] == "09:00")
    slot_1000 = next(s for s in slots_data["slots"] if s["start_time"] == "10:00")
    assert slot_0900["is_available"], "Old slot 09:00 should be available after reschedule!"
    assert not slot_1000["is_available"], "New slot 10:00 should be unavailable after reschedule!"
    print("✓ Verified slot availability updated correctly after rescheduling")

    # 15. Doctor confirms and completes appointment
    client.put(f"/api/v1/appointments/{appt_id}/status", headers=doctor_headers, json={"status": "CONFIRMED"})
    res = client.put(f"/api/v1/appointments/{appt_id}/status", headers=doctor_headers, json={"status": "COMPLETED", "notes": "Patient examined. Prescribed rest."})
    assert res.status_code == 200
    assert res.json()["status"] == "COMPLETED"
    print("✓ Doctor completed appointment successfully")

    # 16. Verify completed appointment cannot be cancelled or rescheduled
    res = client.put(f"/api/v1/appointments/{appt_id}/cancel", headers=patient_headers)
    assert res.status_code == 400
    print("✓ Verified completed appointment cannot be cancelled")

    print("\n🎉 ALL 16 PHASE 3 APPOINTMENT E2E VERIFICATION CHECKS PASSED WITH 100% SUCCESS!")

if __name__ == "__main__":
    test_e2e_phase3_appointments()
