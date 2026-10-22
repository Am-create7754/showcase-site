import { useEffect, useRef, useState } from "react";
import { HERO_QA } from "../data/profile";
import { prefersReducedMotion, useMediaQuery } from "../lib/hooks";
import { Stream } from "./motion";

/** Hero console: types a question, streams a pre-written answer, loops. No model is called. */
export function PromptConsole() {
  const reduced = prefersReducedMotion();
  const small = useMediaQuery("(max-width: 699px)");
  const [idx, setIdx] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [typed, setTyped] = useState(reduced ? HERO_QA[0].q.length : 0);
  const [auto, setAuto] = useState(!reduced);
  const shown = useRef(1);
  const pair = HERO_QA[idx];
  const answering = typed >= pair.q.length;

  useEffect(() => {
    if (typed >= pair.q.length) return;
    const t = setTimeout(() => setTyped((n) => n + 1), 32);
    return () => clearTimeout(t);
  }, [typed, pair.q.length]);

  const goTo = (next: number, manual: boolean) => {
    if (manual) setAuto(false);
    setPrev(idx);
    setIdx(next);
    setTyped(reduced ? HERO_QA[next].q.length : 0);
    shown.current += 1;
  };

  const nextTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(nextTimer.current), []);
  const onAnswerDone = () => {
    if (!auto || (small && shown.current >= 2)) return;
    clearTimeout(nextTimer.current);
    nextTimer.current = setTimeout(() => goTo((idx + 1) % HERO_QA.length, false), 2400);
  };

  return (
    <div className="console reg">
      <div className="console-head">
        <span className="console-lights" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="console-title">ask-amber.ai</span>
        <span className="console-live">
          <span className="dot dot--live" aria-hidden="true" /> LIVE
        </span>
      </div>

      <div className="console-body" aria-hidden="true">
        {prev !== null && (
          <div className="console-pair is-prev" key={`p-${prev}-${idx}`}>
            <p className="console-q">
              <span className="prompt-mark">&gt;</span> {HERO_QA[prev].q}
            </p>
            <p className="console-a">{HERO_QA[prev].a}</p>
          </div>
        )}
        <div className="console-pair" key={`c-${idx}-${shown.current}`}>
          <p className="console-q">
            <span className="prompt-mark">&gt;</span> {pair.q.slice(0, typed)}
            {!answering && <span className="caret">▍</span>}
          </p>
          {answering ? (
            <Stream as="p" className="console-a" text={pair.a} start msPerWord={42} onDone={onAnswerDone} caretHold={2200} />
          ) : (
            <p className="console-a console-thinking">
              <span className="label label--sm">thinking</span>
              <span className="thinking-dots">
                <i />
                <i />
                <i />
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Screen readers get the whole conversation as static text */}
      <dl className="sr-only">
        {HERO_QA.map((qa) => (
          <div key={qa.q}>
            <dt>{qa.q}</dt>
            <dd>{qa.a}</dd>
          </div>
        ))}
      </dl>

      <div className="console-foot">
        <span className="label label--sm muted">Ask:</span>
        <div className="chips">
          {HERO_QA.map((qa, i) => (
            <button key={qa.chip} type="button" className="chip" aria-pressed={i === idx} onClick={() => goTo(i, true)}>
              {qa.chip}
            </button>
          ))}
        </div>
      </div>
      <p className="console-disclaimer label label--sm">Pre-written answers · no live model</p>
    </div>
  );
}
