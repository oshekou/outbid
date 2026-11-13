# Outbid: Build Plan

**What this file is.** The build plan for Outbid, a silent auction web app run by high school students. Local businesses donate items, students promote them, the community bids from their phones, and winners pay the charity directly on Every.org. This plan is written for Claude Code. Save it at the repo root as `BUILD_PLAN.md`.

**How to work from this file (instructions for Claude Code).**

1. Build one phase at a time, in order. Stop at the end of each phase, show what was built, and wait for approval before starting the next.
2. The screens in `design/screens/` are the source of truth for layout, copy and visual style. Open the PNG for a screen before building it, and compare your result against it when you finish.
3. Phase 1 uses mock data only. Do not add a database, auth or any third-party service until Phase 2.
4. Anything marked **VERIFY** is an external fact that may have changed. Check the linked docs before writing code against it.
5. Anything in "Open questions" (section 12) needs an answer from the project owner. Ask; don't guess.
6. Keep a running `PROGRESS.md` with what is done, what is stubbed, and what is blocked.

---

## 1. Product summary

Three parties, and every screen serves one of them:

| Party | What they do | Account needed |
|---|---|---|
| **Organizer** (teacher or student lead) | Creates the auction, picks the charity, sets teams, approves posts | Yes, email sign-in |
| **Student** | Joins a grade team and optional squad, shows a QR "ask card" to businesses, makes posts about items, climbs the leaderboard | Light: name + grade, tied to a join link |
| **Business** | Scans a student's QR, donates an item in about two minutes, watches views and bids, redeems the winner's pass | None. Gets a private dashboard link by text |
| **Bidder** (parents, community) | Browses items, bids, gets texted when outbid, pays the charity on Every.org if they win, receives a prize pass with a QR | Phone number verified by text code |

Core promise: **Outbid never touches the money.** Winners pay the nonprofit directly through Every.org.

Demo data used in the mockups (reuse it for seed data): auction "Branson Fall Auction", school handle `@bransonschool`, charity "SF-Marin Food Bank", student "Olivia S., Class of 2027", approver "Ms. Okafor".

## 2. Scope

**Version 1 (build this):**

- Ask card with a personal QR per student; business self-signup with item, photo and logo
- Teams: four grades plus Faculty & Staff by default, optional custom squads inside a grade, two-level leaderboard
- Post builder with an approval queue
- Bidding with outbid texts and a timed close
- Winner pays on Every.org; paid winners get a prize pass with a QR; business scans to redeem

**Later (do not build; leave room in the data model):**

- Student reshare tracking and a "most reach" award
- AI-written captions and item descriptions from a photo
- Date requests for dinners and experiences
- Big-screen leaderboard
- Max bid (proxy bidding) and buy-it-now
- Raffles and ticketing

Two mockups show "Later" features. Handle them like this:

- Screen 10 has a "Set a max and stop checking" toggle. Render it disabled with a "Coming soon" tag, behind a `FEATURE_MAX_BID` flag.
- Screen 08 shows "21 student reshares". Render the row from mock data in Phase 1; hide it in production until reshare tracking exists.

## 3. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | First-class on Vercel; server actions and route handlers cover the whole backend |
| Styling | Tailwind CSS, tokens from section 4 | Fast to match the mockups |
| Icons | `lucide-react` | Matches the outline icon style in the mockups |
| Database, auth, storage, realtime | Supabase (Postgres) | One service covers magic-link and phone sign-in, image uploads, and live bid and leaderboard updates |
| Hosting | Vercel | Project requirement |
| Payments | Every.org donate link + partner webhook | No money handled by Outbid |
| Texts | Twilio (SMS + Verify) | Outbid alerts, bidder phone verification, business dashboard links |
| Email fallback | Resend | Used when a text can't be sent |
| QR codes | `qrcode` to generate, `html5-qrcode` or the `BarcodeDetector` API to scan | |
| Post images | `next/og` (`ImageResponse`) | Renders story and feed images on the server |
| Validation | `zod` | Shared between forms and server actions |
| Tests | Vitest for logic, Playwright for the main flows | |

