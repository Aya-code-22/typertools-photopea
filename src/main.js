// TypeR-P — main.js
// build-tag: TYPERP-BUILD-006 (بدون تکیه به isNaN سراسری؛ IIFE برای جلوگیری از نشت متغیر)

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
          var fullMsg = "Text inserted. " + payload;
          setStatus(fullMsg);
          alert(fullMsg);
        } else if (e.data.indexOf("TYPERP_ERR:") === 0) {
          var err = e.data.slice("TYPERP_ERR:".length);
          setStatus("Error: " + err);
          alert("Error: " + err);
        }
      } catch (listenerErr) {
        alert("TypeR-P listener error: " + listenerErr.message);
      }
    });

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

        setStatus("Inserting... (build-006)");

        var script =
          "(function(){\n" +
          "try {\n" +
          "  var d = app.activeDocument;\n" +
          "  var cx, cy;\n" +
          "  var boundsInfo = 'doc-center';\n" +
          "\n" +
          "  function isRealNumber(x) {\n" +
          "    return typeof x === 'number' && x === x && x !== Infinity && x !== -Infinity;\n" +
          "  }\n" +
          "\n" +
          "  function toPx(u) {\n" +
          "    if (u === null || u === undefined) return NaN;\n" +
          "    if (isRealNumber(u)) return u;\n" +
          "\n" +
          "    if (u.value !== undefined && u.value !== null) {\n" +
          "      var v1 = Number(u.value);\n" +
          "      if (isRealNumber(v1)) return v1;\n" +
          "    }\n" +
          "\n" +
          "    if (typeof u.as === 'function') {\n" +
          "      try {\n" +
          "        var v2 = Number(u.as('px'));\n" +
          "        if (isRealNumber(v2)) return v2;\n" +
          "      } catch (e2) {}\n" +
          "    }\n" +
          "\n" +
          "    var v3 = Number(u);\n" +
          "    if (isRealNumber(v3)) return v3;\n" +
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
          "    var parsed = 'parsed=[' + left + ',' + top + ',' + right + ',' + bottom + ']';\n" +
          "    var okFlags = 'ok=[' + isRealNumber(left) + ',' + isRealNumber(top) + ',' + isRealNumber(right) + ',' + isRealNumber(bottom) + ']';\n" +
          "\n" +
          "    if (isRealNumber(left) && isRealNumber(top) && isRealNumber(right) && isRealNumber(bottom) && right > left && bottom > top) {\n" +
          "      cx = (left + right) / 2;\n" +
          "      cy = (top + bottom) / 2;\n" +
          "      boundsInfo = 'selection-center:' + left + ',' + top + ',' + right + ',' + bottom + ' | ' + raw + ' | ' + typ;\n" +
          "    } else {\n" +
          "      cx = d.width / 2;\n" +
          "      cy = d.height / 2;\n" +
          "      boundsInfo = 'selection-unreadable-fallback-doc-center | ' + raw + ' | ' + typ + ' | ' + parsed + ' | ' + okFlags;\n" +
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
          "}\n" +
          "})();";

        window.parent.postMessage(script, "*");

        setTimeout(function () {
          if (statusEl.textContent.indexOf("Inserting...") === 0) {
            setStatus("No response from Photopea after 5s (build-006)");
          }
        }, 5000);

      } catch (clickErr) {
        alert("TypeR-P click error: " + clickErr.message);
        setStatus("Click error: " + clickErr.message);
      }
    };

    setStatus("Ready (build-006)");

  } catch (initErr) {
    alert("TypeR-P FATAL init error: " + initErr.message);
  }
})();
