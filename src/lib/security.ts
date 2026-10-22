// Security helpers for the few places where data crosses a trust boundary:
// outbound links and the contact form. Pure functions so they can be unit-tested.

/* ───────────── Outbound URLs ───────────── */

/**
 * Hosts this site is allowed to link out to. Links are built from repository data,
 * not user input, but an allowlist means a typo or a bad edit can't introduce a
 * `javascript:` URL or an unexpected destination.
 */
export const ALLOWED_LINK_HOSTS = ["github.com", "www.linkedin.com", "linkedin.com", "aryan-sahay.netlify.app"] as const;

/** Returns the URL only if it is https and on the allowlist; otherwise null. */
export function safeExternalUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.username || url.password) return null;
  if (!(ALLOWED_LINK_HOSTS as readonly string[]).includes(url.hostname)) return null;
  return url.href;
}

// Deliberately conservative: one @, no spaces, quotes, angle brackets or control characters.
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

/** A `mailto:` href for a known-good address, or null. */
export function safeMailto(email: string | null | undefined): string | null {
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) return null;
  return `mailto:${email}`;
}

/* ───────────── Contact form ───────────── */

export const CONTACT_LIMITS = { name: 80, email: 254, messageMin: 10, message: 2000 } as const;
export const CONTACT_TOPICS = ["Internship opportunity", "Question about a project", "Collaboration", "Other"] as const;

export interface ContactInput {
  name: string;
  email: string;
  need: string;
  message: string;
}

export type ContactField = keyof ContactInput;

export type ContactResult =
  | { ok: true; data: ContactInput }
  | { ok: false; spam: true }
  | { ok: false; spam: false; errors: Partial<Record<ContactField, string>> };

// Control characters other than tab/newline. Line breaks are also rejected in
// single-line fields because they enable header injection if a value ever reaches an email header.
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const LINE_BREAK = /[\r\n\u2028\u2029]/;

/**
 * Validates and normalises a contact submission. Only known fields are read, so
 * anything extra a bot posts is dropped. The honeypot must be empty.
 *
 * This runs in the browser, which improves feedback and blocks careless abuse, but it is
 * not a security boundary — Netlify Forms (spam filtering) is the server-side control.
 */
export function validateContact(form: Record<string, unknown>): ContactResult {
  const str = (k: string) => (typeof form[k] === "string" ? (form[k] as string) : "");
  if (str("bot-field").trim() !== "") return { ok: false, spam: true };

  const name = str("name").replace(CONTROL, "").trim();
  const email = str("email").trim();
  const need = str("need");
  const message = str("message").replace(CONTROL, "").replace(/\r\n?/g, "\n").trim();
  const errors: Partial<Record<ContactField, string>> = {};

  if (!name) errors.name = "Please enter your name.";
  else if (name.length > CONTACT_LIMITS.name) errors.name = `Name must be ${CONTACT_LIMITS.name} characters or fewer.`;
  else if (LINE_BREAK.test(str("name"))) errors.name = "Name can't contain line breaks.";

  if (!email) errors.email = "Please enter your email address.";
  else if (email.length > CONTACT_LIMITS.email || LINE_BREAK.test(email) || !EMAIL_RE.test(email)) errors.email = "Please enter a valid email address.";

  if (!(CONTACT_TOPICS as readonly string[]).includes(need)) errors.need = "Please choose a topic from the list.";

  if (message.length < CONTACT_LIMITS.messageMin) errors.message = `Please write at least ${CONTACT_LIMITS.messageMin} characters.`;
  else if (message.length > CONTACT_LIMITS.message) errors.message = `Message must be ${CONTACT_LIMITS.message} characters or fewer.`;

  if (Object.keys(errors).length) return { ok: false, spam: false, errors };
  return { ok: true, data: { name, email, need, message } };
}

/** Builds the exact form-encoded body Netlify Forms expects — known fields only. */
export function contactPayload(data: ContactInput): string {
  return new URLSearchParams({ "form-name": "contact", "bot-field": "", ...data }).toString();
}
