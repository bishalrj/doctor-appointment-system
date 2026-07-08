import { api } from "@/lib/axios";
import {
  AdminDashboardStats,
  AdminAnalytics,
  AdminDoctor,
  AdminPatient,
  AdminPaginatedDoctorResponse,
  AdminPaginatedPatientResponse,
  AdminDoctorSearchParams,
  AdminPatientSearchParams,
} from "@/types/admin";
import { PaginatedAppointmentResponse } from "@/types/appointment";

export const adminService = {
  getStats: async (): Promise<AdminDashboardStats> => {
    const res = await api.get<AdminDashboardStats>("/admin/stats");
    return res.data;
  },

  getAnalytics: async (): Promise<AdminAnalytics> => {
    const res = await api.get<AdminAnalytics>("/admin/analytics");
    return res.data;
  },

  listDoctors: async (params: AdminDoctorSearchParams = {}): Promise<AdminPaginatedDoctorResponse> => {
    const res = await api.get<AdminPaginatedDoctorResponse>("/admin/doctors", { params });
    return res.data;
  },

  verifyDoctor: async (doctorId: string, is_verified: boolean = true): Promise<AdminDoctor> => {
    const res = await api.patch<AdminDoctor>(`/admin/doctors/${doctorId}/verify`, { is_verified });
    return res.data;
  },

  activateDoctor: async (doctorId: string): Promise<AdminDoctor> => {
    const res = await api.patch<AdminDoctor>(`/admin/doctors/${doctorId}/activate`);
    return res.data;
  },

  deactivateDoctor: async (doctorId: string): Promise<AdminDoctor> => {
    const res = await api.patch<AdminDoctor>(`/admin/doctors/${doctorId}/deactivate`);
    return res.data;
  },

  deleteDoctor: async (doctorId: string): Promise<AdminDoctor> => {
    const res = await api.delete<AdminDoctor>(`/admin/doctors/${doctorId}`);
    return res.data;
  },

  listPatients: async (params: AdminPatientSearchParams = {}): Promise<AdminPaginatedPatientResponse> => {
    const res = await api.get<AdminPaginatedPatientResponse>("/admin/patients", { params });
    return res.data;
  },

  activatePatient: async (patientId: string): Promise<AdminPatient> => {
    const res = await api.patch<AdminPatient>(`/admin/patients/${patientId}/activate`);
    return res.data;
  },

  deactivatePatient: async (patientId: string): Promise<AdminPatient> => {
    const res = await api.patch<AdminPatient>(`/admin/patients/${patientId}/deactivate`);
    return res.data;
  },

  deletePatient: async (patientId: string): Promise<AdminPatient> => {
    const res = await api.delete<AdminPatient>(`/admin/patients/${patientId}`);
    return res.data;
  },

  listAppointments: async (params: Record<string, unknown> = {}): Promise<PaginatedAppointmentResponse> => {
    const res = await api.get<PaginatedAppointmentResponse>("/admin/appointments", { params });
    return res.data;
  },
};
