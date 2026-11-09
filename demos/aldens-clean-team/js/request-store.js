/* =====================================================================
   QUOTE REQUESTS -> GOOGLE SHEET
   ---------------------------------------------------------------------
   The request form only talks to ACT.store.create(request), which
   returns a Promise of the saved record.

   With ACT_CONFIG.sheet.url set (the Apps Script Web app URL, see
   google-sheet/SETUP.md), each request is POSTed there and the script
   adds it as a new row in the team's Google Sheet.

   With no URL (demo mode) the form still works end to end, but the
   request is not sent anywhere; record.demo is true so the
   confirmation screen can say so.
   ===================================================================== */
(function () {
  "use strict";
  var C = window.ACT_CONFIG, core = window.ACT.core;
  var REF_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O or 1/I

  function makeRef() {
    var bytes = new Uint8Array(6), s = "";
    window.crypto.getRandomValues(bytes);
    for (var i = 0; i < 6; i++) s += REF_CHARS.charAt(bytes[i] % REF_CHARS.length);
    return "ACT-" + s;
  }

  function ValidationError(errors) {
    this.name = "ValidationError";
    this.errors = errors;
    this.message = "Request is not valid";
  }
  ValidationError.prototype = Object.create(Error.prototype);

  /* One request = one sheet row. Keys match the column headers the
     Apps Script writes (see google-sheet/Code.gs). */
  function buildRecord(req) {
    var svc = core.serviceById(req.serviceId), freq = core.frequencyById(req.frequency);
    return {
      ref: makeRef(),
      service: svc.name,
      frequency: freq.label,
      preferredDate: req.date,                 // YYYY-MM-DD
      preferredDateLabel: core.formatDateLong(req.date),
      timeOfDay: req.timeOfDay,
      street: String(req.street).trim(),
      city: String(req.city).trim(),
      bedrooms: svc.askRooms ? (req.bedrooms || "Not sure") : "",
      bathrooms: svc.askRooms ? (req.bathrooms || "Not sure") : "",
      size: req.squareFeet || "Not sure",
      name: String(req.name).trim(),
      phone: core.formatPhone(req.phone),
      email: String(req.email || "").trim(),
      notes: String(req.notes || "").trim(),
      submittedAt: new Date().toISOString(),
      source: "website"
    };
  }

  function SheetRequestStore(url) {
    this.create = function (req) {
      var errors = core.validateRequest(req);
      if (Object.keys(errors).length) return Promise.reject(new ValidationError(errors));
      var rec = buildRecord(req);
      if (!url) { rec.demo = true; return Promise.resolve(rec); }
      /* text/plain keeps this a "simple" request (no CORS preflight),
         which is what Apps Script web apps accept. */
      return fetch(url, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(rec),
        redirect: "follow"
      }).then(function (r) {
        if (!r.ok) throw new Error("Sheet returned " + r.status);
        return r.json();
      }).then(function (data) {
        if (!data || data.ok !== true) throw new Error((data && data.error) || "Sheet did not accept the request");
        return rec;
      });
    };
  }

  window.ACT.ValidationError = ValidationError;
  window.ACT.store = new SheetRequestStore(String(C.sheet && C.sheet.url || "").trim());
})();