Use the latest stable version of each. Mobile-first: design for a 390px-wide viewport, cap content at about 480px on larger screens and centre it.

## 4. Design system

Sampled from the mockups. Put these in `tailwind.config.ts` and CSS variables.

| Token | Value | Used for |
|---|---|---|
| `navy-900` | `#061C43` | Dark buttons, dark cards, headings |
| `navy-800` | `#092B57` | Selected chips, leaderboard rows |
| `blue-600` | `#0767B3` | Stat numbers, links |
| `teal-500` | `#0E8479` | Gradient middle, chart bars |
| `green-500` | `#1BAA85` | Gradient end |
| `lime-400` | `#84E81C` | Primary action buttons, headline highlight word, selected grade |
| `lime-50` | `#EDF9DB` | Info callouts, success rows |
| `surface` | `#F8FAFF` | Page background |
| `card` | `#FFFFFF` | Cards and inputs |
| `border` | `#DCE3EE` | Card and input borders |

- **Header gradient:** `navy-900` top-left through `blue-600` to `green-500` on the right, with a shallow curved bottom edge (SVG or `clip-path`) and a faint bull mascot watermark on some screens.
- **Primary button, two variants:** solid `lime-400` with navy text ("Bid $160", "Donate It"), and a blue-to-green gradient with white text ("Next: Set Up Teams", "Donate an Item"). Both are full-width pills about 56px tall with a trailing arrow.
- **Secondary button:** white pill with border, or solid `navy-900` pill.
- **Type:** headlines are a heavy italic sans with the last word in `lime-400` ("Pick your *side.*"). Use Poppins 800 italic as the closest match. Body is Inter. Section labels are small, bold, uppercase, letter-spaced navy ("YOUR NAME", "BID HISTORY").
- **Cards:** white, 1px border, about 20px radius, no heavy shadows. Stat tiles sit three across with a big blue number and a small grey label.
- **Chips:** pill-shaped; selected is navy with white text, unselected is light grey.
- **Bottom tab bar** (student and bidder views): Items, Leaderboard, Me.

Shared components to build first: `GradientHeader`, `Logo`, `PrimaryButton`, `SecondaryButton`, `Card`, `StatTile`, `Chip`/`ChipGroup`, `SectionLabel`, `TextField`, `Callout`, `ProgressSteps`, `ListRow`, `Avatar` (initials), `TabBar`, `QRCard`, `Toggle`.

## 5. Screens and routes

Design files live in `design/screens/`. Logo and illustrations are in `design/brand/`.

| # | File | Route | Who | Notes |
|---|---|---|---|---|
| 01 | `01-organizer-setup-auction.png` | `/setup` | Organizer | Step 1 of 3. Auction name, opens and closes dates, charity search with a live results list and a selected state |
| 02 | `02-organizer-setup-teams.png` (detail in `02b`) | `/setup/teams` | Organizer | Step 2 of 3. Default team cards (class years computed from the current school year), Faculty & Staff, "Let students create squads" toggle |
| - | *no mockup* | `/setup/social` | Organizer | Step 3 of 3, "Connect Instagram". Design it in the same style: school handle field, approver name, and a "skip for now" option |
| 03 | `03-student-join.png` | `/a/[auction]/join` | Student | Name, grade picker, optional squad list with member counts, "Create a squad", "Go solo" |
| 04 | `04-student-ask-card.png` | `/a/[auction]/ask` | Student | Personal QR, short link `outbid.app/give/[auction]/[student]`, "Say this" script, Share card, Copy link |
| 05 | `05-business-landing.png` | `/give/[auction]/[student]` | Business | Opened by scanning the QR. Reach stats, what you get, ideas, "Donate an Item". No account |
| 06 | `06-business-donate-item.png` | `/give/[auction]/[student]/item` | Business | Photo, logo, business name, item, retail value, uses, valid for, one-line description, phone. Credit line names the student |
| 07 | `07-student-make-post.png` (photo variant in `07b`) | `/a/[auction]/items/[item]/post` | Student | Story, Feed post, TikTok tabs. Live preview, editable caption, "Send for Approval" |
| 08 | `08-business-impact-dashboard.png` | `/b/[token]` | Business | Views, posts, bids, top bid, views-this-week bar chart, where you appeared, "Donate another" |
| 09 | `09-bidder-item-detail.png` | `/a/[auction]/items/[item]` | Bidder | Photo with logo, current bid, bid count, retail value, bid history, quick-bid chips plus "Other", bid button |
| 10 | `10-bidder-outbid.png` | `/a/[auction]/items/[item]/outbid` | Bidder | Landing page from the outbid text. Leading bid, your last bid, bid to take it back, quick chips |
| 11 | `11-leaderboard-grades.png` | `/a/[auction]/leaderboard` | Everyone | Tabs: Grades, My grade, Businesses. Countdown chip. Ranked rows with progress bars |
| 12 | `12-leaderboard-my-grade.png` | `/a/[auction]/leaderboard/[team]` | Student | Squads ranked by points per person; "Top askers" list |
| 13 | `13-winner-prize-pass.png` | `/pass/[token]` | Bidder | Confetti, prize pass card with QR, wallet buttons, "Paid on Every.org" confirmation |
| 14 | `14-business-scan-redeem.png` | `/b/[token]/redeem` | Business | Camera scanner, "Auction Item Found" card, "Redeem Item" |

