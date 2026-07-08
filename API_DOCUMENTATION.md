# MediCare Plus | Complete API Documentation

This document provides comprehensive technical specifications for the RESTful API endpoints, security protocols, and operational workflows of the **MediCare Plus Doctor Appointment System** (v1.0.0).

---

## 1. Authentication & Authorization Flow

The platform implements stateless **JSON Web Token (JWT)** authentication with Role-Based Access Control (RBAC). 

### 1.1 Authentication Mechanics
1. **Registration/Login**: Client sends credentials to `/api/v1/auth/register` or `/api/v1/auth/login`.
2. **Token Issuance**: Server verifies credentials against bcrypt-hashed passwords in PostgreSQL and issues:
   - `access_token` (JWT, valid for 30 minutes, contains `sub` as User UUID and `role`).
   - `refresh_token` (JWT, valid for 7 days, used to obtain new access tokens without re-authenticating).
3. **Request Interception**: Frontend Axios interceptors automatically attach the token as a Bearer header:
   ```http
   Authorization: Bearer <access_token>
   ```
4. **Token Refresh**: If an endpoint returns `401 Unauthorized`, the client automatically queues pending requests, hits `/api/v1/auth/refresh` using the stored refresh token, updates local storage, and retries the failed requests.

### 1.2 Role-Based Access Control (RBAC)
The API enforces strict middleware checks via dependency injection (`RoleChecker`):
- **`PATIENT`**: Access limited to personal profile, searching verified doctors, booking appointments, and viewing personal booking history.
- **`DOCTOR`**: Access limited to managing personal professional profile, setting weekly availability schedules, viewing assigned patient appointments, and updating consultation status.
- **`ADMIN`**: Root-level access to system analytics, doctor verification workflows, patient activation/deactivation, and global appointment auditing.

---

## 2. API Endpoint Summary

### 2.1 Authentication Endpoints (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required | Allowed Roles |
| :--- | :--- | :--- | :---: | :---: |
| `POST` | `/auth/register` | Register a new user account (`PATIENT` or `DOCTOR`) | ❌ | Any |
| `POST` | `/auth/login` | Authenticate credentials and receive JWT token pair | ❌ | Any |
| `POST` | `/auth/refresh` | Obtain a new access token using a valid refresh token | ❌ | Any |
| `GET` | `/auth/me` | Retrieve authenticated user metadata and profile state | ✅ | Any |

#### Example Request: User Login
```http
POST /api/v1/auth/login HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "email": "doctor@medicare.com",
  "password": "SecurePassword123!"
}
```

