/* Booking flow: service -> date & time -> technician -> details -> confirmation.
   Talks to storage only through LN.store (see booking-store.js). */
(function () {
  "use strict";
  var C = window.LN_CONFIG, core = window.LN.core, store = window.LN.store, esc = core.escapeHTML;
  var form = document.getElementById("booking-form");
  if (!form) return;
  var booker = document.getElementById("booker");
  function q(sel, root) { return (root || booker).querySelector(sel); }
  function qa(sel, root) { return Array.prototype.slice.call((root || booker).querySelectorAll(sel)); }

  var STEP_FIELDS = { 1: ["serviceId"], 2: ["date", "time"], 3: ["technician"], 4: ["name", "phone"] };
  var FIELD_STEP = { serviceId: 1, date: 2, time: 2, technician: 3, name: 4, phone: 4 };
  var state = { step: 1, serviceId: "", date: "", time: "", technician: "any", technicianName: "" };

  /* ---------- Step 1: services ---------- */
  q('[data-ln="service-choices"]').innerHTML = C.services.map(function (s) {
    return '<label class="choice"><input type="radio" name="serviceId" value="' + esc(s.id) + '">' +
      '<span class="choice-body"><span class="choice-name">' + esc(s.name) + "</span>" +
      '<span class="choice-price">' + esc(core.priceLabel(s)) + "</span></span></label>";
  }).join("");

  /* ---------- Step 3: technicians ---------- */
  q('[data-ln="tech-choices"]').innerHTML = C.technicians.map(function (t) {
    return '<label class="choice"><input type="radio" name="technician" value="' + esc(t.id) + '"' + (t.id === state.technician ? " checked" : "") + ">" +
      '<span class="choice-body"><span class="choice-name">' + esc(t.label) + "</span>" +
      '<span class="choice-hint">' + esc(t.hint || "") + "</span></span></label>";
  }).join("");

  /* ---------- Step 2: dates and slots ---------- */
  var dateInput = document.getElementById("bk-date");
  function setupDates() {
    dateInput.min = core.firstBookableDate();
    dateInput.max = core.lastBookableDate();
    var chips = [], d = core.firstBookableDate(), mins = currentMinutes();
    for (var i = 0; chips.length < 7 && i < 14; i++, d = core.addDays(d, 1)) {
      if (!core.slotsFor(d, mins).length) continue;
      var label = i === 0 ? "Today" : i === 1 ? "Tomorrow" : core.formatDateShort(d).slice(0, 3);
      chips.push('<button type="button" class="chip" data-date="' + d + '"><b>' + label + "</b><span>" +
        esc(core.formatDateShort(d).slice(4)) + "</span></button>");
    }
    q('[data-ln="day-chips"]').innerHTML = chips.join("");
    markChips();
  }
  function currentMinutes() { return core.durationFor(core.serviceById(state.serviceId)); }
  function markChips() {
    qa(".chip").forEach(function (c) { c.classList.toggle("is-selected", c.getAttribute("data-date") === state.date); });
  }

  function renderSlots() {
    var box = q('[data-ln="slots"]'), info = q('[data-ln="day-hours"]');
    markChips();
    if (!state.date) { box.innerHTML = ""; info.textContent = "Pick a date to see open times."; return; }
    var slots = core.slotsFor(state.date, currentMinutes());
    var hrs = core.isValidISODate(state.date) ? core.hoursFor(state.date) : null;
    if (slots.indexOf(state.time) === -1) state.time = "";
    if (!hrs) { info.textContent = ""; box.innerHTML = ""; return; }
    info.innerHTML = esc(core.formatDateLong(state.date)) + ": open " + esc(core.hoursLabel(hrs));
    if (!slots.length) {
      box.innerHTML = '<p class="no-slots">No times left on this day. Please pick another date, or just walk in.</p>';
      return;
    }
    box.innerHTML = slots.map(function (t) {
      return '<label class="slot"><input type="radio" name="time" value="' + t + '"' + (t === state.time ? " checked" : "") + ">" +
        "<span>" + core.formatTime(t) + "</span></label>";
    }).join("");
  }

  /* ---------- Errors (shown on the page, never as alerts) ---------- */
  function showErrors(errors, fields) {
    (fields || Object.keys(FIELD_STEP)).forEach(function (f) {
      var el = q('[data-error="' + f + '"]');
      if (el) el.textContent = errors[f] || "";
      var input = form.elements[f];
      if (input && input.setAttribute) input.setAttribute("aria-invalid", errors[f] ? "true" : "false");
    });
  }
  function clearError(f) { showErrors({}, [f]); }
  function stepErrors(step) {
    var all = core.validateBooking(collect()), out = {};
    STEP_FIELDS[step].forEach(function (f) { if (all[f]) out[f] = all[f]; });
    return out;
  }

  function collect() {
    return {
      serviceId: state.serviceId, date: state.date, time: state.time,
      technician: state.technician, technicianName: state.technicianName,
      name: form.elements.name.value, phone: form.elements.phone.value, notes: form.elements.notes.value
    };
  }

  /* ---------- Step navigation ---------- */
  function goTo(step, focusFirst, noScroll) {
    state.step = step;
    qa(".step").forEach(function (fs) { fs.hidden = +fs.getAttribute("data-step") !== step; });
    qa("[data-step-dot]").forEach(function (li) {
      var n = +li.getAttribute("data-step-dot");
      li.classList.toggle("is-current", n === step);
      li.classList.toggle("is-done", n < step);
    });
    if (step === 2) { setupDates(); renderSlots(); updateDurationHelp(); }
    if (step === 4) renderSummary();
    var top = booker.getBoundingClientRect().top;
    if (!noScroll && (top < 0 || top > window.innerHeight * 0.5)) booker.scrollIntoView({ behavior: "smooth", block: "start" });
    if (focusFirst) {
      var legend = q('.step[data-step="' + step + '"] .step-title');
      if (legend) { legend.setAttribute("tabindex", "-1"); legend.focus({ preventScroll: true }); }
    }
  }
  function updateDurationHelp() {
    q('[data-ln="duration-help"]').textContent = "Times are for a " + currentMinutes() +
      "-minute visit inside open hours. Walk-ins welcome any time we're open.";
  }
  function renderSummary() {
    var s = core.serviceById(state.serviceId), t = core.technicianById(state.technician);
    q('[data-ln="summary"]').innerHTML =
      "<p><b>" + esc(s.name) + "</b> &middot; " + esc(core.priceLabel(s)) + "</p>" +
      "<p>" + esc(core.formatDateLong(state.date)) + " at " + esc(core.formatTime(state.time)) + "</p>" +
      "<p>" + esc(t.label + (t.allowName && state.technicianName.trim() ? ": " + state.technicianName.trim() : "")) + "</p>";
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
  qa("[data-back]").forEach(function (b) {
    b.addEventListener("click", function () { goTo(state.step - 1, true); });
  });

  /* ---------- Inputs ---------- */
  form.addEventListener("change", function (e) {
    var t = e.target;
    if (t.name === "serviceId") { state.serviceId = t.value; clearError("serviceId"); }
    if (t.name === "time") { state.time = t.value; clearError("time"); }
    if (t.name === "technician") {
      state.technician = t.value; clearError("technician");
      var tech = core.technicianById(t.value);
      q('[data-ln="tech-name-field"]').hidden = !(tech && tech.allowName);
    }
  });
  dateInput.addEventListener("input", function () {
    state.date = dateInput.value; clearError("date");
    var errs = stepErrors(2);
    if (errs.date) showErrors({ date: errs.date }, ["date"]);
    renderSlots();
  });
  q('[data-ln="day-chips"]').addEventListener("click", function (e) {
    var chip = e.target.closest(".chip");
    if (!chip) return;
    state.date = chip.getAttribute("data-date");
    dateInput.value = state.date;
    clearError("date");
    renderSlots();
  });
  document.getElementById("bk-tech-name").addEventListener("input", function (e) { state.technicianName = e.target.value; });
  ["name", "phone"].forEach(function (f) {
    form.elements[f].addEventListener("input", function () { clearError(f); });
  });
  form.elements.phone.addEventListener("blur", function () {
    var v = form.elements.phone.value;
    if (core.phoneDigits(v).length === 10) form.elements.phone.value = core.formatPhone(v);
  });

  /* ---------- Submit ---------- */
  var formErr = q('[data-ln="form-error"]');
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    formErr.hidden = true;
    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    store.create(collect()).then(function (booking) {
      showConfirmation(booking);
    }).catch(function (err) {
      if (err && err.errors) {
        showErrors(err.errors);
        var firstField = Object.keys(err.errors)[0], step = FIELD_STEP[firstField] || 4;
        if (step !== 4) {
          goTo(step, true);
          showErrors(err.errors);
        }
      } else {
        formErr.textContent = "Sorry, something went wrong saving your booking. Please call (509) 469-1712.";
        formErr.hidden = false;
      }
    }).then(function () { btn.disabled = false; });
  });

  function showConfirmation(b) {
    var set = function (k, v) { q('[data-ln="' + k + '"]').textContent = v; };
    set("c-ref", b.ref);
    set("c-service", b.serviceName);
    set("c-price", b.priceLabel);
    set("c-date", core.formatDateLong(b.date));
    set("c-time", core.formatTime(b.time));
    set("c-tech", b.technicianLabel);
    set("c-name", b.name);
    set("c-phone", b.phone);
    form.hidden = true;
    q(".steps").hidden = true;
    var box = q('[data-ln="confirm"]');
    box.hidden = false;
    booker.scrollIntoView({ behavior: "smooth", block: "start" });
    box.focus({ preventScroll: true });
  }

  function reset() {
    form.reset();
    state = { step: 1, serviceId: "", date: "", time: "", technician: "any", technicianName: "" };
    form.elements.technician.value = "any";
    q('[data-ln="tech-name-field"]').hidden = true;
    showErrors({});
    form.hidden = false;
    q(".steps").hidden = false;
    q('[data-ln="confirm"]').hidden = true;
  }
  q('[data-ln="book-another"]').addEventListener("click", function () { reset(); goTo(1, true); });

  /* "Book" buttons on the Services cards */
  document.addEventListener("click", function (e) {
    var link = e.target.closest("[data-book-service]");
    if (!link) return;
    if (form.hidden) reset();
    var id = link.getAttribute("data-book-service");
    state.serviceId = id;
    var radio = form.querySelector('input[name="serviceId"][value="' + id + '"]');
    if (radio) radio.checked = true;
    clearError("serviceId");
    e.preventDefault();
    goTo(2, false);
    booker.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  goTo(1, false, true);
})();