Screens with no mockup that the app still needs. Design them to match the others:

- `/a/[auction]` item list (the "Items" tab): a card per item with photo, logo, current bid, bid count, time left.
- `/a/[auction]/me`: for students, their points, items secured and ask card link; for bidders, items they lead, items they've been outbid on, and passes they've won.
- `/admin/[auction]`: organizer home with totals, the post approval queue, an item approval queue, and auction controls.
- `/` marketing landing page, using the pitch copy from the deck: "Silent auctions run by students. Local businesses donate, students make them famous, charities get every dollar."
- Bidder sign-in sheet (phone number, then a code) shown the first time someone taps Bid.
- "You won, pay now" page that sits between the auction closing and screen 13.
- Empty, loading, error and "auction closed" states for every screen.

## 6. Phase 1: Frontend prototype (mock data)

**Goal:** a clickable prototype on Vercel that walks through the whole story with no backend, good enough to demo to the class.

1. Scaffold Next.js + TypeScript + Tailwind. Add tokens, fonts, and the shared components from section 4. Add a `/dev/components` page showing every component.
2. Create `lib/mock/` with typed seed data matching section 7's types: one auction, five teams, three squads, about eight students, six businesses, eight items, bid histories, posts, one win.
3. Put all data access behind functions in `lib/data/` (`getAuction`, `listItems`, `placeBid`, and so on). In Phase 1 they read and write an in-memory or `localStorage` store. In Phase 2 only these functions change.
4. Build the 14 mocked screens in route order, then the unmocked screens.
5. Make the main interactions work against the mock store: charity search over a static list, joining a team, generating a real QR for the ask card, submitting an item, placing a bid (history, leaderboard and current bid update), sending a post for approval, approving it in admin, and redeeming a pass.
6. Add a `/demo` page with a "View as" switcher (Organizer, Student, Business, Bidder) and buttons that jump to each step of the story.
7. Deploy to Vercel.

**Done when:** every route in section 5 renders at 390px without horizontal scroll; each mocked screen matches its PNG in layout, copy and color; the full story can be clicked through from `/demo`; Lighthouse accessibility is 90 or higher.

## 7. Data model

Postgres tables. All have `id uuid`, `created_at`. Money is integer cents.

