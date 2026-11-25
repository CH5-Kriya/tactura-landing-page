"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { FEEDBACK_MAX_LENGTH, type Feedback } from "@/lib/feedback";

type Page = { items: Feedback[]; nextCursor: string | null };

export function FeedbackBoard() {
  const [message, setMessage] = useState("");
  const [items, setItems] = useState<Feedback[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadedEarlier, setLoadedEarlier] = useState(false);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const submission = useRef<{ id: string; message: string } | null>(null);
  const sendingRef = useRef(false);
  const readVersion = useRef(0);
  const textarea = useRef<HTMLTextAreaElement>(null);

  const readFeedback = useCallback(async (before?: string) => {
    const version = ++readVersion.current;
    setLoading(true);
    try {
      const response = await fetch(`/api/feedback${before ? `?before=${encodeURIComponent(before)}` : ""}`, {
        cache: "no-store", signal: AbortSignal.timeout(12000),
      });
      if (!response.ok) throw new Error();
      const page: Page = await response.json();
      if (version !== readVersion.current) return;
      setItems((current) => before
        ? [...current, ...page.items.filter((row) => !current.some((item) => item.id === row.id))]
        : page.items);
      setNextCursor(page.nextCursor);
      setLoadedEarlier(Boolean(before));
      setListError("");
    } catch {
      if (version === readVersion.current) setListError("We couldn’t load feedback. Please try again.");
    } finally {
      if (version === readVersion.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void readFeedback();
    return () => { readVersion.current++; };
  }, [readFeedback]);

  useEffect(() => {
    if (loadedEarlier) return;
    const refresh = () => { if (!document.hidden) void readFeedback(); };
    const timer = window.setInterval(refresh, 15000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [loadedEarlier, readFeedback]);

  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(() => setSuccess(false), 8000);
    return () => window.clearTimeout(timer);
  }, [success]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sendingRef.current) return;
    const clean = message.trim();
    if (!clean) { setSubmitError("Write your feedback before sending."); textarea.current?.focus(); return; }
    if (clean.length > FEEDBACK_MAX_LENGTH) { setSubmitError("Keep your feedback within 1,000 characters."); return; }
    if (submission.current?.message !== clean) submission.current = { id: crypto.randomUUID(), message: clean };
    sendingRef.current = true;
    setSending(true);
    setSubmitError("");
    setSuccess(false);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission.current), signal: AbortSignal.timeout(15000),
      });
      const result: { item?: Feedback; error?: string } = await response.json();
      if (!response.ok || !result.item) throw new Error(result.error || "We couldn’t send your feedback. Please try again.");
      const item = result.item;
      setItems((current) => [item, ...current.filter((row) => row.id !== item.id)]);
      setMessage("");
      submission.current = null;
      setSuccess(true);
      void readFeedback();
      textarea.current?.focus();
    } catch (error) {
      setSubmitError(error instanceof Error && error.name !== "TimeoutError" && error.name !== "AbortError"
        ? error.message : "The connection timed out. Your feedback is still here. Please try again.");
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }

  return (
    <>
      <form className="feedback-form" onSubmit={submit} aria-busy={sending}>
        <textarea ref={textarea} id="feedback-message" name="feedback" rows={5} aria-label="Your feedback"
          value={message} maxLength={FEEDBACK_MAX_LENGTH} required disabled={sending}
          placeholder="What did you enjoy? What could be better?"
          aria-describedby={`feedback-count${submitError ? " feedback-error" : ""}`}
          aria-invalid={Boolean(submitError)}
          onChange={(event) => { setMessage(event.target.value); setSubmitError(""); setSuccess(false); }} />
        <div className="feedback-form-meta">
          <span id="feedback-count">{message.length} / {FEEDBACK_MAX_LENGTH}</span>
        </div>
        {submitError && <p id="feedback-error" className="feedback-error" role="alert">{submitError}</p>}
        <div className="feedback-submit-row">
          <button className="button button-primary" type="submit" disabled={sending}>
            {sending ? "Sending…" : "Send feedback"}
          </button>
          <p className="feedback-success" role="status">{success ? "Thank you! Your feedback is below. Ready for the next visitor." : ""}</p>
        </div>
      </form>
      <section className="feedback-wall" aria-labelledby="feedback-wall-title">
        <div className="feedback-wall-heading">
          <h2 id="feedback-wall-title">What you’re saying</h2>
          <button type="button" className="feedback-refresh" disabled={loading} onClick={() => void readFeedback()}>
            {loading ? "Refreshing…" : loadedEarlier ? "Latest feedback" : "Refresh"}
          </button>
        </div>
        {listError && <p className="feedback-error" role="status">{listError}</p>}
        {!listError && !loading && items.length === 0 && <p className="feedback-empty">No feedback yet. Be the first to share your thoughts.</p>}
        {loading && items.length === 0 && !listError && <p role="status" className="feedback-empty">Loading feedback…</p>}
        <ul className="feedback-list">
          {items.map((item) => (
            <li key={item.id}>
              <blockquote>{item.message}</blockquote>
              <time dateTime={item.created_at}>
                {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Makassar" }).format(new Date(item.created_at))} WITA
              </time>
            </li>
          ))}
        </ul>
        {nextCursor && <button type="button" className="button button-secondary feedback-more" disabled={loading}
          onClick={() => void readFeedback(nextCursor)}>{loading ? "Loading…" : "Show earlier feedback"}</button>}
      </section>
    </>
  );
}
