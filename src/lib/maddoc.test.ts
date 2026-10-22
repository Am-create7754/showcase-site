import { describe, expect, it } from "vitest";
import {
  book,
  bookableSlots,
  BookingError,
  bookingsForPatient,
  initialState,
  isOpen,
  listedDoctors,
  nextOpen,
  scheduleFor,
  setVerification,
  toggleHour,
} from "./maddoc";
import { PATIENT } from "../data/mock/maddoc";

describe("MaDDoC shared state", () => {
  it("only lists verified doctors to patients", () => {
    const s = initialState();
    expect(listedDoctors(s).map((d) => d.id)).not.toContain("d4");
    const approved = setVerification(s, "d4", "verified");
    expect(listedDoctors(approved).map((d) => d.id)).toContain("d4");
    expect(listedDoctors(setVerification(s, "d4", "info")).map((d) => d.id)).not.toContain("d4");
  });

  it("seeds bookings inside open hours and hides them from patients", () => {
    const s = initialState();
    for (const b of s.bookings) {
      expect(isOpen(s, b.doctorId, b.day, b.slot)).toBe(true);
      expect(bookableSlots(s, b.doctorId, b.day)).not.toContain(b.slot);
    }
  });

  it("a patient booking shows up in the doctor's schedule and the patient's care list", () => {
    const s = initialState();
    const slot = nextOpen(s, "d1")!;
    const after = book(s, { doctorId: "d1", day: slot.day, slot: slot.slot, mode: "Video", patient: PATIENT.name, reason: "Sore throat" });
    expect(scheduleFor(after, "d1").some((b) => b.reason === "Sore throat")).toBe(true);
    expect(bookingsForPatient(after, PATIENT.name).some((b) => b.reason === "Sore throat")).toBe(true);
    expect(bookableSlots(after, "d1", slot.day)).not.toContain(slot.slot);
  });

  it("rejects double bookings, closed hours and unverified doctors", () => {
    const s = initialState();
    const taken = s.bookings[0];
    expect(() => book(s, { ...taken })).toThrow(BookingError);
    expect(() => book(s, { doctorId: "d4", day: "Mon", slot: "10:00 am", mode: "In-clinic", patient: "x", reason: "y" })).toThrow(BookingError);
    const open = nextOpen(s, "d2")!;
    const closed = toggleHour(s, "d2", open.day, open.slot);
    expect(() => book(closed, { doctorId: "d2", day: open.day, slot: open.slot, mode: "Video", patient: "x", reason: "y" })).toThrow(BookingError);
  });

  it("doctor availability changes what patients can book", () => {
    const s = initialState();
    const open = nextOpen(s, "d1")!;
    const closed = toggleHour(s, "d1", open.day, open.slot);
    expect(bookableSlots(closed, "d1", open.day)).not.toContain(open.slot);
    expect(nextOpen(closed, "d1")).not.toEqual(open);
  });

  it("a booked hour can't be closed by the doctor", () => {
    const s = initialState();
    const b = s.bookings[0];
    expect(toggleHour(s, b.doctorId, b.day, b.slot)).toBe(s);
  });

  it("orders a schedule by day then time", () => {
    const sched = scheduleFor(initialState(), "d1").map((b) => `${b.day} ${b.slot}`);
    expect(sched).toEqual(["Mon 4:30 pm", "Mon 6:30 pm", "Tue 10:00 am"]);
  });
});
