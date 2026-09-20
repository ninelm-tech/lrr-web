# Homepage Product-Depth Section — Design

**Status:** Approved for planning
**Repo:** `lrr-web`

## Problem

The homepage's "Pricing" section (a ₦50,000/year "Membership" pitch) was just
removed for describing a subscription model the product doesn't use — LRR is
pay-per-job (deposit + balance per rescue). That removal leaves a gap in the
page's rhythm between `HowItWorks` and `OperatorsSection`, and the page is
being used to support an AWS Activate application, where it needs to read as
a real, built-out product rather than a landing page for an idea.

Separately: `HowItWorks`'s step 3 currently claims "Track help in real
time... follow your operator's route, ETA, and updates from dispatch to
resolution" — live map tracking was never built (explicitly split off as a
future spec during this session's work). This is a second instance of the
same problem the Pricing section had: copy describing something that isn't
real.

## Goals

- Fill the vacated homepage slot with a section that demonstrates real,
  shipped product depth — not aspirational features.
- Fix `HowItWorks` step 3 to describe what actually happens today (a
  one-time location link at dispatch, WhatsApp status updates as the job
  progresses) instead of implying continuous live tracking.
- Match the existing homepage's visual language exactly — no new design
  system, no new component patterns.

## Non-goals

- Real screenshots of the running app — none exist in this repo currently
  (`public/` only has three operator-marketing images, already used in
  `OperatorsSection`), and this environment can't produce new ones. This
  section is icon+copy cards, not screenshots.
- Traction/credibility stats (rescue counts, testimonials) — a separate,
  later concern; not part of this change.
- Touching `StatsBar.tsx`'s numbers, even though they read as similarly
  unverified ("150+ Verified operators", "98% Successful resolutions") —
  out of scope for this change; flagged separately, not fixed here.

## Design

### New component: `ProductDepthSection.tsx`

Placed in `app/page.tsx` in the exact slot `PricingSection` vacated —
between `<HowItWorks />` and `<OperatorsSection />`. Structurally mirrors
`HowItWorks.tsx`: same eyebrow-label / heading / max-width intro pattern,
same `section` padding (`py-20 sm:py-28`) and `max-w-7xl` container, same
`var(--font-fraunces)` heading font and `#003DB4`/`#0b1736`/`#6c7890` color
tokens. Both `HowItWorks` and `OperatorsSection` are `bg-white`; without a
divider between them they'd blend into one long white block now that
Pricing (which used `background: "#f6f9fc"`) is gone. `ProductDepthSection`
takes over that same `#f6f9fc` background — landing in the same slot,
inheriting the same visual-separator role, not just the same content slot. Cards use a `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6` layout
(1 column mobile, 2 tablet, 3 desktop — consistent with this page's other
responsive breakpoints, e.g. `StatsBar`'s `grid-cols-2 md:grid-cols-4`)
rather than `HowItWorks`'s single-column numbered-step layout, since these
are parallel features, not sequential steps.

Six cards, each an icon (inline SVG, matching `HowItWorks`'s existing
icon style — simple stroke-based Lucide-style icons, no icon library
dependency) + title + one-line description, grounded in features actually
shipped in `lrr-service`/`lrr-web` this session or earlier:

1. **No app, ever** — "The entire flow — request, quotes, payment,
   updates — runs over WhatsApp. Nothing to download."
2. **Two-way ratings** — "Motorists rate operators and operators rate
   motorists after every job, building trust on both sides."
3. **Instant digital receipts** — "Get an itemized, printable receipt the
   moment your balance is paid — deposit, balance, total, all accounted
   for."
4. **Verified, rated operators** — "Every operator on the network is
   vetted before they can receive dispatch offers, and carries a visible
   rating from real jobs."
5. **Automatic WhatsApp updates** — "Get notified the moment your operator
   arrives and the moment the job is marked complete — no need to ask."
6. **Pay only for what you use** — "No subscription. A small deposit
   confirms your request; the balance is due once you're helped."

Card #1 deliberately doesn't restate `HowItWorks`'s step-by-step walkthrough
— it's framed as a standing product property ("no app, ever"), not a
process step, so the two sections don't read as redundant.

### `HowItWorks` step 3 rewording

Current (`app/components/landing/HowItWorks.tsx`, the third `steps` entry):
- `title: "Track help in real time"`
- `copy: "Follow your operator's route, ETA, and updates from dispatch to resolution."`

New:
- `title: "Stay updated automatically"`
- `copy: "Get your operator's location link when they're dispatched, plus automatic WhatsApp updates when they arrive and when the job's done."`

This keeps the "tracking-ish" claim scoped to what's real (a location link
sent once at dispatch, not a live-updating map) and moves the ongoing-status
framing to match card #5 above, so the two sections reinforce rather than
duplicate or contradict each other.

## Testing

No test framework covers this repo's landing-page components (confirmed:
no existing `.test.tsx`/`.spec.tsx` for any `app/components/landing/*`
file). Verification is `npx tsc --noEmit` + `npx next build` (confirming
the page still builds and `/` still prerenders as static), plus a manual
visual check of the new section's layout at desktop and mobile widths if a
browser is available in the execution environment — if not, this is noted
as an explicit limitation, same as this session's other frontend UI work.
