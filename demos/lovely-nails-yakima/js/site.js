/* Page rendering: hours, services, "to confirm" tags, photo lightbox. */
(function () {
  "use strict";
  var C = window.LN_CONFIG, core = window.LN.core, esc = core.escapeHTML;

  function $all(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  /* Hours (Monday first), today highlighted */
  var todayIdx = core.weekday(core.salonNow().date);
  var order = [1, 2, 3, 4, 5, 6, 0];
  $all('[data-ln="hours-list"]').forEach(function (ul) {
    ul.innerHTML = order.map(function (d) {
      var h = C.hours[d];
      return '<li class="' + (d === todayIdx ? "is-today" : "") + '"><span>' + core.DAY_NAMES[d] +
        (d === todayIdx ? ' <em>today</em>' : "") + "</span><span>" + core.hoursLabel(h) + "</span></li>";
    }).join("");
  });

  /* "Today" line in the hero */
  var todayEl = document.getElementById("today-hours");
  if (todayEl) {
    var now = core.salonNow(), h = C.hours[todayIdx];
    if (!h) todayEl.textContent = "Closed today";
    else {
      var open = core.toMinutes(h.open), close = core.toMinutes(h.close);
      var state = now.minutes < open ? "Opens " + core.formatTime(h.open)
        : now.minutes < close ? "Open now until " + core.formatTime(h.close)
        : "Closed now";
      todayEl.innerHTML = esc(core.hoursLabel(h)) + ' <span class="open-state">' + esc(state) + "</span>" +
        (C.hoursConfirmed ? "" : ' <span class="tbc">To confirm</span>');
    }
  }

  /* Services grid */
  var grid = document.querySelector('[data-ln="service-grid"]');
  if (grid) {
    grid.innerHTML = C.services.map(function (s) {
      var hasPrice = s.price != null;
      return '<li class="service-card">' +
        '<h3>' + esc(s.name) + "</h3>" +
        "<p>" + esc(s.description) + "</p>" +
        '<div class="sc-foot">' +
          '<p class="sc-price' + (hasPrice ? "" : " is-ask") + '">' + esc(core.priceLabel(s)) +
            (hasPrice && !C.pricesConfirmed ? ' <span class="tbc">To confirm</span>' : "") +
            (s.priceNote ? '<small>' + esc(s.priceNote) + "</small>" : "") + "</p>" +
          '<a class="btn btn-primary btn-sm" href="#book" data-book-service="' + esc(s.id) + '">Book</a>' +
        "</div></li>";
    }).join("");
  }

  /* Hide "To confirm" tags once confirmed in config */
  if (C.hoursConfirmed) $all('[data-tbc="hours"]').forEach(function (el) { el.hidden = true; });

  /* Salon view router: #salon shows the bookings list, anything else the site */
  function route() {
    var salon = location.hash === "#salon";
    var was = document.body.classList.contains("is-salon");
    document.body.classList.toggle("is-salon", salon);
    if (salon && !was) window.scrollTo(0, 0);
    if (!salon && was) {
      var target = location.hash && document.querySelector(location.hash);
      if (target) target.scrollIntoView(); else window.scrollTo(0, 0);
    }
  }
  window.addEventListener("hashchange", route);
  route();

  /* Lightbox */
  var lb = document.getElementById("lightbox");
  if (lb && typeof lb.showModal === "function") {
    var img = lb.querySelector("img"), cap = lb.querySelector(".lb-cap");
    $all(".g-item").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var thumb = btn.querySelector("img");
        img.src = btn.getAttribute("data-full");
        img.alt = thumb.alt;
        cap.textContent = btn.querySelector(".g-cap").textContent;
        lb.showModal();
      });
    });
    lb.querySelector(".lb-close").addEventListener("click", function () { lb.close(); });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });
  } else {
    $all(".g-item").forEach(function (btn) {
      btn.addEventListener("click", function () { window.open(btn.getAttribute("data-full"), "_blank"); });
    });
  }
})();
