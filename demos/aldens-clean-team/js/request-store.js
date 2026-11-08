/* =====================================================================
   QUOTE REQUEST STORAGE
   ---------------------------------------------------------------------
   The quote flow and the requests view ONLY talk to ACT.store, through
   these async methods:

     ACT.store.create(request)    -> Promise<record>
     ACT.store.list()             -> Promise<record[]>   (newest first)
     ACT.store.markContacted(ref) -> Promise<record>
     ACT.store.cancel(ref)        -> Promise<record>
     ACT.store.onChange(fn)       -> call fn when requests change

   For the demo, requests live in this browser's localStorage (or in
   memory if the browser blocks it). To move to a real backend, write
   an object with the same methods (see ApiRequestStore below) and
   change the last line of this file. Nothing else needs to change.
   ===================================================================== */
(function () {
  "use strict";
  var core = window.ACT.core;
  var KEY = "aldensCleanTeam.requests.v1";
  var REF_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O or 1/I

  function makeRef(existing) {
    var ref;
    do {
      var bytes = new Uint8Array(6), s = "";
      window.crypto.getRandomValues(bytes);
      for (var i = 0; i < 6; i++) s += REF_CHARS.charAt(bytes[i] % REF_CHARS.length);
      ref = "ACT-" + s;
    } while (existing[ref]);
    return ref;
  }

  function ValidationError(errors) {
    this.name = "ValidationError";
    this.errors = errors;
    this.message = "Request is not valid";
  }
  ValidationError.prototype = Object.create(Error.prototype);

  /* The saved record. A backend should build the same shape. */
  function buildRecord(req, ref) {
    var svc = core.serviceById(req.serviceId);
    var freq = core.frequencyById(req.frequency);
    return {
      ref: ref,
      status: "new",                     // new -> contacted, or cancelled
      serviceId: svc.id,
      serviceName: svc.name,
      frequency: freq.id,
      frequencyLabel: freq.label,
      date: req.date,                    // YYYY-MM-DD, preferred date
      bedrooms: svc.askRooms ? (req.bedrooms || "Not sure") : "",
      bathrooms: svc.askRooms ? (req.bathrooms || "Not sure") : "",
      squareFeet: req.squareFeet || "Not sure",
      name: String(req.name).trim(),
      phone: core.formatPhone(req.phone),
      email: String(req.email || "").trim(),
      notes: String(req.notes || "").trim(),
      createdAt: new Date().toISOString(),
      source: "website"
    };
  }

  /* ---------------- Demo store: this browser only ---------------- */
  function LocalRequestStore() {
    var listeners = [];
    var memory = null; // used only if the browser blocks localStorage
    function read() {
      if (memory) return memory.slice();
      try { var v = JSON.parse(window.localStorage.getItem(KEY) || "[]"); return Array.isArray(v) ? v : []; }
      catch (e) { memory = []; return []; }
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

    function update(ref, change) {
      return new Promise(function (resolve, reject) {
        var all = read(), hit = null;
        all.forEach(function (r) { if (r.ref === ref) { change(r); hit = r; } });
        if (!hit) return reject(new Error("Request " + ref + " not found"));
        write(all);
        resolve(hit);
      });
    }

    this.create = function (req) {
      return new Promise(function (resolve, reject) {
        var errors = core.validateRequest(req);
        if (Object.keys(errors).length) return reject(new ValidationError(errors));
        var all = read(), seen = {};
        all.forEach(function (r) { seen[r.ref] = true; });
        var rec = buildRecord(req, makeRef(seen));
        all.push(rec);
        write(all);
        resolve(rec);
      });
    };
    this.list = function () {
      return Promise.resolve(read().sort(function (a, b) { return a.createdAt < b.createdAt ? 1 : -1; }));
    };
    this.markContacted = function (ref) {
      return update(ref, function (r) { r.status = "contacted"; r.contactedAt = new Date().toISOString(); });
    };
    this.cancel = function (ref) {
      return update(ref, function (r) { r.status = "cancelled"; r.cancelledAt = new Date().toISOString(); });
    };
    this.onChange = function (fn) { listeners.push(fn); };
  }

  /* ---------------- Example: real backend (not used yet) ----------------
     Same methods over HTTP. Any server works (Supabase, a Netlify
     function, Google Sheets via Apps Script...). The server should
     re-run ACT.core.validateRequest's rules, generate the ref, save
     the same record shape, and text or email the team.

  function ApiRequestStore(baseUrl, adminToken) {
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
    this.create        = function (req) { return call("POST", "/requests", req); };
    this.list          = function ()    { return call("GET", "/requests", null, true); };   // team login needed
    this.markContacted = function (ref) { return call("POST", "/requests/" + encodeURIComponent(ref) + "/contacted", null, true); };
    this.cancel        = function (ref) { return call("POST", "/requests/" + encodeURIComponent(ref) + "/cancel", null, true); };
    this.onChange      = function (fn)  { listeners.push(fn); };
  }
  ------------------------------------------------------------------------ */

  window.ACT.ValidationError = ValidationError;
  window.ACT.store = new LocalRequestStore();
  // Later: window.ACT.store = new ApiRequestStore("https://api.example.com", token);
})();
