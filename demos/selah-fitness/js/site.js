/* Equipment tabs: pick a section, see what's in it. */
(function () {
  "use strict";
  var tabs = document.querySelectorAll('#equipment [role="tab"]');
  Array.prototype.forEach.call(tabs, function (tab) {
    tab.addEventListener("click", function () {
      Array.prototype.forEach.call(tabs, function (t) {
        var on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
    });
  });
})();
