import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Moon, Sun, X } from "lucide-react";
import { safeStorage } from "../lib/hooks";

const NAV = [
  { to: "/work", label: "Work", match: (p: string) => p.startsWith("/work") && !p.startsWith("/work/design-workflow-assistant") },
  { to: "/work/design-workflow-assistant", label: "Design Exploration", match: (p: string) => p.startsWith("/work/design-workflow-assistant") },
  { to: "/about", label: "About", match: (p: string) => p === "/about" },
  { to: "/resume", label: "Resume", match: (p: string) => p === "/resume" },
];

export function ThemeToggle() {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute("data-theme") ?? "light");
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    safeStorage("local").set("theme", next);
    setTheme(next);
    window.dispatchEvent(new Event("themechange"));
  };
  return (
    <button type="button" className="icon-btn" onClick={toggle} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} data-cursor="link">
      {theme === "dark" ? <Sun aria-hidden="true" strokeWidth={1.5} /> : <Moon aria-hidden="true" strokeWidth={1.5} />}
    </button>
  );
}

export function Header() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("a")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuBtn.current?.focus();
      }
    };
    window.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", key);
    };
  }, [open]);

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="wrap header-inner">
        <Link to="/" className="wordmark" aria-label="Amber Sahay — home" data-cursor="link">
          <span className="wordmark-name">Amber Sahay</span>
          <span className="wordmark-role label label--sm">AI Generalist · Design</span>
        </Link>

        <nav className="nav-desktop" aria-label="Primary">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className={`nav-link ${n.match(pathname) ? "is-active" : ""}`} aria-current={n.match(pathname) ? "page" : undefined}>
              {n.label}
            </Link>
          ))}
          <a href="#contact" className="nav-link nav-contact">
            Contact
          </a>
        </nav>

        <div className="header-actions">
          <ThemeToggle />
          <button
            ref={menuBtn}
            type="button"
            className="icon-btn menu-btn"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X aria-hidden="true" strokeWidth={1.5} /> : <Menu aria-hidden="true" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      <div id="mobile-menu" ref={panel} className={`mobile-menu ${open ? "is-open" : ""}`} hidden={!open}>
        <nav aria-label="Mobile" className="wrap">
          <ol>
            {[{ to: "/", label: "Home", match: (p: string) => p === "/" }, ...NAV].map((n, i) => (
              <li key={n.to}>
                <Link to={n.to} className={n.match(pathname) ? "is-active" : ""} aria-current={n.match(pathname) ? "page" : undefined}>
                  <span className="label label--sm">0{i}</span>
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <a href="#contact" onClick={() => setOpen(false)}>
                <span className="label label--sm">0{NAV.length + 1}</span>
                Contact
              </a>
            </li>
          </ol>
        </nav>
      </div>
    </header>
  );
}
