import { NextRequest, NextResponse } from "next/server";
import { createFeedbackClient } from "@/lib/supabase/server";
import { FEEDBACK_PAGE_SIZE, feedbackCursor, parseFeedbackCursor, validateFeedback, type Feedback } from "@/lib/feedback";

export const dynamic = "force-dynamic";
const fields = "id,message,created_at";
const unavailable = () => NextResponse.json({ error: "Feedback is unavailable right now. Please try again or ask the Tactura team." }, { status: 503, headers: { "Cache-Control": "no-store" } });

export async function GET(request: NextRequest) {
  const rawCursor = request.nextUrl.searchParams.get("before");
  const cursor = rawCursor ? parseFeedbackCursor(rawCursor) : null;
  if (rawCursor && !cursor) return NextResponse.json({ error: "Invalid page. Refresh to see the latest feedback." }, { status: 400 });
  const supabase = createFeedbackClient();
  if (!supabase) return unavailable();
  try {
    let query = supabase.from("exhibition_feedback").select(fields).eq("is_visible", true)
      .order("created_at", { ascending: false }).order("id", { ascending: false }).limit(FEEDBACK_PAGE_SIZE + 1);
    if (cursor) query = query.or(`created_at.lt.${cursor.timestamp},and(created_at.eq.${cursor.timestamp},id.lt.${cursor.id})`);
    const { data, error } = await query;
    if (error) { console.error("Feedback read failed:", error.code); return unavailable(); }
    const rows = (data ?? []) as Feedback[];
    const items = rows.slice(0, FEEDBACK_PAGE_SIZE);
    return NextResponse.json({ items, nextCursor: rows.length > FEEDBACK_PAGE_SIZE ? feedbackCursor(items[items.length - 1]) : null }, { headers: { "Cache-Control": "no-store" } });
  } catch { return unavailable(); }
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin) {
    let allowed = false;
    try {
      const source = new URL(origin);
      const host = request.headers.get("host") ?? request.nextUrl.host;
      allowed = source.host === host && source.protocol === request.nextUrl.protocol;
    } catch { /* Malformed origins are rejected. */ }
    if (!allowed) return NextResponse.json({ error: "Please send feedback from the Tactura website." }, { status: 403 });
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) return NextResponse.json({ error: "Invalid request." }, { status: 415 });
  const raw = await request.text();
  if (raw.length > 8000) return NextResponse.json({ error: "Your feedback is too long." }, { status: 413 });
  let input: unknown;
  try { input = JSON.parse(raw); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const feedback = validateFeedback(input);
  if (!feedback) return NextResponse.json({ error: "Write between 1 and 1,000 characters, then try again." }, { status: 400 });
  const supabase = createFeedbackClient();
  if (!supabase) return unavailable();
  try {
    const { data, error } = await supabase.from("exhibition_feedback").insert(feedback).select(fields).single();
    if (error?.code === "23505") {
      // A retry after a lost response must not publish the same submission twice.
      const existing = await supabase.from("exhibition_feedback").select(fields).eq("id", feedback.id).single();
      if (existing.data?.message === feedback.message) return NextResponse.json({ item: existing.data });
    }
    if (error) { console.error("Feedback insert failed:", error.code); return unavailable(); }
    return NextResponse.json({ item: data }, { status: 201 });
  } catch { return unavailable(); }
}
