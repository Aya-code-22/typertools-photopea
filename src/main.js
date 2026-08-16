// TypeR-P — main.js
// build-tag: TYPERP-BUILD-008 (True Auto-Fit, Vertical Centering, Leading & UnitValue Box)

(function () {
  try {
    var statusEl = document.getElementById("status");
    var textEl = document.getElementById("text");
    var fontEl = document.getElementById("font");
    var sizeEl = document.getElementById("size");
    var colorEl = document.getElementById("color");
    var alignEl = document.getElementById("align");
    var insertBtn = document.getElementById("insert");

    var modeEl = document.getElementById("textMode");
    var autoFitEl = document.getElementById("autoFit");
    var paddingEl = document.getElementById("padding");
    var uppercaseEl = document.getElementById("uppercase");

    if (!statusEl || !textEl || !insertBtn) {
      alert("TypeR-P init error: Essential UI elements missing.");
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
          setStatus(payload);
        } else if (e.data.indexOf("TYPERP_ERR:") === 0) {
          var err = e.data.slice("TYPERP_ERR:".length);
          setStatus("Error: " + err);
        }
      } catch (listenerErr) {
        setStatus("Listener error: " + listenerErr.message);
      }
    });

    insertBtn.onclick = function () {
      try {
        var rawText = textEl.value;

        if (!rawText || rawText.trim() === "") {
          setStatus("Please type some text first.");
          return;
        }

        var isUppercase = uppercaseEl ? uppercaseEl.checked : false;
        var text = isUppercase ? rawText.toUpperCase() : rawText;

        var font = (fontEl && fontEl.value) ? fontEl.value : "ArialMT";
        var manualSize = Number(sizeEl ? sizeEl.value : 48) || 48;
        var color = ((colorEl ? colorEl.value : "FF0000") || "FF0000")
          .replace(/[^0-9a-fA-F]/g, "")
          .padEnd(6, "0")
          .slice(0, 6);
        var align = (alignEl && alignEl.value) ? alignEl.value : "CENTER";

        var textMode = modeEl ? modeEl.value : "PARAGRAPHTEXT";
        var useAutoFit = autoFitEl ? autoFitEl.checked : true;
        var padding = Number(paddingEl ? paddingEl.value : 15) || 0;

        setStatus("Fitting & Rendering... (build-008)");

        var script =
          "(function(){\n" +
          "try {\n" +
          "  var d = app.activeDocument;\n" +
          "  if (!d) { app.echoToOE('TYPERP_ERR:No active document'); return; }\n" +
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
          "      try { var v2 = Number(u.as('px')); if (isRealNumber(v2)) return v2; } catch(e){}\n" +
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
          "  try { bounds = d.selection.bounds; } catch (e) { bounds = null; }\n" +
          "\n" +
          "  var hasSel = false;\n" +
          "  var left = 0, top = 0, right = d.width, bottom = d.height;\n" +
          "\n" +
          "  if (bounds && bounds.length === 4) {\n" +
          "    var l = toPx(bounds[0]), t = toPx(bounds[1]), r = toPx(bounds[2]), bm = toPx(bounds[3]);\n" +
          "    if (isRealNumber(l) && isRealNumber(t) && isRealNumber(r) && isRealNumber(bm) && r > l && bm > t) {\n" +
          "      left = l; top = t; right = r; bottom = bm;\n" +
          "      hasSel = true;\n" +
          "    }\n" +
          "  }\n" +
          "\n" +
          "  var pad = " + padding + ";\n" +
          "  var boxL = left + pad;\n" +
          "  var boxT = top + pad;\n" +
          "  var boxW = Math.max(10, (right - left) - (pad * 2));\n" +
          "  var boxH = Math.max(10, (bottom - top) - (pad * 2));\n" +
          "\n" +
          "  var layer = d.artLayers.add();\n" +
          "  layer.kind = LayerKind.TEXT;\n" +
          "  var ti = layer.textItem;\n" +
          "\n" +
          "  ti.contents = " + JSON.stringify(text) + ";\n" +
          "  ti.font = " + JSON.stringify(font) + ";\n" +
          "  ti.justification = Justification." + align + ";\n" +
          "\n" +
          "  var c = new SolidColor();\n" +
          "  c.rgb.hexValue = " + JSON.stringify(color) + ";\n" +
          "  ti.color = c;\n" +
          "\n" +
          "  try { ti.hyphenation = false; } catch(eH) {}\n" +
          "\n" +
          "  var mode = " + JSON.stringify(textMode) + ";\n" +
          "  var finalSize = " + manualSize + ";\n" +
          "\n" +
          "  if (mode === 'PARAGRAPHTEXT' && hasSel) {\n" +
          "    ti.kind = TextType.PARAGRAPHTEXT;\n" +
          "    try { ti.width = new UnitValue(boxW, 'px'); } catch(eW) { ti.width = boxW; }\n" +
          "    try { ti.height = new UnitValue(boxH, 'px'); } catch(eH) { ti.height = boxH; }\n" +
          "    ti.position = [boxL, boxT];\n" +
          "\n" +
          "    // الگوریتم Auto-Fit تعاملی جهت سنجش واقعی ابعاد متن روی بوم\n" +
          "    if (" + useAutoFit + ") {\n" +
          "      var minS = 8;\n" +
          "      var maxS = Math.min(boxH, 120);\n" +
          "      var bestSize = minS;\n" +
          "\n" +
          "      for (var iter = 0; iter < 10; iter++) {\n" +
          "        var midS = Math.floor((minS + maxS) / 2);\n" +
          "        if (midS <= minS) break;\n" +
          "\n" +
          "        ti.size = midS;\n" +
          "        try { ti.useAutoLeading = false; ti.leading = midS * 1.15; } catch(eL) {}\n" +
          "\n" +
          "        var tb = layer.bounds;\n" +
          "        var tw = toPx(tb[2]) - toPx(tb[0]);\n" +
          "        var th = toPx(tb[3]) - toPx(tb[1]);\n" +
          "\n" +
          "        if (tw <= boxW && th <= boxH) {\n" +
          "          bestSize = midS;\n" +
          "          minS = midS;\n" +
          "        } else {\n" +
          "          maxS = midS;\n" +
          "        }\n" +
          "      }\n" +
          "      finalSize = bestSize;\n" +
          "    }\n" +
          "\n" +
          "    ti.size = finalSize;\n" +
          "    try { ti.useAutoLeading = false; ti.leading = finalSize * 1.15; } catch(eL2) {}\n" +
          "\n" +
          "    // تراز عمودی (Vertical Centering) بر اساس ابعاد رندر شده واقعی\n" +
          "    var renderBounds = layer.bounds;\n" +
          "    var actualT = toPx(renderBounds[1]);\n" +
          "    var actualB = toPx(renderBounds[3]);\n" +
          "    var actualH = actualB - actualT;\n" +
          "\n" +
          "    var targetCenterY = top + ((bottom - top) / 2);\n" +
          "    var currentCenterY = actualT + (actualH / 2);\n" +
          "    var offsetY = targetCenterY - currentCenterY;\n" +
          "\n" +
          "    if (isRealNumber(offsetY) && Math.abs(offsetY) > 1) {\n" +
          "      layer.translate(0, offsetY);\n" +
          "    }\n" +
          "  } else {\n" +
          "    ti.kind = TextType.POINTTEXT;\n" +
          "    ti.size = finalSize;\n" +
          "    ti.position = [(left + right) / 2, (top + bottom) / 2];\n" +
          "  }\n" +
          "\n" +
          "  d.activeLayer = layer;\n" +
          "  app.echoToOE('TYPERP_OK: Applied Auto-Fit (' + finalSize + 'px) & Centered Vertically');\n" +
          "} catch (e) {\n" +
          "  app.echoToOE('TYPERP_ERR:' + (e && e.message ? e.message : String(e)));\n" +
          "}\n" +
          "})();";

        window.parent.postMessage(script, "*");

      } catch (clickErr) {
        setStatus("Click error: " + clickErr.message);
      }
    };

    setStatus("Ready (build-008)");

  } catch (initErr) {
    alert("TypeR-P FATAL init error: " + initErr.message);
  }
})();
