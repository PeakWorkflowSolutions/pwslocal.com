/* Renders today's hours, the menu and the locations from js/data.js. */
(function () {
  "use strict";
  var OE = window.OE;
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }
  function toMin(t) { var p = t.split(":"); return +p[0] * 60 + +p[1]; }
  function fmt(t) {
    var m = toMin(t), h = Math.floor(m / 60), mm = m % 60;
    return (h % 12 || 12) + (mm ? ":" + (mm < 10 ? "0" : "") + mm : "") + (h < 12 ? " AM" : " PM");
  }
  function money(n) { return n == null ? "&ndash;" : "$" + n.toFixed(2); }

  /* Day and minute right now in Yakima, whatever the phone's time zone */
  function now() {
    var parts = {};
    new Intl.DateTimeFormat("en-US", { timeZone: OE.timezone, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday);
    return { day: day, min: (+parts.hour % 24) * 60 + +parts.minute };
  }
  function status(loc) {
    var n = now(), h = loc.hours[n.day];
    if (!h) return { open: false, text: "Closed today" };
    var o = toMin(h[0]), c = toMin(h[1]);
    if (n.min < o) return { open: false, text: "Opens " + fmt(h[0]) };
    if (n.min < c) return { open: true, text: "Open until " + fmt(h[1]) };
    var tm = loc.hours[(n.day + 1) % 7];
    return { open: false, text: "Closed. Opens tomorrow " + (tm ? fmt(tm[0]) : "") };
  }

  /* Today strip */
  var today = document.querySelector('[data-oe="today"]');
  if (today) {
    today.innerHTML = OE.locations.map(function (l) {
      var s = status(l);
      return '<a class="today-card" href="#loc-' + l.id + '"><span class="dot' + (s.open ? " is-open" : "") + '" aria-hidden="true"></span>' +
        "<span><b>" + esc(l.name) + "</b><small>" + esc(s.text) + "</small></span></a>";
    }).join("");
  }

  /* Menu tabs and tables */
  var tabs = document.querySelector('[data-oe="tabs"]'), menu = document.querySelector('[data-oe="menu"]');
  if (tabs && menu) {
    tabs.innerHTML = OE.menu.map(function (g, i) {
      return '<button type="button" role="tab" id="tab-' + g.id + '" aria-controls="panel-' + g.id + '" aria-selected="' + (i === 0) + '" class="tab' + (i === 0 ? " is-active" : "") + '" data-tab="' + g.id + '">' + esc(g.title) + "</button>";
    }).join("");
    menu.innerHTML = OE.menu.map(function (g, i) {
      var sizes = g.sizes || OE.sizes;
      var head = "<tr><th scope=\"col\">Drink</th>" + sizes.map(function (s) { return '<th scope="col">' + esc(s) + "</th>"; }).join("") + "</tr>";
      var rows = g.items.map(function (it) {
        return '<tr><th scope="row">' + esc(it.name) + (it.detail ? "<small>" + esc(it.detail) + "</small>" : "") + "</th>" +
          it.prices.map(function (p) { return "<td>" + money(p) + "</td>"; }).join("") + "</tr>";
      }).join("");
      var extra = g.extra ? '<div class="extra"><b>' + esc(g.extra.name) + "</b>" + g.extra.options.map(function (o) {
        return "<span>" + esc(o[0]) + " <i>" + money(o[1]) + "</i></span>";
      }).join("") + "</div>" : "";
      return '<div class="panel" role="tabpanel" id="panel-' + g.id + '" aria-labelledby="tab-' + g.id + '"' + (i === 0 ? "" : " hidden") + ">" +
        '<p class="panel-note">' + esc(g.note) + "</p>" +
        '<div class="table-wrap"><table class="price-table" style="--cols:' + sizes.length + '"><thead>' + head + "</thead><tbody>" + rows + "</tbody></table></div>" + extra + "</div>";
    }).join("");
    tabs.addEventListener("click", function (e) {
      var b = e.target.closest("[data-tab]");
      if (!b) return;
      Array.prototype.forEach.call(tabs.children, function (t) {
        var on = t === b; t.classList.toggle("is-active", on); t.setAttribute("aria-selected", on);
      });
      Array.prototype.forEach.call(menu.querySelectorAll(".panel"), function (p) { p.hidden = p.id !== "panel-" + b.getAttribute("data-tab"); });
    });
  }

  /* Location cards */
  var locs = document.querySelector('[data-oe="locations"]');
  if (locs) {
    var n = now(), order = [1, 2, 3, 4, 5, 6, 0];
    locs.innerHTML = OE.locations.map(function (l) {
      var s = status(l);
      var rows = order.map(function (d) {
        var h = l.hours[d];
        return '<li class="' + (d === n.day ? "is-today" : "") + '"><span>' + DAYS[d] + "</span><span>" + (h ? fmt(h[0]) + " &ndash; " + fmt(h[1]) : "Closed") + "</span></li>";
      }).join("");
      return '<article class="loc" id="loc-' + l.id + '">' +
        '<img loading="lazy" src="' + esc(l.photo) + '" width="800" height="600" alt="The ' + esc(l.name) + ' drive-thru">' +
        '<div class="loc-body"><p class="loc-alt">' + esc(l.alt) + "</p><h3>" + esc(l.name) + "</h3>" +
        '<p class="loc-status' + (s.open ? " is-open" : "") + '">' + esc(s.text) + "</p>" +
        "<p>" + esc(l.address) + "</p>" +
        '<div class="loc-btns"><a class="btn btn-dark" href="tel:' + esc(l.phoneTel) + '">Call ' + esc(l.phoneDisplay) + "</a>" +
        '<a class="btn btn-line" href="' + esc(l.mapsUrl) + '" target="_blank" rel="noopener">Directions</a></div>' +
        '<ul class="hours">' + rows + "</ul></div></article>";
    }).join("");
  }
})();
