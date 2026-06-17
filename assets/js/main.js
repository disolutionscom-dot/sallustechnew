/* SallusTech — shared scripts (kept intentionally tiny) */
(function () {
  "use strict";
  // Stamp the current year wherever data-year is present.
  var y = String(new Date().getFullYear());
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = y; });
})();
