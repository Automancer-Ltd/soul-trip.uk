/* ============================================================
   SoulTrip Travel and Tours Ltd — main.js
   Nav scroll state · mobile menu · scroll reveal ·
   enquiry-type preselect · Formspree submit
   ============================================================ */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Scroll helper (nav-offset aware, avoids scrollIntoView) ---------- */
  function scrollToEl(el, extraOffset) {
    if (!el) return;
    var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-h"), 10) || 80;
    var top = window.pageYOffset + el.getBoundingClientRect().top - navH - (extraOffset || 16);
    window.scrollTo({ top: top, behavior: prefersReduced ? "auto" : "smooth" });
  }

  /* ---------- Sticky nav: transparent -> solid ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    nav.classList.toggle("is-scrolled", y > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true, capture: true });
  document.addEventListener("scroll", onScroll, { passive: true, capture: true });
  onScroll();

  /* ---------- Mobile hamburger ---------- */
  var toggle = document.getElementById("nav-toggle");
  var navLinks = document.getElementById("nav-links");

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  toggle.addEventListener("click", function () {
    setMenu(!nav.classList.contains("is-open"));
  });
  // Close menu after tapping a link
  navLinks.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });
  // Close on Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      setMenu(false);
      toggle.focus();
    }
  });

  /* ---------- Scroll reveal ----------
     Robust by design: content is visible by default. We only opt into the
     animated hidden state (html.js-anim) when we KNOW we can reveal it again.
     We avoid IntersectionObserver (which can silently never fire in some
     embedded/iframe scrollers) in favour of a getBoundingClientRect check
     wired to every plausible scroll source, plus a hard timeout fallback. */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function revealAll() {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  if (prefersReduced || !revealEls.length) {
    // No animation: leave everything visible (no js-anim class added).
    revealAll();
  } else {
    document.documentElement.classList.add("js-anim");

    function revealInView() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var pending = 0;
      revealEls.forEach(function (el) {
        if (el.classList.contains("is-in")) return;
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > -40) {
          el.classList.add("is-in");
        } else {
          pending++;
        }
      });
      return pending;
    }

    var ticking = false;
    function onScrollReveal() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        revealInView();
        ticking = false;
      });
    }

    // Listen on every scroll source we can, with capture so we catch
    // events from inner scroll containers too.
    window.addEventListener("scroll", onScrollReveal, { passive: true, capture: true });
    document.addEventListener("scroll", onScrollReveal, { passive: true, capture: true });
    window.addEventListener("resize", onScrollReveal, { passive: true });

    // Initial passes (cover late layout / font load).
    revealInView();
    window.addEventListener("load", revealInView);
    setTimeout(revealInView, 200);
    setTimeout(revealInView, 600);

    // Hard fallback: if for any reason scrolling never reports intersections,
    // never leave content hidden. Reveal everything after a short grace period.
    setTimeout(revealAll, 2500);
  }

  /* ---------- Service choice and enquiry guidance ---------- */
  var select = document.getElementById("type");
  var guidance = document.getElementById("enquiry-guidance");
  var enquiry = document.getElementById("enquiry");
  var prompts = {
    "Hajj": "For Hajj, tell us when you hope to travel and any questions you would like to discuss with the team.",
    "Umrah": "For Umrah, tell us your preferred dates, departure city and any questions about your journey.",
    "Spiritual Tour": "Tell us which places or spiritual experiences interest you and whether you are travelling as a family or group.",
    "Business Travel": "Tell us the purpose of your visit, the cities you plan to visit and any travel arrangements you need.",
    "Trade Shows & Exhibitions": "Tell us the event name, location and dates, if known, and which travel arrangements you need.",
    "Property Visits": "Tell us which cities you are considering and your preferred dates for property viewing trips.",
    "Hotel Booking": "Tell us the city, preferred dates and number of rooms, if known.",
    "Transportation": "Tell us the pickup and destination, approximate dates and group size, if known.",
    "Other": "Tell us what you would like help with and any questions for the team."
  };
  function updateGuidance() {
    if (guidance && prompts[select.value]) guidance.textContent = prompts[select.value] + " Share what you know in the message below; travel details are optional.";
  }
  function presetType(want) {
    if (!select) return;
    want = want.trim().toLowerCase();
    Array.prototype.forEach.call(select.options, function (opt) {
      if (opt.value.toLowerCase() === want || opt.text.toLowerCase() === want) {
        select.value = opt.value;
      }
    });
    updateGuidance();
  }
  if (select) select.addEventListener("change", updateGuidance);
  updateGuidance();

  // Keep previously shared typed links working. Bad escaping must never
  // stop the submit handler below from being installed.
  function presetFromHash() {
    var m = window.location.hash.match(/^#(?:enquiry\?|)type=([^&]*)/i);
    if (!m) return;
    try {
      presetType(decodeURIComponent(m[1].replace(/\+/g, " ")));
    } catch (_) { /* Leave the visitor's current choice intact. */ }
    enquiry.focus({ preventScroll: true });
    scrollToEl(enquiry);
  }
  presetFromHash();
  window.addEventListener("hashchange", presetFromHash);

  // Real fragment links work without JavaScript. Enhancement carries the
  // service choice and moves keyboard focus out of a closed mobile menu.
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button) return;
      var target = document.getElementById(link.getAttribute("href").slice(1));
      if (!target) return;
      var type = link.getAttribute("data-type");
      if (type) presetType(type);
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      // Native navigation owns the URL and history; CSS supplies nav clearance.
    });
  });

  /* ---------- Formspree submit ---------- */
  var form = document.getElementById("enquiry-form");
  var successPanel = document.getElementById("form-success");
  var errorBox = document.getElementById("form-error");
  var submitBtn = document.getElementById("submit-btn");

  if (form) {
    // Visible outcome of a sent enquiry — shared by the real submit path
    // and the honeypot path, so a bot learns nothing from the response.
    function showEnquirySuccess() {
      form.style.display = "none";
      successPanel.classList.add("is-visible");
      successPanel.focus({ preventScroll: true });
      scrollToEl(successPanel, 24);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      // A second submit (including Enter) must not send a second enquiry.
      if (submitBtn.disabled) return;

      // Honeypot — resolve to the same visible outcome as a real submit,
      // but send nothing and report nothing.
      var hp = form.querySelector('input[name="_gotcha"]');
      if (hp && hp.value) {
        showEnquirySuccess();
        return;
      }

      // Native validity check
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      errorBox.classList.remove("is-visible");
      submitBtn.disabled = true;
      var originalText = submitBtn.textContent;
      submitBtn.textContent = "Sending…";

      var data = new FormData(form);

      // Bound the wait: without a timeout a stalled connection leaves the
      // button stuck on "Sending…" and the enquiry is silently lost.
      var fetchOptions = {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" }
      };
      // Older browsers lack the built-in signal timeout: enforce the same
      // 15 s bound with a manual abort controller instead, cleared on
      // settle below.
      var submitTimer = null;
      function clearSubmitTimer() {
        if (submitTimer !== null) {
          clearTimeout(submitTimer);
          submitTimer = null;
        }
      }
      if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
        fetchOptions.signal = AbortSignal.timeout(15000);
      } else if (typeof AbortController !== "undefined") {
        var submitAbort = new AbortController();
        fetchOptions.signal = submitAbort.signal;
        submitTimer = setTimeout(function () { submitAbort.abort(); }, 15000);
      }

      fetch(form.action, fetchOptions)
        .then(function (response) {
          clearSubmitTimer();
          if (response.ok) {
            showEnquirySuccess();
          } else {
            throw new Error("Bad response");
          }
        })
        .catch(function (err) {
          clearSubmitTimer();
          // Report the failure without any visitor data so lost enquiries are
          // visible; the Sentry guard redacts the event before it leaves.
          if (window.Sentry && typeof window.Sentry.captureException === "function") {
            var report = new Error("Enquiry submission failed");
            report.name = err && err.name ? "EnquirySubmit" + err.name : "EnquirySubmitError";
            window.Sentry.captureException(report);
          }
          errorBox.classList.add("is-visible");
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          errorBox.focus({ preventScroll: true });
          scrollToEl(errorBox);
        });
    });
    // Enhance validation only after the handler exists. Without JavaScript,
    // the same form keeps the browser's validation and native POST behaviour.
    form.noValidate = true;
  }

  /* ---------- Year (footer is static 2026 per brief; left as-is) ---------- */
})();
