# AGENTS.md

## Cursor Cloud specific instructions

This is a static HTML/CSS/vanilla-JS marketing site with zero npm dependencies — no `package.json`, no build step, no framework.

### Running the dev server

```bash
python3 -m http.server 8000
# Then open http://localhost:8000
```

Any static server works (`npx serve .`, `python3 -m http.server`, etc.). Pages must be served over HTTP (not `file://`) for the services dropdown fetch and toolkit scripts to work correctly.

### Page generator (SEO pages)

```bash
node scripts/generate-pages.js
```

Generates `services/*/index.html`, `areas/*/index.html`, and combo pages from `data/services.json` and `data/areas.json`. Uses only Node built-ins — no install needed.

### Linting / tests

There is no automated linter or test framework configured. Validation is manual — see the **Manual test plan** in `README.md`.

### Config

`assets/js/config.js` holds webhook URLs, phone, and email. Some values are placeholders (e.g. `PASTE_FEEDBACK_WEBHOOK_HERE`). Forms still render and validate without live webhooks — they show a "Not connected yet" message on submit.

### Key gotcha

The main stylesheet is `style.css` (not `styles.css`). Getting this wrong breaks the entire layout.
