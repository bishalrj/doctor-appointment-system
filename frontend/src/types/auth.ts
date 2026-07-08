export type UserRole = "PATIENT" | "DOCTOR" | "ADMIN";

export interface PatientProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
  address?: string;
  emergency_contact?: string;
  created_at: string;
  updated_at: string;
}

export interface DoctorProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  specialization: string;
  license_number: string;
  qualification: string;
  experience_years: number;
  consultation_fee: number;
  bio?: string;
  profile_photo?: string;
  hospital_clinic?: string;
  languages?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  is_verified: boolean;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  patient_profile?: PatientProfile;
  doctor_profile?: DoctorProfile;
}

export interface AuthTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
