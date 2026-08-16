// TypeR-P — main.js
// build-tag: TYPERP-BUILD-007 (Paragraph Text به‌جای Point Text)

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
          console.log("[TypeR-P]", fullMsg);
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
        var PADDING = 12; // padding ثابت فعلی — بعداً به UI اضافه می‌شود

        setStatus("Inserting... (build-007)");

        var script =
          "(function(){\n" +
          "try {\n" +
          "  var d = app.activeDocument;\n" +
          "  var PAD = " + PADDING + ";\n" +
          "  var boxLeft, boxTop, boxW, boxH;\n" +
          "  var boundsInfo = 'doc-center-box';\n" +
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
          "    var s = String(u);\n" +
          "    var m = s.match(/-?\\d+(\\.\\d+)?/);\n" +
          "    if (m) return parseFloat(m[0]);\n" +
          "    return NaN;\n" +
          "  }\n" +
          "\n" +
          "  var bounds = null;\n" +
          "  var boundsErr = '';\n" +
          "  try { bounds = d.selection.bounds; } catch (e3) { bounds = null; boundsErr = (e3 && e3.message) ? e3.message : String(e3); }\n" +
          "\n" +
          "  var gotSelBox = false;\n" +
          "  if (bounds && bounds.length === 4) {\n" +
          "    var left = toPx(bounds[0]), top = toPx(bounds[1]), right = toPx(bounds[2]), bottom = toPx(bounds[3]);\n" +
          "    if (isRealNumber(left) && isRealNumber(top) && isRealNumber(right) && isRealNumber(bottom) && right > left && bottom > top) {\n" +
          "      var rawW = right - left;\n" +
          "      var rawH = bottom - top;\n" +
          "      var padX = Math.min(PAD, rawW / 2 - 1);\n" +
          "      var padY = Math.min(PAD, rawH / 2 - 1);\n" +
          "      if (padX < 0) padX = 0;\n" +
          "      if (padY < 0) padY = 0;\n" +
          "      boxLeft = left + padX;\n" +
          "      boxTop = top + padY;\n" +
          "      boxW = rawW - padX * 2;\n" +
          "      boxH = rawH - padY * 2;\n" +
          "      gotSelBox = true;\n" +
          "      boundsInfo = 'selection-box:' + Math.round(boxLeft) + ',' + Math.round(boxTop) + ',' + Math.round(boxW) + 'x' + Math.round(boxH);\n" +
          "    } else {\n" +
          "      boundsInfo = 'selection-unreadable-fallback-doc-center-box';\n" +
          "    }\n" +
          "  } else {\n" +
          "    boundsInfo = 'no-selection: ' + boundsErr + ' -> doc-center-box';\n" +
          "  }\n" +
          "\n" +
          "  if (!gotSelBox) {\n" +
          "    boxW = Math.min(d.width * 0.5, 500);\n" +
          "    boxH = Math.min(d.height * 0.2, 250);\n" +
          "    boxLeft = (d.width - boxW) / 2;\n" +
          "    boxTop = (d.height - boxH) / 2;\n" +
          "  }\n" +
          "\n" +
          "  var layer = d.artLayers.add();\n" +
          "  layer.kind = LayerKind.TEXT;\n" +
          "\n" +
          "  var ti = layer.textItem;\n" +
          "  ti.kind = TextType.PARAGRAPHTEXT;\n" +
          "  ti.contents = " + JSON.stringify(text) + ";\n" +
          "  ti.font = " + JSON.stringify(font) + ";\n" +
          "  ti.size = " + size + ";\n" +
          "  ti.justification = Justification." + align + ";\n" +
          "\n" +
          "  var c = new SolidColor();\n" +
          "  c.rgb.hexValue = " + JSON.stringify(color) + ";\n" +
          "  ti.color = c;\n" +
          "\n" +
          "  ti.width = boxW;\n" +
          "  ti.height = boxH;\n" +
          "  ti.position = [boxLeft, boxTop];\n" +
          "\n" +
          "  d.activeLayer = layer;\n" +
          "\n" +
          "  app.echoToOE('TYPERP_OK:' + boundsInfo);\n" +
          "} catch (e) {\n" +
          "  app.echoToOE('TYPERP_ERR:' + (e && e.message ? e.message : String(e)));\n" +
          "}\n" +
          "})();";

        window.parent.postMessage(script, "*");

        setTimeout(function () {
          if (statusEl.textContent.indexOf("Inserting...") === 0) {
            setStatus("No response from Photopea after 5s (build-007)");
          }
        }, 5000);

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
