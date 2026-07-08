import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const patientRegisterSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm Password is required"),
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().min(1, "Last name is required").max(100),
  phone_number: z.string().min(10, "Valid phone number is required").max(50),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Male", "Female", "Other", "Prefer not to say"]),
  blood_group: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),
  address: z.string().min(5, "Full residential address is required"),
  emergency_contact: z.string().min(3, "Emergency contact name and phone required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type PatientRegisterFormValues = z.infer<typeof patientRegisterSchema>;

export const doctorRegisterSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm Password is required"),
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().min(1, "Last name is required").max(100),
  specialization: z.string().min(2, "Specialization is required (e.g., Cardiology)"),
  license_number: z.string().min(3, "Medical license number is required"),
  qualification: z.string().min(2, "Qualification is required (e.g., MBBS, MD)"),
  experience_years: z.coerce.number().min(0, "Experience must be 0 or more years").max(70),
  consultation_fee: z.coerce.number().min(0, "Fee must be a valid number"),
  bio: z.string().min(10, "Please provide a short professional bio").max(1000),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type DoctorRegisterFormValues = z.infer<typeof doctorRegisterSchema>;
