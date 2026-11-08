/* Team view: quote requests newest first, mark contacted, cancel.
   Reads and writes only through ACT.store. */
(function () {
  "use strict";
  var core = window.ACT.core, store = window.ACT.store, esc = core.escapeHTML;
  var listEl = document.getElementById("request-list");
  if (!listEl) return;
  var filter = "open", pendingCancel = null;

  function stamp(iso) {
    return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  }
  function home(r) { return window.ACT.homeLabel ? window.ACT.homeLabel(r) : ""; }

  function card(r) {
    var tel = "+1" + core.phoneDigits(r.phone), actions, badge;
    if (r.status === "cancelled") {
      badge = '<span class="badge badge-cancel">Cancelled</span>';
      actions = '<p class="rq-note">Cancelled ' + esc(stamp(r.cancelledAt)) + "</p>";
    } else {
      badge = r.status === "contacted"
        ? '<span class="badge badge-done">Contacted</span>'
        : '<span class="badge badge-new">New: call back with a price</span>';
      if (pendingCancel === r.ref) {
        actions = '<div class="rq-confirm"><span>Cancel this request?</span>' +
          '<button type="button" class="btn btn-danger btn-sm" data-cancel-yes="' + esc(r.ref) + '">Yes, cancel</button>' +
          '<button type="button" class="btn btn-ghost btn-sm" data-cancel-no>Keep it</button></div>';
      } else {
        actions = '<a class="btn btn-call btn-sm" href="tel:' + esc(tel) + '">Call</a>' +
          '<a class="btn btn-ghost btn-sm" href="sms:' + esc(tel) + '">Text</a>' +
          (r.status === "new" ? '<button type="button" class="btn btn-green btn-sm" data-contacted="' + esc(r.ref) + '">Mark contacted</button>' : "") +
          '<button type="button" class="btn btn-ghost btn-sm btn-cancel" data-cancel="' + esc(r.ref) + '">Cancel</button>';
      }
    }
    return '<article class="rq-card is-' + esc(r.status) + '" data-ref="' + esc(r.ref) + '">' +
      '<div class="rq-head"><span class="rq-service">' + esc(r.serviceName) + "</span>" +
        '<span class="rq-freq">' + esc(r.frequencyLabel) + "</span>" + badge + "</div>" +
      '<dl class="rq-grid">' +
        "<div><dt>Preferred date</dt><dd>" + esc(core.formatDateLong(r.date)) + "</dd></div>" +
        "<div><dt>Customer</dt><dd>" + esc(r.name) + "</dd></div>" +
        '<div><dt>Phone</dt><dd><a href="tel:' + esc(tel) + '">' + esc(r.phone) + "</a></dd></div>" +
        "<div><dt>About the place</dt><dd>" + esc(home(r)) + "</dd></div>" +
        (r.email ? '<div><dt>Email</dt><dd><a href="mailto:' + esc(r.email) + '">' + esc(r.email) + "</a></dd></div>" : "") +
        (r.notes ? '<div class="rq-wide"><dt>Notes</dt><dd>' + esc(r.notes) + "</dd></div>" : "") +
      "</dl>" +
      '<p class="rq-meta">Ref <b>' + esc(r.ref) + "</b> &middot; sent " + esc(stamp(r.createdAt)) +
        (r.contactedAt && r.status !== "cancelled" ? " &middot; contacted " + esc(stamp(r.contactedAt)) : "") + "</p>" +
      '<div class="rq-actions">' + actions + "</div></article>";
  }

  function render() {
    store.list().then(function (all) {
      var counts = { all: all.length, open: 0, cancelled: 0 };
      all.forEach(function (r) { counts[r.status === "cancelled" ? "cancelled" : "open"]++; });
      Object.keys(counts).forEach(function (k) {
        var el = document.querySelector('[data-count="' + k + '"]');
        if (el) el.textContent = "(" + counts[k] + ")";
      });
      var shown = all.filter(function (r) {
        return filter === "all" || (filter === "cancelled" ? r.status === "cancelled" : r.status !== "cancelled");
      });
      listEl.innerHTML = shown.length ? shown.map(card).join("")
        : '<div class="empty"><p>No ' + (filter === "all" ? "" : filter + " ") + "requests right now.</p>" +
          '<a class="btn btn-primary" href="#quote">Make a test request</a></div>';
    });
  }

  listEl.addEventListener("click", function (e) {
    var t = e.target.closest("button");
    if (!t) return;
    if (t.hasAttribute("data-contacted")) { t.disabled = true; store.markContacted(t.getAttribute("data-contacted")).then(render); }
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
