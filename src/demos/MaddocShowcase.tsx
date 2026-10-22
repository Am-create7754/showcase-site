import { useMemo, useState } from "react";
import { BadgeCheck, Bot, CalendarDays, FileText, Pill, Search, ShieldCheck, Stethoscope, Video } from "lucide-react";
import {
  ASSISTANT_CHAT,
  ASSISTANT_CONTEXT,
  DAYS,
  DOCTOR_VIEW_ID,
  DOCTORS,
  PATIENT,
  SLOTS,
  SPECIALTIES,
  type Doctor,
  type Mode,
} from "../data/mock/maddoc";
import {
  book,
  bookableSlots,
  BookingError,
  bookingsForPatient,
  initialState,
  isBooked,
  isOpen,
  listedDoctors,
  nextOpen,
  openHourCount,
  scheduleFor,
  setVerification,
  toggleHour,
  type MarketState,
  type Verification,
} from "../lib/maddoc";

type View = "patient" | "doctor" | "admin";
const STEPS = ["Choose slot", "Your details", "Payment", "Confirmed"];
const doctorById = (id: string) => DOCTORS.find((d) => d.id === id)!;

function nextLabel(market: MarketState, id: string) {
  const n = nextOpen(market, id);
  return n ? `${n.day}, ${n.slot}` : "No open hours this week";
}

/* ───────────── Patient ───────────── */

