import { useEffect, useRef, useState } from "react";
import { PROFILE } from "../data/profile";
import { prefersReducedMotion, useInView } from "../lib/hooks";
import { RegMarks } from "./motion";

/**
 * Full, uncropped portrait.
 * - Reveal: a scan line sweeps down while the photo "develops" from monochrome to colour.
 * - Face lock-on: focus brackets snap onto the face once, and return on hover.
 * - Hover (fine pointers): 3D tilt toward the cursor, counter-parallax on the photo, a soft moving light.
 * Falls back to the "AS" monogram if the photo fails to load. All motion is off for reduced-motion users.
 */
export function Portrait({ caption, className = "" }: { caption?: string; className?: string }) {
  const [ref, inView] = useInView<HTMLElement>({ threshold: 0.25 });
  const wrap = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(!PROFILE.photo);

  useEffect(() => {
    const el = wrap.current;
    if (!el || prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
    let raf = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty("--ry", `${(nx * 9).toFixed(2)}deg`);
        el.style.setProperty("--rx", `${(-ny * 9).toFixed(2)}deg`);
        el.style.setProperty("--px", `${(-nx * 12).toFixed(1)}px`);
        el.style.setProperty("--py", `${(-ny * 12).toFixed(1)}px`);
        el.style.setProperty("--gx", `${((nx + 0.5) * 100).toFixed(1)}%`);
        el.style.setProperty("--gy", `${((ny + 0.5) * 100).toFixed(1)}%`);
      });
    };
    const leave = () => {
      cancelAnimationFrame(raf);
      for (const k of ["--rx", "--ry", "--px", "--py", "--gx", "--gy"]) el.style.removeProperty(k);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div ref={wrap} className={`portrait-wrap ${className}`}>
      <span className="portrait-offset" aria-hidden="true" />
      <figure
        ref={ref}
        className={`portrait reg ${inView ? "is-in" : ""}`}
        style={!failed ? { aspectRatio: `${PROFILE.photo!.width} / ${PROFILE.photo!.height}` } : undefined}
      >
        <RegMarks />
        {failed ? (
          <span className="human-initials" aria-hidden="true">
            AS
          </span>
        ) : (
          <>
            <img
              className="portrait-img"
              src={PROFILE.photo!.src}
              width={PROFILE.photo!.width}
              height={PROFILE.photo!.height}
              alt={PROFILE.photo!.alt}
              loading="lazy"
              decoding="async"
              onError={() => setFailed(true)}
            />
            <span className="portrait-glare" aria-hidden="true" />
            <span className="portrait-focus" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
          </>
        )}
        {caption && <figcaption className="label label--sm portrait-caption">{caption}</figcaption>}
      </figure>
    </div>
  );
}
