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

// هر پیامی که از Photopea (از طریق app.echoToOE) برگردد، اینجا دریافت می‌شود
window.addEventListener("message", function (e) {
  if (typeof e.data !== "string") return;

  if (e.data.indexOf("TYPERP_OK:") === 0) {
    var payload = e.data.slice("TYPERP_OK:".length);
    var fullMsg = "Text inserted. " + payload;
    setStatus(fullMsg);
    console.log("TypeR-P full message:", fullMsg);
    alert(fullMsg); // برای اینکه متن کامل، بدون بریدگی، قابل مشاهده و کپی باشد
  } else if (e.data.indexOf("TYPERP_ERR:") === 0) {
    var err = e.data.slice("TYPERP_ERR:".length);
    setStatus("Error: " + err);
    console.error("TypeR-P error from Photopea:", err);
    alert("Error: " + err);
  }
  // پیام‌های دیگر Photopea (مثل هندشیک اولیه) نادیده گرفته می‌شوند
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
  var align = alignEl.value || "CENTER"; // LEFT | CENTER | RIGHT

  setStatus("Inserting...");

  // اسکریپتی که داخل Photopea اجرا می‌شود.
  // نکته: LayerKind, TextType, Justification, SolidColor, UnitValue همگی فقط
  // داخل محیط اسکریپت Photopea معتبرند، نه در این فایل main.js.
  var script =
    "try {\n" +
    "  var d = app.activeDocument;\n" +
    "  var cx, cy;\n" +
    "  var boundsInfo = 'doc-center';\n" +
    "\n" +
    "  function toPx(u) {\n" +
    "    if (u === null || u === undefined) return NaN;\n" +
    "    if (typeof u === 'number') return u;\n" +
    "    if (typeof u.value === 'number') return u.value;\n" +
    "    if (typeof u.as === 'function') {\n" +
    "      try { return u.as('px'); } catch (e2) {}\n" +
    "    }\n" +
    "    var n = Number(u);\n" +
    "    return n;\n" +
    "  }\n" +
    "\n" +
    "  var bounds = null;\n" +
    "  var boundsErr = '';\n" +
    "  try { bounds = d.selection.bounds; } catch (e3) { bounds = null; boundsErr = (e3 && e3.message) ? e3.message : String(e3); }\n" +
    "\n" +
    "  if (bounds) {\n" +
    "    var left   = toPx(bounds[0]);\n" +
    "    var top    = toPx(bounds[1]);\n" +
    "    var right  = toPx(bounds[2]);\n" +
    "    var bottom = toPx(bounds[3]);\n" +
    "\n" +
    "    var raw = 'raw=[' + String(bounds[0]) + ',' + String(bounds[1]) + ',' + String(bounds[2]) + ',' + String(bounds[3]) + ']';\n" +
    "    var typ = 'types=[' + typeof bounds[0] + ',' + typeof bounds[1] + ',' + typeof bounds[2] + ',' + typeof bounds[3] + ']';\n" +
    "    var val = 'valueProp=[' + (bounds[0] && bounds[0].value) + ',' + (bounds[1] && bounds[1].value) + ',' + (bounds[2] && bounds[2].value) + ',' + (bounds[3] && bounds[3].value) + ']';\n" +
    "    var parsed = 'parsed=[' + left + ',' + top + ',' + right + ',' + bottom + ']';\n" +
    "\n" +
    "    if (!isNaN(left) && !isNaN(top) && !isNaN(right) && !isNaN(bottom)) {\n" +
    "      cx = (left + right) / 2;\n" +
    "      cy = (top + bottom) / 2;\n" +
    "      boundsInfo = 'selection-center:' + left + ',' + top + ',' + right + ',' + bottom + ' | ' + raw + ' | ' + typ + ' | ' + val;\n" +
    "    } else {\n" +
    "      cx = d.width / 2;\n" +
    "      cy = d.height / 2;\n" +
    "      boundsInfo = 'selection-unreadable-fallback-doc-center | ' + raw + ' | ' + typ + ' | ' + val + ' | ' + parsed;\n" +
    "    }\n" +
    "  } else {\n" +
    "    cx = d.width / 2;\n" +
    "    cy = d.height / 2;\n" +
    "    boundsInfo = 'no-selection-or-error: ' + boundsErr;\n" +
    "  }\n" +
    "\n" +
    "  var layer = d.artLayers.add();\n" +
    "  layer.kind = LayerKind.TEXT;\n" +
    "\n" +
    "  var ti = layer.textItem;\n" +
    "  ti.kind = TextType.POINTTEXT;\n" +
    "  ti.contents = " + JSON.stringify(text) + ";\n" +
    "  ti.font = " + JSON.stringify(font) + ";\n" +
    "  ti.size = " + size + ";\n" +
    "  ti.justification = Justification." + align + ";\n" +
    "\n" +
    "  var c = new SolidColor();\n" +
    "  c.rgb.hexValue = " + JSON.stringify(color) + ";\n" +
    "  ti.color = c;\n" +
    "\n" +
    "  ti.position = [cx, cy];\n" +
    "  d.activeLayer = layer;\n" +
    "\n" +
    "  app.echoToOE('TYPERP_OK:' + boundsInfo + ' -> x=' + cx + ' y=' + cy);\n" +
    "} catch (e) {\n" +
    "  app.echoToOE('TYPERP_ERR:' + (e && e.message ? e.message : String(e)));\n" +
    "}";

  window.parent.postMessage(script, "*");
});

setStatus("Ready.");
