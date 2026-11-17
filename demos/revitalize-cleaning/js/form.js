/* Quote request form -> Google Sheet (see google-sheet/Code.gs). */
(function () {
  "use strict";
  var C = window.RCS;
  var form = document.getElementById("quote-form");
  if (!form) return;
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function fill(name, list, placeholder) {
    var sel = form.elements[name];
    sel.innerHTML = (placeholder ? '<option value="">' + placeholder + "</option>" : "") +
      list.map(function (v) { return "<option>" + v.replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</option>"; }).join("");
  }
  fill("service", C.services, "Choose a service");
  fill("property", C.properties, "Choose one");
  fill("size", C.sizes);

  function today() {
    var p = {};
    new Intl.DateTimeFormat("en-US", { timeZone: C.timezone, year: "numeric", month: "2-digit", day: "2-digit" })
      .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    return p.year + "-" + p.month + "-" + p.day;
  }
  form.elements.date.min = today();
  function dateLabel(iso) {
    if (!iso) return "";
    var d = new Date(iso + "T12:00:00Z");
    return DAYS[d.getUTCDay()] + ", " + MONTHS[d.getUTCMonth()] + " " + d.getUTCDate() + ", " + d.getUTCFullYear();
  }
  function digits(v) { var d = String(v || "").replace(/\D/g, ""); return d.length === 11 && d[0] === "1" ? d.slice(1) : d; }
  function phoneFmt(v) { var d = digits(v); return d.length === 10 ? "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6) : v; }

  function validate(v) {
    var e = {};
    if (!v.service) e.service = "Please pick a service.";
    if (!v.property) e.property = "Please pick the type of property.";
    if (!v.city.trim()) e.city = "Please enter the city.";
    if (v.date && v.date < today()) e.date = "Please pick today or a later date.";
    if (!v.name.trim()) e.name = "Please enter your name.";
    if (!v.phone.trim()) e.phone = "Please enter a phone number so we can reach you.";
    else if (digits(v.phone).length !== 10) e.phone = "Please enter a 10-digit phone number, like (509) 555-0123.";
    if (v.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = "That email doesn't look right. You can also leave it blank.";
    return e;
  }
  function show(e) {
    Array.prototype.forEach.call(form.querySelectorAll("[data-error]"), function (el) {
      var f = el.getAttribute("data-error"); el.textContent = e[f] || "";
      if (form.elements[f]) form.elements[f].setAttribute("aria-invalid", e[f] ? "true" : "false");
    });
  }
  form.addEventListener("input", function (ev) {
    var el = form.querySelector('[data-error="' + ev.target.name + '"]');
    if (el) { el.textContent = ""; ev.target.setAttribute("aria-invalid", "false"); }
  });

  function ref() {
    var A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", b = new Uint8Array(6), s = "";
    window.crypto.getRandomValues(b);
    for (var i = 0; i < 6; i++) s += A[b[i] % A.length];
    return "RCS-" + s;
  }

  var err = document.getElementById("form-error"), done = document.getElementById("quote-done");
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    err.hidden = true;
    var v = {};
    ["service", "property", "street", "city", "size", "date", "name", "phone", "email", "notes"].forEach(function (k) { v[k] = form.elements[k].value; });
    var e = validate(v); show(e);
    if (Object.keys(e).length) { form.querySelector('[data-error="' + Object.keys(e)[0] + '"]').scrollIntoView({ block: "center", behavior: "smooth" }); return; }
    var rec = {
      ref: ref(), service: v.service, property: v.property, street: v.street.trim(), city: v.city.trim(), size: v.size,
      preferredDate: v.date, preferredDateLabel: dateLabel(v.date) || "Flexible", name: v.name.trim(), phone: phoneFmt(v.phone.trim()),
      email: v.email.trim(), notes: v.notes.trim(), submittedAt: new Date().toISOString(), source: "website"
    };
    var btn = form.querySelector('button[type="submit"]'); btn.disabled = true;
    var send = C.sheetUrl
      ? fetch(C.sheetUrl, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(rec), redirect: "follow" })
          .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
          .then(function (d) { if (!d || d.ok !== true) throw new Error("rejected"); })
      : Promise.resolve();
    send.then(function () {
      form.hidden = true;
      document.getElementById("done-ref").textContent = rec.ref;
      document.getElementById("done-text").textContent = C.confirmText;
      document.getElementById("done-summary").textContent = rec.service + " · " + rec.property + " · " + rec.city + " · " + rec.preferredDateLabel;
      var demo = document.getElementById("done-demo"); demo.textContent = C.demoNote; demo.hidden = !!C.sheetUrl;
      done.hidden = false; done.focus({ preventScroll: true }); done.scrollIntoView({ block: "center", behavior: "smooth" });
    }).catch(function () {
      err.textContent = "Sorry, your request didn't go through. Please try again, or message us on Facebook.";
      err.hidden = false;
    }).then(function () { btn.disabled = false; });
  });
  document.getElementById("quote-again").addEventListener("click", function () {
    form.reset(); show({}); done.hidden = true; form.hidden = false;
  });
})();
