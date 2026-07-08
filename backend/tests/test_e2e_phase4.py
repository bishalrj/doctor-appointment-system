import sys
import os
import uuid
from datetime import date, timedelta
import pytest
from fastapi.testclient import TestClient

# Add parent dir to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.database.session import SessionLocal
from app.models.user import User, UserRole
from app.auth.security import get_password_hash

client = TestClient(app)

def test_e2e_phase4_admin_management():
    print("\n--- Starting E2E Verification for Doctor Appointment System (Phase 4: Admin Management) ---")

    unique_id = str(uuid.uuid4())[:8]
    admin_email = f"admin_p4_{unique_id}@test.com"
    patient_email = f"patient_p4_{unique_id}@test.com"
    doctor_email = f"doctor_p4_{unique_id}@test.com"
    password = "Password123!"

    # 1. Create Admin User directly in database session
    db = SessionLocal()
    try:
        admin_user = User(
            email=admin_email,
            hashed_password=get_password_hash(password),
            role=UserRole.ADMIN.value,
            is_active=True
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        print(f"[OK] Admin user seeded in DB: {admin_email}")
    finally:
        db.close()

    # 2. Login Admin
    res = client.post("/api/v1/auth/login", json={"email": admin_email, "password": password})
    assert res.status_code == 200, f"Admin login failed: {res.text}"
    admin_headers = {"Authorization": f"Bearer {res.json()['access_token']}"}
    print("[OK] Admin logged in successfully")

    # 3. Register Patient & Doctor
    res = client.post("/api/v1/auth/register/patient", json={
        "email": patient_email,
        "password": password,
        "profile": {
            "first_name": "Bob",
            "last_name": "Patient",
            "phone_number": "1234567890",
            "gender": "Male",
            "blood_group": "O+"
        }
    })
    assert res.status_code == 201
    print(f"[OK] Patient registered: {patient_email}")

    res = client.post("/api/v1/auth/register/doctor", json={
        "email": doctor_email,
        "password": password,
        "profile": {
            "first_name": "Lisa",
            "last_name": "Cuddy",
            "specialization": "Endocrinology",
            "license_number": f"LIC-P4-{unique_id}",
            "qualification": "MD",
            "experience_years": 12,
            "consultation_fee": 300.00,
            "city": "Princeton",
            "state": "NJ",
            "country": "USA",
            "bio": "Hospital Administrator and Endocrinologist."
        }
    })
    assert res.status_code == 201
    print(f"[OK] Doctor registered: {doctor_email}")

    # 4. Get Doctor Profile ID via doctor login
    res = client.post("/api/v1/auth/login", json={"email": doctor_email, "password": password})
    assert res.status_code == 200
    doctor_headers = {"Authorization": f"Bearer {res.json()['access_token']}"}
    res = client.get("/api/v1/doctor/profile", headers=doctor_headers)
    assert res.status_code == 200
    doctor_profile_id = res.json()["id"]
    assert res.json()["is_verified"] is False
    print(f"[OK] Doctor profile created and unverified by default (ID: {doctor_profile_id})")

    # 5. Test RBAC: Non-admin should NOT be able to access Admin endpoints
    res = client.get("/api/v1/admin/stats", headers=doctor_headers)
    assert res.status_code == 403, f"Expected 403 for doctor accessing admin stats, got {res.status_code}"
    print("[OK] RBAC verified: Doctor access to /api/v1/admin/stats rejected with 403 Forbidden")

    res = client.post("/api/v1/auth/login", json={"email": patient_email, "password": password})
    assert res.status_code == 200
    patient_headers = {"Authorization": f"Bearer {res.json()['access_token']}"}
    res = client.get("/api/v1/admin/stats", headers=patient_headers)
    assert res.status_code == 403, f"Expected 403 for patient accessing admin stats, got {res.status_code}"
    print("[OK] RBAC verified: Patient access to /api/v1/admin/stats rejected with 403 Forbidden")

    # 6. Admin checks Dashboard Stats
    res = client.get("/api/v1/admin/stats", headers=admin_headers)
    assert res.status_code == 200, f"Admin stats failed: {res.text}"
    stats = res.json()
    assert stats["total_doctors"] >= 1
    assert stats["total_patients"] >= 1
    assert stats["unverified_doctors"] >= 1
    print(f"[OK] Admin Dashboard Stats retrieved: {stats['total_doctors']} doctors, {stats['total_patients']} patients")

    # 7. Admin searches/lists doctors
    res = client.get(f"/api/v1/admin/doctors?search_query=Cuddy", headers=admin_headers)
    assert res.status_code == 200
    doc_list = res.json()
    assert doc_list["total"] >= 1
    assert any(d["id"] == doctor_profile_id for d in doc_list["data"])
    print("[OK] Admin successfully searched and listed doctors")

    # 8. Admin verifies Doctor
    res = client.patch(f"/api/v1/admin/doctors/{doctor_profile_id}/verify", headers=admin_headers, json={"is_verified": True})
    assert res.status_code == 200, f"Doctor verification failed: {res.text}"
    verified_doc = res.json()
    assert verified_doc["is_verified"] is True
    print(f"[OK] Admin verified doctor profile: {doctor_profile_id}")

    # 8.5 Admin suspends (deactivates) Doctor and reactivates
    res = client.patch(f"/api/v1/admin/doctors/{doctor_profile_id}/deactivate", headers=admin_headers)
    assert res.status_code == 200
    assert res.json()["is_active"] is False
    print(f"[OK] Admin suspended (deactivated) doctor: {doctor_profile_id}")

    res = client.patch(f"/api/v1/admin/doctors/{doctor_profile_id}/activate", headers=admin_headers)
    assert res.status_code == 200
    assert res.json()["is_active"] is True
    print(f"[OK] Admin reactivated doctor: {doctor_profile_id}")

    # 8.6 Admin lists patients and tests suspend/activate patient
    res = client.get("/api/v1/admin/patients", headers=admin_headers)
    assert res.status_code == 200
    patient_list = res.json()
    assert patient_list["total"] >= 1
    patient_profile_id = patient_list["data"][0]["id"]

    res = client.patch(f"/api/v1/admin/patients/{patient_profile_id}/deactivate", headers=admin_headers)
    assert res.status_code == 200
    assert res.json()["is_active"] is False
    print(f"[OK] Admin suspended (deactivated) patient: {patient_profile_id}")

    res = client.patch(f"/api/v1/admin/patients/{patient_profile_id}/activate", headers=admin_headers)
    assert res.status_code == 200
    assert res.json()["is_active"] is True
    print(f"[OK] Admin reactivated patient: {patient_profile_id}")

    # 8.7 Admin lists and filters appointments
    res = client.get("/api/v1/admin/appointments?status=PENDING", headers=admin_headers)
    assert res.status_code == 200
    appts = res.json()
    assert "data" in appts and "total" in appts
    print(f"[OK] Admin successfully filtered appointments by status PENDING (Total found: {appts['total']})")

    # 9. Check Admin Analytics
    res = client.get("/api/v1/admin/analytics", headers=admin_headers)
    assert res.status_code == 200, f"Admin analytics failed: {res.text}"
    analytics = res.json()
    assert any(s["specialization"] == "Endocrinology" for s in analytics["doctors_by_specialization"])
    print("[OK] Admin Analytics retrieved with specialization distributions and appointment status breakdowns")

    # 10. Admin soft deletes Doctor
    res = client.delete(f"/api/v1/admin/doctors/{doctor_profile_id}", headers=admin_headers)
    assert res.status_code == 200, f"Delete doctor failed: {res.text}"
    deleted_doc = res.json()
    assert deleted_doc["is_deleted"] is True
    assert deleted_doc["is_active"] is False
    print(f"[OK] Admin soft-deleted doctor profile: {doctor_profile_id}")

    # 11. Verify deleted doctor is excluded from default search, but included when include_deleted=true
    res_default = client.get(f"/api/v1/admin/doctors?search_query=Cuddy", headers=admin_headers)
    assert all(d["id"] != doctor_profile_id for d in res_default.json()["data"])

    res_included = client.get(f"/api/v1/admin/doctors?search_query=Cuddy&include_deleted=true", headers=admin_headers)
    assert any(d["id"] == doctor_profile_id for d in res_included.json()["data"])
    print("[OK] Soft-delete filtering verified: excluded by default, present when include_deleted=true")

    print("--- Phase 4 E2E Verification Completed Successfully ---\n")
