import { api } from "@/lib/axios";
import {
  DoctorDetail,
  DoctorAvailability,
  DoctorAvailabilityCreate,
  DoctorAvailabilityUpdate,
  DoctorProfileUpdate,
  PaginatedDoctorResponse,
  DoctorSearchParams,
} from "@/types/doctor";

export const doctorService = {
  searchDoctors: async (params: DoctorSearchParams = {}): Promise<PaginatedDoctorResponse> => {
    const res = await api.get<PaginatedDoctorResponse>("/doctors", { params });
    return res.data;
  },

  getDoctorDetail: async (doctorId: string): Promise<DoctorDetail> => {
    const res = await api.get<DoctorDetail>(`/doctors/${doctorId}`);
    return res.data;
  },

  getMyProfile: async (): Promise<DoctorDetail> => {
    const res = await api.get<DoctorDetail>("/doctor/profile");
    return res.data;
  },

  updateMyProfile: async (data: DoctorProfileUpdate): Promise<DoctorDetail> => {
    const res = await api.put<DoctorDetail>("/doctor/profile", data);
    return res.data;
  },

  createAvailability: async (data: DoctorAvailabilityCreate): Promise<DoctorAvailability> => {
    const res = await api.post<DoctorAvailability>("/doctor/availability", data);
    return res.data;
  },

  listAvailabilities: async (): Promise<DoctorAvailability[]> => {
    const res = await api.get<DoctorAvailability[]>("/doctor/availability");
    return res.data;
  },

  updateAvailability: async (slotId: string, data: DoctorAvailabilityUpdate): Promise<DoctorAvailability> => {
    const res = await api.put<DoctorAvailability>(`/doctor/availability/${slotId}`, data);
    return res.data;
  },

  deleteAvailability: async (slotId: string): Promise<void> => {
    await api.delete(`/doctor/availability/${slotId}`);
  },
};
