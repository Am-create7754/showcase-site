import { Component, lazy, Suspense, useEffect, type ReactNode } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { BootLoader, Cursor, TokenCounter } from "./components/ambient";
import Home from "./pages/Home";

const Work = lazy(() => import("./pages/Work"));
const IplCase = lazy(() => import("./pages/IplCase"));
const GuardrailCase = lazy(() => import("./pages/GuardrailCase"));
const MaddocCase = lazy(() => import("./pages/MaddocCase"));
const DesignCase = lazy(() => import("./pages/DesignCase"));
const About = lazy(() => import("./pages/About"));
const Resume = lazy(() => import("./pages/Resume"));
const NotFound = lazy(() => import("./pages/NotFound"));

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      // wait a frame for lazy content, then scroll to the anchor
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView(), 60);
      return () => clearTimeout(t);
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="wrap section state-panel" role="alert">
        <p className="label signal">Error</p>
        <h1 className="h2">Something didn't load.</h1>
        <p className="muted">This section failed to render. Reloading usually fixes it — if not, the rest of the site still works.</p>
        <div className="chips">
          <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
            Reload page
          </button>
          <a className="btn" href="/">
            Go home
          </a>
        </div>
      </div>
    );
  }
}

function Loading() {
  return (
    <div className="wrap section state-panel" role="status" aria-live="polite">
      <p className="label muted">
        &gt; loading page<span className="caret">▍</span>
      </p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <BootLoader />
      <ScrollManager />
      <Header />
      <main id="main" tabIndex={-1}>
        <ErrorBoundary>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/work" element={<Work />} />
              <Route path="/work/ipl-intelligence" element={<IplCase />} />
              <Route path="/work/shadow-ai-guardrail" element={<GuardrailCase />} />
              <Route path="/work/maddoc" element={<MaddocCase />} />
              <Route path="/work/design-workflow-assistant" element={<DesignCase />} />
              <Route path="/about" element={<About />} />
              <Route path="/resume" element={<Resume />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <TokenCounter />
      <Cursor />
    </BrowserRouter>
  );
}
