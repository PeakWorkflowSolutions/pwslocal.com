/* Salon view: list bookings (newest first) and cancel them.
   Reads and writes only through LN.store. */
(function () {
  "use strict";
  var core = window.LN.core, store = window.LN.store, esc = core.escapeHTML;
  var listEl = document.getElementById("booking-list");
  var filter = "active";
  var pendingCancel = null;

  function bookedAgo(iso) {
    var d = new Date(iso);
    return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  }
  function isPast(b) {
    var now = core.salonNow();
    return b.date < now.date || (b.date === now.date && core.toMinutes(b.time) < now.minutes);
  }

  function card(b) {
    var cancelled = b.status === "cancelled";
    var tel = "+1" + core.phoneDigits(b.phone);
    var actions;
    if (cancelled) {
      actions = '<p class="bk-cancelled-note">Cancelled ' + esc(bookedAgo(b.cancelledAt)) + "</p>";
    } else if (pendingCancel === b.ref) {
      actions = '<div class="bk-confirm" role="group" aria-label="Confirm cancel">' +
        "<span>Cancel this booking?</span>" +
        '<button type="button" class="btn btn-danger btn-sm" data-cancel-yes="' + esc(b.ref) + '">Yes, cancel</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-cancel-no>Keep it</button></div>';
    } else {
      actions = '<a class="btn btn-call btn-sm" href="tel:' + esc(tel) + '">Call</a>' +
        '<a class="btn btn-ghost btn-sm" href="sms:' + esc(tel) + '">Text</a>' +
        '<button type="button" class="btn btn-ghost btn-sm btn-cancel" data-cancel="' + esc(b.ref) + '">Cancel booking</button>';
    }
    return '<article class="bk-card' + (cancelled ? " is-cancelled" : "") + '" data-ref="' + esc(b.ref) + '">' +
      '<div class="bk-when"><span class="bk-date">' + esc(core.formatDateLong(b.date)) + "</span>" +
        '<span class="bk-time">' + esc(core.formatTime(b.time)) + "</span>" +
        (cancelled ? '<span class="bk-badge badge-cancel">Cancelled</span>'
          : isPast(b) ? '<span class="bk-badge badge-past">Past</span>'
          : '<span class="bk-badge badge-new">Needs confirming</span>') + "</div>" +
      '<dl class="bk-grid">' +
        "<div><dt>Service</dt><dd>" + esc(b.serviceName) + ' <small>(' + esc(b.durationMinutes) + " min)</small></dd></div>" +
        "<div><dt>Customer</dt><dd>" + esc(b.name) + "</dd></div>" +
        '<div><dt>Phone</dt><dd><a href="tel:' + esc(tel) + '">' + esc(b.phone) + "</a></dd></div>" +
        "<div><dt>Technician</dt><dd>" + esc(b.technicianLabel) + "</dd></div>" +
        (b.notes ? '<div class="bk-notes"><dt>Notes</dt><dd>' + esc(b.notes) + "</dd></div>" : "") +
      "</dl>" +
      '<p class="bk-meta">Ref <b>' + esc(b.ref) + "</b> &middot; booked " + esc(bookedAgo(b.createdAt)) + "</p>" +
      '<div class="bk-actions">' + actions + "</div></article>";
  }

  function render() {
    store.list().then(function (all) {
      var counts = { all: all.length, active: 0, cancelled: 0 };
      all.forEach(function (b) { counts[b.status === "cancelled" ? "cancelled" : "active"]++; });
      Object.keys(counts).forEach(function (k) {
        var el = document.querySelector('[data-count="' + k + '"]');
        if (el) el.textContent = "(" + counts[k] + ")";
      });
      var shown = all.filter(function (b) {
        return filter === "all" || (filter === "cancelled" ? b.status === "cancelled" : b.status !== "cancelled");
      });
      listEl.innerHTML = shown.length ? shown.map(card).join("")
        : '<div class="empty"><p>No ' + (filter === "all" ? "" : filter + " ") + "bookings yet.</p>" +
          '<a class="btn btn-primary" href="index.html#book">Make a test booking</a></div>';
    });
  }

  listEl.addEventListener("click", function (e) {
    var t = e.target;
    if (t.matches("[data-cancel]")) { pendingCancel = t.getAttribute("data-cancel"); render(); }
    else if (t.matches("[data-cancel-no]")) { pendingCancel = null; render(); }
    else if (t.matches("[data-cancel-yes]")) {
      var ref = t.getAttribute("data-cancel-yes");
      t.disabled = true;
      store.cancel(ref).then(function () { pendingCancel = null; render(); });
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
