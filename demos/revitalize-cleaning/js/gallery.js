/* Project photo rows: arrows scroll one photo at a time, counter shows position. */
(function () {
  "use strict";
  Array.prototype.forEach.call(document.querySelectorAll("[data-carousel]"), function (box) {
    var track = box.querySelector(".track"), slides = track.querySelectorAll(".slide"),
        prev = box.querySelector('[data-dir="-1"]'), next = box.querySelector('[data-dir="1"]'), count = box.querySelector(".count");
    function current() {
      var x = track.scrollLeft, best = 0;
      Array.prototype.forEach.call(slides, function (s, i) { if (Math.abs(s.offsetLeft - track.offsetLeft - x) < Math.abs(slides[best].offsetLeft - track.offsetLeft - x)) best = i; });
      return best;
    }
    function update() {
      var i = current(), end = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      count.textContent = (end ? slides.length : i + 1) + " / " + slides.length;
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = end;
    }
    function go(dir) {
      var i = Math.max(0, Math.min(slides.length - 1, current() + dir));
      track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: "smooth" });
    }
    prev.addEventListener("click", function () { go(-1); });
    next.addEventListener("click", function () { go(1); });
    track.addEventListener("scroll", function () { window.requestAnimationFrame(update); }, { passive: true });
    window.addEventListener("resize", update);
    if (slides.length < 2) box.querySelector(".arrows").hidden = true;
    update();
  });
})();
