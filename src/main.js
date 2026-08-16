// TypeR-P — main.js
// build-tag: TYPERP-BUILD-007 (Paragraph Text در Selection + fallback به Point Text)

(function () {
  try {
    var statusEl = document.getElementById("status");
    var textEl = document.getElementById("text");
    var fontEl = document.getElementById("font");
    var sizeEl = document.getElementById("size");
    var colorEl = document.getElementById("color");
    var alignEl = document.getElementById("align");
    var insertBtn = document.getElementById("insert");

    var missing = [];
    if (!statusEl) missing.push("#status");
    if (!textEl) missing.push("#text");
    if (!fontEl) missing.push("#font");
    if (!sizeEl) missing.push("#size");
    if (!colorEl) missing.push("#color");
    if (!alignEl) missing.push("#align");
    if (!insertBtn) missing.push("#insert");

    if (missing.length > 0) {
      alert("TypeR-P init error: missing elements: " + missing.join(", "));
      return;
    }

    function setStatus(msg) {
      statusEl.textContent = msg;
    }

    window.addEventListener("message", function (e) {
      try {
        if (typeof e.data !== "string") return;

        if (e.data.indexOf("TYPERP_OK:") === 0) {
          var payload = e.data.slice("TYPERP_OK:".length);
          setStatus("Text inserted. " + payload);
        } else if (e.data.indexOf("TYPERP_ERR:") === 0) {
          var err = e.data.slice("TYPERP_ERR:".length);
          setStatus("Error: " + err);
          alert("Error: " + err);
        }
      } catch (listenerErr) {
        alert("TypeR-P listener error: " + listenerErr.message);
      }
    });

    var PADDING = 14;
    var MIN_BOX_SIZE = 20;

    insertBtn.onclick = function () {
      try {
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
          "(function(){\n" +
          "try {\n" +
          "  var d = app.activeDocument;\n" +
          "  var PADDING = " + PADDING + ";\n" +
          "  var MIN_BOX = " + MIN_BOX_SIZE + ";\n" +
          "  var boundsInfo = 'doc-center-point-text';\n" +
          "  var mode = 'point';\n" +
          "  var boxLeft, boxTop, boxWidth, boxHeight;\n" +
          "  var cx, cy;\n" +
          "\n" +
          "  function isRealNumber(x) {\n" +
          "    return typeof x === 'number' && x === x && x !== Infinity && x !== -Infinity;\n" +
          "  }\n" +
          "\n" +
          "  function toPx(u) {\n" +
          "    if (u === null || u === undefined) return NaN;\n" +
          "    if (isRealNumber(u)) return u;\n" +
          "    if (u.value !== undefined && u.value !== null) {\n" +
          "      var v1 = Number(u.value);\n" +
          "      if (isRealNumber(v1)) return v1;\n" +
          "    }\n" +
          "    if (typeof u.as === 'function') {\n" +
          "      try { var v2 = Number(u.as('px')); if (isRealNumber(v2)) return v2; } catch (e2) {}\n" +
          "    }\n" +
          "    var v3 = Number(u);\n" +
          "    if (isRealNumber(v3)) return v3;\n" +
          "    return NaN;\n" +
          "  }\n" +
          "\n" +
          "  var bounds = null, boundsErr = '';\n" +
          "  try { bounds = d.selection.bounds; } catch (e3) { bounds = null; boundsErr = (e3 && e3.message) ? e3.message : String(e3); }\n" +
          "\n" +
          "  if (bounds && bounds.length === 4) {\n" +
          "    var b0 = bounds[0], b1 = bounds[1], b2 = bounds[2], b3 = bounds[3];\n" +
          "    var left = toPx(b0), top = toPx(b1), right = toPx(b2), bottom = toPx(b3);\n" +
          "\n" +
          "    if (isRealNumber(left) && isRealNumber(top) && isRealNumber(right) && isRealNumber(bottom) && (right - left) > MIN_BOX && (bottom - top) > MIN_BOX) {\n" +
          "      boxLeft = left + PADDING;\n" +
          "      boxTop = top + PADDING;\n" +
          "      boxWidth = (right - left) - (PADDING * 2);\n" +
          "      boxHeight = (bottom - top) - (PADDING * 2);\n" +
          "      if (boxWidth < 10) boxWidth = right - left;\n" +
          "      if (boxHeight < 10) boxHeight = bottom - top;\n" +
          "      mode = 'paragraph';\n" +
          "      boundsInfo = 'paragraph-in-selection:' + left + ',' + top + ',' + right + ',' + bottom;\n" +
          "    } else {\n" +
          "      cx = d.width / 2;\n" +
          "      cy = d.height / 2;\n" +
          "      boundsInfo = 'selection-unreadable-or-too-small-fallback-point-text';\n" +
          "    }\n" +
          "  } else {\n" +
          "    cx = d.width / 2;\n" +
          "    cy = d.height / 2;\n" +
          "    boundsInfo = 'no-selection-fallback-point-text: ' + boundsErr;\n" +
          "  }\n" +
          "\n" +
          "  var layer = d.artLayers.add();\n" +
          "  layer.kind = LayerKind.TEXT;\n" +
          "\n" +
          "  var ti = layer.textItem;\n" +
          "\n" +
          "  if (mode === 'paragraph') {\n" +
          "    ti.kind = TextType.PARAGRAPHTEXT;\n" +
          "    ti.contents = " + JSON.stringify(text) + ";\n" +
          "    ti.font = " + JSON.stringify(font) + ";\n" +
          "    ti.size = " + size + ";\n" +
          "    ti.justification = Justification." + align + ";\n" +
          "\n" +
          "    var c1 = new SolidColor();\n" +
          "    c1.rgb.hexValue = " + JSON.stringify(color) + ";\n" +
          "    ti.color = c1;\n" +
          "\n" +
          "    ti.position = [boxLeft, boxTop];\n" +
          "\n" +
          "    var sizeSetErr = '';\n" +
          "    try {\n" +
          "      ti.width = boxWidth;\n" +
          "      ti.height = boxHeight;\n" +
          "    } catch (eSizePlain) {\n" +
          "      try {\n" +
          "        ti.width = UnitValue(boxWidth, 'px');\n" +
          "        ti.height = UnitValue(boxHeight, 'px');\n" +
          "      } catch (eSizeUnit) {\n" +
          "        sizeSetErr = ' | width/height-set-failed: ' + eSizeUnit.message;\n" +
          "      }\n" +
          "    }\n" +
          "    boundsInfo += ' | box=' + boxLeft + ',' + boxTop + ',' + boxWidth + ',' + boxHeight + sizeSetErr;\n" +
          "  } else {\n" +
          "    ti.kind = TextType.POINTTEXT;\n" +
          "    ti.contents = " + JSON.stringify(text) + ";\n" +
          "    ti.font = " + JSON.stringify(font) + ";\n" +
          "    ti.size = " + size + ";\n" +
          "    ti.justification = Justification." + align + ";\n" +
          "\n" +
          "    var c2 = new SolidColor();\n" +
          "    c2.rgb.hexValue = " + JSON.stringify(color) + ";\n" +
          "    ti.color = c2;\n" +
          "\n" +
          "    ti.position = [cx, cy];\n" +
          "  }\n" +
          "\n" +
          "  d.activeLayer = layer;\n" +
          "  app.echoToOE('TYPERP_OK:' + boundsInfo);\n" +
          "} catch (e) {\n" +
          "  app.echoToOE('TYPERP_ERR:' + (e && e.message ? e.message : String(e)));\n" +
          "}\n" +
          "})();";

        window.parent.postMessage(script, "*");

      } catch (clickErr) {
        alert("TypeR-P click error: " + clickErr.message);
        setStatus("Click error: " + clickErr.message);
      }
    };

    setStatus("Ready (build-007)");

  } catch (initErr) {
    alert("TypeR-P FATAL init error: " + initErr.message);
  }
})();