- **auctions**: `slug`, `name`, `school_name`, `opens_at`, `closes_at`, `status` (draft, live, closed, settled), `nonprofit_slug`, `nonprofit_name`, `nonprofit_ein`, `everyorg_fundraiser_id`, `allow_custom_squads`, `min_increment_cents` (default 1000), `social_handle`, `approver_name`, `reach_families`, `reach_followers`, `organizer_id`
- **teams**: `auction_id`, `name` ("Class of 2027"), `label` ("Seniors"), `kind` (grade, faculty), `sort_order`
- **squads**: `team_id`, `name`, `icon`, `created_by`
- **students**: `auction_id`, `team_id`, `squad_id` (nullable), `display_name` (first name + last initial only), `slug`, `user_id` (nullable)
- **businesses**: `auction_id`, `name`, `logo_path`, `phone`, `address`, `dashboard_token`, `referred_by_student_id`
- **items**: `auction_id`, `business_id`, `student_id` (who gets credit), `title`, `description`, `photo_path`, `retail_value_cents`, `uses`, `valid_days`, `starting_bid_cents`, `status` (pending, live, closed, paid, redeemed), `current_bid_cents`, `bid_count`, `leading_bidder_id`
- **bidders**: `user_id`, `display_name`, `town`, `phone`, `sms_opt_in`
- **bids**: `item_id`, `bidder_id`, `amount_cents`. Append-only
- **posts**: `item_id`, `student_id`, `format` (story, feed, tiktok), `caption`, `status` (draft, pending, approved, rejected, posted), `reviewed_by`, `posted_url`, `views`
- **item_views**: `item_id`, `source` (direct, post, qr), `viewed_on` date, `count`. Daily rollup that drives the dashboard chart
- **wins**: `item_id`, `bidder_id`, `amount_cents`, `payment_status` (pending, paid, lapsed), `everyorg_charge_id`, `paid_at`, `pass_token`, `expires_on`, `uses_remaining`
- **redemptions**: `win_id`, `business_id`, `redeemed_at`
- **notifications**: `kind`, `to`, `payload`, `status`, `sent_at`. Log of every text and email

**Scoring.** Keep the constants in one config file so they can be tuned:

- Student points = `ITEM_POINTS` (10) per approved item they secured + `BID_POINTS` (1) per bid on those items.
- Squad score and team score = total member points ÷ member count ("pts/person"), so small groups aren't penalized. Students without a squad roll into a virtual "Solo" squad for their grade.
- Build leaderboards as Postgres views (`student_scores`, `squad_scores`, `team_scores`).
- The numbers in the mockups are illustrative and won't match this formula exactly.

## 8. Phase 2: Backend, auth and realtime bidding

1. Create the Supabase project. Write the schema as SQL migrations in `supabase/migrations/`. Add a seed script that loads the Phase 1 mock data.
2. Swap `lib/data/` over to Supabase. The UI should not change.
3. **Auth:**
   - Organizer: email magic link.
   - Student: opens the auction's join link, enters name and grade. Store an anonymous Supabase session so they stay signed in on that device. No email or phone collected from students.
   - Business: no login. `dashboard_token` in the URL is the credential; make it long and random.
   - Bidder: phone number + one-time code.
4. **Row-level security** on every table. Public can read live items, bid amounts with display names, and leaderboards. Nobody can read phone numbers except the server. Writes go through server actions using the service role, never straight from the browser.
5. **Bidding** as a single Postgres function `place_bid(item_id, amount_cents)` that, in one transaction: locks the item row, checks the auction is live and before `closes_at`, checks the amount is at least current bid + minimum increment, inserts the bid, updates `current_bid_cents`, `bid_count` and `leading_bidder_id`, and returns the previous leader so they can be notified. Add a per-bidder rate limit.
6. **Realtime:** subscribe to item and bid changes so the item page, item list and leaderboard update live.
7. **Uploads:** item photos and logos go to Supabase Storage. Resize on the client before upload; accept only images under 5 MB.
8. **Closing the auction.** Vercel's free plan runs cron jobs at most once a day (**VERIFY** current limits), so don't rely on Vercel Cron for a timed close. Instead: treat bidding as closed the moment `now() >= closes_at` inside `place_bid`, and run a Supabase `pg_cron` job every minute that finds auctions past `closes_at` with status `live`, creates a `wins` row for each item with bids, and sets status to `closed`.
9. Tests: unit tests for `place_bid` (too low, tie, after close, two bids at once) and for the scoring views. One Playwright test for join, donate item, bid, outbid.

