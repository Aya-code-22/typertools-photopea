// TypeR-P â€” main.js
// baseline: Point Text Ø¯Ø± Ù…Ø±Ú©Ø² Selection (Ø¯Ø± ØµÙˆØ±Øª ÙˆØ¬ÙˆØ¯) ÛŒØ§ Ù…Ø±Ú©Ø² ØªØµÙˆÛŒØ± (Ø¯Ø± ØºÛŒØ± Ø§ÛŒÙ†ØµÙˆØ±Øª)

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

// Ù‡Ø± Ù¾ÛŒØ§Ù…ÛŒ Ú©Ù‡ Ø§Ø² Photopea (Ø§Ø² Ø·Ø±ÛŒÙ‚ app.echoToOE) Ø¨Ø±Ú¯Ø±Ø¯Ø¯ØŒ Ø§ÛŒÙ†Ø¬Ø§ Ø¯Ø±ÛŒØ§ÙØª Ù…ÛŒâ€ŒØ´ÙˆØ¯
window.addEventListener("message", function (e) {
  if (typeof e.data !== "string") return;

  if (e.data.indexOf("TYPERP_OK:") === 0) {
    var payload = e.data.slice("TYPERP_OK:".length);
    setStatus("Text inserted. " + payload);
  } else if (e.data.indexOf("TYPERP_ERR:") === 0) {
    var err = e.data.slice("TYPERP_ERR:".length);
    setStatus("Error: " + err);
    console.error("TypeR-P error from Photopea:", err);
  }
  // Ù¾ÛŒØ§Ù…â€ŒÙ‡Ø§ÛŒ Ø¯ÛŒÚ¯Ø± Photopea (Ù…Ø«Ù„ Ù‡Ù†Ø¯Ø´ÛŒÚ© Ø§ÙˆÙ„ÛŒÙ‡) Ù†Ø§Ø¯ÛŒØ¯Ù‡ Ú¯Ø±ÙØªÙ‡ Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯
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

  // Ø§Ø³Ú©Ø±ÛŒÙ¾ØªÛŒ Ú©Ù‡ Ø¯Ø§Ø®Ù„ Photopea Ø§Ø¬Ø±Ø§ Ù…ÛŒâ€ŒØ´ÙˆØ¯.
  // Ù†Ú©ØªÙ‡: LayerKind, TextType, Justification, SolidColor, UnitValue Ù‡Ù…Ú¯ÛŒ ÙÙ‚Ø·
  // Ø¯Ø§Ø®Ù„ Ù…Ø­ÛŒØ· Ø§Ø³Ú©Ø±ÛŒÙ¾Øª Photopea Ù…Ø¹ØªØ¨Ø±Ù†Ø¯ØŒ Ù†Ù‡ Ø¯Ø± Ø§ÛŒÙ† ÙØ§ÛŒÙ„ main.js.
  var script =
    "try {\n" +
    "  var d = app.activeDocument;\n" +
    "  var cx, cy;\n" +
    "  var boundsInfo = 'doc-center';\n" +
    "\n" +
    "  function toPx(u) {\n" +
    "    if (u === null || u === undefined) return NaN;\n" +
    "    if (typeof u === 'number') return u;\n" +
    "    if (typeof u.value === 'number') return u.value;\n" +          // Ø±ÙˆØ´ ØªØ£ÛŒÛŒØ¯Ø´Ø¯Ù‡ Ø§ØµÙ„ÛŒ
    "    if (typeof u.as === 'function') {\n" +
    "      try { return u.as('px'); } catch (e2) {}\n" +               // fallback Ù…Ø³ØªÙ†Ø¯
    "    }\n" +
    "    var n = Number(u);\n" +                                       // Ø¢Ø®Ø±ÛŒÙ† fallback
    "    return n;\n" +
    "  }\n" +
    "\n" +
    "  var bounds = null;\n" +
    "  try { bounds = d.selection.bounds; } catch (e3) { bounds = null; }\n" +
    "\n" +
    "  if (bounds) {\n" +
    "    var left   = toPx(bounds[0]);\n" +
    "    var top    = toPx(bounds[1]);\n" +
    "    var right  = toPx(bounds[2]);\n" +
    "    var bottom = toPx(bounds[3]);\n" +
    "\n" +
    "    if (!isNaN(left) && !isNaN(top) && !isNaN(right) && !isNaN(bottom)) {\n" +
    "      cx = (left + right) / 2;\n" +
    "      cy = (top + bottom) / 2;\n" +
    "      boundsInfo = 'selection-center:' + left + ',' + top + ',' + right + ',' + bottom;\n" +
    "    } else {\n" +
    "      cx = d.width / 2;\n" +
    "      cy = d.height / 2;\n" +
    "      boundsInfo = 'selection-unreadable-fallback-doc-center';\n" +
    "    }\n" +
    "  } else {\n" +
    "    cx = d.width / 2;\n" +
    "    cy = d.height / 2;\n" +
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
