/* Quote visit booking: service -> how often -> the place -> visit time -> details -> confirmation.
   Talks to storage only through ACT.store (see request-store.js). */
(function () {
  "use strict";
  var C = window.ACT_CONFIG, core = window.ACT.core, store = window.ACT.store, esc = core.escapeHTML;
  var form = document.getElementById("quote-form");
  if (!form) return;
  var booker = document.getElementById("booker");
  function q(sel) { return booker.querySelector(sel); }
  function qa(sel) { return Array.prototype.slice.call(booker.querySelectorAll(sel)); }

  var LAST = 5;
  var STEP_FIELDS = { 1: ["serviceId"], 2: ["frequency"], 3: ["street", "city", "bedrooms", "bathrooms", "squareFeet"], 4: ["date", "time"], 5: ["name", "phone", "email"] };
  var FIELD_STEP = {};
  Object.keys(STEP_FIELDS).forEach(function (s) { STEP_FIELDS[s].forEach(function (f) { FIELD_STEP[f] = +s; }); });
  var state;
  function freshState() { return { step: 1, serviceId: "", frequency: "", date: "", time: "" }; }
  state = freshState();

  /* Step 1: services */
  q('[data-act="service-choices"]').innerHTML = C.services.map(function (s) {
    return '<label class="choice"><input type="radio" name="serviceId" value="' + esc(s.id) + '">' +
      '<span class="choice-body"><span class="choice-name">' + esc(s.name) + "</span>" +
      '<span class="choice-hint">' + (s.oneTimeOnly ? "One-time" : "") + "</span></span></label>";
  }).join("");

  /* Step 3: size selects */
  function fill(name, options) {
    q('[data-act="' + name + '"]').innerHTML = options.map(function (o) {
      return '<option value="' + esc(o) + '">' + esc(o) + "</option>";
    }).join("");
  }
  fill("bedrooms", C.bedrooms); fill("bathrooms", C.bathrooms); fill("squareFeet", C.squareFeet);
  q('[data-act="size-note"]').textContent = "Helps the team plan the visit. " + C.quote.stepNote;
  q('[data-act="visit-help"]').textContent = "A quote visit takes about " + C.visit.minutes +
    " minutes. Pick a day, then a start time. Greyed-out times are already booked.";

  function service() { return core.serviceById(state.serviceId); }

  /* Step 2: frequencies for the chosen service */
  function renderFrequencies() {
    var svc = service(), list = core.frequenciesFor(svc);
    if (list.length === 1) state.frequency = list[0].id;
    else if (!core.frequencyById(state.frequency)) state.frequency = "";
    q('[data-act="freq-choices"]').innerHTML = list.map(function (f) {
      return '<label class="choice"><input type="radio" name="frequency" value="' + f.id + '"' + (f.id === state.frequency ? " checked" : "") + ">" +
        '<span class="choice-body"><span class="choice-name">' + esc(f.label) + "</span></span></label>";
    }).join("");
    q('[data-act="freq-help"]').textContent = svc && svc.oneTimeOnly
      ? svc.name + ": " + C.quote.oneTimeOnlyNote
      : "Pick one. You can change it at the visit.";
  }

  /* Step 3: rooms only where they make sense */
  function setupPlace() {
    var rooms = !!(service() && service().askRooms);
    qa('[data-act="rooms-field"]').forEach(function (el) { el.hidden = !rooms; });
  }

  /* Step 4: dates and visit times */
  var dateInput = document.getElementById("q-date");
  function setupDates() {
    dateInput.min = core.firstDate();
    dateInput.max = core.lastDate();
    var chips = [], d = core.firstDate();
    for (var i = 0; chips.length < 7 && i < 21; i++, d = core.addDays(d, 1)) {
      if (!core.slotsFor(d).length) continue;
      var label = i === 0 ? "Today" : i === 1 ? "Tomorrow" : core.formatDateShort(d).slice(0, 3);
      chips.push('<button type="button" class="chip" data-date="' + d + '"><b>' + label + "</b><span>" +
        esc(core.formatDateShort(d).slice(4)) + "</span></button>");
    }
    q('[data-act="day-chips"]').innerHTML = chips.join("");
    renderSlots();
  }
  var slotRender = 0;
  function renderSlots() {
    qa(".chip").forEach(function (c) { c.classList.toggle("is-selected", c.getAttribute("data-date") === state.date); });
    var box = q('[data-act="slots"]'), note = q('[data-act="day-note"]');
    if (!state.date || !core.isValidISODate(state.date)) { box.innerHTML = ""; note.textContent = state.date ? "" : "Pick a day to see open times."; return; }
    var slots = core.slotsFor(state.date);
    if (!core.visitHoursFor(state.date)) { box.innerHTML = ""; note.textContent = ""; state.time = ""; return; }
    var mine = ++slotRender;
    store.takenSlots(state.date).then(function (taken) {
      if (mine !== slotRender) return;
      if (slots.indexOf(state.time) === -1 || taken.indexOf(state.time) !== -1) state.time = "";
      var open = slots.filter(function (t) { return taken.indexOf(t) === -1; });
      note.textContent = core.formatDateLong(state.date) + (open.length ? ": " + open.length + " open time" + (open.length === 1 ? "" : "s") : "");
      if (!open.length) {
        box.innerHTML = '<p class="no-slots">No open times left that day. Please pick another day, or call Dave at (509) 952-9488.</p>';
        return;
      }
      box.innerHTML = slots.map(function (t) {
        var full = taken.indexOf(t) !== -1;
        return '<label class="slot' + (full ? " is-taken" : "") + '"><input type="radio" name="time" value="' + t + '"' +
          (t === state.time ? " checked" : "") + (full ? " disabled" : "") + "><span>" + core.formatTime(t) +
          (full ? "<small>Booked</small>" : "") + "</span></label>";
      }).join("");
    });
  }

  /* Errors on the page, never alerts */
  function showErrors(errors, fields) {
    (fields || Object.keys(FIELD_STEP)).forEach(function (f) {
      var el = q('[data-error="' + f + '"]');
      if (el) el.textContent = errors[f] || "";
      var input = form.elements[f];
      if (input && input.setAttribute) input.setAttribute("aria-invalid", errors[f] ? "true" : "false");
    });
  }
  function clearError(f) { showErrors({}, [f]); }

  function collect() {
    var svc = service();
    return {
      serviceId: state.serviceId, frequency: state.frequency, date: state.date, time: state.time,
      street: form.elements.street.value, city: form.elements.city.value,
      bedrooms: svc && svc.askRooms ? form.elements.bedrooms.value : "",
      bathrooms: svc && svc.askRooms ? form.elements.bathrooms.value : "",
      squareFeet: form.elements.squareFeet.value,
      name: form.elements.name.value, phone: form.elements.phone.value,
      email: form.elements.email.value, notes: form.elements.notes.value
    };
  }
  function stepErrors(step) {
    var all = core.validateRequest(collect()), out = {};
    STEP_FIELDS[step].forEach(function (f) { if (all[f]) out[f] = all[f]; });
    return out;
  }

  function homeLabel(r) {
    var bits = [];
    if (r.bedrooms && r.bedrooms !== "Not sure") bits.push(r.bedrooms + (r.bedrooms === "Studio" ? "" : " bed"));
    if (r.bathrooms && r.bathrooms !== "Not sure") bits.push(r.bathrooms + " bath");
    if (r.squareFeet && r.squareFeet !== "Not sure") bits.push(r.squareFeet);
    return bits.length ? bits.join(", ") : "Not sure yet";
  }
  window.ACT.homeLabel = homeLabel;

  function goTo(step, focus, noScroll) {
    state.step = step;
    qa(".step").forEach(function (fs) { fs.hidden = +fs.getAttribute("data-step") !== step; });
    qa("[data-step-dot]").forEach(function (li) {
      var n = +li.getAttribute("data-step-dot");
      li.classList.toggle("is-current", n === step);
      li.classList.toggle("is-done", n < step);
    });
    if (step === 2) renderFrequencies();
    if (step === 3) setupPlace();
    if (step === 4) setupDates();
    if (step === 5) renderSummary();
    var top = booker.getBoundingClientRect().top;
    if (!noScroll && (top < 0 || top > window.innerHeight * 0.5)) booker.scrollIntoView({ behavior: "smooth", block: "start" });
    if (focus) {
      var legend = q('.step[data-step="' + step + '"] .step-title');
      if (legend) { legend.setAttribute("tabindex", "-1"); legend.focus({ preventScroll: true }); }
    }
  }
  function renderSummary() {
    var r = collect(), svc = service(), f = core.frequencyById(state.frequency);
    q('[data-act="summary"]').innerHTML =
      "<p><b>Quote visit: " + esc(core.formatDateLong(state.date)) + " at " + esc(core.formatTime(state.time)) + "</b></p>" +
      "<p>" + esc(r.street.trim() + ", " + r.city.trim()) + "</p>" +
      "<p>" + esc(svc.name) + " &middot; " + esc(f.label) + " &middot; " + esc(homeLabel(r)) + "</p>" +
      '<p class="summary-note">' + esc(C.quote.stepNote) + "</p>";
  }

  qa("[data-next]").forEach(function (b) {
    b.addEventListener("click", function () {
      var errs = stepErrors(state.step);
      showErrors(errs, STEP_FIELDS[state.step]);
      if (Object.keys(errs).length) {
        var first = q('[data-error="' + Object.keys(errs)[0] + '"]');
        if (first) first.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      goTo(state.step + 1, true);
    });
  });
  qa("[data-back]").forEach(function (b) { b.addEventListener("click", function () { goTo(state.step - 1, true); }); });

  form.addEventListener("change", function (e) {
    var t = e.target;
    if (t.name === "serviceId") { state.serviceId = t.value; clearError("serviceId"); }
    if (t.name === "frequency") { state.frequency = t.value; clearError("frequency"); }
    if (t.name === "time") { state.time = t.value; clearError("time"); }
  });
  dateInput.addEventListener("input", function () {
    state.date = dateInput.value;
    var errs = stepErrors(4);
    showErrors({ date: errs.date }, ["date"]);
    clearError("time");
    renderSlots();
  });
  q('[data-act="day-chips"]').addEventListener("click", function (e) {
    var chip = e.target.closest(".chip");
    if (!chip) return;
    state.date = dateInput.value = chip.getAttribute("data-date");
    clearError("date"); clearError("time");
    renderSlots();
  });
  ["street", "city", "name", "phone", "email"].forEach(function (f) {
    form.elements[f].addEventListener("input", function () { clearError(f); });
  });
  form.elements.phone.addEventListener("blur", function () {
    var v = form.elements.phone.value;
    if (core.phoneDigits(v).length === 10) form.elements.phone.value = core.formatPhone(v);
  });
  store.onChange(function () { if (state.step === 4) renderSlots(); });

  var formErr = q('[data-act="form-error"]');
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    formErr.hidden = true;
    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    store.create(collect()).then(showConfirmation).catch(function (err) {
      if (err && err.errors) {
        var step = FIELD_STEP[Object.keys(err.errors)[0]] || LAST;
        if (step !== LAST) goTo(step, true);
        showErrors(err.errors);
      } else {
        formErr.textContent = "Sorry, something went wrong booking your visit. Please call Dave at (509) 952-9488.";
        formErr.hidden = false;
      }
    }).then(function () { btn.disabled = false; });
  });

  function showConfirmation(r) {
    function set(k, v) { q('[data-act="' + k + '"]').textContent = v; }
    set("c-title", C.quote.confirmTitle);
    set("c-ref", r.ref);
    set("c-when", core.formatDateLong(r.date) + " at " + core.formatTime(r.time));
    set("c-address", r.street + ", " + r.city);
    set("c-service", r.serviceName);
    set("c-freq", r.frequencyLabel);
    set("c-home", homeLabel(r));
    set("c-name", r.name);
    set("c-phone", r.phone);
    set("c-body", C.quote.confirmBody);
    set("c-noprice", C.quote.noPriceYet);
    form.hidden = true;
    q(".steps").hidden = true;
    var box = q('[data-act="confirm"]');
    box.hidden = false;
    booker.scrollIntoView({ behavior: "smooth", block: "start" });
    box.focus({ preventScroll: true });
  }

  function reset() {
    form.reset();
    state = freshState();
    showErrors({});
    form.hidden = false;
    q(".steps").hidden = false;
    q('[data-act="confirm"]').hidden = true;
  }
  q('[data-act="another"]').addEventListener("click", function () { reset(); goTo(1, true); });

  /* "Book a visit" buttons on the service cards */
  document.addEventListener("click", function (e) {
    var link = e.target.closest("[data-quote-service]");
    if (!link) return;
    e.preventDefault();
    if (form.hidden) reset();
    state.serviceId = link.getAttribute("data-quote-service");
    var radio = form.querySelector('input[name="serviceId"][value="' + state.serviceId + '"]');
    if (radio) radio.checked = true;
    clearError("serviceId");
    if (location.hash === "#requests") location.hash = "quote";
    goTo(2, false, true);
    booker.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  goTo(1, false, true);
})();