**Done when:** two phones bidding on the same item see each other's bids within a couple of seconds, a bid placed after close is rejected, and the leaderboard matches hand-calculated scores for the seed data.

## 9. Phase 3: Every.org

Docs: https://docs.every.org. Get API keys from the developer dashboard at https://www.every.org/charity-api. The API is free for non-commercial use. Develop against the staging environment first (staging webhooks need a verified email on the staging account).

1. **Charity search (screen 01).** Server route `/api/nonprofits/search?q=` that calls `GET https://partners.every.org/v0.2/search/{term}?apiKey={PUBLIC_KEY}` and returns name, location, slug, EIN and logo. Debounce the input by 300ms and cache results briefly. Store the chosen nonprofit's slug, name and EIN on the auction. Also available: `GET /v0.2/nonprofit/{slug or EIN}` for details.
2. **Fundraiser (optional).** When the auction is created, create one Every.org fundraiser for it with the Fundraisers API, which uses HTTP Basic auth with the public key as username and the private key as password. Use it to show a running "total raised" figure. **VERIFY** the request body in the Fundraisers API docs.
3. **Winner payment.** When a `wins` row is created, build a donate link to the nonprofit with the amount pre-filled, frequency one-time, `partner_donation_id` set to the win's id, and a `success_url` back to `/pass/[token]`. **VERIFY** the exact URL shape and parameter names on the Donate Link docs page (expected form: `https://www.every.org/{nonprofit-slug}?amount=170&frequency=ONCE&partner_donation_id=...&success_url=...#donate`).
4. **Partner webhook.** Register `/api/webhooks/everyorg` in the Every.org developer dashboard. The payload includes `chargeId`, `partnerDonationId`, `amount`, `netAmount`, `toNonprofit` (slug, EIN, name), `donationDate` and donor name and email. On receipt:
   - Look up the win by `partnerDonationId`. Ignore unknown ids.
   - Check `toNonprofit.slug` matches the auction's nonprofit and `amount` is at least the winning bid. The donor can change the amount on Every.org, so never assume it.
   - Make it idempotent on `chargeId`.
   - Mark the win `paid`, set the item to `paid`, activate the prize pass, send the "You won" text with the pass link.
   - The docs describe no signature on webhook requests. Put a long random secret in the webhook URL path and reject requests without it. Don't store the donor's email or address from the payload unless needed.
5. **Unpaid winners.** The `success_url` redirect alone is not proof of payment; only the webhook is. Show "Waiting for payment confirmation" on the pass page until it arrives. If a win is unpaid after 48 hours, flag it in admin with a "Offer to next bidder" button.

**Done when:** on staging, closing an auction produces a pay link, completing a test donation flips the win to paid within a minute, and the prize pass appears.

## 10. Phase 4: Texts, prize pass and redemption

1. **Texts (Twilio).** Messages: phone verification code, "You've been outbid" with a link to screen 10, "You won, pay here", "Paid, here's your pass", and the business's dashboard link after they donate. Every bidder must tick an explicit opt-in box, and every message must honor STOP. US carriers require business texting registration (A2P 10DLC or a verified toll-free number), which can take days to weeks, so start it early. Until it's approved, send the same notifications by email through Resend, and build the notification layer so the channel is a setting.
2. **Prize pass (screen 13).** `/pass/[token]` shows the pass and a QR that encodes the redeem URL with the pass token. Tokens are long and random.
3. **Wallet buttons.** Apple Wallet passes need a paid Apple Developer account and signing certificates; Google Wallet needs an approved issuer account. For version 1, show the web pass with an "Add to Home Screen" hint and keep the two wallet buttons behind a `FEATURE_WALLET` flag.
4. **Redeem (screen 14).** The business opens `/b/[token]/redeem`, scans the pass with the camera, sees the item, winner, winning bid and expiry, and taps "Redeem Item". The server checks the pass belongs to one of that business's items, is paid, not expired and has uses left, then decrements `uses_remaining` and writes a `redemptions` row. Include a manual code entry for when the camera doesn't work.

