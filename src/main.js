(function () {
  "use strict";

  alert("MAIN JS STEP 1");

  var statusEl = document.getElementById("status");
  var insertBtn = document.getElementById("insert");

  if (!statusEl) {
    alert("ERROR: status element not found");
    return;
  }

  if (!insertBtn) {
    alert("ERROR: insert button not found");
    return;
  }

  statusEl.textContent = "MAIN JS STEP 1 WORKS";

  insertBtn.onclick = function () {
    alert("INSERT BUTTON WORKS");
  };

})();
