/**
 * RETENTION + LOCAL SEO TOOLKIT — CONFIG
 * ======================================
 *
 * CHECKLIST:
 * 1) googleReviewUrl — Paste your Google review link here.
 *    Get it: Google Business Profile → Share review form, or
 *    https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID
 *
 * 2) leadWebhookUrl — Paste your Make.com or Zapier webhook URL here.
 *    (Make: Create webhook module, copy URL. Zapier: Webhooks by Zapier → Catch Hook.)
 *
 * 3) feedbackWebhookUrl — Paste webhook URL for 1–3 star private feedback.
 *
 * 4) discountWebhookUrl — Paste webhook URL for seasonal/referral opt-in (discount.html).
 *
 * If a webhook URL is left empty, the form still works; a visible "Not connected yet"
 * message is shown so you can test the UI. No broken behavior.
 */
(function (global) {
  'use strict';

  var CONFIG = {
    businessName: 'KWebDevelopment',
    primaryPhone: '14694436874',
    trackingPhoneOptional: '',
    businessEmail: 'kwebdevelopmenttx@gmail.com',
    googleReviewUrl: '',
    leadWebhookUrl: '',
    feedbackWebhookUrl: '',
    discountWebhookUrl: '',
    enableFloatingCallButton: true,
    enableLeadModal: true,
    enableSmsConsent: true,
    enableUtmCapture: true,
    timezone: 'America/Chicago',
    businessHours: { start: '08:00', end: '18:00' },
    serviceDaysAllowed: [1, 2, 3, 4, 5, 6],
    expectedCallbackWindowText: 'within the hour',
    brandColors: { primary: '#111', secondary: '#333' },
    logoPath: ''
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
  } else {
    global.CONFIG = CONFIG;
  }
})(typeof window !== 'undefined' ? window : this);
