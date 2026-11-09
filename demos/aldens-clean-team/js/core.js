/* Shared helpers: business clock, dates, validation, formatting.
   Used by the request form and the site.
   No storage code here, see request-store.js. */
(function () {
  "use strict";
  var C = window.ACT_CONFIG;
  var DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function toMinutes(hhmm) { var p = hhmm.split(":"); return (+p[0]) * 60 + (+p[1]); }
  function fromMinutes(m) { return pad(Math.floor(m / 60)) + ":" + pad(m % 60); }

  /* Date and time right now in Yakima, whatever the visitor's phone is set to. */
  function now() {
    var parts = {};
    new Intl.DateTimeFormat("en-US", {
      timeZone: C.business.timezone, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    return { date: parts.year + "-" + parts.month + "-" + parts.day, minutes: (+parts.hour % 24) * 60 + (+parts.minute) };
  }
  function today() { return now().date; }
  function parseDate(iso) { var p = iso.split("-"); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])); }
  function isoFromUTC(d) { return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate()); }
  function addDays(iso, n) { var d = parseDate(iso); d.setUTCDate(d.getUTCDate() + n); return isoFromUTC(d); }
  function weekday(iso) { return parseDate(iso).getUTCDay(); }
  function isValidISODate(iso) {
    return /^\d{4}-\d{2}-\d{2}$/.test(iso || "") && isoFromUTC(parseDate(iso)) === iso;
  }
  function firstDate() { return today(); }
  function lastDate() { return addDays(today(), C.bookingWindowDays); }
  function formatDateLong(iso) {
    var d = parseDate(iso);
    return DAY_NAMES[d.getUTCDay()] + ", " + MONTHS[d.getUTCMonth()] + " " + d.getUTCDate() + ", " + d.getUTCFullYear();
  }
  function formatDateShort(iso) {
    var d = parseDate(iso);
    return DAY_NAMES[d.getUTCDay()].slice(0, 3) + " " + MONTHS[d.getUTCMonth()] + " " + d.getUTCDate();
  }
  function formatTime(hhmm) {
    var m = toMinutes(hhmm), h = Math.floor(m / 60), mm = m % 60;
    return (h % 12 === 0 ? 12 : h % 12) + ":" + pad(mm) + " " + (h >= 12 ? "PM" : "AM");
  }

  function find(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function serviceById(id) { return find(C.services, id); }
  function frequencyById(id) { return find(C.frequencies, id); }
  function frequenciesFor(service) { return service && service.oneTimeOnly ? [C.frequencies[0]] : C.frequencies; }

  function phoneDigits(v) {
    var d = String(v || "").replace(/\D/g, "");
    if (d.length === 11 && d.charAt(0) === "1") d = d.slice(1);
    return d;
  }
  function formatPhone(v) {
    var d = phoneDigits(v);
    return d.length === 10 ? "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6) : String(v || "").trim();
  }

  /* Validates a quote request. Returns { field: message }. Empty = OK.
     The store runs this again before sending, and the Apps Script
     checks the required fields too. */
  function validateRequest(r) {
    var e = {};
    var svc = serviceById(r.serviceId);
    if (!svc) e.serviceId = "Please pick a service.";
    var freq = frequencyById(r.frequency);
    if (!freq) e.frequency = "Please pick how often.";
    else if (svc && frequenciesFor(svc).indexOf(freq) === -1) e.frequency = C.quote.oneTimeOnlyNote + " Please pick One-time.";
    if (r.bedrooms && C.bedrooms.indexOf(r.bedrooms) === -1) e.bedrooms = "Please pick from the list.";
    if (r.bathrooms && C.bathrooms.indexOf(r.bathrooms) === -1) e.bathrooms = "Please pick from the list.";
    if (r.squareFeet && C.squareFeet.indexOf(r.squareFeet) === -1) e.squareFeet = "Please pick from the list.";
    if (!String(r.street || "").trim()) e.street = "Please enter the street address for the visit.";
    if (!String(r.city || "").trim()) e.city = "Please enter the city.";
    if (!r.date) e.date = "Please pick a preferred day.";
    else if (!isValidISODate(r.date) || r.date < firstDate()) e.date = "Please pick today or a later date.";
    else if (r.date > lastDate()) e.date = "Please pick a date within the next " + C.bookingWindowDays + " days.";
    if (!r.timeOfDay) e.timeOfDay = "Please pick a time of day.";
    else if (C.timesOfDay.indexOf(r.timeOfDay) === -1) e.timeOfDay = "Please pick from the list.";
    if (!String(r.name || "").trim()) e.name = "Please enter your name.";
    if (!String(r.phone || "").trim()) e.phone = "Please enter your phone number.";
    else if (phoneDigits(r.phone).length !== 10) e.phone = "Please enter a 10-digit phone number, like (509) 555-0123.";
    var em = String(r.email || "").trim();
    if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) e.email = "That email doesn't look right. You can also leave it blank.";
    return e;
  }

  function mapsLink(street, city) {
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent((street + ", " + city).trim());
  }

  function escapeHTML(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  window.ACT = window.ACT || {};
  window.ACT.core = {
    now: now, today: today, addDays: addDays, weekday: weekday, isValidISODate: isValidISODate,
    firstDate: firstDate, lastDate: lastDate, formatDateLong: formatDateLong, formatDateShort: formatDateShort,
    formatTime: formatTime, toMinutes: toMinutes,
    serviceById: serviceById, frequencyById: frequencyById, frequenciesFor: frequenciesFor,
    phoneDigits: phoneDigits, formatPhone: formatPhone, validateRequest: validateRequest,
    mapsLink: mapsLink, escapeHTML: escapeHTML
  };
})();
