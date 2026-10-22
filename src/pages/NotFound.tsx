import { Link } from "react-router-dom";
import { useMeta } from "../lib/hooks";

export default function NotFound() {
  useMeta("Not found", "This page doesn't exist.");
  return (
    <section className="section paper-grid">
      <div className="wrap state-panel">
        <p className="label signal">404 · no validated route</p>
        <h1 className="h1">
          This page doesn't <em className="serif">exist</em>.
        </h1>
        <p className="lede muted">Rather than guess, here's where things actually are.</p>
        <div className="chips">
          <Link to="/" className="btn btn--primary">
            Home
          </Link>
          <Link to="/work" className="btn">
            Work
          </Link>
          <Link to="/about" className="btn">
            About
          </Link>
        </div>
      </div>
    </section>
  );
}