#### Example Response: `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "email": "doctor@medicare.com",
    "role": "DOCTOR",
    "is_active": true
  }
}
```

---

### 2.2 User Profile Endpoints (`/api/v1/users`)

| Method | Endpoint | Description | Auth Required | Allowed Roles |
| :--- | :--- | :--- | :---: | :---: |
| `GET` | `/users/me` | Get current user account details | ✅ | Any |
| `PUT` | `/users/me/patient-profile` | Create or update patient medical & contact profile | ✅ | `PATIENT` |
| `GET` | `/users/me/patient-profile` | Retrieve current patient medical profile | ✅ | `PATIENT` |

---

### 2.3 Doctor Directory & Profile Endpoints (`/api/v1/doctors` & `/api/v1/doctor-profile`)

| Method | Endpoint | Description | Auth Required | Allowed Roles |
| :--- | :--- | :--- | :---: | :---: |
| `GET` | `/doctors` | Browse & filter verified doctors (by city, spec, fee) | ❌ / ✅ | Any |
| `GET` | `/doctors/{doctor_id}` | Retrieve public profile & weekly schedule of a doctor | ❌ / ✅ | Any |
| `GET` | `/doctor-profile/me` | Get personal doctor profile & verification status | ✅ | `DOCTOR` |
| `PUT` | `/doctor-profile/me` | Update professional details, bio, fee, & clinic | ✅ | `DOCTOR` |
| `GET` | `/doctor-profile/me/availability` | Fetch weekly availability slots and break times | ✅ | `DOCTOR` |
| `PUT` | `/doctor-profile/me/availability` | Set or update 7-day recurring availability schedule | ✅ | `DOCTOR` |

#### Example Request: Filter Verified Doctors
```http
GET /api/v1/doctors?specialization=Cardiology&city=New+York&page=1&page_size=10 HTTP/1.1
Host: localhost:8000
```

---

### 2.4 Appointment Booking Workflow Endpoints (`/api/v1/appointments`)

| Method | Endpoint | Description | Auth Required | Allowed Roles |
| :--- | :--- | :--- | :---: | :---: |
| `POST` | `/appointments` | Book a new appointment slot with a verified doctor | ✅ | `PATIENT` |
| `GET` | `/appointments` | Retrieve appointment history (scoped to user role) | ✅ | `PATIENT`, `DOCTOR` |
| `GET` | `/appointments/{id}` | Get specific appointment details and clinical notes | ✅ | `PATIENT`, `DOCTOR` |
| `PATCH` | `/appointments/{id}/status` | Update status (`CONFIRMED`, `COMPLETED`, `CANCELLED`) | ✅ | `PATIENT`, `DOCTOR` |

#### Example Request: Book Appointment
```http
POST /api/v1/appointments HTTP/1.1
Host: localhost:8000
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "doctor_id": "8f7e6d5c-4b3a-2a1f-0e9d-8c7b6a5f4e3d",
  "appointment_date": "2026-07-15",
  "start_time": "10:00",
  "end_time": "10:30",
  "reason_for_visit": "Annual cardiovascular routine examination and ECG review."
}
```

---

### 2.5 Admin Governance Endpoints (`/api/v1/admin`)

| Method | Endpoint | Description | Auth Required | Allowed Roles |
| :--- | :--- | :--- | :---: | :---: |
| `GET` | `/admin/stats` | Fetch real-time KPIs (totals, growth, status charts) | ✅ | `ADMIN` |
| `GET` | `/admin/doctors` | List all doctors (including unverified & inactive) | ✅ | `ADMIN` |
| `PATCH` | `/admin/doctors/{id}/verify` | Approve medical credentials & verify doctor badge | ✅ | `ADMIN` |
| `PATCH` | `/admin/doctors/{id}/activate` | Suspend or reactivate doctor practice account | ✅ | `ADMIN` |
| `DELETE` | `/admin/doctors/{id}` | Perform soft-delete on doctor account and profile | ✅ | `ADMIN` |
| `GET` | `/admin/patients` | List all registered patients with medical demographics | ✅ | `ADMIN` |
| `PATCH` | `/admin/patients/{id}/activate` | Toggle patient account active status | ✅ | `ADMIN` |
| `DELETE` | `/admin/patients/{id}` | Soft-delete patient record from active directory | ✅ | `ADMIN` |
| `GET` | `/admin/appointments` | Global audit log of all system appointments | ✅ | `ADMIN` |
| `PATCH` | `/admin/appointments/{id}/status` | Override appointment status or inject admin notes | ✅ | `ADMIN` |

---

## 3. Detailed Workflows

### 3.1 Patient Appointment Booking Workflow
1. **Discovery**: Patient navigates to `/doctors` and filters by specialization (e.g., Neurologist) and location.
2. **Schedule Inspection**: Patient clicks on a doctor card to view `/doctors/{id}`. The system returns the doctor's profile along with their configured `availabilities` array (start times, end times, slot durations, and break windows).
3. **Slot Selection**: Client calculates available 30-minute slots for the selected date, excluding past slots and break periods.
4. **Reservation**: Client sends a `POST /appointments` payload containing `doctor_id`, `appointment_date`, `start_time`, `end_time`, and `reason_for_visit`.
5. **Validation**: Backend checks:
   - Doctor account is verified (`is_verified == True`) and active (`is_active == True`).
   - Slot falls within the doctor's scheduled `DoctorAvailability` for that day of the week.
   - Slot does not overlap with any existing `PENDING` or `CONFIRMED` appointment for that doctor on that date.
6. **Confirmation**: Appointment is committed to PostgreSQL with status `PENDING`.

### 3.2 Doctor Verification & Governance Workflow
1. **Onboarding**: A new doctor registers via `/register` with role `DOCTOR`. Their account is created with `is_verified = False`.
2. **Profile Completion**: Doctor logs in and submits their professional credentials (license number, degree, specialization, hospital affiliation) via `PUT /doctor-profile/me`.
3. **Restriction**: Until verified, the doctor does not appear in public `/doctors` search results and cannot receive patient bookings.
4. **Admin Review**: Admin logs into `/dashboard/admin/doctors`, inspects the license number and qualification, and clicks **Verify Doctor**.
5. **Activation**: The frontend sends `PATCH /api/v1/admin/doctors/{id}/verify` with `{"is_verified": true}`.
6. **Live Directory**: The doctor instantly becomes visible in public directories and booking engines.

---

## 4. Error Handling & HTTP Status Codes

The API strictly adheres to standard HTTP status codes and returns structured JSON error payloads:

| Status Code | Error Title | Typical Cause |
| :---: | :--- | :--- |
| `200 OK` | Success | Request completed successfully. |
| `201 Created` | Created | Resource (user, appointment, profile) created successfully. |
| `400 Bad Request` | Validation Error | Malformed input, overlapping appointment slot, or invalid date format. |
| `401 Unauthorized` | Authentication Failed | Missing, expired, or invalid JWT Bearer token. |
| `403 Forbidden` | Access Denied | Insufficient role permissions (e.g., Patient attempting to hit Admin endpoints). |
| `404 Not Found` | Resource Missing | Requested doctor, patient, or appointment UUID does not exist. |
| `409 Conflict` | Resource Conflict | Email address or medical license number already registered. |
| `422 Unprocessable` | Schema Error | Pydantic payload validation failure (e.g., missing required fields). |
| `500 Internal Error` | Server Exception | Unhandled backend runtime exception or database connection failure. |

#### Example Error Payload (`400 Bad Request` - Slot Overlap)
```json
{
  "detail": "The selected appointment time slot (10:00 - 10:30) is already booked for this doctor. Please choose another slot."
}
```
