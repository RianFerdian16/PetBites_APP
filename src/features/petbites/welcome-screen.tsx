import { useEffect, useRef, useState } from "react";

import { BrandMark, FlyingBird } from "./illustrations";

const WELCOME_SESSION_KEY = "petbites:welcome-seen:v1";
const WELCOME_DURATION_MS = 1800;
const REDUCED_MOTION_DURATION_MS = 520;
const EXIT_DURATION_MS = 280;

export function WelcomeScreen() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const removeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let hasSeenWelcome = false;

    try {
      hasSeenWelcome = window.sessionStorage.getItem(WELCOME_SESSION_KEY) === "1";
      if (!hasSeenWelcome) window.sessionStorage.setItem(WELCOME_SESSION_KEY, "1");
    } catch {
      // Storage can be blocked in private browsing. The welcome screen still works.
    }

    if (hasSeenWelcome) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reducedMotion ? REDUCED_MOTION_DURATION_MS : WELCOME_DURATION_MS;
    setVisible(true);

    const leaveTimer = window.setTimeout(
      () => setLeaving(true),
      Math.max(0, duration - EXIT_DURATION_MS),
    );
    removeTimerRef.current = window.setTimeout(() => setVisible(false), duration);

    return () => {
      window.clearTimeout(leaveTimer);
      if (removeTimerRef.current !== null) window.clearTimeout(removeTimerRef.current);
    };
  }, []);

  function dismiss() {
    setLeaving(true);
    if (removeTimerRef.current !== null) window.clearTimeout(removeTimerRef.current);
    removeTimerRef.current = window.setTimeout(() => setVisible(false), EXIT_DURATION_MS);
  }

  if (!visible) return null;

  return (
    <div
      className={`welcome-screen ${leaving ? "welcome-screen--leaving" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Selamat datang di PetBites"
    >
      <button type="button" className="welcome-screen__skip" onClick={dismiss}>
        Lewati
      </button>

      <div className="welcome-screen__sky" />
      <FlyingBird />

      <div className="welcome-screen__content">
        <div className="welcome-screen__logo">
          <BrandMark />
        </div>
        <p className="welcome-screen__eyebrow">Selamat datang di</p>
        <h1>PetBites</h1>
        <p className="welcome-screen__copy">
          Panduan pakan yang lebih mudah dipahami untuk burung kesayanganmu.
        </p>
        <div className="welcome-screen__loader" aria-hidden="true">
          <span />
        </div>
      </div>

      <div className="welcome-screen__ground" aria-hidden="true">
        <span className="welcome-screen__leaf welcome-screen__leaf--one" />
        <span className="welcome-screen__leaf welcome-screen__leaf--two" />
        <span className="welcome-screen__leaf welcome-screen__leaf--three" />
      </div>
    </div>
  );
}