**Done when:** an outbid notification arrives within 30 seconds of a higher bid, and a pass can be redeemed exactly as many times as its `uses`.

## 11. Phase 5: Posts and approval, then Phase 6: launch

**Phase 5: posts**

1. Post builder (screen 07): choose a format, render the preview with `next/og` at 1080×1920 (story) or 1080×1350 (feed), pre-fill a caption from a template, let the student edit it.
2. "Send for Approval" sets the post to `pending`. The approver sees a queue in `/admin/[auction]` with approve, reject and edit-caption actions.
3. **Publishing, version 1:** after approval, the approver gets a "Download image" and "Copy caption" button plus the item's short link, posts it from the school account themselves, then pastes the post URL back in and marks it posted. This avoids needing Meta's review.
4. **Publishing, later:** automatic posting through the Instagram API needs a professional Instagram account, a Meta developer app and app review (**VERIFY** current requirements). TikTok has a similar review process. Plan this as a follow-up.
5. View tracking: count item page views into `item_views`, tagging those that arrive with `?src=post-{id}`. Use these for the business dashboard chart and "where you appeared" list.

**Phase 6: launch**

- Custom domain on Vercel, production Supabase project, production Every.org keys and webhook.
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `EVERYORG_PUBLIC_KEY`, `EVERYORG_PRIVATE_KEY`, `EVERYORG_WEBHOOK_SECRET`, `EVERYORG_BASE_URL`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SID`, `TWILIO_FROM`, `RESEND_API_KEY`, `NEXT_PUBLIC_APP_URL`. Never commit them; add `.env.example`.
- Privacy policy and terms pages. Error monitoring. Rate limits on all public write endpoints.
- A full dress rehearsal: a one-hour test auction with real phones before the real one.

## 12. Open questions for the project owner

1. **Tax receipts.** Every.org sends an automatic tax-deductible receipt for each donation. An auction winner gets something of value in return, so the full amount usually isn't deductible. Ask Every.org (partners@every.org) whether paying for auction wins through a donate link is an accepted use, and how the receipt should read. This is the biggest unknown in the plan; raise it with a teacher or the school's business office as well.
2. **Who can bid?** Recommended: bidders confirm they are 18 or older, since a bid is a commitment to pay. Students take part by recruiting and promoting, not bidding.
3. **Student privacy.** The plan shows only first name and last initial and collects no student phone or email. Does the school need anything more, such as a sign-off from the administration, before students use it?
4. **Unpaid winners.** Is "offer to the next bidder after 48 hours" the right rule?
5. **Starting bid and increment.** Default suggestion: start at 40% of retail value, $10 increments.
6. **Last-minute bids.** Should a bid in the final two minutes extend that item's close by two minutes?
7. **Item approval.** Should an organizer approve each donated item before it goes live? Recommended yes.
8. **Real business names in the demo.** The mockups use a real restaurant's name, logo and photo. Use made-up businesses in seed data unless that business has agreed.
9. **Domain.** The mockups show `outbid.app`. Is it registered?
10. **Accounts to open now** because approval takes time: Every.org developer account (production and staging), Twilio with texting registration, and, for later phases, Apple Developer and a Meta developer app.

## 13. Repo layout

```
app/                  routes from section 5
components/ui/        shared components from section 4
components/           screen-specific pieces
lib/data/             data access functions (mock in Phase 1, Supabase after)
lib/mock/             seed data
lib/everyorg/         search, fundraiser, donate link, webhook handling
lib/notify/           text and email sending
lib/scoring.ts        point constants
supabase/migrations/  schema, views, place_bid, cron
design/screens/       the 14 mockup PNGs
design/brand/         logo and illustrations
tests/
BUILD_PLAN.md
PROGRESS.md
```

## 14. First prompt to give Claude Code

> Read BUILD_PLAN.md and look at every image in design/screens/. Then do Phase 1 steps 1 to 3 only: scaffold the project, set up the design tokens and shared components, and create the mock data. Show me the /dev/components page before building any screens.
