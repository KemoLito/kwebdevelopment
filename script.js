(function () {
  'use strict';

  var config = window.KWEB_CONFIG || {};
  var UTMS_KEY = 'kweb_utms';

  // Capture UTMs from landing URL into localStorage
  function captureUtms() {
    try {
      var params = new URLSearchParams(window.location.search);
      var utmSource = params.get('utm_source');
      if (!utmSource) return;
      var utms = {
        utm_source: params.get('utm_source') || '',
        utm_medium: params.get('utm_medium') || '',
        utm_campaign: params.get('utm_campaign') || '',
        utm_term: params.get('utm_term') || '',
        utm_content: params.get('utm_content') || ''
      };
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

  captureUtms();

  // Copyright year
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  // Apply phone and email from config to [data-kweb-phone] / [data-kweb-email]
  var phone = (config.phoneE164 || '').replace(/\s|-/g, '');
  var telHref = phone ? 'tel:' + phone : '#';
  var email = (config.companyEmail || config.email || '').trim();
  var gmailHref = email ? 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(email) : '#';
  document.querySelectorAll('[data-kweb-phone]').forEach(function (el) { el.href = telHref; });
  document.querySelectorAll('[data-kweb-email]').forEach(function (el) { el.href = gmailHref; });
  var googleReviewsUrl = (config.googleReviewsUrl || '').trim();
  document.querySelectorAll('[data-kweb-google-reviews]').forEach(function (el) {
    el.href = googleReviewsUrl || '#';
    if (!googleReviewsUrl) el.style.visibility = 'hidden';
  });

  // Quote form (quote.html only)
  var quoteForm = document.getElementById('quote-form');
  if (quoteForm) {
    quoteForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var nameEl = quoteForm.querySelector('[name="name"]');
      var phoneEl = quoteForm.querySelector('[name="phone"]');
      var needEl = quoteForm.querySelector('[name="need"]');
      var serviceAreaEl = quoteForm.querySelector('[name="serviceArea"]');
      var dateEl = quoteForm.querySelector('[name="preferredDate"]');
      var timeEl = quoteForm.querySelector('[name="preferredTime"]');
      var formError = document.getElementById('formError');
      var submitBtn = quoteForm.querySelector('button[type="submit"]');

      function showError(msg) {
        if (formError) {
          formError.textContent = msg || 'Something went wrong. Please try again or call us.';
          formError.classList.add('visible');
        }
      }

      function clearError() {
        if (formError) {
          formError.textContent = '';
          formError.classList.remove('visible');
        }
      }

      var name = nameEl ? nameEl.value.trim() : '';
      var phoneRaw = phoneEl ? phoneEl.value : '';
      var phone = phoneRaw.replace(/\D/g, '');
      if (phone.length === 11 && phone[0] === '1') phone = phone.slice(1);
      var need = needEl ? needEl.value.trim() : '';
      var serviceArea = serviceAreaEl ? serviceAreaEl.value.trim() : '';
      var preferredDate = dateEl ? dateEl.value.trim() : '';
      var preferredTime = timeEl ? timeEl.value.trim() : '';

      clearError();

      if (!name) {
        showError('Please enter your name.');
        return;
      }
      if (!phone || phone.length !== 10) {
        showError('Please enter a valid 10-digit phone number.');
        return;
      }
      if (!need) {
        showError('Please select what you need.');
        return;
      }
      if (!serviceArea) {
        showError('Please enter your service area (city or region).');
        return;
      }
      if (!preferredDate) {
        showError('Please select a preferred date.');
        return;
      }
      if (!preferredTime) {
        showError('Please select a preferred time.');
        return;
      }

      var webhook = (config.leadWebhookUrl || '').trim();
      if (!webhook) {
        showError('Something went wrong. Please try again or call us.');
        return;
      }

      var payload = {
        timestamp: new Date().toISOString(),
        pageUrl: window.location.href,
        name: name,
        phone: phone,
        businessName: (quoteForm.querySelector('[name="businessName"]') || {}).value.trim() || '',
        need: need,
        serviceArea: serviceArea,
        preferredDate: preferredDate,
        preferredTime: preferredTime,
        notes: (quoteForm.querySelector('[name="notes"]') || {}).value.trim() || '',
        utms: getStoredUtms()
      };

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }

      fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          if (res.ok || res.status === 204) {
            window.location.href = config.successRedirect || '/thanks.html';
            return;
          }
          throw new Error('Request failed');
        })
        .catch(function () {
          showError('Something went wrong. Please try again or call us.');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit';
          }
        });
    });
  }

  // Mobile nav toggle
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('nav .links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', navLinks.classList.contains('open'));
    });
  }
})();
