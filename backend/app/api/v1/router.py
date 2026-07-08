from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, doctors, doctor_profile, appointments, admin

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(doctors.router, prefix="/doctors", tags=["Doctor Discovery"])
api_router.include_router(doctor_profile.router, prefix="/doctor", tags=["Doctor Management"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["Appointments"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin Management"])
