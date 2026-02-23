/**
 * RETENTION + LOCAL SEO TOOLKIT — CONFIG
 * ========================================
 * CHECKLIST (paste values per client):
 * 1) googleReviewUrl — Get from Google Business Profile: Profile → Share review form,
 *    or use: https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID
 * 2) leadWebhookUrl — Zapier/Make/GoHighLevel "Webhooks by Zapier" or GHL form webhook URL
 * 3) feedbackWebhookUrl — Same; for 1–3 star private feedback submissions
 * 4) discountWebhookUrl — For seasonal/referral opt-in on /discount.html
 *
 * CONNECTING:
 * - GoHighLevel: Form webhook → Pipeline → Create contact → Trigger SMS + Call task
 * - Missed-call text-back: Use tracking number (CallRail/Twilio) + automation on missed call
 *   (Website role: capture leads + consent; CRM/Twilio handles the actual text-back)
 * - Seasonal campaigns: Add contacts to "Past Customers" smart list; send campaign every 90 days
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
