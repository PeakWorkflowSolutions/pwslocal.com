/* Page rendering: services, team-view router, photo lightbox. */
(function () {
  "use strict";
  var C = window.ACT_CONFIG, esc = window.ACT.core.escapeHTML;
  function $all(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  /* Services grid */
  var grid = document.querySelector('[data-act="service-grid"]');
  if (grid) {
    grid.innerHTML = C.services.map(function (s) {
      return '<li class="service-card">' +
        "<h3>" + esc(s.name) + "</h3>" +
        "<p>" + esc(s.description) + "</p>" +
        (s.oneTimeOnly ? '<p class="sc-tag">One-time clean</p>' : "") +
        '<div class="sc-foot"><p class="sc-price">' + esc(C.quote.priceLine) + "</p>" +
        '<a class="btn btn-primary btn-sm" href="#quote" data-quote-service="' + esc(s.id) + '">Book a visit</a></div></li>';
    }).join("");
  }

  /* Team view router: #requests shows the request list, anything else the site */
  function route() {
    var team = location.hash === "#requests";
    var was = document.body.classList.contains("is-team");
    document.body.classList.toggle("is-team", team);
    if (team && !was) window.scrollTo(0, 0);
    if (!team && was) {
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
        img.src = btn.getAttribute("data-full");
        img.alt = btn.querySelector("img").alt;
        cap.textContent = btn.querySelector(".g-cap").textContent;
        lb.showModal();
      });
    });
    lb.querySelector(".lb-close").addEventListener("click", function () { lb.close(); });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });
  }
})();
