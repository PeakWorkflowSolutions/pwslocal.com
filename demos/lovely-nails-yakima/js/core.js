/* Shared helpers: salon clock, open hours, time slots, price labels,
   validation. Used by the booking flow, the site and the salon view.
   No storage code here, see booking-store.js. */
(function () {
  "use strict";
  var C = window.LN_CONFIG;
  var DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function toMinutes(hhmm) { var p = hhmm.split(":"); return (+p[0]) * 60 + (+p[1]); }
  function fromMinutes(m) { return pad(Math.floor(m / 60)) + ":" + pad(m % 60); }

  /* "Now" in the salon's time zone, so slots are right even if the
     customer's phone is set to another zone. */
  function salonNow() {
    var parts = {};
    new Intl.DateTimeFormat("en-US", {
      timeZone: C.salon.timezone, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    return {
      date: parts.year + "-" + parts.month + "-" + parts.day,
      minutes: (+parts.hour % 24) * 60 + (+parts.minute)
    };
  }

  function parseDate(iso) { var p = iso.split("-"); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])); }
  function isoFromUTC(d) { return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate()); }
  function addDays(iso, n) { var d = parseDate(iso); d.setUTCDate(d.getUTCDate() + n); return isoFromUTC(d); }
  function weekday(iso) { return parseDate(iso).getUTCDay(); }
  function isValidISODate(iso) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || "")) return false;
    return isoFromUTC(parseDate(iso)) === iso;
  }

  function formatTime(hhmm) {
    var m = toMinutes(hhmm), h = Math.floor(m / 60), mm = m % 60;
    var ap = h >= 12 ? "PM" : "AM", h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ":" + pad(mm) + " " + ap;
  }
  function formatDateLong(iso) {
    var d = parseDate(iso);
    return DAY_NAMES[d.getUTCDay()] + ", " + MONTHS[d.getUTCMonth()] + " " + d.getUTCDate() + ", " + d.getUTCFullYear();
  }
  function formatDateShort(iso) {
    var d = parseDate(iso);
    return DAY_NAMES[d.getUTCDay()].slice(0, 3) + " " + MONTHS[d.getUTCMonth()] + " " + d.getUTCDate();
  }

  function hoursFor(iso) { return C.hours[weekday(iso)] || null; }
  function hoursLabel(h) { return h ? formatTime(h.open) + " - " + formatTime(h.close) : "Closed"; }

  function serviceById(id) {
    for (var i = 0; i < C.services.length; i++) if (C.services[i].id === id) return C.services[i];
    return null;
  }
  function technicianById(id) {
    for (var i = 0; i < C.technicians.length; i++) if (C.technicians[i].id === id) return C.technicians[i];
    return null;
  }
  function durationFor(service) { return (service && service.minutes) || C.appointmentMinutes; }

  function priceLabel(service) {
    if (service.price == null) return "Ask the salon";
    return (service.pricePrefix ? service.pricePrefix.charAt(0).toUpperCase() + service.pricePrefix.slice(1) + " " : "") + "$" + service.price;
  }

  function firstBookableDate() { return salonNow().date; }
  function lastBookableDate() { return addDays(salonNow().date, C.bookingWindowDays); }

  /* All start times for a date: inside open hours, the whole appointment
     must end by closing, never in the past (plus a small lead time). */
  function slotsFor(iso, minutes) {
    if (!isValidISODate(iso)) return [];
    var now = salonNow();
    if (iso < now.date || iso > lastBookableDate()) return [];
    var h = hoursFor(iso);
    if (!h) return [];
    var dur = minutes || C.appointmentMinutes;
    var open = toMinutes(h.open), close = toMinutes(h.close), out = [];
    for (var m = open; m + dur <= close; m += C.slotStepMinutes) {
      if (iso === now.date && m < now.minutes + C.minLeadMinutes) continue;
      out.push(fromMinutes(m));
    }
    return out;
  }
  function isSlotBookable(iso, hhmm, minutes) { return slotsFor(iso, minutes).indexOf(hhmm) !== -1; }

  function phoneDigits(v) {
    var d = String(v || "").replace(/\D/g, "");
    if (d.length === 11 && d.charAt(0) === "1") d = d.slice(1);
    return d;
  }
  function formatPhone(v) {
    var d = phoneDigits(v);
    return d.length === 10 ? "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6) : String(v || "").trim();
  }

  /* Validates a booking request. Returns { field: message }. Empty = OK.
     The store runs this again before saving, so a real backend can
     reuse the same rules. */
  function validateBooking(b) {
    var e = {};
    var svc = serviceById(b.serviceId);
    if (!svc) e.serviceId = "Please pick a service.";
    if (!b.date) e.date = "Please pick a date.";
    else if (!isValidISODate(b.date) || b.date < firstBookableDate()) e.date = "Please pick today or a later date.";
    else if (b.date > lastBookableDate()) e.date = "Please pick a date within the next " + C.bookingWindowDays + " days.";
    else if (!hoursFor(b.date)) e.date = "The salon is closed that day. Please pick another date.";
    if (!e.date) {
      if (!b.time) e.time = "Please pick a time.";
      else if (!isSlotBookable(b.date, b.time, durationFor(svc))) e.time = "That time is no longer available. Please pick another time.";
    }
    if (!technicianById(b.technician)) e.technician = "Please pick a technician option.";
    if (!String(b.name || "").trim()) e.name = "Please enter your name.";
    var pd = phoneDigits(b.phone);
    if (!String(b.phone || "").trim()) e.phone = "Please enter your phone number.";
    else if (pd.length !== 10) e.phone = "Please enter a 10-digit phone number, like (509) 555-0123.";
    return e;
  }

  function escapeHTML(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  window.LN = window.LN || {};
  window.LN.core = {
    DAY_NAMES: DAY_NAMES, pad: pad, salonNow: salonNow, addDays: addDays, weekday: weekday,
    formatTime: formatTime, formatDateLong: formatDateLong, formatDateShort: formatDateShort,
    hoursFor: hoursFor, hoursLabel: hoursLabel, serviceById: serviceById, technicianById: technicianById,
    durationFor: durationFor, priceLabel: priceLabel, firstBookableDate: firstBookableDate,
    lastBookableDate: lastBookableDate, slotsFor: slotsFor, isSlotBookable: isSlotBookable,
    phoneDigits: phoneDigits, formatPhone: formatPhone, validateBooking: validateBooking,
    escapeHTML: escapeHTML, isValidISODate: isValidISODate, toMinutes: toMinutes
  };
})();
