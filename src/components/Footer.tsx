import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, ArrowUpRight, Check, Copy, Github } from "lucide-react";
import { PROFILE } from "../data/profile";
import { Decode } from "./motion";

type SendState = "idle" | "sending" | "sent" | "error";

function ContactForm() {
  const [state, setState] = useState<SendState>("idle");
  const [error, setError] = useState("");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (String(data.get("bot-field") ?? "")) return; // honeypot
    const message = String(data.get("message") ?? "").trim();
    if (message.length < 10) {
      setState("error");
      setError("Please write a slightly longer message (10+ characters).");
      return;
    }
    setState("sending");
    try {
      const body = new URLSearchParams();
      data.forEach((v, k) => body.append(k, String(v)));
      const res = await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() });
      if (!res.ok) throw new Error(String(res.status));
      setState("sent");
      form.reset();
    } catch {
      setState("error");
      setError("Couldn't send — the form only delivers on the deployed site. Please reach out through GitHub instead.");
    }
  };

  if (state === "sent") {
    return (
      <div className="form-sent" role="status">
        <Check aria-hidden="true" strokeWidth={1.5} /> Sent. Thank you — I'll reply as soon as I can.
      </div>
    );
  }

  return (
    <form className="contact-form" name="contact" method="POST" onSubmit={submit} noValidate={false}>
      <input type="hidden" name="form-name" value="contact" />
      <p className="sr-only">
        <label>
          Leave this empty <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>
      <div className="field-row">
        <label className="field">
          <span className="label label--sm">Name</span>
          <input name="name" required autoComplete="name" maxLength={80} />
        </label>
        <label className="field">
          <span className="label label--sm">Email</span>
          <input name="email" type="email" required autoComplete="email" maxLength={120} />
        </label>
      </div>
      <label className="field">
        <span className="label label--sm">About</span>
        <select name="need" defaultValue="Internship opportunity">
          <option>Internship opportunity</option>
          <option>Question about a project</option>
          <option>Collaboration</option>
          <option>Other</option>
        </select>
      </label>
      <label className="field">
        <span className="label label--sm">Message</span>
        <textarea name="message" rows={4} required maxLength={2000} />
      </label>
      <div className="form-foot">
        <button type="submit" className="btn btn--primary" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Send message"}
        </button>
        {state === "error" && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}

export function EmailLink() {
  const [copied, setCopied] = useState(false);
  if (!PROFILE.email) {
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
      <a className="text-link" href={`mailto:${PROFILE.email}`}>
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
                <a className="text-link" href={PROFILE.links.github} target="_blank" rel="noopener noreferrer">
                  <Github aria-hidden="true" strokeWidth={1.5} /> github.com/Am-create7754 <ArrowUpRight aria-hidden="true" strokeWidth={1.5} />
                </a>
              </li>
              <li>
                <span className="label label--sm muted">LinkedIn</span>
                <a className="text-link" href={PROFILE.links.linkedin} target="_blank" rel="noopener noreferrer">
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
