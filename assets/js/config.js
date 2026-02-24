/**
 * KWebDevelopment — global config
 *
 * 1) Webhook: leadWebhookUrl — your Make.com webhook for lead capture.
 * 2) Work phone + company email: Update phoneE164 and companyEmail below.
 * 3) Test locally: python3 -m http.server 8000 → http://localhost:8000
 * 4) Deploy (Netlify): Connect repo, build command empty, publish directory: .
 */
window.KWEB_CONFIG = {
  leadWebhookUrl: "https://hook.us2.make.com/fr29y3zbnwgmb617lrou7s8jiz8np2qd",
  successRedirect: "thanks.html",

  // Work phone (E.164, no spaces/dashes in value for tel:)
  phoneE164: "+14694436874",
  // Company email (for Gmail compose links)
  companyEmail: "kwebdevelopmenttx@gmail.com"
};
