// Shared marketplace state for the MaDDoC showcase. One source of truth that the
// patient, doctor and admin views all read and write, so actions in one role
// show up in the others. Pure functions — easy to test, easy to swap for API calls.

import { DAYS, DOCTORS, SEED_BOOKINGS, SLOTS, type Booking, type Doctor } from "../data/mock/maddoc";

export type Verification = "verified" | "pending" | "info";

export interface MarketState {
  verification: Record<string, Verification>;
  /** Hours each doctor has opened, keyed by doctorId then slotKey(day, slot). */
  availability: Record<string, Record<string, boolean>>;
  bookings: Booking[];
}

export const slotKey = (day: string, slot: string) => `${day}|${slot}`;

export function initialState(): MarketState {
  const availability: MarketState["availability"] = {};
  DOCTORS.forEach((d, di) => {
    const hours: Record<string, boolean> = {};
    DAYS.forEach((day, i) => SLOTS.forEach((slot, j) => (hours[slotKey(day, slot)] = (i * 2 + j + di) % 3 !== 0)));
    availability[d.id] = hours;
  });
  // seeded appointments always sit in open hours
  for (const b of SEED_BOOKINGS) availability[b.doctorId][slotKey(b.day, b.slot)] = true;
  return {
    verification: Object.fromEntries(DOCTORS.map((d) => [d.id, d.verified ? "verified" : "pending"])),
    availability,
    bookings: [...SEED_BOOKINGS],
  };
}

export function isBooked(s: MarketState, doctorId: string, day: string, slot: string): boolean {
  return s.bookings.some((b) => b.doctorId === doctorId && b.day === day && b.slot === slot);
}

export function isOpen(s: MarketState, doctorId: string, day: string, slot: string): boolean {
  return !!s.availability[doctorId]?.[slotKey(day, slot)];
}

/** Slots a patient can actually book: opened by the doctor and not already taken. */
export function bookableSlots(s: MarketState, doctorId: string, day: string): string[] {
  return SLOTS.filter((slot) => isOpen(s, doctorId, day, slot) && !isBooked(s, doctorId, day, slot));
}

export function nextOpen(s: MarketState, doctorId: string): { day: string; slot: string } | null {
  for (const day of DAYS) {
    const slot = bookableSlots(s, doctorId, day)[0];
    if (slot) return { day, slot };
  }
  return null;
}

/** Only verified doctors are visible to patients. */
export function listedDoctors(s: MarketState): Doctor[] {
  return DOCTORS.filter((d) => s.verification[d.id] === "verified");
}

export class BookingError extends Error {}

export function book(s: MarketState, b: Omit<Booking, "id">): MarketState {
  if (s.verification[b.doctorId] !== "verified") throw new BookingError("This doctor isn't verified yet.");
  if (!bookableSlots(s, b.doctorId, b.day).includes(b.slot)) throw new BookingError("That slot was just taken or closed — please pick another.");
  return { ...s, bookings: [...s.bookings, { ...b, id: `b${s.bookings.length + 1}-${b.doctorId}-${b.day}-${b.slot}` }] };
}

/** Doctors can open/close hours, but can't close a slot a patient has already booked. */
export function toggleHour(s: MarketState, doctorId: string, day: string, slot: string): MarketState {
  if (isBooked(s, doctorId, day, slot)) return s;
  const key = slotKey(day, slot);
  return { ...s, availability: { ...s.availability, [doctorId]: { ...s.availability[doctorId], [key]: !s.availability[doctorId][key] } } };
}

export function setVerification(s: MarketState, doctorId: string, v: Verification): MarketState {
  return { ...s, verification: { ...s.verification, [doctorId]: v } };
}

const order = (b: Booking) => DAYS.indexOf(b.day) * 100 + SLOTS.indexOf(b.slot);

export function scheduleFor(s: MarketState, doctorId: string): Booking[] {
  return s.bookings.filter((b) => b.doctorId === doctorId).sort((a, b) => order(a) - order(b));
}

export function bookingsForPatient(s: MarketState, patient: string): Booking[] {
  return s.bookings.filter((b) => b.patient === patient).sort((a, b) => order(a) - order(b));
}

export function openHourCount(s: MarketState, doctorId: string): number {
  return DAYS.reduce((n, day) => n + bookableSlots(s, doctorId, day).length, 0);
}
