export const FEEDBACK_MAX_LENGTH = 1000;
export const FEEDBACK_PAGE_SIZE = 20;
export type Feedback = { id: string; message: string; created_at: string };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateFeedback(input: unknown): { id: string; message: string } | null {
  if (!input || typeof input !== "object") return null;
  const { id, message } = input as Record<string, unknown>;
  if (typeof id !== "string" || !uuid.test(id) || typeof message !== "string") return null;
  const clean = message.trim();
  if (!clean || clean.length > FEEDBACK_MAX_LENGTH || /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(clean)) return null;
  return { id, message: clean };
}

export function feedbackCursor(row: Feedback): string {
  return `${row.created_at}|${row.id}`;
}

export function parseFeedbackCursor(value: string): { timestamp: string; id: string } | null {
  const parts = value.split("|");
  if (parts.length !== 2 || !uuid.test(parts[1])) return null;
  // Keep Postgres microseconds intact so pagination doesn't skip equal timestamps.
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|\+00:00)$/.test(parts[0]) || !Number.isFinite(Date.parse(parts[0]))) return null;
  return { timestamp: parts[0], id: parts[1] };
}
