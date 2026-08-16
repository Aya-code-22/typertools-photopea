// TypeR-P — main.js
// baseline: Point Text در مرکز Selection (در صورت وجود) یا مرکز تصویر (در غیر اینصورت)

var statusEl = document.getElementById("status");
var textEl = document.getElementById("text");
var fontEl = document.getElementById("font");
var sizeEl = document.getElementById("size");
var colorEl = document.getElementById("color");
var alignEl = document.getElementById("align");
var insertBtn = document.getElementById("insert");

function setStatus(msg) {
  statusEl.textContent = msg;
}

window.addEventListener("message", function (e) {
  if (typeof e.data !== "string") return;

  if (e.data.indexOf("TYPERP_OK:") === 0) {
    var payload = e.data.slice("TYPERP_OK:".length);
    var fullMsg = "Text inserted. " + payload;
    setStatus(fullMsg);
    console.log("TypeR-P full message:", fullMsg);
    alert(fullMsg);
  } else if (e.data.indexOf("TYPERP_ERR:") === 0) {
    var err = e.data.slice("TYPERP_ERR:".length);
    setStatus("Error: " + err);
    console.error("TypeR-P error from Photopea:", err);
    alert("Error: " + err);
  }
});

insertBtn.addEventListener("click", function () {
  var text = textEl.value;

  if (!text || text.trim() === "") {
    setStatus("Please type some text first.");
    return;
  }

  var font = fontEl.value || "ArialMT";
  var size = Number(sizeEl.value) || 48;
  var color = (colorEl.value || "FF0000").replace(/[^0-9a-fA-F]/g, "").padEnd(6, "0").slice(0, 6);
  var align = alignEl.value || "CENTER";

  setStatus("Inserting...");

  var script =
    "try {\n" +
    "  var d = app.activeDocument;\n" +
    "  var cx, cy;\n" +
    "  var boundsInfo = 'doc-center';\n" +
    "\n" +
    "  function toPx(u) {\n" +
    "    if (u === null || u === undefined) return NaN;\n" +
    "    if (typeof u === 'number') return u;\n" +
    "\n" +
    "    if (u.value !== undefined && u.value !== null) {\n" +
    "      var v1 = Number(u.value);\n" +
    "      if (!isNaN(v1)) return v1;\n" +
    "    }\n" +
    "\n" +
    "    if (typeof u.as === 'function') {\n" +
    "      try {\n" +
    "        var v2 = Number(u.as('px'));\n" +
    "        if (!isNaN(v2)) return v2;\n" +
    "      } catch (e2) {}\n" +
    "    }\n" +
    "\n" +
    "    var v3 = Number(u);\n" +
    "    if (!isNaN(v3)) return v3;\n" +
    "\n" +
    "    var s = String(u);\n" +
    "    var m = s.match(/-?\\d+(\\.\\d+)?/);\n" +
    "    if (m) return parseFloat(m[0]);\n" +
    "\n" +
    "    return NaN;\n" +
    "  }\n" +
    "\n" +
    "  var bounds = null;\n" +
    "  var boundsErr = '';\n" +
    "  try { bounds = d.selection.bounds; } catch (e3) { bounds = null; boundsErr = (e3 && e3.message) ? e3.message : String(e3); }\n" +
    "\n" +
    "  if (bounds && bounds.length === 4) {\n" +
    "    var b0 = bounds[0], b1 = bounds[1], b2 = bounds[2], b3 = bounds[3];\n" +
    "    var left   = toPx(b0);\n" +
    "    var top    = toPx(b1);\n" +
    "    var right  = toPx(b2);\n" +
    "    var bottom = toPx(b3);\n" +
    "\n" +
    "    var raw = 'raw=[' + String(b0) + ',' + String(b1) + ',' + String(b2) + ',' + String(b3) + ']';\n" +
    "    var typ = 'types=[' + (typeof b0) + ',' + (typeof b1) + ',' + (typeof b2) + ',' + (typeof b3) + ']';\n" +
    "    var val = 'valueProp=[' + (b0 && b0.value) + ',' + (b1 && b1.value) + ',' + (b2 && b2.value) + ',' + (b3 && b3.value) + ']';\n" +
    "    var parsed = 'parsed=[' + left + ',' + top + ',' + right + ',' + bottom + ']';\n" +
    "    var nanFlags = 'isNaN=[' + isNaN(left) + ',' + isNaN(top) + ',' + isNaN(right) + ',' + isNaN(bottom) + ']';\n" +
    "\n" +
    "    if (!isNaN(left) && !isNaN(top) && !isNaN(right) && !isNaN(bottom) && right > left && bottom > top) {\n" +
    "      cx = (left + right) / 2;\n" +
    "      cy = (top + bottom) / 2;\n" +
    "      boundsInfo = 'selection-center:' + left + ',' + top + ',' + right + ',' + bottom + ' | ' + raw + ' | ' + typ + ' | ' + val;\n" +
    "    } else {\n" +
    "      cx = d.width / 2;\n" +
    "      cy = d.height / 2;\n" +
    "      boundsInfo = 'selection-unreadable-fallback-doc-center | ' + raw + ' | ' + typ + ' | ' + val + ' | ' + parsed + ' | ' + nanFlags;\n" +
    "    }\n" +
    "  } else {\n" +
    "    cx = d.width / 2;\n" +
    "    cy = d.height / 2;\n" +
    "    boundsInfo = 'no-selection-or-error: ' + boundsErr + ' | boundsLen=' + (bounds && bounds.length);\n" +
    "  }\n" +
    "\n" +
    "  var layer = d.artLayers.add();\n" +
    "  layer.kind = LayerKind.TEXT;\n" +
    "\n" +
    "  var ti =
