# MediCare Plus | System Architecture & Visual Diagrams

This document contains comprehensive **Mermaid.js** visual architecture diagrams, Entity-Relationship Diagrams (ERD), and end-to-end data flow charts for the **MediCare Plus Doctor Appointment System**.

---

## 1. System Architecture Diagram

The system follows a modern decoupled, cloud-native architecture utilizing **Clean Architecture** principles on the backend and an **Edge-Optimized App Router** architecture on the frontend.

```mermaid
graph TD
    subgraph Client Tier ["Client Layer (Browser / Mobile / Tablet)"]
        UI["Next.js 15 Frontend (App Router)"]
        State["TanStack React Query (Server State & Cache)"]
        AuthCtx["React Auth Context (JWT Session State)"]
        UI <--> State
        UI <--> AuthCtx
    end

    subgraph API Gateway & Security ["Security & Routing Layer"]
        CORS["CORS Middleware"]
        JWTAuth["JWT Authentication Interceptor"]
        RBAC["Role-Based Access Control (RoleChecker)"]
    end

    subgraph Backend Services ["FastAPI Backend (Clean Architecture)"]
        Router["API v1 Routers (/auth, /users, /doctors, /appointments, /admin)"]
        AuthSvc["AuthService (Bcrypt & JWT Issuance)"]
        UserSvc["UserService (Patient & Doctor Profiles)"]
        ApptSvc["AppointmentService (Slot Engine & Booking Logic)"]
        AdminSvc["AdminService (KPIs & Governance)"]
    end

    subgraph Data & Persistence Layer ["Database & Storage Tier"]
        ORM["SQLAlchemy 2.0 ORM (Repository Pattern)"]
        PG[(PostgreSQL 15+ Relational Database)]
    end

    %% Connections
    UI -- "REST / HTTP (JSON)" --> CORS
    CORS --> JWTAuth
    JWTAuth --> RBAC
    RBAC --> Router

    Router --> AuthSvc
    Router --> UserSvc
    Router --> ApptSvc
    Router --> AdminSvc

    AuthSvc --> ORM
    UserSvc --> ORM
    ApptSvc --> ORM
    AdminSvc --> ORM

    ORM -- "SQL / UUID / Foreign Keys" --> PG

    style UI fill:#2563eb,stroke:#1e40af,color:#ffffff
    style PG fill:#059669,stroke:#047857,color:#ffffff
    style Router fill:#7c3aed,stroke:#5b21b6,color:#ffffff
```

---

## 2. Final Entity-Relationship Diagram (ERD)

The database schema is designed in 3rd Normal Form (3NF) with UUID v4 primary keys, strict foreign key cascading, and comprehensive database indexing on filterable columns.

```mermaid
erDiagram
    USERS {
        uuid id PK "UUID v4 Primary Key"
        string email UK "Unique indexed login email"
        string hashed_password "Bcrypt encrypted hash"
        string role "PATIENT | DOCTOR | ADMIN"
        boolean is_active "Account status flag"
        boolean is_deleted "Soft delete flag"
        timestamp created_at "Creation timestamp"
        timestamp updated_at "Modification timestamp"
    }

    PATIENT_PROFILES {
        uuid id PK "UUID v4 Primary Key"
        uuid user_id FK "1-to-1 link to USERS"
        string first_name "Patient first name"
        string last_name "Patient last name"
        string phone_number "Contact telephone"
        date date_of_birth "Birth date"
        string gender "Gender identity"
        string blood_group "Blood type (e.g., O+)"
        text address "Residential address"
        string emergency_contact "Emergency phone/contact"
    }

    DOCTOR_PROFILES {
        uuid id PK "UUID v4 Primary Key"
        uuid user_id FK "1-to-1 link to USERS"
        string first_name "Doctor first name"
        string last_name "Doctor last name"
        string specialization "Medical practice area (Indexed)"
        string license_number UK "Medical board license (Indexed)"
        string qualification "Degrees & certifications"
        integer experience_years "Years in practice"
        numeric consultation_fee "Fee per session (USD)"
        text bio "Professional summary"
        string profile_photo "Avatar URL"
        string hospital_clinic "Clinic affiliation"
        string languages "Spoken languages"
        text address "Clinic address"
        string city "Practice city (Indexed)"
        string state "State/Province"
        string country "Country"
        boolean is_verified "Admin badge approval (Indexed)"
        boolean is_active "Practice active status (Indexed)"
    }

    DOCTOR_AVAILABILITY {
        uuid id PK "UUID v4 Primary Key"
        uuid doctor_id FK "Many-to-1 link to DOCTOR_PROFILES"
        string day_of_week "Monday through Sunday (Indexed)"
        string start_time "Slot start (e.g., 09:00)"
        string end_time "Slot end (e.g., 17:00)"
        integer slot_duration "Duration in minutes (e.g., 30)"
        string break_start "Lunch window start"
        string break_end "Lunch window end"
        boolean is_available "Day active toggle"
    }

    APPOINTMENTS {
        uuid id PK "UUID v4 Primary Key"
        uuid patient_id FK "Many-to-1 link to PATIENT_PROFILES"
        uuid doctor_id FK "Many-to-1 link to DOCTOR_PROFILES"
        date appointment_date "Scheduled visit date (Indexed)"
        string start_time "Slot start time (e.g., 10:00)"
        string end_time "Slot end time (e.g., 10:30)"
        text reason_for_visit "Patient reported symptoms/reason"
        string status "PENDING | CONFIRMED | REJECTED | COMPLETED | CANCELLED (Indexed)"
        text notes "Clinical notes or cancellation reason"
        timestamp created_at "Booking timestamp"
    }

    %% Relationships
    USERS ||--o| PATIENT_PROFILES : "has (1:1)"
    USERS ||--o| DOCTOR_PROFILES : "has (1:1)"
    DOCTOR_PROFILES ||--o{ DOCTOR_AVAILABILITY : "defines schedules (1:N)"
    PATIENT_PROFILES ||--o{ APPOINTMENTS : "books (1:N)"
    DOCTOR_PROFILES ||--o{ APPOINTMENTS : "receives (1:N)"
```

