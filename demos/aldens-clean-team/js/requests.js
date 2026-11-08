/* Team view: quote visits, soonest first. Assign who goes, mark visited, cancel.
   Reads and writes only through ACT.store. */
(function () {
  "use strict";
  var C = window.ACT_CONFIG, core = window.ACT.core, store = window.ACT.store, esc = core.escapeHTML;
  var listEl = document.getElementById("request-list");
  if (!listEl) return;
  var filter = "upcoming", pendingCancel = null;

  function stamp(iso) {
    return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  }
  function home(v) { return window.ACT.homeLabel ? window.ACT.homeLabel(v) : ""; }
  function isPast(v) {
    var n = core.now();
    return v.date < n.date || (v.date === n.date && core.toMinutes(v.time) + v.visitMinutes <= n.minutes);
  }
  function bucket(v) { return v.status === "booked" ? "upcoming" : v.status; }

  function card(v) {
    var tel = "+1" + core.phoneDigits(v.phone), actions, badge;
    if (v.status === "cancelled") {
      badge = '<span class="badge badge-cancel">Cancelled</span>';
      actions = '<p class="rq-note">Cancelled ' + esc(stamp(v.cancelledAt)) + "</p>";
    } else if (v.status === "visited") {
      badge = '<span class="badge badge-done">Visited' + (v.assignedTo ? " by " + esc(v.assignedTo) : "") + "</span>";
      actions = '<a class="btn btn-call btn-sm" href="tel:' + esc(tel) + '">Call</a>' +
        '<a class="btn btn-ghost btn-sm" href="sms:' + esc(tel) + '">Text</a>';
    } else {
      badge = isPast(v) ? '<span class="badge badge-late">Visit time passed: mark visited?</span>'
        : v.assignedTo ? '<span class="badge badge-assigned">' + esc(v.assignedTo) + " is going</span>"
        : '<span class="badge badge-new">New: assign someone</span>';
      if (pendingCancel === v.ref) {
        actions = '<div class="rq-confirm"><span>Cancel this visit?</span>' +
          '<button type="button" class="btn btn-danger btn-sm" data-cancel-yes="' + esc(v.ref) + '">Yes, cancel</button>' +
          '<button type="button" class="btn btn-ghost btn-sm" data-cancel-no>Keep it</button></div>';
      } else {
        actions = '<label class="assign"><span>Who\'s going</span><select data-assign="' + esc(v.ref) + '">' +
            '<option value="">Not assigned</option>' +
            C.team.map(function (p) { return '<option' + (p === v.assignedTo ? " selected" : "") + ">" + esc(p) + "</option>"; }).join("") +
          "</select></label>" +
          '<a class="btn btn-call btn-sm" href="tel:' + esc(tel) + '">Call</a>' +
          '<a class="btn btn-ghost btn-sm" href="sms:' + esc(tel) + '">Text</a>' +
          '<button type="button" class="btn btn-green btn-sm" data-visited="' + esc(v.ref) + '">Mark visited</button>' +
          '<button type="button" class="btn btn-ghost btn-sm btn-cancel" data-cancel="' + esc(v.ref) + '">Cancel</button>';
      }
    }
    return '<article class="rq-card is-' + esc(v.status) + '" data-ref="' + esc(v.ref) + '">' +
      '<div class="rq-when"><span class="rq-date">' + esc(core.formatDateLong(v.date)) + "</span>" +
        '<span class="rq-time">' + esc(core.formatTime(v.time)) + "</span>" + badge + "</div>" +
      '<p class="rq-address"><a href="' + esc(core.mapsLink(v.street, v.city)) + '" target="_blank" rel="noopener">' +
        esc(v.street + ", " + v.city) + "</a> <span>Map</span></p>" +
      '<dl class="rq-grid">' +
        "<div><dt>Service</dt><dd>" + esc(v.serviceName) + " &middot; " + esc(v.frequencyLabel) + "</dd></div>" +
        "<div><dt>Customer</dt><dd>" + esc(v.name) + "</dd></div>" +
        '<div><dt>Phone</dt><dd><a href="tel:' + esc(tel) + '">' + esc(v.phone) + "</a></dd></div>" +
        "<div><dt>About the place</dt><dd>" + esc(home(v)) + "</dd></div>" +
        (v.email ? '<div><dt>Email</dt><dd><a href="mailto:' + esc(v.email) + '">' + esc(v.email) + "</a></dd></div>" : "") +
        (v.notes ? '<div class="rq-wide"><dt>Notes</dt><dd>' + esc(v.notes) + "</dd></div>" : "") +
      "</dl>" +
      '<p class="rq-meta">Ref <b>' + esc(v.ref) + "</b> &middot; booked " + esc(stamp(v.createdAt)) +
        (v.visitedAt ? " &middot; visited " + esc(stamp(v.visitedAt)) : "") + "</p>" +
      '<div class="rq-actions">' + actions + "</div></article>";
  }

  function render() {
    store.list().then(function (all) {
      var counts = { all: all.length, upcoming: 0, visited: 0, cancelled: 0 };
      all.forEach(function (v) { counts[bucket(v)]++; });
      Object.keys(counts).forEach(function (k) {
        var el = document.querySelector('[data-count="' + k + '"]');
        if (el) el.textContent = "(" + counts[k] + ")";
      });
      var shown = all.filter(function (v) { return filter === "all" || bucket(v) === filter; });
      if (filter !== "upcoming") shown.reverse(); // most recent first for history tabs
      listEl.innerHTML = shown.length ? shown.map(card).join("")
        : '<div class="empty"><p>No ' + (filter === "all" ? "" : filter + " ") + "visits right now.</p>" +
          '<a class="btn btn-primary" href="#quote">Book a test visit</a></div>';
    });
  }

  listEl.addEventListener("change", function (e) {
    var sel = e.target.closest("[data-assign]");
    if (sel) store.assign(sel.getAttribute("data-assign"), sel.value).then(render);
  });
  listEl.addEventListener("click", function (e) {
    var t = e.target.closest("button");
    if (!t) return;
    if (t.hasAttribute("data-visited")) { t.disabled = true; store.markVisited(t.getAttribute("data-visited")).then(render); }
    else if (t.hasAttribute("data-cancel")) { pendingCancel = t.getAttribute("data-cancel"); render(); }
    else if (t.hasAttribute("data-cancel-no")) { pendingCancel = null; render(); }
    else if (t.hasAttribute("data-cancel-yes")) {
      t.disabled = true;
      store.cancel(t.getAttribute("data-cancel-yes")).then(function () { pendingCancel = null; render(); });
    }
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-filter]"), function (tab) {
    tab.addEventListener("click", function () {
      filter = tab.getAttribute("data-filter");
      Array.prototype.forEach.call(document.querySelectorAll("[data-filter]"), function (o) {
        o.classList.toggle("is-active", o === tab);
        o.setAttribute("aria-selected", o === tab ? "true" : "false");
      });
      render();
    });
  });

  store.onChange(render);
  render();
})();
