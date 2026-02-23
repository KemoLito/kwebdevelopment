# KWebDevelopment

Static marketing site + Retention & Local SEO Toolkit for home-service businesses. Built for GitHub Pages (custom domain). HTML/CSS/vanilla JS only — no frameworks.

## Quick start

- **Local:** Open `index.html` in a browser, or serve the folder (e.g. `npx serve .`).
- **GitHub Pages:** Push to the repo; the site is served from the root. Update `sitemap.xml` and `robots.txt` if your domain differs from `kwebdevelopment.com`.

## Manual test plan

Use this checklist to verify the site and toolkit after changes or after deploy.

1. **Homepage**
   - Open `index.html` (or your live URL).
   - Confirm main stylesheet loads (no broken layout). Filename is `style.css` (not `styles.css`).
   - Confirm toolkit styles and scripts load: header CTAs and modal look correct.
   - Click **Get Free Quote** in header or hero → lead modal opens.
   - Click **Call** → phone app or `tel:` link works.
   - Scroll to **Retention Toolkit** → section and three buttons (Review Funnel, Seasonal Offer, Privacy/SMS) are visible.
   - Click **Review**, **Offer**, **Privacy** → each page loads with same header/footer and no broken assets.

2. **Lead form & services dropdown**
   - On the homepage, open the lead modal (**Get Free Quote**).
   - Confirm the **Service needed** dropdown does not stay on “Loading…” — it should show “Select a service…” and options (from `data/services.json`, or fallback options if the file is missing).
   - Submit the form with empty required fields → friendly validation messages (e.g. “Please enter your name.”).
   - Submit with valid data → if `leadWebhookUrl` in `config.js` is empty, a visible “Not connected yet” message appears; the UI does not break.

3. **Review funnel**
   - Open `review.html`.
   - **5-star path:** Select 5 stars → “Leave a Google Review” button appears. Click it (opens Google review if `googleReviewUrl` is set).
   - **2-star path:** Select 2 stars → private feedback form appears. Submit a message → “Thank you — we’ll make this right” (or success) appears.

4. **Discount / referral**
   - Open `discount.html`.
   - Fill name and phone, submit → referral code appears.
   - **Copy SMS** and **Copy Email** copy share text (with code and link) to clipboard.

5. **GitHub Pages / relative paths**
   - Deploy to GitHub Pages (or serve from a subpath).
   - Open the site from the deployed URL (not `file://`).
   - Confirm all links work: homepage, `review.html`, `discount.html`, `privacy.html`, `services/index.html`, `areas/index.html`.
   - Confirm services dropdown still loads (no CORS or wrong path).
   - Open a non-existent path → `404.html` is shown (GitHub Pages uses `404.html` at repo root).

6. **Accessibility**
   - With lead modal open: press **Esc** → modal closes.
   - With modal open: **Tab** cycles focus within the modal (focus trap).
   - Star rating: keyboard and screen reader labels (e.g. “1 star”) work.

## Config

Edit `assets/js/config.js`:

- **googleReviewUrl** — Paste your Google review link (from Google Business Profile).
- **leadWebhookUrl**, **feedbackWebhookUrl**, **discountWebhookUrl** — Paste your Make.com or Zapier webhook URLs. If left empty, forms still work and show “Not connected yet”.

See the checklist at the top of `config.js` for details.

## Structure

- `index.html` — Homepage (hero, services, process, retention toolkit, results, portfolio, pricing, contact).
- `review.html` — Review funnel (1–5 stars → Google or private feedback).
- `discount.html` — Seasonal/referral offer + referral code.
- `privacy.html` — Privacy and SMS consent.
- `services/index.html`, `areas/index.html` — Hubs (links to generated or static subpages).
- `assets/css/toolkit.css`, `assets/js/config.js`, `assets/js/toolkit.js` — Toolkit styles and behavior.
- `data/services.json`, `data/areas.json` — Data for services dropdown and for `scripts/generate-pages.js`.
- `scripts/generate-pages.js` — Node script to generate service/area/combo pages for local SEO (run with `node scripts/generate-pages.js`).
- `404.html`, `robots.txt`, `sitemap.xml` — 404 page and basic SEO. Update `sitemap.xml` and `robots.txt` if your domain is not `kwebdevelopment.com`.

## Favicon

- `favicon.svg` is included. Add `favicon.ico` in the repo root if you want legacy browser support.
