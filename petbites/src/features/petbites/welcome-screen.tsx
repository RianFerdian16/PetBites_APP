import { useEffect, useRef, useState } from "react";

import { BrandMark, FlyingBird } from "./illustrations";
import { useLanguage } from "./language";

const WELCOME_SESSION_KEY = "petbites:welcome-seen:v9-production-smooth";
const WELCOME_DURATION_MS = 2700;
const REDUCED_MOTION_DURATION_MS = 520;
const EXIT_DURATION_MS = 320;

export function WelcomeScreen() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const removeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let hasSeenWelcome = false;
    let cancelled = false;
    let started = false;
    let leaveTimer: number | null = null;
    let fallbackTimer: number | null = null;

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

    function beginAnimation() {
      if (cancelled || started) return;
      started = true;
      if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          if (cancelled) return;
          setReady(true);

          leaveTimer = window.setTimeout(
            () => setLeaving(true),
            Math.max(0, duration - EXIT_DURATION_MS),
          );
          removeTimerRef.current = window.setTimeout(() => setVisible(false), duration);
        });
      });
    }

    const assetSources = ["/welcome/flying-bird.webp", "/welcome/flying-bird-wing.webp"];

    const assetPromises = assetSources.map(
      (source) =>
        new Promise<void>((resolve) => {
          const image = new Image();
          image.src = source;

          const finish = () => resolve();
          image.onload = finish;
          image.onerror = finish;

          if (image.complete) {
            if (typeof image.decode === "function") {
              void image
                .decode()
                .catch(() => undefined)
                .finally(finish);
            } else {
              finish();
            }
          }
        }),
    );

    void Promise.all(assetPromises).then(beginAnimation);
    fallbackTimer = window.setTimeout(beginAnimation, 900);

    return () => {
      cancelled = true;
      if (leaveTimer !== null) window.clearTimeout(leaveTimer);
      if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);
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
      className={`welcome-screen ${ready ? "welcome-screen--ready" : ""} ${
        leaving ? "welcome-screen--leaving" : ""
      }`}
      role="status"
      aria-live="polite"
      aria-label={t("welcome.aria")}
    >
      <button type="button" className="welcome-screen__skip" onClick={dismiss}>
        {t("welcome.skip")}
      </button>

      <div className="welcome-screen__sky" />
      <FlyingBird />

      <div className="welcome-screen__content">
        <div className="welcome-screen__logo">
          <BrandMark />
        </div>
        <p className="welcome-screen__eyebrow">{t("welcome.eyebrow")}</p>
        <h1>PetBites</h1>
        <p className="welcome-screen__copy">{t("welcome.copy")}</p>
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
