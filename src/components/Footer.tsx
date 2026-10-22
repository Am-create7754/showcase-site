import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, ArrowUpRight, Check, Copy, Github } from "lucide-react";
import { PROFILE } from "../data/profile";
import { Decode } from "./motion";
import { CONTACT_LIMITS, CONTACT_TOPICS, contactPayload, safeExternalUrl, safeMailto, validateContact, type ContactField } from "../lib/security";

type SendState = "idle" | "sending" | "sent" | "failed";
const SEND_TIMEOUT_MS = 10_000;

function FieldError({ id, msg }: { id: string; msg?: string }) {
  return msg ? (
    <span id={id} className="field-error">
      {msg}
    </span>
  ) : null;
}

/**
 * Posts to Netlify Forms. Validation here gives fast, accessible feedback and drops junk early;
 * Netlify's spam filtering is the server-side control. A success message is shown only when
 * the host actually accepted the submission.
 */
function ContactForm() {
  const [state, setState] = useState<SendState>("idle");
  const [errors, setErrors] = useState<Partial<Record<ContactField, string>>>({});
  const mailto = safeMailto(PROFILE.email);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state === "sending") return;
    const form = e.currentTarget;
    const result = validateContact(Object.fromEntries(new FormData(form)));
    if (!result.ok) {
      if (result.spam) {
        setState("failed");
        return;
      }
      setErrors(result.errors);
      setState("idle");
      form.querySelector<HTMLElement>(`[name="${Object.keys(result.errors)[0]}"]`)?.focus();
      return;
    }
    setErrors({});
    setState("sending");
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), SEND_TIMEOUT_MS);
    try {
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: contactPayload(result.data),
        signal: ctrl.signal,
        credentials: "same-origin",
      });
      if (!res.ok) throw new Error("rejected");
      setState("sent");
      form.reset();
    } catch {
      setState("failed");
    } finally {
      clearTimeout(timer);
    }
  };

  if (state === "sent") {
    return (
      <div className="form-sent" role="status">
        <Check aria-hidden="true" strokeWidth={1.5} /> Sent. Thank you — I'll reply as soon as I can.
      </div>
    );
  }

  const invalid = (f: ContactField) => (errors[f] ? { "aria-invalid": true as const, "aria-describedby": `err-${f}` } : {});

  return (
    <form className="contact-form" name="contact" method="POST" onSubmit={submit} noValidate>
      <input type="hidden" name="form-name" value="contact" />
      <p className="sr-only" aria-hidden="true">
        <label>
          Leave this empty <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>
      <div className="field-row">
        <label className="field">
          <span className="label label--sm">Name</span>
          <input name="name" required autoComplete="name" maxLength={CONTACT_LIMITS.name} {...invalid("name")} />
          <FieldError id="err-name" msg={errors.name} />
        </label>
        <label className="field">
          <span className="label label--sm">Email</span>
          <input name="email" type="email" required autoComplete="email" maxLength={CONTACT_LIMITS.email} {...invalid("email")} />
          <FieldError id="err-email" msg={errors.email} />
        </label>
      </div>
      <label className="field">
        <span className="label label--sm">About</span>
        <select name="need" defaultValue={CONTACT_TOPICS[0]} {...invalid("need")}>
          {CONTACT_TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <FieldError id="err-need" msg={errors.need} />
      </label>
      <label className="field">
        <span className="label label--sm">Message</span>
        <textarea name="message" rows={4} required minLength={CONTACT_LIMITS.messageMin} maxLength={CONTACT_LIMITS.message} {...invalid("message")} />
        <FieldError id="err-message" msg={errors.message} />
      </label>
      <div className="form-foot">
        <button type="submit" className="btn btn--primary" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Send message"}
        </button>
        {state === "failed" && (
          <p className="form-error" role="alert">
            Couldn't send your message. {mailto ? <>Please email me directly at <a href={mailto}>{PROFILE.email}</a>.</> : "Please reach out through GitHub."}
          </p>
        )}
      </div>
    </form>
  );
}

export function EmailLink() {
  const [copied, setCopied] = useState(false);
  const mailto = safeMailto(PROFILE.email);
  if (!mailto) {
    return (
      <span className="placeholder-tag" title="Set PROFILE.email in src/data/profile.ts">
        Email — add before submitting
      </span>
    );
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email!);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — the mailto link still works */
    }
  };
  return (
    <span className="email-line">
      <a className="text-link" href={mailto}>
        {PROFILE.email}
      </a>
      <button type="button" className="icon-btn icon-btn--sm" onClick={copy} aria-label="Copy email address">
        {copied ? <Check aria-hidden="true" strokeWidth={1.5} /> : <Copy aria-hidden="true" strokeWidth={1.5} />}
      </button>
    </span>
  );
}

export function Footer() {
  return (
    <footer className="site-footer paper-grid" id="contact">
      <div className="wrap">
        <p className="sec-label label">
          <b>§ —</b> Contact
        </p>
        <div className="footer-grid">
          <div>
            <Decode as="h2" className="h1 footer-head" text="Interested in building tools that make creative work *better*." />
            <p className="lede muted footer-lede">Have a workflow that feels heavier than it should? I'd like to hear about it.</p>
            <ul className="footer-links">
              <li>
                <span className="label label--sm muted">Email</span>
                <EmailLink />
              </li>
              <li>
                <span className="label label--sm muted">GitHub</span>
                <a className="text-link" href={safeExternalUrl(PROFILE.links.github) ?? undefined} target="_blank" rel="noopener noreferrer">
                  <Github aria-hidden="true" strokeWidth={1.5} /> github.com/Am-create7754 <ArrowUpRight aria-hidden="true" strokeWidth={1.5} />
                </a>
              </li>
              <li>
                <span className="label label--sm muted">LinkedIn</span>
                <a className="text-link" href={safeExternalUrl(PROFILE.links.linkedin) ?? undefined} target="_blank" rel="noopener noreferrer">
                  amber-sahay <ArrowUpRight aria-hidden="true" strokeWidth={1.5} />
                </a>
              </li>
              <li>
                <span className="label label--sm muted">Resume</span>
                <Link className="text-link" to="/resume">
                  View resume <ArrowUpRight aria-hidden="true" strokeWidth={1.5} />
                </Link>
              </li>
            </ul>
          </div>
          <ContactForm />
        </div>
        <div className="footer-bottom label label--sm">
          <span>© {new Date().getFullYear()} {PROFILE.name}</span>
          <span className="muted">Built by a human, with a little help.</span>
          <button type="button" className="back-top" onClick={() => window.scrollTo({ top: 0 })}>
            Back to top <ArrowUp aria-hidden="true" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </footer>
  );
}
