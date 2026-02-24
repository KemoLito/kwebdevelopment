/**
 * KWebDevelopment — global config
 *
 * 1) leadWebhookUrl — Make.com webhook for quote form leads.
 * 2) feedbackWebhookUrl — Make.com webhook for 1–3 star private feedback (review.html).
 * 3) googleReviewsUrl — Your Google Business “Leave a review” or reviews page URL.
 * 4) Work phone + company email: phoneE164 and companyEmail below.
 *
 * Test locally: python3 -m http.server 8000 → http://localhost:8000
 * Deploy (Netlify): Connect repo, build empty, publish directory: .
 */
window.KWEB_CONFIG = {
  leadWebhookUrl: "https://hook.us2.make.com/fr29y3zbnwgmb617lrou7s8jiz8np2qd",
  feedbackWebhookUrl: "PASTE_FEEDBACK_WEBHOOK_HERE",
  successRedirect: "/thanks.html",
  phoneE164: "+14694436874",
  companyEmail: "kwebdevelopmenttx@gmail.com",
  googleReviewsUrl: "PASTE_GOOGLE_REVIEWS_LINK_HERE"
};
