/**
 * KWebDevelopment — global config
 *
 * 1) leadWebhookUrl — Make.com webhook for quote form leads.
 * 2) feedbackWebhookUrl — Make.com webhook for 1–3 star private feedback (review.html).
 * 3) googleReviewsUrl — Your Google Business “Leave a review” or reviews page URL.
 * 4) Work phone + company email: phoneE164 and companyEmail below.
 *
 * Both window.CONFIG and window.KWEB_CONFIG point to the same object for compatibility.
 *
 * Test locally: python3 -m http.server 8000 → http://localhost:8000
 * Deploy (Netlify): Connect repo, build empty, publish directory: .
 */
window.CONFIG = {
  leadWebhookUrl: "https://hook.us2.make.com/fr29y3zbnwgmb617lrou7s8jiz8np2qd",
  successRedirect: "/thanks.html",

  feedbackWebhookUrl: "PASTE_FEEDBACK_WEBHOOK_HERE",
  googleReviewsUrl: "PASTE_GOOGLE_REVIEWS_LINK_HERE",

  phoneE164: "+14694436874",
  companyEmail: "kwebdevelopmenttx@gmail.com",

  /* toolkit.js may use primaryPhone; alias to phoneE164 */
  primaryPhone: "+14694436874"
};

window.KWEB_CONFIG = window.CONFIG;
