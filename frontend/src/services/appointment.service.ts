import { api } from "@/lib/axios";
import {
  AvailableSlotsResponse,
  Appointment,
  PaginatedAppointmentResponse,
  AppointmentCreate,
  AppointmentReschedule,
  AppointmentStatusUpdate,
  AppointmentSearchParams,
} from "@/types/appointment";

export const appointmentService = {
  getAvailableSlots: async (doctorId: string, date: string): Promise<AvailableSlotsResponse> => {
    const res = await api.get<AvailableSlotsResponse>("/appointments/slots", {
      params: { doctor_id: doctorId, date },
    });
    return res.data;
  },

  bookAppointment: async (data: AppointmentCreate): Promise<Appointment> => {
    const res = await api.post<Appointment>("/appointments/book", data);
    return res.data;
  },

  getMyAppointments: async (params: AppointmentSearchParams = {}): Promise<PaginatedAppointmentResponse> => {
    const res = await api.get<PaginatedAppointmentResponse>("/appointments/my", { params });
    return res.data;
  },

  getDoctorAppointments: async (params: AppointmentSearchParams = {}): Promise<PaginatedAppointmentResponse> => {
    const res = await api.get<PaginatedAppointmentResponse>("/appointments/doctor", { params });
    return res.data;
  },

  getAppointmentDetail: async (appointmentId: string): Promise<Appointment> => {
    const res = await api.get<Appointment>(`/appointments/${appointmentId}`);
    return res.data;
  },

  cancelAppointment: async (appointmentId: string, notes?: string): Promise<Appointment> => {
    const res = await api.put<Appointment>(`/appointments/${appointmentId}/cancel`, null, {
      params: notes ? { notes } : undefined,
    });
    return res.data;
  },

  rescheduleAppointment: async (appointmentId: string, data: AppointmentReschedule): Promise<Appointment> => {
    const res = await api.put<Appointment>(`/appointments/${appointmentId}/reschedule`, data);
    return res.data;
  },

  updateAppointmentStatus: async (appointmentId: string, data: AppointmentStatusUpdate): Promise<Appointment> => {
    const res = await api.put<Appointment>(`/appointments/${appointmentId}/status`, data);
    return res.data;
  },
};
