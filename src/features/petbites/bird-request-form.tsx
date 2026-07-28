import { Bird, CheckCircle2, LoaderCircle, MessageCirclePlus, Send } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitBirdRequest } from "@/lib/request-service";

import { useLanguage } from "./language";

const COOLDOWN_KEY = "petbites:last-bird-request";
const COOLDOWN_MS = 60_000;

export function BirdRequestForm() {
  const { t } = useLanguage();
  const [birdName, setBirdName] = useState("");
  const [localName, setLocalName] = useState("");
  const [scientificName, setScientificName] = useState("");
  const [reason, setReason] = useState("");
  const [contact, setContact] = useState("");
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (birdName.trim().length < 2) {
      setError(t("request.validationName"));
      return;
    }

    if (reason.trim().length < 10) {
      setError(t("request.validationReason"));
      return;
    }

    try {
      const lastRequest = Number(window.localStorage.getItem(COOLDOWN_KEY) ?? "0");
      if (Date.now() - lastRequest < COOLDOWN_MS) {
        setError(t("request.cooldown"));
        return;
      }
    } catch {
      // The database still validates each request when browser storage is unavailable.
    }

    setBusy(true);
    try {
      await submitBirdRequest({
        birdName,
        localName,
        scientificName,
        reason,
        contact,
        website,
      });

      try {
        window.localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
      } catch {
        // A successful request does not depend on browser storage.
      }

      setSent(true);
      setBirdName("");
      setLocalName("");
      setScientificName("");
      setReason("");
      setContact("");
      setWebsite("");
    } catch (caught) {
      setError(messageFrom(caught, t("request.error")));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="bird-request-section reveal-section" aria-labelledby="bird-request-title">
      <div className="bird-request-section__intro">
        <span className="bird-request-section__icon" aria-hidden="true">
          <MessageCirclePlus className="h-5 w-5" />
        </span>
        <p className="eyebrow">{t("request.eyebrow")}</p>
        <h2 id="bird-request-title">{t("request.title")}</h2>
        <p>{t("request.copy")}</p>
        <div className="bird-request-section__flow" aria-label={t("request.flowLabel")}>
          <span>
            <strong>1</strong>
            {t("request.flowSend")}
          </span>
          <span>
            <strong>2</strong>
            {t("request.flowReview")}
          </span>
          <span>
            <strong>3</strong>
            {t("request.flowPublish")}
          </span>
        </div>
      </div>

      {sent ? (
        <div className="bird-request-success" role="status">
          <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
          <h3>{t("request.successTitle")}</h3>
          <p>{t("request.successCopy")}</p>
          <Button type="button" variant="outline" onClick={() => setSent(false)}>
            {t("request.sendAnother")}
          </Button>
        </div>
      ) : (
        <form className="bird-request-form" onSubmit={submit}>
          <div className="bird-request-form__heading">
            <Bird className="h-5 w-5" aria-hidden="true" />
            <span>
              <strong>{t("request.formTitle")}</strong>
              <small>{t("request.formCopy")}</small>
            </span>
          </div>

          <div className="bird-request-form__grid">
            <label>
              <span>{t("request.birdName")}</span>
              <Input
                value={birdName}
                onChange={(event) => setBirdName(event.target.value)}
                maxLength={120}
                autoComplete="off"
                placeholder={t("request.birdNamePlaceholder")}
                required
              />
            </label>
            <label>
              <span>{t("request.localName")}</span>
              <Input
                value={localName}
                onChange={(event) => setLocalName(event.target.value)}
                maxLength={120}
                autoComplete="off"
                placeholder={t("request.localNamePlaceholder")}
              />
            </label>
            <label>
              <span>{t("request.scientificName")}</span>
              <Input
                value={scientificName}
                onChange={(event) => setScientificName(event.target.value)}
                maxLength={160}
                autoComplete="off"
                placeholder={t("request.scientificNamePlaceholder")}
              />
            </label>
            <label>
              <span>{t("request.contact")}</span>
              <Input
                value={contact}
                onChange={(event) => setContact(event.target.value)}
                maxLength={180}
                autoComplete="email"
                placeholder={t("request.contactPlaceholder")}
              />
            </label>
            <label className="bird-request-form__wide">
              <span>{t("request.reason")}</span>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                maxLength={1200}
                rows={4}
                placeholder={t("request.reasonPlaceholder")}
                required
              />
              <small>{reason.length}/1200</small>
            </label>
          </div>

          <label className="bird-request-form__honeypot" aria-hidden="true">
            Website
            <Input
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              autoComplete="off"
              tabIndex={-1}
            />
          </label>

          {error && (
            <p className="bird-request-form__error" role="alert">
              {error}
            </p>
          )}

          <div className="bird-request-form__actions">
            <p>{t("request.privacy")}</p>
            <Button type="submit" disabled={busy} className="gap-2">
              {busy ? (
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="h-4 w-4" aria-hidden="true" />
              )}
              {busy ? t("request.sending") : t("request.submit")}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}

function messageFrom(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object" && error && "message" in error) return String(error.message);
  return fallback;
}
