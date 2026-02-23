#!/usr/bin/env node
/**
 * Generate static service pages, area pages, and optional combo pages
 * for local SEO. Run from project root: node scripts/generate-pages.js
 *
 * Reads: data/services.json, data/areas.json
 * Writes: services/{slug}/index.html, areas/{slug}/index.html,
 *         and optionally {service-slug}-in-{area-slug}/index.html
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const BUSINESS_NAME = process.env.BUSINESS_NAME || 'KWebDevelopment';
const GENERATE_COMBO = process.env.GENERATE_COMBO !== 'false';

function loadJson(file) {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
  } catch (e) {
    return [];
  }
}

function escapeHtml(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function faqSchema(faq) {
  if (!faq || !faq.length) return '';
  const mainEntity = faq.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a }
  }));
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity
  });
}

function localBusinessSchema(areaName) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: BUSINESS_NAME,
    areaServed: areaName ? { '@type': 'City', name: areaName } : undefined
  });
}

// Shared header/footer/CTA fragment. rel: path from page to root (e.g. '../../' or '../')
function header(rel) {
  const r = rel || '../';
  return `
<header>
  <div class="wrap">
    <nav>
      <div class="logo"><a href="${r}index.html">${escapeHtml(BUSINESS_NAME)}</a></div>
      <div class="links">
        <a href="${r}index.html#services">Services</a>
        <a href="${r}services/index.html">All Services</a>
        <a href="${r}areas/index.html">Areas</a>
        <a href="${r}index.html#contact">Contact</a>
      </div>
      <div class="nav-cta tk-nav-cta">
        <a class="btn tk-btn-call" href="#">Call</a>
        <a class="btn primary tk-btn-quote" href="${r}index.html#contact" data-tk-open-lead>Get Free Quote</a>
      </div>
    </nav>
  </div>
</header>`;
}

function footer(rel) {
  const r = rel || '../';
  return `
<footer>
  <div class="wrap small">
    <a href="${r}privacy.html">Privacy &amp; SMS</a> · <a href="${r}review.html">Leave a review</a> · ${escapeHtml(BUSINESS_NAME)} · TX / DFW
  </div>
</footer>

<div id="tk-fab-wrap" class="tk-fab-wrap" aria-hidden="true">
  <a href="#" class="tk-fab" aria-label="Call us">&#x260E;</a>
</div>

<script src="${r}assets/js/config.js"></script>
<script src="${r}assets/js/toolkit.js"></script>`;
}

function servicePage(service, services, areas, rel) {
  const title = `${service.title} | ${BUSINESS_NAME}`;
  const desc = service.shortDescription || `Professional ${service.title} for local businesses.`;
  const faq = service.faq || [];
  const schemaFaq = faq.length ? `<script type="application/ld+json">${faqSchema(faq)}</script>` : '';
  const otherServices = (services || []).filter((s) => s.slug !== service.slug);
  const linksOther = otherServices.slice(0, 4).map((s) => `<a href="${s.slug}/" class="link">${escapeHtml(s.title)}</a>`).join(' · ');
  const areaLinks = (areas || []).slice(0, 5).map((a) => `<a href="${rel}areas/${a.slug}/" class="link">${escapeHtml(a.name)}</a>`).join(' · ');

  const faqHtml = faq.length
    ? `<section class="scroll-margin" style="margin-top: 32px;"><h2>FAQ</h2><dl>${faq.map((item) => `<dt><strong>${escapeHtml(item.q)}</strong></dt><dd class="muted">${escapeHtml(item.a)}</dd>`).join('')}</dl></section>`
    : '';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(desc)}" />
  <link rel="stylesheet" href="${rel}style.css" />
  <link rel="stylesheet" href="${rel}assets/css/toolkit.css" />
  ${schemaFaq}
</head>
<body>
${header(rel)}
<main>
  <div class="wrap" style="padding: 48px 20px;">
    <h1 style="margin: 0 0 8px;">${escapeHtml(service.title)}</h1>
    <p class="muted">${escapeHtml(service.shortDescription || '')}</p>
    <p class="top16"><a href="${rel}index.html#contact" class="btn primary tk-btn-quote" data-tk-open-lead>Get a Free Quote</a></p>
    ${faqHtml}
    <section style="margin-top: 32px;">
      <h2>Other services</h2>
      <p class="muted">${linksOther}</p>
    </section>
    <section style="margin-top: 16px;">
      <h2>Areas we serve</h2>
      <p class="muted">${areaLinks}</p>
    </section>
  </div>
</main>
${footer(rel)}
</body>
</html>`;
}

function areaPage(area, services, areas, rel) {
  const title = `${area.name} | ${BUSINESS_NAME} — Web Design & Local SEO`;
  const desc = `Professional web design and local SEO in ${area.name}. Get a quote today.`;
  const schema = localBusinessSchema(area.name);
  const serviceLinks = (services || []).slice(0, 5).map((s) => `<a href="${rel}services/${s.slug}/" class="link">${escapeHtml(s.title)}</a>`).join(' · ');
  const otherAreas = (areas || []).filter((a) => a.slug !== area.slug).slice(0, 4).map((a) => `<a href="${a.slug}/" class="link">${escapeHtml(a.name)}</a>`).join(' · ');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(desc)}" />
  <link rel="stylesheet" href="${rel}style.css" />
  <link rel="stylesheet" href="${rel}assets/css/toolkit.css" />
  <script type="application/ld+json">${schema}</script>
</head>
<body>
${header(rel)}
<main>
  <div class="wrap" style="padding: 48px 20px;">
    <h1 style="margin: 0 0 8px;">Web design &amp; local SEO in ${escapeHtml(area.name)}</h1>
    <p class="muted">We serve ${escapeHtml(area.name)} and the surrounding area. Get a fast, mobile-friendly website and local search visibility.</p>
    <p class="top16"><a href="${rel}index.html#contact" class="btn primary tk-btn-quote" data-tk-open-lead>Get a Free Quote</a></p>
    <section style="margin-top: 32px;">
      <h2>Our services in ${escapeHtml(area.name)}</h2>
      <p class="muted">${serviceLinks}</p>
    </section>
    <section style="margin-top: 16px;">
      <h2>Nearby areas</h2>
      <p class="muted">${otherAreas}</p>
    </section>
  </div>
</main>
${footer(rel)}
</body>
</html>`;
}

function comboPage(service, area, services, areas) {
  const rel = '../';
  const title = `${service.title} in ${area.name} | ${BUSINESS_NAME}`;
  const desc = `${service.title} in ${area.name}. ${service.shortDescription || ''}`;
  const faq = service.faq || [];
  const schemaFaq = faq.length ? `<script type="application/ld+json">${faqSchema(faq)}</script>\n  ` : '';
  const schemaBiz = `<script type="application/ld+json">${localBusinessSchema(area.name)}</script>`;

  const faqHtml = faq.length
    ? `<section class="scroll-margin" style="margin-top: 32px;"><h2>FAQ</h2><dl>${faq.map((item) => `<dt><strong>${escapeHtml(item.q)}</strong></dt><dd class="muted">${escapeHtml(item.a)}</dd>`).join('')}</dl></section>`
    : '';

  const serviceLinks = (services || []).filter((s) => s.slug !== service.slug).slice(0, 3).map((s) => `<a href="${rel}services/${s.slug}/" class="link">${escapeHtml(s.title)}</a>`).join(' · ');
  const areaLinks = (areas || []).filter((a) => a.slug !== area.slug).slice(0, 3).map((a) => `<a href="${rel}areas/${a.slug}/" class="link">${escapeHtml(a.name)}</a>`).join(' · ');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(desc)}" />
  <link rel="stylesheet" href="${rel}style.css" />
  <link rel="stylesheet" href="${rel}assets/css/toolkit.css" />
  ${schemaFaq}
  ${schemaBiz}
</head>
<body>
${header(rel)}
<main>
  <div class="wrap" style="padding: 48px 20px;">
    <h1 style="margin: 0 0 8px;">${escapeHtml(service.title)} in ${escapeHtml(area.name)}</h1>
    <p class="muted">${escapeHtml(service.shortDescription || '')} Serving ${escapeHtml(area.name)} and the surrounding area.</p>
    <p class="top16"><a href="${rel}index.html#contact" class="btn primary tk-btn-quote" data-tk-open-lead>Get a Free Quote</a></p>
    ${faqHtml}
    <section style="margin-top: 32px;">
      <p class="muted">Other services: ${serviceLinks}. Other areas: ${areaLinks}.</p>
    </section>
  </div>
</main>
${footer(rel)}
</body>
</html>`;
}

function ensureDir(dir) {
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (e) {}
}

function main() {
  const services = loadJson('services.json');
  const areas = loadJson('areas.json');

  const servicesDir = path.join(ROOT, 'services');
  const areasDir = path.join(ROOT, 'areas');

  services.forEach((s) => {
    const dir = path.join(servicesDir, s.slug);
    ensureDir(dir);
    const rel = '../../';
    fs.writeFileSync(path.join(dir, 'index.html'), servicePage(s, services, areas, rel), 'utf8');
    console.log('Written services/' + s.slug + '/index.html');
  });

  areas.forEach((a) => {
    const dir = path.join(areasDir, a.slug);
    ensureDir(dir);
    const rel = '../../';
    fs.writeFileSync(path.join(dir, 'index.html'), areaPage(a, services, areas, rel), 'utf8');
    console.log('Written areas/' + a.slug + '/index.html');
  });

  if (GENERATE_COMBO && services.length && areas.length) {
    services.forEach((s) => {
      areas.forEach((a) => {
        const dir = path.join(ROOT, `${s.slug}-in-${a.slug}`);
        ensureDir(dir);
        fs.writeFileSync(path.join(dir, 'index.html'), comboPage(s, a, services, areas), 'utf8');
        console.log('Written ' + s.slug + '-in-' + a.slug + '/index.html');
      });
    });
  }

  console.log('Done.');
}

main();
