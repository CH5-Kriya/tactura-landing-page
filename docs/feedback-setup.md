# Exhibition feedback booth

Open `/feedback` on the booth computer. Visitors write one anonymous message, which is published below the form immediately. The form clears only after the server confirms the insert. Failed submissions keep their text; retrying the same submission does not create duplicates. The latest 20 entries refresh every 15 seconds while the page is visible. Earlier entries are available with “Show earlier feedback”; automatic refresh pauses while browsing earlier entries.

## One-time Supabase setup

Project: `tvvoxrasnzsxmcrfnmjr`.

1. Open the project's SQL Editor.
2. Run `supabase/migrations/202611250001_exhibition_feedback.sql` once. If the table already exists, inspect it before running this migration; do not drop existing data.
3. Confirm Row Level Security is enabled on `public.exhibition_feedback`.

The anonymous role can read visible entries and insert only `id` and `message`. It cannot update or delete entries, set timestamps, or change visibility. Feedback is public by design. Do not use this form to collect email addresses or other private details. Insert access is public (no account, CAPTCHA or booth access restriction); the origin check is not authentication or comprehensive spam protection. A closed booth-only service would need separate access controls.

To hide an entry, use Supabase Table Editor and set `is_visible` to `false`. It disappears from the latest list on the next refresh. Refresh the page to clear an entry already loaded in older pages. Keep critical feedback visible; use hiding for personal details, spam, or abuse.

## Vercel environment variables

Add these under Project → Settings → Environment Variables:

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://tvvoxrasnzsxmcrfnmjr.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | The `sb_publishable_...` key supplied for this project |

Enable Production (and Preview if you want preview deployments connected to this database), then redeploy. Local development reads these from the ignored `.env.local`. `.env.example` has placeholders only.

No secret key or service-role key is required. Do not put either in a `NEXT_PUBLIC_` variable. The server uses the publishable key with the `anon` role and obeys RLS. There are no visitor accounts or sessions, so SSR cookie helpers and session-refresh middleware are not needed here; `@supabase/ssr` is installed for future authenticated functionality but is not used by this anonymous form.

## Pre-event check

- Load `/feedback`: the empty list or real entries appear without a connection error.
- Submit one clearly marked test message. Confirm it appears in the wall and the Supabase table, with the form cleared.
- Refresh and confirm persistence. Use the database to hide the test entry afterward.
- Try sending while offline: text remains available to retry.
- Open a second page and confirm a new message appears after the refresh interval.
- Check both themes and the actual booth screen. Tell visitors that feedback is displayed publicly when inviting them to write.

Feedback is public, anonymous, and not indexed by search engines (`noindex`); this is not a privacy or access restriction. The page is reached directly and is not added to the marketing navigation. The native-app privacy promise about local artwork processing is unchanged; this form sends visitor comments to Supabase for public display.
