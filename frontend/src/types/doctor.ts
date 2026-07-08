import { DoctorProfile } from "./auth";

export interface DoctorAvailability {
  id: string;
  doctor_id: string;
  day_of_week: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY" | string;
  start_time: string;
  end_time: string;
  slot_duration: number;
  break_start?: string;
  break_end?: string;
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DoctorAvailabilityCreate {
  day_of_week: string;
  start_time: string;
  end_time: string;
  slot_duration: number;
  break_start?: string;
  break_end?: string;
  is_available?: boolean;
}

export interface DoctorAvailabilityUpdate {
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
  slot_duration?: number;
  break_start?: string;
  break_end?: string;
  is_available?: boolean;
}

export interface DoctorProfileUpdate {
  first_name?: string;
  last_name?: string;
  specialization?: string;
  qualification?: string;
  experience_years?: number;
  consultation_fee?: number;
  bio?: string;
  profile_photo?: string;
  hospital_clinic?: string;
  languages?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  is_active?: boolean;
}

export interface DoctorDetail extends DoctorProfile {
  availabilities?: DoctorAvailability[];
}

export interface PaginatedDoctorResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  data: DoctorDetail[];
}

export interface DoctorSearchParams {
  page?: number;
  page_size?: number;
  specialization?: string;
  city?: string;
  max_fee?: number;
  min_experience?: number;
  language?: string;
  search?: string;
  sort_by?: "exp_desc" | "fee_asc" | "fee_desc" | "exp_asc";
}
