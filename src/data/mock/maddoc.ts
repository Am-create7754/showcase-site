// SYNTHETIC data for the MaDDoC product showcase. Names, doctors and records are invented.

export type Mode = "Video" | "In-clinic";

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  fee: number;
  languages: string[];
  mode: Mode[];
  verified: boolean;
  initials: string;
  about: string;
}

export const DOCTORS: Doctor[] = [
  { id: "d1", name: "Dr. Kavya Raman", specialty: "General Physician", experience: 9, fee: 500, languages: ["English", "Tamil"], mode: ["Video", "In-clinic"], verified: true, initials: "KR", about: "Primary care for adults; preventive check-ups and follow-ups." },
  { id: "d2", name: "Dr. Arjun Mehta", specialty: "Dermatologist", experience: 12, fee: 800, languages: ["English", "Hindi"], mode: ["Video"], verified: true, initials: "AM", about: "Skin, hair and allergy consultations." },
  { id: "d3", name: "Dr. Sana Qureshi", specialty: "Paediatrician", experience: 7, fee: 600, languages: ["English", "Hindi", "Urdu"], mode: ["Video", "In-clinic"], verified: true, initials: "SQ", about: "Child health, vaccination schedules and growth checks." },
  { id: "d4", name: "Dr. Rohan Iyengar", specialty: "General Physician", experience: 4, fee: 400, languages: ["English", "Kannada"], mode: ["In-clinic"], verified: false, initials: "RI", about: "Primary care and lifestyle consultations. Newly onboarded — awaiting admin verification." },
];

export const SPECIALTIES = ["All", "General Physician", "Dermatologist", "Paediatrician"];

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const SLOTS = ["10:00 am", "11:30 am", "2:00 pm", "4:30 pm", "6:30 pm", "8:00 pm"];

/** The doctor whose dashboard the "Doctor" view shows. */
export const DOCTOR_VIEW_ID = "d1";

export const PATIENT = {
  name: "Ananya (synthetic)",
  prescriptions: [
    { name: "Vitamin D3 (sample)", note: "Once weekly · 8 weeks", status: "Active" },
    { name: "Saline nasal spray (sample)", note: "As needed", status: "Completed" },
  ],
  records: ["Blood panel — sample report", "Consultation notes — sample", "Vaccination card — sample"],
};

export interface Booking {
  id: string;
  doctorId: string;
  day: string;
  slot: string;
  mode: Mode;
  patient: string;
  reason: string;
}

export const SEED_BOOKINGS: Booking[] = [
  { id: "b1", doctorId: "d1", day: "Mon", slot: "4:30 pm", mode: "Video", patient: "Patient #A12", reason: "Follow-up" },
  { id: "b2", doctorId: "d1", day: "Mon", slot: "6:30 pm", mode: "Video", patient: PATIENT.name, reason: "Persistent cough" },
  { id: "b3", doctorId: "d1", day: "Tue", slot: "10:00 am", mode: "In-clinic", patient: "Patient #C07", reason: "Check-up" },
];

export const ASSISTANT_CHAT = [
  { from: "patient", text: "I've had a dry cough for a week. Should I be worried?" },
  {
    from: "assistant",
    text: "I can't diagnose, but I can help you prepare. You have a video consultation with Dr. Kavya Raman on Monday at 6:30 pm. Note when the cough started, any fever, and whether it's worse at night — I've added these as questions for your appointment.",
  },
  { from: "patient", text: "Can I keep taking my vitamin D?" },
  {
    from: "assistant",
    text: "Your active prescription lists Vitamin D3 once weekly. Please confirm any changes with your doctor during your consultation.",
  },
];

export const ASSISTANT_CONTEXT = ["Upcoming appointment", "Active prescriptions", "Patient-shared records only"];