function Booking({ doctor, market, onBook, onClose }: { doctor: Doctor; market: MarketState; onBook: (day: string, slot: string, mode: Mode, reason: string) => void; onClose: () => void }) {
  const firstDay = DAYS.find((d) => bookableSlots(market, doctor.id, d).length) ?? DAYS[0];
  const [step, setStep] = useState(0);
  const [day, setDay] = useState(firstDay);
  const [slot, setSlot] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>(doctor.mode[0]);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const slots = bookableSlots(market, doctor.id, day);
  const anyOpen = DAYS.some((d) => bookableSlots(market, doctor.id, d).length);

  const pay = () => {
    try {
      onBook(day, slot!, mode, reason.trim());
      setStep(3);
    } catch (e) {
      setError(e instanceof BookingError ? e.message : "Booking failed — please try again.");
      setSlot(null);
      setStep(0);
    }
  };

  return (
    <div className="md-profile">
      <div className="md-profile-head">
        <span className="md-av md-av--lg">{doctor.initials}</span>
        <div>
          <h4 className="md-h">
            {doctor.name} <BadgeCheck className="md-verified" aria-label="Verified" strokeWidth={1.75} />
          </h4>
          <p className="md-muted">
            {doctor.specialty} · {doctor.experience} yrs · {doctor.languages.join(", ")}
          </p>
        </div>
        <button type="button" className="md-link" onClick={onClose}>
          Back to results
        </button>
      </div>
      <p className="md-about">{doctor.about}</p>

      <ol className="md-steps" aria-label="Booking progress">
        {STEPS.map((s, i) => (
          <li key={s} className={i < step ? "done" : i === step ? "current" : ""} aria-current={i === step ? "step" : undefined}>
            <span>{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>

      {step === 0 &&
        (!anyOpen ? (
          <div className="md-empty">
            <p>{doctor.name} has no open hours this week. Switch to the Doctor view to open some.</p>
          </div>
        ) : (
          <div className="md-step">
            {error && (
              <p className="md-error" role="alert">
                {error}
              </p>
            )}
            <p className="md-label">Day</p>
            <div className="md-days" role="radiogroup" aria-label="Day">
              {DAYS.map((d) => {
                const n = bookableSlots(market, doctor.id, d).length;
                return (
                  <button
                    key={d}
                    type="button"
                    role="radio"
                    aria-checked={day === d}
                    disabled={!n}
                    className={day === d ? "on" : ""}
                    onClick={() => (setDay(d), setSlot(null))}
                  >
                    <b>{d}</b>
                    <small>{n ? `${n} open` : "full"}</small>
                  </button>
                );
              })}
            </div>
            <p className="md-label">Time · {day}</p>
            <div className="md-slots" role="radiogroup" aria-label="Time slots">
              {slots.map((s) => (
                <button key={s} type="button" role="radio" aria-checked={slot === s} className={slot === s ? "on" : ""} onClick={() => setSlot(s)}>
                  {s}
                </button>
              ))}
            </div>
            {doctor.mode.length > 1 && (
              <div className="md-filters" role="radiogroup" aria-label="Consultation mode">
                {doctor.mode.map((m) => (
                  <button key={m} type="button" role="radio" aria-checked={mode === m} aria-pressed={mode === m} onClick={() => setMode(m)}>
                    {m}
                  </button>
                ))}
              </div>
            )}
            <button type="button" className="md-btn" disabled={!slot} onClick={() => (setError(""), setStep(1))}>
              Continue
            </button>
          </div>
        ))}
      {step === 1 && (
        <div className="md-step">
          <label className="md-field">
            <span className="md-label">Reason for visit (shared only with {doctor.name})</span>
            <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. persistent dry cough" maxLength={120} />
          </label>
          <div className="md-row">
            <button type="button" className="md-btn md-btn--ghost" onClick={() => setStep(0)}>
              Back
            </button>
            <button type="button" className="md-btn" disabled={reason.trim().length < 3} onClick={() => setStep(2)}>
              Continue
            </button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="md-step">
          <div className="md-summary">
            <span>
              {day} · {slot} · {mode}
            </span>
            <b>₹{doctor.fee}</b>
          </div>
          <p className="md-muted md-small">In the product this opens Razorpay checkout. In this demo nothing is charged.</p>
          <div className="md-row">
            <button type="button" className="md-btn md-btn--ghost" onClick={() => setStep(1)}>
              Back
            </button>
            <button type="button" className="md-btn" onClick={pay}>
              Simulate payment
            </button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="md-step md-confirm" role="status">
          <ShieldCheck aria-hidden="true" strokeWidth={1.5} />
          <div>
            <p className="md-h">Appointment confirmed (demo)</p>
            <p className="md-muted">
              {doctor.name} · {day} {slot} · {mode}. It's now in <b>My care</b>
              {doctor.id === DOCTOR_VIEW_ID ? ", and in the doctor's schedule — switch to the Doctor view to see it." : "."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function PatientView({ market, onBook }: { market: MarketState; onBook: (doctorId: string, day: string, slot: string, mode: Mode, reason: string) => void }) {
  const [query, setQuery] = useState("");
  const [spec, setSpec] = useState("All");
  const [videoOnly, setVideoOnly] = useState(false);
  const [compare, setCompare] = useState<string[]>([]);
  const [open, setOpen] = useState<Doctor | null>(null);

  const list = useMemo(
    () =>
      listedDoctors(market)
        .filter((d) => spec === "All" || d.specialty === spec)
        .filter((d) => !videoOnly || d.mode.includes("Video"))
        .filter((d) => `${d.name} ${d.specialty} ${d.languages.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase())),
    [market, query, spec, videoOnly],
  );
  const toggleCompare = (id: string) => setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= 2 ? [c[1], id] : [...c, id]));
  const compared = listedDoctors(market).filter((d) => compare.includes(d.id));
  const mine = bookingsForPatient(market, PATIENT.name);

  return (
    <div className="md-patient">
      <section className="md-panel md-discover" aria-labelledby="md-find">
        <h4 id="md-find" className="md-h">
          Find a doctor
        </h4>
        {open ? (
          <Booking doctor={open} market={market} onBook={(day, slot, mode, reason) => onBook(open.id, day, slot, mode, reason)} onClose={() => setOpen(null)} />
        ) : (
          <>
            <label className="md-search">
              <Search aria-hidden="true" strokeWidth={1.5} />
              <span className="sr-only">Search doctors</span>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, specialty or language" />
            </label>
            <div className="md-filters">
              {SPECIALTIES.map((s) => (
                <button key={s} type="button" aria-pressed={spec === s} onClick={() => setSpec(s)}>
                  {s}
                </button>
              ))}
              <label className="md-check">
                <input type="checkbox" checked={videoOnly} onChange={(e) => setVideoOnly(e.target.checked)} /> Video only
              </label>
            </div>
            {list.length === 0 ? (
              <div className="md-empty">
                <p>No verified doctors match these filters.</p>
                <button
                  type="button"
                  className="md-link"
                  onClick={() => {
                    setQuery("");
                    setSpec("All");
                    setVideoOnly(false);
                  }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <ul className="md-docs">
                {list.map((d) => (
                  <li key={d.id} className="md-doc">
                    <span className="md-av">{d.initials}</span>
                    <div className="md-doc-info">
                      <p className="md-doc-name">
                        {d.name} <BadgeCheck className="md-verified" aria-label="Verified" strokeWidth={1.75} />
                      </p>
                      <p className="md-muted">
                        {d.specialty} · {d.experience} yrs · ₹{d.fee}
                      </p>
                      <p className="md-next">
                        <CalendarDays aria-hidden="true" strokeWidth={1.5} /> Next: {nextLabel(market, d.id)}
                      </p>
                    </div>
                    <div className="md-doc-actions">
                      <label className="md-check">
                        <input type="checkbox" checked={compare.includes(d.id)} onChange={() => toggleCompare(d.id)} /> Compare
                      </label>
                      <button type="button" className="md-btn md-btn--sm" onClick={() => setOpen(d)}>
                        View & book
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {compared.length === 2 && (
              <div className="md-compare" aria-live="polite">
                <p className="md-label">Side-by-side</p>
                <table>
                  <thead>
                    <tr>
                      <th scope="col">
                        <span className="sr-only">Attribute</span>
                      </th>
                      {compared.map((d) => (
                        <th key={d.id} scope="col">
                          {d.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(
                      [
                        ["Specialty", (d: Doctor) => d.specialty],
                        ["Experience", (d: Doctor) => `${d.experience} yrs`],
                        ["Fee", (d: Doctor) => `₹${d.fee}`],
                        ["Mode", (d: Doctor) => d.mode.join(", ")],
                        ["Next slot", (d: Doctor) => nextLabel(market, d.id)],
                        ["Languages", (d: Doctor) => d.languages.join(", ")],
                      ] as const
                    ).map(([k, f]) => (
                      <tr key={k}>
                        <th scope="row">{k}</th>
                        {compared.map((d) => (
                          <td key={d.id}>{f(d)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {compared.length === 1 && <p className="md-muted md-small">Select one more doctor to compare.</p>}
          </>
        )}
      </section>

      <div className="md-side">
        <section className="md-panel" aria-labelledby="md-dash">
          <h4 id="md-dash" className="md-h">
            My care · {PATIENT.name}
          </h4>
          <p className="md-label">Upcoming · {mine.length}</p>
          {mine.length === 0 ? (
            <p className="md-muted md-small">No appointments yet.</p>
          ) : (
            <ul className="md-upcoming-list">
              {mine.map((b) => (
                <li key={b.id} className="md-upcoming">
                  <Video aria-hidden="true" strokeWidth={1.5} />
                  <div>
                    <p>
                      <b>{doctorById(b.doctorId).name}</b>
                    </p>
                    <p className="md-muted md-small">
                      {b.day} · {b.slot} · {b.mode} · {b.reason}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="md-label">Prescriptions</p>
          <ul className="md-list">
            {PATIENT.prescriptions.map((r) => (
              <li key={r.name}>
                <Pill aria-hidden="true" strokeWidth={1.5} /> <span>{r.name}</span>
                <small className={r.status === "Active" ? "md-tag md-tag--on" : "md-tag"}>{r.status}</small>
              </li>
            ))}
          </ul>
          <p className="md-label">Records</p>
          <ul className="md-list">
            {PATIENT.records.map((r) => (
              <li key={r}>
                <FileText aria-hidden="true" strokeWidth={1.5} /> <span>{r}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="md-panel md-assistant" aria-labelledby="md-ai">
          <h4 id="md-ai" className="md-h">
            <Bot aria-hidden="true" strokeWidth={1.5} /> AI Health Assistant
          </h4>
          <div className="md-context">
            <span className="md-label">Context it may use:</span>
            {ASSISTANT_CONTEXT.map((c) => (
              <span key={c} className="md-tag md-tag--on">
                {c}
              </span>
            ))}
          </div>
          <div className="md-chat">
            {ASSISTANT_CHAT.map((m, i) => (
              <p key={i} className={`md-msg md-msg--${m.from}`}>
                {m.text}
              </p>
            ))}
          </div>
          <p className="md-disclaimer">Scripted example conversation. Not medical advice and not clinically validated.</p>
        </section>
      </div>
    </div>
  );
}

/* ───────────── Doctor ───────────── */

function DoctorView({ market, onToggle }: { market: MarketState; onToggle: (day: string, slot: string) => void }) {
  const me = doctorById(DOCTOR_VIEW_ID);
  const schedule = scheduleFor(market, me.id);
  const [selId, setSelId] = useState<string | null>(null);
  const appt = schedule.find((b) => b.id === selId) ?? schedule[0];
  return (
    <div className="md-doctor">
      <section className="md-panel" aria-labelledby="md-today">
        <h4 id="md-today" className="md-h">
          <Stethoscope aria-hidden="true" strokeWidth={1.5} /> This week · {me.name}
        </h4>
        {schedule.length === 0 ? (
          <p className="md-muted md-small">No appointments booked.</p>
        ) : (
          <ul className="md-schedule">
            {schedule.map((a) => (
              <li key={a.id}>
                <button type="button" aria-pressed={appt?.id === a.id} onClick={() => setSelId(a.id)}>
                  <b className="tnum">
                    {a.day} {a.slot}
                  </b>
                  <span>{a.patient}</span>
                  <small>
                    {a.reason} · {a.mode}
                  </small>
                </button>
              </li>
            ))}
          </ul>
        )}
        {appt && (
          <div className="md-summary-card">
            <p className="md-label">Before the consult · {appt.patient}</p>
            <p>
              <b>Reason:</b> {appt.reason}
            </p>
            <p className="md-muted md-small">Only information the patient has chosen to share is shown — prescriptions and records they've linked to this appointment.</p>
            {appt.mode === "Video" && (
              <span className="md-tag">
                <Video aria-hidden="true" strokeWidth={1.5} /> In the product, the Daily video room opens from here
              </span>
            )}
          </div>
        )}
      </section>
      <section className="md-panel" aria-labelledby="md-avail">
        <h4 id="md-avail" className="md-h">
          Availability · {openHourCount(market, me.id)} bookable slots
        </h4>
        <div className="md-avail" role="grid" aria-label="Weekly availability">
          <div role="row" className="md-avail-row">
            <span role="columnheader" />
            {DAYS.map((d) => (
              <span role="columnheader" key={d}>
                {d}
              </span>
            ))}
          </div>
          {SLOTS.map((s) => (
            <div role="row" key={s} className="md-avail-row">
              <span role="rowheader">{s}</span>
              {DAYS.map((d) => {
                const booked = isBooked(market, me.id, d, s);
                const open = isOpen(market, me.id, d, s);
                return (
                  <span role="gridcell" key={d}>
                    <button
                      type="button"
                      aria-pressed={open}
                      aria-label={`${d} ${s} ${booked ? "booked" : open ? "open" : "closed"}`}
                      className={booked ? "booked" : open ? "on" : ""}
                      disabled={booked}
                      title={booked ? "Booked by a patient" : undefined}
                      onClick={() => onToggle(d, s)}
                    />
                  </span>
                );
              })}
            </div>
          ))}
        </div>
        <p className="md-avail-legend md-muted md-small">
          <span>
            <i className="on" /> open
          </span>
          <span>
            <i /> closed
          </span>
          <span>
            <i className="booked" /> booked
          </span>
          Tap a cell to open or close it — patients see the change immediately.
        </p>
      </section>
    </div>
  );
}

/* ───────────── Admin ───────────── */

const QUEUE = DOCTORS.filter((d) => !d.verified);

function AdminView({ market, onVerify }: { market: MarketState; onVerify: (id: string, v: Verification) => void }) {
  const verified = DOCTORS.filter((d) => market.verification[d.id] === "verified").length;
  const awaiting = DOCTORS.length - verified;
  return (
    <div className="md-admin">
      <div className="md-stats">
        {[
          ["Verified doctors", verified],
          ["Awaiting verification", awaiting],
          ["Appointments this week", market.bookings.length],
        ].map(([k, v]) => (
          <div key={k as string} className="md-panel md-stat">
            <span className="md-label">{k}</span>
            <b className="tnum">{v}</b>
          </div>
        ))}
      </div>
      <section className="md-panel" aria-labelledby="md-verify">
        <h4 id="md-verify" className="md-h">
          Verification queue
        </h4>
        <ul className="md-queue">
          {QUEUE.map((d) => {
            const st = market.verification[d.id];
            return (
              <li key={d.id}>
                <span className="md-av">{d.initials}</span>
                <div>
                  <p className="md-doc-name">{d.name}</p>
                  <p className="md-muted">
                    {d.specialty} · registration document (sample) · {d.experience} yrs
                  </p>
                </div>
                {st === "verified" ? (
                  <div className="md-row">
                    <span className="md-tag md-tag--on" role="status">
                      Approved — now visible to patients
                    </span>
                    <button type="button" className="md-link" onClick={() => onVerify(d.id, "pending")}>
                      Undo
                    </button>
                  </div>
                ) : (
                  <div className="md-row">
                    {st === "info" && (
                      <span className="md-tag" role="status">
                        Info requested
                      </span>
                    )}
                    {st !== "info" && (
                      <button type="button" className="md-btn md-btn--sm md-btn--ghost" onClick={() => onVerify(d.id, "info")}>
                        Request info
                      </button>
                    )}
                    <button type="button" className="md-btn md-btn--sm" onClick={() => onVerify(d.id, "verified")}>
                      Approve
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

/* ───────────── Shell ───────────── */

export function MaddocShowcase() {
  const [view, setView] = useState<View>("patient");
  const [market, setMarket] = useState<MarketState>(initialState);
  const [activity, setActivity] = useState("Changes carry across roles — book as a patient, then switch to the Doctor view.");

  const onBook = (doctorId: string, day: string, slot: string, mode: Mode, reason: string) => {
    const next = book(market, { doctorId, day, slot, mode, patient: PATIENT.name, reason }); // throws BookingError if not bookable
    setMarket(next);
    const doc = doctorById(doctorId);
    setActivity(`Booked ${doc.name} · ${day} ${slot}.${doctorId === DOCTOR_VIEW_ID ? " Switch to Doctor to see it in the schedule." : ""}`);
  };
  const onToggle = (day: string, slot: string) => {
    setMarket((m) => toggleHour(m, DOCTOR_VIEW_ID, day, slot));
    setActivity(`Updated ${doctorById(DOCTOR_VIEW_ID).name}'s hours — patients now see the new slots.`);
  };
  const onVerify = (id: string, v: Verification) => {
    setMarket((m) => setVerification(m, id, v));
    const name = doctorById(id).name;
    setActivity(v === "verified" ? `${name} approved — now listed in the patient's search.` : v === "info" ? `Asked ${name} for more documents.` : `${name} moved back to the queue.`);
  };
  const reset = () => {
    setMarket(initialState());
    setActivity("Demo reset to its starting state.");
  };

  const views: { id: View; label: string; goal: string }[] = [
    { id: "patient", label: "Patient", goal: "Discover a doctor, understand options, book, manage care" },
    { id: "doctor", label: "Doctor", goal: "Manage availability, review shared context, run appointments" },
    { id: "admin", label: "Administrator", goal: "Verify doctors and oversee the marketplace" },
  ];
  return (
    <div className="demo md reg">
      <div className="demo-bar">
        <span className="label label--sm">MaDDoC · product showcase</span>
        <span className="demo-tag">Synthetic people & records · simulated flows</span>
      </div>
      <div className="md-roles" role="group" aria-label="View as">
        {views.map((v) => (
          <button key={v.id} type="button" aria-pressed={view === v.id} onClick={() => setView(v.id)}>
            <span className="md-role-name">{v.label}</span>
            <span className="md-role-goal">{v.goal}</span>
          </button>
        ))}
      </div>
      <div className="md-activity">
        <p role="status" aria-live="polite">
          {activity}
        </p>
        <button type="button" className="md-link" onClick={reset}>
          Reset demo
        </button>
      </div>
      <div className="md-stage">
        {view === "patient" && <PatientView market={market} onBook={onBook} />}
        {view === "doctor" && <DoctorView market={market} onToggle={onToggle} />}
        {view === "admin" && <AdminView market={market} onVerify={onVerify} />}
      </div>
    </div>
  );
}
