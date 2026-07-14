# OffMarket

A single-scroll, cinematic landing page for OffMarket — an app for genuinely
off-market properties. An agent lists a home and receives a unique six-digit
code; the code goes only to their trusted network; a buyer enters it to
unlock a private portfolio; the agent tracks interest across their network.

**Mission:** Connecting the right property to the right people.
**Founders:** Will Humphrey & Harry Gibson

## Stack

Dependency-free, hand-built, no framework:

- **HTML / CSS / vanilla JS** — no build step, no bundler, no runtime JS dependencies
- **IntersectionObserver** for scroll reveals and the sticky "how it works" step sequence
- **`position: sticky`** for the scroll-pinned six-digit-code mechanic (Section 3)
- **System font stacks** (`ui-serif`/Georgia for the editorial serif, `-apple-system`/SF Pro
  for the sans) — zero font-loading requests, so the page has nothing to wait on
- **[sharp](https://sharp.pixelplumbing.com/)** (dev-only, Node) generates responsive
  AVIF/WebP image sets at build time — not shipped to the browser

Why vanilla: the motion this page needs (sticky-pin, scroll reveal, parallax) is well
within what CSS + IntersectionObserver can do smoothly — a framework or animation
library would add weight without adding capability here.

## Project structure

```
index.html               single page, all 7 sections
css/style.css             full design system (tokens, type, motion, components)
js/main.js                 nav state, parallax, scroll reveals, sticky-mechanic sync
assets/
  favicon.svg / *.png       favicon set
  images/
    source/                 original sourced photography (full-res)
    optimized/               generated AVIF/WebP responsive sets (checked in)
    og-image.jpg             generated social share card
scripts/
  optimize-images.mjs        regenerates assets/images/optimized/*
  build-og-image.mjs         regenerates assets/images/og-image.jpg
```

## Running locally

No build step is required to view the site — it's static HTML/CSS/JS.

```bash
npm install        # only needed to re-run the image scripts below
npx serve .         # or: python3 -m http.server 3000
```

Then open the printed local URL (e.g. `http://localhost:3000`).

### Regenerating imagery

If you swap in new source photography, drop the files into
`assets/images/source/` and re-run:

```bash
npm run optimize-images   # -> assets/images/optimized/*.{avif,webp}
npm run build-og-image    # -> assets/images/og-image.jpg
```

## Wiring up "Request Access"

The CTA currently opens a `mailto:` link. To wire it to a real form/waitlist
service instead, replace the `href` on the two `.btn-gold` elements in
`index.html` (hero and footer CTA) with your form endpoint, or swap the
element for a `<form>` posting to your provider of choice (e.g. a serverless
function, Formspree, Basin, or a Vercel API route).

### Automated verification

`scripts/verify.mjs` drives the live page with Playwright (desktop, mobile,
and `prefers-reduced-motion` passes) and screenshots every section, checking
for console/page errors along the way:

```bash
npm install
npx playwright install chromium
npm run dev &            # serve on :4173, or set VERIFY_URL
npm run verify            # screenshots land in .verify-shots/
```

## Deployment

Static site — deployable as-is to Vercel or Netlify with no build command
(framework preset: "Other" / root as the publish directory).

```bash
vercel deploy --prod
```

## Verification checklist

- [ ] Hero image and portfolio imagery load correctly, no console errors
- [ ] Sticky "how it works" mechanic steps through 01→04 in sync with scroll
- [ ] Gold six-digit code assembles, then "unlocks" into the portfolio grid
- [ ] Hero parallax fires smoothly
- [ ] Mobile nav / layout verified at small breakpoints
- [ ] `prefers-reduced-motion` shows the graceful, instant-state fallback
- [ ] Contrast of silver-on-black text passes WCAG AA
