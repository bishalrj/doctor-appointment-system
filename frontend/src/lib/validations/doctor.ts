import * as z from "zod";

export const doctorProfileSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().min(1, "Last name is required").max(100),
  specialization: z.string().min(2, "Specialization must be at least 2 characters").max(150),
  qualification: z.string().min(2, "Qualification must be at least 2 characters").max(255),
  experience_years: z.coerce.number().min(0, "Experience must be 0 or greater").max(70, "Invalid experience years"),
  consultation_fee: z.coerce.number().min(0, "Consultation fee cannot be negative"),
  bio: z.string().max(1000, "Bio cannot exceed 1000 characters").optional().or(z.literal("")),
  profile_photo: z.string().url("Must be a valid image URL").max(500).optional().or(z.literal("")),
  hospital_clinic: z.string().max(255, "Hospital/Clinic name too long").optional().or(z.literal("")),
  languages: z.string().max(255, "Languages string too long").optional().or(z.literal("")),
  address: z.string().max(500, "Address too long").optional().or(z.literal("")),
  city: z.string().max(100, "City too long").optional().or(z.literal("")),
  state: z.string().max(100, "State too long").optional().or(z.literal("")),
  country: z.string().max(100, "Country too long").optional().or(z.literal("")),
  is_active: z.boolean().default(true),
});

export type DoctorProfileFormValues = z.infer<typeof doctorProfileSchema>;

export const doctorAvailabilitySchema = z.object({
  day_of_week: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"], {
    required_error: "Please select a day of the week",
  }),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Must be HH:MM 24-hour format"),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Must be HH:MM 24-hour format"),
  slot_duration: z.coerce.number().min(5, "Minimum slot duration is 5 mins").max(240, "Maximum slot duration is 240 mins"),
  break_start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Must be HH:MM").optional().or(z.literal("")),
  break_end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Must be HH:MM").optional().or(z.literal("")),
  is_available: z.boolean().default(true),
}).refine((data) => {
  return data.start_time < data.end_time;
}, {
  message: "Start time must be earlier than end time",
  path: ["end_time"],
}).refine((data) => {
  if (data.break_start && data.break_end) {
    return data.break_start < data.break_end && data.start_time <= data.break_start && data.break_end <= data.end_time;
  }
  return true;
}, {
  message: "Break time must be valid and within start and end times",
  path: ["break_end"],
});

export type DoctorAvailabilityFormValues = z.infer<typeof doctorAvailabilitySchema>;
