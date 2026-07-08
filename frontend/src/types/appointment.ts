export const AppointmentStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  REJECTED: "REJECTED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type AppointmentStatus = (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

export interface TimeSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface AvailableSlotsResponse {
  date: string;
  doctor_id: string;
  day_of_week: string;
  slots: TimeSlot[];
}

export interface PatientSummary {
  id: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  gender?: string;
  blood_group?: string;
}

export interface DoctorSummary {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
  qualification?: string;
  hospital_clinic?: string;
  profile_photo?: string;
  consultation_fee: number;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  reason_for_visit: string;
  status: AppointmentStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  patient?: PatientSummary;
  doctor?: DoctorSummary;
}

export interface PaginatedAppointmentResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  data: Appointment[];
}

export interface AppointmentCreate {
  doctor_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  reason_for_visit: string;
}

export interface AppointmentReschedule {
  appointment_date: string;
  start_time: string;
  end_time: string;
  reason_for_visit?: string;
}

export interface AppointmentStatusUpdate {
  status: AppointmentStatus;
  notes?: string;
}

export interface AppointmentSearchParams {
  page?: number;
  page_size?: number;
  size?: number;
  status?: string;
  filter?: "upcoming" | "history" | string;
  date?: string;
}
