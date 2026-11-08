/* =====================================================================
   QUOTE VISIT STORAGE
   ---------------------------------------------------------------------
   The booking flow and the team view ONLY talk to ACT.store, through
   these async methods:

     ACT.store.create(request)         -> Promise<visit>
     ACT.store.list()                  -> Promise<visit[]>  (soonest visit first)
     ACT.store.takenSlots(date)        -> Promise<"HH:MM"[]> (full slots that day)
     ACT.store.assign(ref, person)     -> Promise<visit>
     ACT.store.markVisited(ref)        -> Promise<visit>
     ACT.store.cancel(ref)             -> Promise<visit>
     ACT.store.onChange(fn)            -> call fn when visits change

   For the demo, visits live in this browser's localStorage (or in
   memory if the browser blocks it). To move to a real backend, write
   an object with the same methods (see ApiVisitStore below) and change
   the last line of this file. Nothing else needs to change.
   ===================================================================== */
(function () {
  "use strict";
  var C = window.ACT_CONFIG, core = window.ACT.core;
  var KEY = "aldensCleanTeam.visits.v1";
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
    this.message = "Booking is not valid";
  }
  ValidationError.prototype = Object.create(Error.prototype);

  /* The saved record. A backend should build the same shape. */
  function buildRecord(req, ref) {
    var svc = core.serviceById(req.serviceId), freq = core.frequencyById(req.frequency);
    return {
      ref: ref,
      status: "booked",                  // booked -> visited, or cancelled
      serviceId: svc.id,
      serviceName: svc.name,
      frequency: freq.id,
      frequencyLabel: freq.label,
      date: req.date,                    // YYYY-MM-DD, visit day (Yakima time)
      time: req.time,                    // HH:MM 24h, visit start
      visitMinutes: C.visit.minutes,
      street: String(req.street).trim(),
      city: String(req.city).trim(),
      bedrooms: svc.askRooms ? (req.bedrooms || "Not sure") : "",
      bathrooms: svc.askRooms ? (req.bathrooms || "Not sure") : "",
      squareFeet: req.squareFeet || "Not sure",
      name: String(req.name).trim(),
      phone: core.formatPhone(req.phone),
      email: String(req.email || "").trim(),
      notes: String(req.notes || "").trim(),
      assignedTo: "",
      createdAt: new Date().toISOString(),
      source: "website"
    };
  }

  function sortSoonest(a, b) {
    var ka = a.date + " " + a.time, kb = b.date + " " + b.time;
    return ka < kb ? -1 : ka > kb ? 1 : (a.createdAt < b.createdAt ? 1 : -1);
  }

  /* ---------------- Demo store: this browser only ---------------- */
  function LocalVisitStore() {
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

    function taken(all, date) {
      var count = {};
      all.forEach(function (v) { if (v.status === "booked" && v.date === date) count[v.time] = (count[v.time] || 0) + 1; });
      return Object.keys(count).filter(function (t) { return count[t] >= C.visit.perSlot; });
    }
    function update(ref, change) {
      return new Promise(function (resolve, reject) {
        var all = read(), hit = null;
        all.forEach(function (v) { if (v.ref === ref) { change(v); hit = v; } });
        if (!hit) return reject(new Error("Visit " + ref + " not found"));
        write(all);
        resolve(hit);
      });
    }

    this.create = function (req) {
      return new Promise(function (resolve, reject) {
        var errors = core.validateRequest(req);
        var all = read();
        if (!errors.time && !errors.date && taken(all, req.date).indexOf(req.time) !== -1) {
          errors.time = "Someone just booked that time. Please pick another time.";
        }
        if (Object.keys(errors).length) return reject(new ValidationError(errors));
        var seen = {};
        all.forEach(function (v) { seen[v.ref] = true; });
        var rec = buildRecord(req, makeRef(seen));
        all.push(rec);
        write(all);
        resolve(rec);
      });
    };
    this.list = function () { return Promise.resolve(read().sort(sortSoonest)); };
    this.takenSlots = function (date) { return Promise.resolve(taken(read(), date)); };
    this.assign = function (ref, person) {
      return update(ref, function (v) { v.assignedTo = C.team.indexOf(person) !== -1 ? person : ""; });
    };
    this.markVisited = function (ref) {
      return update(ref, function (v) { v.status = "visited"; v.visitedAt = new Date().toISOString(); });
    };
    this.cancel = function (ref) {
      return update(ref, function (v) { v.status = "cancelled"; v.cancelledAt = new Date().toISOString(); });
    };
    this.onChange = function (fn) { listeners.push(fn); };
  }

  /* ---------------- Example: real backend (not used yet) ----------------
     Same methods over HTTP. Any server works (Supabase, a Netlify
     function, Google Sheets via Apps Script...). The server should
     re-run ACT.core.validateRequest's rules, refuse a full slot,
     generate the ref, save the same record shape, and text or email
     the team (and a confirmation to the customer).

  function ApiVisitStore(baseUrl, teamToken) {
    var listeners = [];
    function call(method, path, body, auth) {
      return fetch(baseUrl + path, {
        method: method,
        headers: Object.assign({ "Content-Type": "application/json" },
                               auth ? { Authorization: "Bearer " + teamToken } : {}),
        body: body ? JSON.stringify(body) : undefined
      }).then(function (r) {
        return r.json().then(function (data) {
          if (r.status === 422) throw new ValidationError(data.errors);
          if (!r.ok) throw new Error(data.message || "Request failed");
          return data;
        });
      });
    }
    this.create      = function (req)  { return call("POST", "/visits", req); };
    this.takenSlots  = function (date) { return call("GET", "/visits/taken?date=" + encodeURIComponent(date)); };
    this.list        = function ()     { return call("GET", "/visits", null, true); };   // team login needed
    this.assign      = function (ref, person) { return call("POST", "/visits/" + encodeURIComponent(ref) + "/assign", { person: person }, true); };
    this.markVisited = function (ref)  { return call("POST", "/visits/" + encodeURIComponent(ref) + "/visited", null, true); };
    this.cancel      = function (ref)  { return call("POST", "/visits/" + encodeURIComponent(ref) + "/cancel", null, true); };
    this.onChange    = function (fn)   { listeners.push(fn); };
  }
  ------------------------------------------------------------------------ */

  window.ACT.ValidationError = ValidationError;
  window.ACT.store = new LocalVisitStore();
  // Later: window.ACT.store = new ApiVisitStore("https://api.example.com", token);
})();
