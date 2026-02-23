/**
 * Retention + Local SEO Toolkit — core behavior
 * Depends: config.js (CONFIG). Defensive: no crash if CONFIG missing.
 *
 * Missed-call text-back: Handled by CRM (GoHighLevel/Twilio/CallRail). Website role:
 * capture leads + consent; use tracking number in CONFIG.trackingPhoneOptional if desired.
 * Configure automation in your CRM to send SMS on missed-call event.
 */
(function () {
  'use strict';

  var CONFIG = typeof window !== 'undefined' && window.CONFIG ? window.CONFIG : {};
  var UTMS_KEY = 'tk_utms';

  function getPhone() {
    var t = CONFIG.trackingPhoneOptional;
    return (t && String(t).trim()) ? String(t).trim() : (CONFIG.primaryPhone || '');
  }

  function getTelHref(phone) {
    var p = (phone || getPhone()).replace(/\D/g, '');
    return p ? 'tel:+' + p : '#';
  }

  function getSmsHref(phone) {
    var p = (phone || getPhone()).replace(/\D/g, '');
    return p ? 'sms:+' + p : '#';
  }

  function captureUtms() {
    if (!CONFIG.enableUtmCapture || typeof window === 'undefined') return;
    var params = new URLSearchParams(window.location.search);
    var utmSource = params.get('utm_source');
    if (!utmSource) return;
    var utms = {
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      utm_term: params.get('utm_term'),
      utm_content: params.get('utm_content')
    };
    try {
      localStorage.setItem(UTMS_KEY, JSON.stringify(utms));
    } catch (e) {}
  }

  function getStoredUtms() {
    try {
      var raw = localStorage.getItem(UTMS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function validateUSPhone(str) {
    var digits = (str || '').replace(/\D/g, '');
    return digits.length === 10 || (digits.length === 11 && digits[0] === '1');
  }

  function initUtmCapture() {
    if (typeof window === 'undefined') return;
    captureUtms();
  }

  function initFloatingCallButton() {
    if (!CONFIG.enableFloatingCallButton || !getPhone()) return;
    var wrap = document.getElementById('tk-fab-wrap');
    if (!wrap) return;
    var link = wrap.querySelector('a.tk-fab');
    if (link) link.href = getTelHref();
    wrap.classList.add('visible');
    wrap.classList.add('visible-mobile-only');
  }

  function initClickToCall() {
    var phone = getPhone();
    if (!phone) return;
    document.querySelectorAll('.tk-btn-call, [data-tk-call]').forEach(function (el) {
      if (el.tagName === 'A') {
        el.href = getTelHref();
      } else {
        el.addEventListener('click', function () {
          window.location.href = getTelHref();
        });
      }
    });
  }

  function initTextUs() {
    var phone = getPhone();
    if (!phone) return;
    document.querySelectorAll('.tk-text-us, [data-tk-sms]').forEach(function (el) {
      if (el.tagName === 'A') {
        el.href = getSmsHref();
      } else {
        el.addEventListener('click', function () {
          window.location.href = getSmsHref();
        });
      }
    });
  }

  function trapFocus(container) {
    if (!container) return;
    var focusables = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    container.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  function openLeadModal() {
    var overlay = document.getElementById('tk-lead-modal');
    if (!overlay) return;
    overlay.classList.add('visible');
    overlay.setAttribute('aria-hidden', 'false');
    var firstFocus = overlay.querySelector('input, select, button');
    if (firstFocus) firstFocus.focus();
    trapFocus(overlay);
    document.body.style.overflow = 'hidden';
  }

  function closeLeadModal() {
    var overlay = document.getElementById('tk-lead-modal');
    if (!overlay) return;
    overlay.classList.remove('visible');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    var trigger = document.querySelector('[data-tk-open-lead]');
    if (trigger) trigger.focus();
  }

  function initLeadModal() {
    if (!CONFIG.enableLeadModal) return;
    var overlay = document.getElementById('tk-lead-modal');
    if (!overlay) return;

    document.querySelectorAll('[data-tk-open-lead], .tk-btn-quote').forEach(function (el) {
      el.addEventListener('click', function (e) {
        var h = el.getAttribute('href') || '';
        if (h === '#contact' || h === '#' || h.indexOf('#contact') > -1) {
          e.preventDefault();
          openLeadModal();
        }
      });
    });

    overlay.querySelectorAll('[data-tk-close-lead], .tk-modal-close').forEach(function (btn) {
      btn.addEventListener('click', closeLeadModal);
    });

    overlay.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLeadModal();
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeLeadModal();
    });
  }

  function getDataBase() {
    try {
      var pathname = window.location.pathname || '';
      var segments = pathname.split('/').filter(Boolean);
      if (segments.length && !pathname.endsWith('/')) segments.pop();
      var depth = Math.max(0, segments.length - 1);
      return depth ? Array(depth + 1).join('../') : '';
    } catch (e) { return ''; }
  }

  function loadServicesOptions(selectEl) {
    if (!selectEl) return;
    var base = getDataBase();
    var fallback = [
      { slug: 'website', title: 'Website' },
      { slug: 'landing-page', title: 'Landing page' },
      { slug: 'local-seo', title: 'Local SEO' }
    ];
    fetch(base + 'data/services.json')
      .then(function (r) { return r.ok ? r.json() : []; })
      .catch(function () { return []; })
      .then(function (arr) {
        var list = (arr && arr.length) ? arr : fallback;
        selectEl.innerHTML = '';
        var opt = document.createElement('option');
        opt.value = '';
        opt.textContent = 'Select a service…';
        selectEl.appendChild(opt);
        list.forEach(function (s) {
          var o = document.createElement('option');
          o.value = s.slug || s.title || '';
          o.textContent = s.title || s.slug || '';
          selectEl.appendChild(o);
        });
      });
  }

  function submitLeadForm(form) {
    var webhook = CONFIG.leadWebhookUrl;
    var nameEl = form.querySelector('[name="name"]');
    var phoneEl = form.querySelector('[name="phone"]');
    var serviceEl = form.querySelector('[name="serviceNeeded"]');
    var zipEl = form.querySelector('[name="zipOrCity"]');
    var dateEl = form.querySelector('[name="preferredDate"]');
    var timeEl = form.querySelector('[name="preferredTime"]');
    var notesEl = form.querySelector('[name="notes"]');
    var smsEl = form.querySelector('[name="smsConsent"]');

    var name = nameEl ? nameEl.value.trim() : '';
    var phone = (phoneEl ? phoneEl.value : '').replace(/\D/g, '');
    if (phone.length === 11 && phone[0] === '1') phone = phone.slice(1);
    phone = phone.replace(/\D/g, '');

    var errors = [];
    if (!name) errors.push('Please enter your name.');
    if (!phone) errors.push('Please enter your phone number.');
    if (!validateUSPhone(phoneEl ? phoneEl.value : '')) errors.push('Please enter a valid 10-digit US phone number.');
    if (serviceEl && !serviceEl.value.trim()) errors.push('Please select a service.');
    if (zipEl && !zipEl.value.trim()) errors.push('Please enter your city or ZIP code.');
    if (CONFIG.enableSmsConsent && smsEl && !smsEl.checked) errors.push('Please check the box to agree to receive text messages.');

    form.querySelectorAll('.error').forEach(function (el) { el.classList.remove('error'); });
    if (errors.length) {
      var errEl = form.querySelector('.tk-message.error');
      if (errEl) {
        errEl.textContent = errors[0];
        errEl.classList.add('visible');
      }
      return;
    }

    var payload = {
      source: 'website',
      timestamp: new Date().toISOString(),
      pageUrl: typeof window !== 'undefined' ? window.location.href : '',
      name: name,
      phone: phone,
      serviceNeeded: serviceEl ? serviceEl.value : '',
      zipOrCity: zipEl ? zipEl.value.trim() : '',
      preferredDate: dateEl ? dateEl.value : '',
      preferredTime: timeEl ? timeEl.value : '',
      notes: notesEl ? notesEl.value.trim() : '',
      smsConsent: smsEl ? smsEl.checked : false,
      utms: CONFIG.enableUtmCapture ? getStoredUtms() : {}
    };

    var submitBtn = form.querySelector('[type="submit"], .tk-btn-submit');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
    }

    var successEl = form.querySelector('.tk-message.success');
    var errorEl = form.querySelector('.tk-message.error');
    var notConfigEl = form.querySelector('.tk-message.not-configured');

    function showSuccess() {
      if (successEl) {
        var text = CONFIG.expectedCallbackWindowText || 'soon';
        successEl.innerHTML = 'Thanks! We\'ll text you shortly and call you ' + text + '.';
        successEl.classList.add('visible');
      }
      if (errorEl) errorEl.classList.remove('visible');
      if (notConfigEl) notConfigEl.classList.remove('visible');
      form.reset();
    }

    function showError(msg) {
      if (errorEl) {
        errorEl.textContent = msg || 'Something went wrong. Please call us instead.';
        errorEl.classList.add('visible');
      }
      if (successEl) successEl.classList.remove('visible');
    }

    function showNotConfigured() {
      if (notConfigEl) {
        notConfigEl.textContent = 'Not connected yet — paste your Make.com or Zapier webhook URL in config.js to receive leads here.';
        notConfigEl.classList.add('visible');
      }
      if (successEl) successEl.classList.remove('visible');
      if (errorEl) errorEl.classList.remove('visible');
    }

    if (!webhook || !webhook.trim()) {
      showNotConfigured();
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Get Free Quote'; }
      return;
    }

    fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (r) {
        if (r.ok || r.status === 204) showSuccess();
        else showError('Request failed. Please call us.');
      })
      .catch(function () { showError(); })
      .then(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Get Free Quote';
        }
      });
  }

  function initLeadForm() {
    var form = document.getElementById('tk-lead-form');
    if (!form) return;
    loadServicesOptions(form.querySelector('[name="serviceNeeded"]'));
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submitLeadForm(form);
    });
  }

  function initReviewFunnel() {
    var container = document.getElementById('tk-review-funnel');
    if (!container) return;

    var starButtons = container.querySelectorAll('.tk-review-stars button');
    var step2 = container.querySelector('.tk-review-step2');
    var step2Google = container.querySelector('.tk-review-google-link');
    var step2Feedback = container.querySelector('.tk-review-feedback');
    var feedbackForm = container.querySelector('#tk-feedback-form');
    var ratingInput = container.querySelector('input[name="rating"]');

    var selectedRating = 0;

    starButtons.forEach(function (btn, i) {
      var value = i + 1;
      btn.setAttribute('aria-label', value + ' star' + (value > 1 ? 's' : ''));
      btn.setAttribute('aria-pressed', 'false');
      btn.addEventListener('click', function () {
        selectedRating = value;
        if (ratingInput) ratingInput.value = value;
        starButtons.forEach(function (b, j) {
          b.classList.toggle('selected', j < value);
          b.setAttribute('aria-pressed', j < value ? 'true' : 'false');
        });
        if (step2) step2.classList.add('visible');
        if (value >= 4 && step2Google) {
          step2Google.style.display = 'block';
          if (step2Feedback) step2Feedback.style.display = 'none';
          if (step2Google.querySelector('a')) {
            step2Google.querySelector('a').href = CONFIG.googleReviewUrl || '#';
          }
        } else if (value <= 3 && step2Feedback) {
          step2Feedback.style.display = 'block';
          if (step2Google) step2Google.style.display = 'none';
        }
      });
    });

    if (step2Google && step2Google.querySelector('a')) {
      step2Google.querySelector('a').addEventListener('click', function () {
        var url = CONFIG.feedbackWebhookUrl || CONFIG.leadWebhookUrl;
        if (url && typeof fetch !== 'undefined') {
          fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              rating: selectedRating,
              action: 'sent_to_google',
              utms: getStoredUtms(),
              timestamp: new Date().toISOString()
            })
          }).catch(function () {});
        }
      });
    }

    if (feedbackForm) {
      feedbackForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var msg = feedbackForm.querySelector('[name="message"]');
        if (!msg || !msg.value.trim()) return;
        var payload = {
          rating: selectedRating,
          message: msg.value.trim(),
          name: (feedbackForm.querySelector('[name="name"]') || {}).value || '',
          email: (feedbackForm.querySelector('[name="email"]') || {}).value || '',
          phoneOptional: (feedbackForm.querySelector('[name="phoneOptional"]') || {}).value || '',
          timestamp: new Date().toISOString(),
          utms: getStoredUtms(),
          pageUrl: window.location.href
        };
        var wh = CONFIG.feedbackWebhookUrl;
        if (wh && wh.trim()) {
          fetch(wh, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }).then(function () {
            var thanks = container.querySelector('.tk-feedback-thanks');
            if (thanks) { thanks.classList.add('visible'); feedbackForm.style.display = 'none'; }
          }).catch(function () {
            var thanks = container.querySelector('.tk-feedback-thanks');
            if (thanks) { thanks.classList.add('visible'); feedbackForm.style.display = 'none'; }
          });
        } else {
          var thanks = container.querySelector('.tk-feedback-thanks');
          if (thanks) { thanks.classList.add('visible'); feedbackForm.style.display = 'none'; }
        }
      });
    }
  }

  function initDiscountPage() {
    var form = document.getElementById('tk-discount-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (form.querySelector('[name="name"]') || {}).value || '';
      var phone = (form.querySelector('[name="phone"]') || {}).value || '';
      var projectType = (form.querySelector('[name="projectType"]') || {}).value || '';
      var smsConsent = (form.querySelector('[name="smsConsent"]') || {}).checked || false;

      var digits = phone.replace(/\D/g, '');
      if (digits.length === 11 && digits[0] === '1') digits = digits.slice(1);
      var last4 = digits.slice(-4);
      var letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
      var code = last4 + Array.from({ length: 3 }, function () { return letters[Math.floor(Math.random() * letters.length)]; }).join('');

      var payload = {
        name: name,
        phone: phone,
        projectType: projectType,
        smsConsent: smsConsent,
        referralCode: code,
        timestamp: new Date().toISOString(),
        utms: getStoredUtms(),
        pageUrl: window.location.href
      };

      var webhook = CONFIG.discountWebhookUrl;
      if (webhook && webhook.trim()) {
        fetch(webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(function () {});
      }

      var baseUrl = window.location.origin + window.location.pathname;
      var refUrl = baseUrl + (baseUrl.indexOf('?') >= 0 ? '&' : '?') + 'ref=' + encodeURIComponent(code);
      var shareText = 'Get this offer: ' + refUrl + ' — Use code ' + code;

      var resultEl = document.getElementById('tk-referral-result');
      var codeEl = document.getElementById('tk-referral-code');
      if (resultEl) resultEl.classList.add('visible');
      if (codeEl) codeEl.textContent = code;

      var copySms = document.getElementById('tk-copy-sms');
      var copyEmail = document.getElementById('tk-copy-email');
      if (copySms) {
        copySms.onclick = function () {
          navigator.clipboard.writeText(shareText).then(function () {
            copySms.textContent = 'Copied!';
            setTimeout(function () { copySms.textContent = 'Copy SMS'; }, 2000);
          });
        };
      }
      if (copyEmail) {
        copyEmail.onclick = function () {
          navigator.clipboard.writeText(shareText).then(function () {
            copyEmail.textContent = 'Copied!';
            setTimeout(function () { copyEmail.textContent = 'Copy Email'; }, 2000);
          });
        };
      }

      form.style.display = 'none';
    });
  }

  function openCalendlyPopup() {
    var url = CONFIG.calendlyUrl && String(CONFIG.calendlyUrl).trim();
    if (!url) return false;
    if (typeof window.Calendly !== 'undefined') {
      window.Calendly.initPopupWidget({ url: url });
      return true;
    }
    var script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    script.onload = function () {
      if (window.Calendly) window.Calendly.initPopupWidget({ url: url });
    };
    document.body.appendChild(script);
    return true;
  }

  function initCalendly() {
    document.querySelectorAll('[data-tk-calendly], .tk-btn-get-started').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var url = CONFIG.calendlyUrl && String(CONFIG.calendlyUrl).trim();
        if (url && openCalendlyPopup()) return;
        var contact = document.getElementById('contact');
        if (contact) contact.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  function init() {
    initUtmCapture();
    initFloatingCallButton();
    initClickToCall();
    initTextUs();
    initCalendly();
    initLeadModal();
    initLeadForm();
    initReviewFunnel();
    initDiscountPage();
  }

  if (typeof document !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else if (typeof document !== 'undefined') {
    init();
  }
})();
