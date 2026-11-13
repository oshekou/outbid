# Outbid: Progress

Running log against `BUILD_PLAN.md`. Newest at the top.

## Phase 1: Frontend prototype (mock data)

### Done: step 4 (all screens) + app polish

Live at https://outbid-eta.vercel.app (Vercel deploys this branch on every push).

**App feel**
- Installable: web app manifest, home-screen icon (the tag mark from the logo), full-screen launch,
  safe-area padding for notched phones, theme colour.
- Screens ease in; bottom sheets slide up; pop-up confirmation messages; loading skeletons;
  "not found" and "closed" states; reduced-motion respected.
- Back buttons in headers; bottom tab bar on student/bidder screens.

**Screens** (all work against the mock store, all checked at 390px with no sideways scroll)
- `/` landing page, `/demo` story hub with "View as" and 14 story steps + reset.
- 01 `/setup`, 02 `/setup/teams`, `/setup/social` (step 3, no mockup). Launching creates a real
  auction with the five default teams and opens its admin page.
- 03 join, 04 ask card (real QR, share/copy), 05 business landing, 06 donate item (photo + logo
  upload resized on the device, success screen with dashboard link).
- 07 make a post (story/feed/TikTok preview, editable caption, send for approval).
- 08 business dashboard (views chart, where you appeared, item switcher, scan button).
- 09 item detail (bid history, quick bids + Other, bidder sign-in sheet with phone + code),
  10 outbid page, 11 leaderboard (grades + businesses), 12 team leaderboard (squads + individuals).
- 13 prize pass with "You won, pay now" step before it (demo payment stands in for Every.org),
  14 scan & redeem (camera scanning via BarcodeDetector where supported, plus a 6-character code).
- Items list, Me (student and bidder views), Admin (post queue, item queue, join link QR,
  winners and payment status with 48-hour flag, close bidding).

**Checks**
- Playwright run of 9 end-to-end flows: join, donate, approve item, new bidder sign-in + bid,
  too-low bid rejected, outbid + take it back, close + pay + pass, redeem by code, setup wizard.
- `npm test`: 17 unit tests passing. Lint, typecheck and production build clean.

### Still to do in Phase 1
- Lighthouse accessibility audit (target 90+).
- Side-by-side pixel comparison of each screen with its PNG.

### Done: steps 1–3 (awaiting review before screens)

**Step 1: Scaffold, tokens, shared components**
- Next.js 16.4 (App Router, Turbopack) + TypeScript + Tailwind v4, React 19.3.
- Tokens from §4 live in `app/globals.css` under `@theme`. Tailwind v4 has no
  `tailwind.config.ts`; `@theme` is its replacement and also exposes every token as a CSS variable
  (`var(--color-navy-900)`).
- Fonts: Poppins 700/800 (normal and italic) for headlines and buttons, Inter for body, via `next/font`.
- Brand: `public/brand/logo-white.png` (for gradient headers) and `logo-color.png`, trimmed and
  resized from `design/brand/`.
- Shared components in `components/ui/` (exported from `components/ui/index.ts`):
  `GradientHeader` (+ `HeaderSubtitle`, curved bottom, optional watermark), `Logo`, `Headline`,
  `PrimaryButton` (lime / gradient), `SecondaryButton` (outline / navy / lime), `Card`, `ListCard`,
  `StatTile`/`StatRow`, `Chip`/`ChipGroup`/`Pill`, `SectionLabel`, `TextField`/`TextArea`, `Callout`,
  `ProgressSteps`/`ProgressBar`, `ListRow`/`IconTile`, `Avatar`, `TabBar`, `QRCode`/`QRCard`, `Toggle`,
  `PageShell`/`PageBody`, `BullWatermark`, `InstagramIcon`/`TikTokIcon`.
- `/dev/components` shows all of them on mock content. Checked at 390px: no horizontal scroll.

**Step 2: Mock data** (`lib/mock/`)
- `seed.ts` builds the whole DB: 1 auction, 5 teams, 3 squads, 9 participants (8 students + 1 teacher),
  6 businesses, 8 items (6 live, 1 pending, 1 paid), 6 bidders, 40 bids, 4 posts, 7 days of item views,
  1 paid win with a prize pass. Dates are relative to "now" so the auction is always live in the demo.
- `DEMO` exports the ids and tokens the story uses (Olivia, Jamie the bidder, Coach Daniels the rival,
  the business dashboard token, the pass token).
- `nonprofits.ts`: static charity list for the screen 01 search.
- Grade teams are computed from the school year (`lib/school-year.ts`): Class of 2027 = seniors
  from Aug 2026 to Jul 2027.

**Step 3: Data access** (`lib/data/`)
- `index.ts`: every read and write the UI will use (`getAuction`, `listItems`, `placeBid`, `joinAuction`,
  `donateItem`, `submitPost`, `reviewPost`, `closeAuction`, `redeemPass`, leaderboards, …). All async,
  validated with zod. Phase 2 changes only this file.
- `store.ts`: in-memory DB mirrored to `localStorage`, synced across tabs, with `resetDB()`.
- `hooks.ts`: `useData(fn)` re-runs a query whenever the store changes.
- `placeBid` follows the Phase 2 `place_bid` rules: live + before close, ≥ current + increment,
  returns the previous leader, logs an "outbid" notification.
- Scoring constants and the reference implementation are in `lib/scoring.ts`.
- Tests: `npm test` (Vitest), 17 passing: scoring, bid rules (too low, tie, after close, two at once),
  closing, redemption limits, join validation.

### Stubbed / decisions to review
- **Businesses are fictional** (Redwood Slice Co., Blue Fin Burger Bar, …) per open question 8.
  The mockups' Gott's Roadside and Marin Joe's are real businesses, so they're not in the seed.
  Items have no photos; screens will use generated placeholder art + a logo tile until uploads exist.
- **Charity list is placeholder.** EINs are `00-000000x`, not real. Phase 3 swaps in Every.org search.
- **Bull watermark** is a simple SVG stand-in; there's no mascot file in `design/brand/`.
  Send the real art if you have it.
- **Team-card jerseys (screen 02)** aren't separate assets either; they only exist inside the mockup PNG.
- Starting bid defaults to 40% of retail rounded to $5, increment $10 (open question 5's suggestion).
- One item ("Burger night for 2") is seeded as already won and paid so the prize pass and redeem
  screens have data while the auction is still live.
- Feature flags in `lib/flags.ts`: `FEATURE_MAX_BID`, `FEATURE_WALLET` (off), `FEATURE_RESHARES`
  (on in Phase 1).


## Phase 2+
Not started.
