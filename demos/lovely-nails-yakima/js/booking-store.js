/* =====================================================================
   BOOKING STORAGE
   ---------------------------------------------------------------------
   The booking flow and the salon view ONLY talk to LN.store, through
   four async methods:

     LN.store.create(request)  -> Promise<booking>
     LN.store.list()           -> Promise<booking[]>   (newest first)
     LN.store.cancel(ref)      -> Promise<booking>
     LN.store.onChange(fn)     -> call fn when bookings change

   For the demo, bookings live in this browser's localStorage.
   To move to a real backend, write an object with the same four
   methods (see ApiBookingStore below) and change the last line of
   this file. Nothing in booking.js or salon.js needs to change.
   ===================================================================== */
(function () {
  "use strict";
  var core = window.LN.core;
  var KEY = "lovelyNails.bookings.v1";
  var REF_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O or 1/I

  function makeRef(existing) {
    var ref;
    do {
      var bytes = new Uint8Array(6), s = "";
      (window.crypto || window.msCrypto).getRandomValues(bytes);
      for (var i = 0; i < 6; i++) s += REF_CHARS.charAt(bytes[i] % REF_CHARS.length);
      ref = "LN-" + s;
    } while (existing[ref]);
    return ref;
  }

  function ValidationError(errors) {
    this.name = "ValidationError";
    this.errors = errors;
    this.message = "Booking is not valid";
  }
  ValidationError.prototype = Object.create(Error.prototype);

  /* Turns a validated request into the saved booking record. A backend
     should build the same shape. */
  function buildRecord(req, ref) {
    var svc = core.serviceById(req.serviceId);
    var tech = core.technicianById(req.technician);
    var otherName = tech.allowName ? String(req.technicianName || "").trim() : "";
    return {
      ref: ref,
      status: "requested",              // requested -> confirmed / cancelled
      serviceId: svc.id,
      serviceName: svc.name,
      priceLabel: core.priceLabel(svc),
      durationMinutes: core.durationFor(svc),
      date: req.date,                    // YYYY-MM-DD, salon time zone
      time: req.time,                    // HH:MM 24h, salon time zone
      technician: tech.id,
      technicianLabel: tech.label + (otherName ? ": " + otherName : ""),
      name: String(req.name).trim(),
      phone: core.formatPhone(req.phone),
      notes: String(req.notes || "").trim(),
      createdAt: new Date().toISOString(),
      source: "website"
    };
  }

  /* ---------------- Demo store: this browser only ---------------- */
  function LocalStorageBookingStore() {
    var listeners = [];
    var memory = null; // used only if the browser blocks localStorage
    function read() {
      if (memory) return memory.slice();
      try { var v = JSON.parse(window.localStorage.getItem(KEY) || "[]"); return Array.isArray(v) ? v : []; }
      catch (e) { memory = memory || []; return memory.slice(); }
    }
    function write(all) {
      if (!memory) {
        try { window.localStorage.setItem(KEY, JSON.stringify(all)); notify(); return; }
        catch (e) { memory = []; }
      }
      memory = all.slice(); notify();
    }
    function notify() { listeners.forEach(function (fn) { try { fn(); } catch (e) {} }); }
    window.addEventListener("storage", function (e) { if (e.key === KEY) notify(); });

    this.create = function (req) {
      return new Promise(function (resolve, reject) {
        var errors = core.validateBooking(req);
        if (Object.keys(errors).length) return reject(new ValidationError(errors));
        var all = read(), seen = {};
        all.forEach(function (b) { seen[b.ref] = true; });
        var rec = buildRecord(req, makeRef(seen));
        all.push(rec);
        write(all);
        resolve(rec);
      });
    };
    this.list = function () {
      return Promise.resolve(read().sort(function (a, b) { return a.createdAt < b.createdAt ? 1 : -1; }));
    };
    this.cancel = function (ref) {
      return new Promise(function (resolve, reject) {
        var all = read(), hit = null;
        all.forEach(function (b) {
          if (b.ref === ref) { b.status = "cancelled"; b.cancelledAt = new Date().toISOString(); hit = b; }
        });
        if (!hit) return reject(new Error("Booking " + ref + " not found"));
        write(all);
        resolve(hit);
      });
    };
    this.onChange = function (fn) { listeners.push(fn); };
  }

  /* ---------------- Example: real backend (not used yet) ----------------
     Same four methods, backed by HTTP. Any server works (Supabase, a
     Netlify/Cloudflare function, Google Sheets via Apps Script...).
     The server should re-run the same checks as LN.core.validateBooking,
     check the slot is still free, generate the ref, and send the
     SMS/email confirmation.

  function ApiBookingStore(baseUrl, adminToken) {
    var listeners = [];
    function call(method, path, body, auth) {
      return fetch(baseUrl + path, {
        method: method,
        headers: Object.assign({ "Content-Type": "application/json" },
                               auth ? { Authorization: "Bearer " + adminToken } : {}),
        body: body ? JSON.stringify(body) : undefined
      }).then(function (r) {
        return r.json().then(function (data) {
          if (r.status === 422) throw new ValidationError(data.errors);
          if (!r.ok) throw new Error(data.message || "Request failed");
          return data;
        });
      });
    }
    this.create = function (req) { return call("POST", "/bookings", req).then(function (b) { listeners.forEach(function (f) { f(); }); return b; }); };
    this.list   = function ()    { return call("GET", "/bookings", null, true); };   // salon login needed
    this.cancel = function (ref) { return call("POST", "/bookings/" + encodeURIComponent(ref) + "/cancel", null, true); };
    this.onChange = function (fn) { listeners.push(fn); };
  }
  ------------------------------------------------------------------------ */

  window.LN.ValidationError = ValidationError;
  window.LN.store = new LocalStorageBookingStore();
  // Later: window.LN.store = new ApiBookingStore("https://api.example.com", token);
})();
