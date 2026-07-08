import { Appointment } from "./appointment";
import { DoctorDetail } from "./doctor";

export interface MonthlyAppointmentCount {
  month: string;
  count: number;
}

export interface StatusAppointmentCount {
  status: string;
  count: number;
}

export interface SpecializationDoctorCount {
  specialization: string;
  count: number;
}

export interface AdminDashboardStats {
  total_doctors: number;
  total_patients: number;
  total_appointments: number;
  today_appointments: number;
  pending_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
  verified_doctors: number;
  unverified_doctors: number;
  recent_appointments: Appointment[];
}

export interface AdminAnalytics extends AdminDashboardStats {
  appointments_by_month: MonthlyAppointmentCount[];
  appointments_by_status: StatusAppointmentCount[];
  doctors_by_specialization: SpecializationDoctorCount[];
}

export interface AdminDoctor extends DoctorDetail {
  email: string;
  is_deleted: boolean;
  total_appointments: number;
}

export interface AdminPatient {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  date_of_birth: string;
  gender: string;
  blood_group: string;
  address?: string;
  emergency_contact?: string;
  created_at: string;
  updated_at?: string;
  email: string;
  is_active: boolean;
  is_deleted: boolean;
  total_appointments: number;
}

export interface AdminPaginatedDoctorResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  data: AdminDoctor[];
}

export interface AdminPaginatedPatientResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  data: AdminPatient[];
}

export interface AdminDoctorSearchParams {
  page?: number;
  page_size?: number;
  specialization?: string;
  is_verified?: boolean;
  is_active?: boolean;
  city?: string;
  search_query?: string;
  sort_by?: string;
  include_deleted?: boolean;
}

export interface AdminPatientSearchParams {
  page?: number;
  page_size?: number;
  gender?: string;
  blood_group?: string;
  is_active?: boolean;
  search_query?: string;
  sort_by?: string;
  include_deleted?: boolean;
}
