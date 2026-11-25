import { beforeEach, describe, expect, mock, test } from "bun:test";
import { NextRequest } from "next/server";
import { feedbackCursor, parseFeedbackCursor, validateFeedback } from "../src/lib/feedback";

const id = "7bb74eb6-d2a6-48cd-b274-3a65130971ba";
const item = { id, message: "A test message", created_at: "2026-11-25T01:02:03.123456+00:00" };
let results = [];
let queries = [];
let configured = true;
class Query {
  select(...args) { queries.push({ method: "select", args }); return this; }
  insert(...args) { queries.push({ method: "insert", args }); return this; }
  eq(...args) { queries.push({ method: "eq", args }); return this; }
  order(...args) { queries.push({ method: "order", args }); return this; }
  limit(...args) { queries.push({ method: "limit", args }); return this; }
  or(...args) { queries.push({ method: "or", args }); return this; }
  single() { return Promise.resolve(results.shift()); }
  then(resolve) { return Promise.resolve(results.shift()).then(resolve); }
}
mock.module("@/lib/supabase/server", () => ({ createFeedbackClient: () => configured ? { from: () => new Query() } : null }));
const { GET, POST } = await import("../src/app/api/feedback/route");
const request = (body, origin = "http://localhost:3113") => new NextRequest("http://localhost:3113/api/feedback", {
  method: "POST", headers: { "Content-Type": "application/json", origin }, body: JSON.stringify(body),
});
beforeEach(() => { results = []; queries = []; configured = true; });

describe("feedback validation and pagination", () => {
  test("trims input and rejects empty, oversized and control-character messages", () => {
    expect(validateFeedback({ id, message: "  Thank you  " })).toEqual({ id, message: "Thank you" });
    for (const message of [" \n\t", "a".repeat(1001), "text\u0000text"]) expect(validateFeedback({ id, message })).toBeNull();
    expect(validateFeedback({ id, message: "a".repeat(1000) })).not.toBeNull();
    expect(validateFeedback({ id: "not-a-uuid", message: "Hello" })).toBeNull();
  });
  test("preserves microseconds and rejects unsafe cursors", () => {
    expect(parseFeedbackCursor(feedbackCursor(item))).toEqual({ timestamp: item.created_at, id });
    for (const cursor of [`2026-11-25T01:02:03Z,other.eq.true|${id}`, "not-a-date|bad", `2026-11-25T01:02:03Z|${id}|extra`]) expect(parseFeedbackCursor(cursor)).toBeNull();
  });
});
describe("feedback API (mock database)", () => {
  test("does not accept cross-origin or invalid submissions", async () => {
    expect((await POST(request({ id, message: "Hello" }, "https://example.com"))).status).toBe(403);
    expect((await POST(request({ id, message: "  " }))).status).toBe(400);
    expect(queries).toHaveLength(0);
  });
  test("uses the public Host header when Next.js has an internal origin", async () => {
    results.push({ data: item, error: null });
    const proxied = new NextRequest("http://localhost:3113/api/feedback", {
      method: "POST", headers: { host: "127.0.0.1:3113", origin: "http://127.0.0.1:3113", "content-type": "application/json" },
      body: JSON.stringify({ id, message: item.message }),
    });
    expect((await POST(proxied)).status).toBe(201);
  });
  test("accepts only sanitized fields, leaving timestamp and visibility to the database", async () => {
    results.push({ data: item, error: null });
    const response = await POST(request({ id, message: "  A test message ", is_visible: false, created_at: "fake" }));
    expect(response.status).toBe(201);
    expect(queries.find((q) => q.method === "insert")?.args).toEqual([{ id, message: item.message }]);
  });
  test("retry with the same id and text returns the saved entry without another entry", async () => {
    results.push({ data: null, error: { code: "23505" } }, { data: item, error: null });
    const response = await POST(request({ id, message: item.message }));
    expect(response.status).toBe(200);
    expect((await response.json()).item).toEqual(item);
  });
  test("a duplicate id with different text is not reported as successful", async () => {
    results.push({ data: null, error: { code: "23505" } }, { data: item, error: null });
    expect((await POST(request({ id, message: "Changed text" }))).status).toBe(503);
  });
  test("unconfigured storage returns an error rather than false success", async () => {
    configured = false;
    expect((await POST(request({ id, message: item.message }))).status).toBe(503);
    expect((await GET(new NextRequest("http://localhost:3113/api/feedback"))).status).toBe(503);
  });
  test("returns one page with an exclusive cursor and visibility filter", async () => {
    results.push({ data: Array.from({ length: 21 }, () => item), error: null });
    const response = await GET(new NextRequest("http://localhost:3113/api/feedback"));
    const page = await response.json();
    expect(page.items).toHaveLength(20);
    expect(page.nextCursor).toBe(feedbackCursor(item));
    expect(queries).toContainEqual({ method: "eq", args: ["is_visible", true] });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
  test("rejects malformed cursors before querying storage", async () => {
    expect((await GET(new NextRequest("http://localhost:3113/api/feedback?before=bad"))).status).toBe(400);
    expect(queries).toHaveLength(0);
  });
});