---

## 3. Authentication & Authorization Flow

Illustrates stateless JWT authentication, Axios request/response interception, automatic token rotation via refresh tokens, and RBAC endpoint protection.

```mermaid
sequenceDiagram
    autonumber
    actor User as Client (Browser)
    participant UI as Next.js 15 App
    participant Axios as Axios Interceptor
    participant API as FastAPI Backend
    participant DB as PostgreSQL DB

    User->>UI: Enter Credentials (Email & Password)
    UI->>API: POST /api/v1/auth/login
    API->>DB: Query User & Verify Bcrypt Hash
    DB-->>API: User Record Valid
    API-->>UI: Return 200 OK (access_token [30m], refresh_token [7d], User Metadata)
    UI->>UI: Store tokens in LocalStorage & update AuthContext

    Note over User,DB: Protected API Request with RBAC
    User->>UI: Navigate to Protected Page (e.g., Book Appointment)
    UI->>Axios: Initiate API Request
    Axios->>Axios: Attach Header: "Authorization: Bearer <access_token>"
    Axios->>API: POST /api/v1/appointments
    API->>API: Verify JWT Signature & Check Role == PATIENT
    API->>DB: Check Doctor Availability & Slot Overlap
    DB-->>API: Slot Available
    API-->>Axios: Return 201 Created (Appointment Details)
    Axios-->>UI: Render Success Toast & Update Cache

    Note over User,DB: Automatic Token Refresh on Expiration (401)
    UI->>Axios: Send Request with Expired access_token
    Axios->>API: GET /api/v1/users/me
    API-->>Axios: Return 401 Unauthorized (Token Expired)
    Axios->>Axios: Pause Queue & Initiate Refresh Lock
    Axios->>API: POST /api/v1/auth/refresh (with refresh_token)
    API->>DB: Validate Refresh Token & User Status
    DB-->>API: Valid Session
    API-->>Axios: Return 200 OK (New access_token & refresh_token)
    Axios->>Axios: Update LocalStorage & Retry Queued Requests
    Axios-->>UI: Return Original Request Data Seamlessly
```

---

## 4. Patient Appointment Booking Workflow

Details the complete life-cycle of discovering a verified doctor, inspecting available slots, checking business logic constraints, and managing appointment statuses.

```mermaid
stateDiagram-v2
    [*] --> Discovery: Patient searches Directory (/doctors)
    Discovery --> SlotSelection: Select Doctor & View Schedule
    
    state SlotSelection {
        [*] --> FetchAvailability: Load DoctorAvailability (7-day rules)
        FetchAvailability --> FilterSlots: Calculate 30-min intervals
        FilterSlots --> ExcludeBreaks: Remove Break Windows
        ExcludeBreaks --> ExcludeBooked: Remove PENDING/CONFIRMED slots
        ExcludeBooked --> [*]: Display Available Time Slots
    }

    SlotSelection --> BookingSubmission: Submit POST /appointments
    BookingSubmission --> PENDING: Backend Validates & Saves (Status: PENDING)

    state AppointmentLifecycle {
        PENDING --> CONFIRMED: Doctor Approves Visit
        PENDING --> REJECTED: Doctor Declines Visit
        PENDING --> CANCELLED: Patient Cancels Visit
        CONFIRMED --> COMPLETED: Visit Concluded & Clinical Notes Added
        CONFIRMED --> CANCELLED: Patient or Doctor Cancels Visit
    }

    COMPLETED --> [*]: Archived in Patient & Doctor History
    REJECTED --> [*]: Slot Released
    CANCELLED --> [*]: Slot Released
```

---

## 5. Admin Governance & Verification Flow

Shows how system administrators monitor platform metrics, review medical credentials, verify doctors, and enforce data governance.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as System Administrator
    participant Portal as Admin Dashboard
    participant API as AdminService (/api/v1/admin)
    participant DB as PostgreSQL DB

    Admin->>Portal: Navigate to Admin Portal (/dashboard/admin)
    Portal->>API: GET /api/v1/admin/stats
    API->>DB: Aggregate Counts (Users, Doctors, Appointments, Revenue)
    DB-->>API: Statistical Summary
    API-->>Portal: Render Real-Time KPI Charts

    Note over Admin,DB: Doctor Verification Workflow
    Admin->>Portal: View Doctor Management (/dashboard/admin/doctors)
    Portal->>API: GET /api/v1/admin/doctors?page=1
    API->>DB: Fetch All Doctor Profiles (including unverified)
    DB-->>API: Doctor Directory List
    API-->>Portal: Display Table with Verification Badges

    Admin->>Portal: Inspect License & Click "Verify Doctor"
    Portal->>API: PATCH /api/v1/admin/doctors/{id}/verify (is_verified=true)
    API->>DB: Update DOCTOR_PROFILES set is_verified = true
    DB-->>API: Commit Success
    API-->>Portal: Return Updated Profile
    Portal->>Portal: Update UI Badge to "Verified" & Trigger Toast

    Note over Admin,DB: Soft Delete / Account Suspension
    Admin->>Portal: Click "Suspend Account" or "Delete"
    Portal->>API: DELETE /api/v1/admin/doctors/{id}
    API->>DB: Update USERS set is_deleted = true, is_active = false
    DB-->>API: Commit Success
    API-->>Portal: Remove Doctor from Active Directory View
```
