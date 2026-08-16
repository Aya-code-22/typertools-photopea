// TypeR-P — main.js
// BUILD: TYPERP-BUILD-010
// Selection-aware Paragraph Text + Auto Fit + Padding + Line Height + Case + Hyphenation

(function () {

  "use strict";

  try {

    /* =====================================================
       UI
       ===================================================== */

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

    if (missing.length) {
      alert(
        "TypeR-P init error:\nMissing: " +
        missing.join(", ")
      );
      return;
    }


    /* =====================================================
       STATUS
       ===================================================== */

    function setStatus(msg) {
      statusEl.textContent = msg;
    }


    /* =====================================================
       ADD EXTRA CONTROLS (TyperTools Features)
       ===================================================== */

    var actions = insertBtn.parentElement;

    function makeLabel(text) {
      var label = document.createElement("label");
      label.textContent = text;
      label.style.display = "block";
      label.style.marginTop = "8px";
      return label;
    }

    function makeNumber(value, min, max, step) {
      var input = document.createElement("input");

      input.type = "number";
      input.value = value;
      input.min = min;
      input.max = max;
      input.step = step || "1";

      input.style.width = "100%";
      input.style.boxSizing = "border-box";

      return input;
    }


    /* Padding */

    var paddingLabel = makeLabel("Padding");
    var paddingEl = makeNumber(12, 0, 500);

    actions.parentElement.appendChild(paddingLabel);
    actions.parentElement.appendChild(paddingEl);


    /* Text Case (UPPERCASE / Preserved) */

    var caseLabel = makeLabel("Text Case");
    var caseEl = document.createElement("select");
    caseEl.style.width = "100%";

    var upperOption = document.createElement("option");
    upperOption.value = "UPPERCASE";
    upperOption.textContent = "UPPERCASE (Manga Standard)";

    var asIsOption = document.createElement("option");
    asIsOption.value = "AS_IS";
    asIsOption.textContent = "As Is (Preserve)";

    caseEl.appendChild(upperOption);
    caseEl.appendChild(asIsOption);

    actions.parentElement.appendChild(caseLabel);
    actions.parentElement.appendChild(caseEl);


    /* Line Height Ratio / Leading */

    var leadingLabel = makeLabel("Line Height Factor (Leading)");
    var leadingEl = makeNumber(1.20, 0.8, 2.5, "0.05");

    actions.parentElement.appendChild(leadingLabel);
    actions.parentElement.appendChild(leadingEl);


    /* Auto Fit */

    var fitLabel = makeLabel("Auto Fit");
    var fitRow = document.createElement("label");

    fitRow.style.display = "flex";
    fitRow.style.alignItems = "center";
    fitRow.style.gap = "6px";

    var fitEl = document.createElement("input");
    fitEl.type = "checkbox";
    fitEl.checked = true;

    fitRow.appendChild(fitEl);
    fitRow.appendChild(
      document.createTextNode(
        "Automatically reduce font size"
      )
    );

    actions.parentElement.appendChild(fitLabel);
    actions.parentElement.appendChild(fitRow);


    /* Minimum font size */

    var minSizeLabel = makeLabel("Minimum Font Size");
    var minSizeEl = makeNumber(8, 1, 500);

    actions.parentElement.appendChild(minSizeLabel);
    actions.parentElement.appendChild(minSizeEl);


    /* Hyphenation Toggle */

    var hyphenRow = document.createElement("label");
    hyphenRow.style.display = "flex";
    hyphenRow.style.alignItems = "center";
    hyphenRow.style.gap = "6px";
    hyphenRow.style.marginTop = "8px";

    var hyphenEl = document.createElement("input");
    hyphenEl.type = "checkbox";
    hyphenEl.checked = true;

    hyphenRow.appendChild(hyphenEl);
    hyphenRow.appendChild(
      document.createTextNode("Disable Word Hyphenation")
    );

    actions.parentElement.appendChild(hyphenRow);


    /* Text mode */

    var modeLabel = makeLabel("Text Mode");
    var modeEl = document.createElement("select");
    modeEl.style.width = "100%";

    var paragraphOption = document.createElement("option");
    paragraphOption.value = "PARAGRAPH";
    paragraphOption.textContent = "Text Box (recommended)";

    var pointOption = document.createElement("option");
    pointOption.value = "POINT";
    pointOption.textContent = "Point Text";

    modeEl.appendChild(paragraphOption);
    modeEl.appendChild(pointOption);

    actions.parentElement.appendChild(modeLabel);
    actions.parentElement.appendChild(modeEl);


    /* =====================================================
       PHOTOPEA COMMUNICATION
       ===================================================== */

    window.addEventListener(
      "message",
      function (e) {

        try {

          if (typeof e.data !== "string") {
            return;
          }

          if (e.data.indexOf("TYPERP_OK:") === 0) {
            var payload = e.data.slice("TYPERP_OK:".length);
            setStatus("Text inserted. " + payload);
            return;
          }

          if (e.data.indexOf("TYPERP_ERR:") === 0) {
            var err = e.data.slice("TYPERP_ERR:".length);
            setStatus("Error: " + err);
            alert("TypeR-P Error:\n" + err);
          }

        } catch (err) {
          setStatus("Listener error.");
        }

      }
    );


    /* =====================================================
       INSERT
       ===================================================== */

    insertBtn.onclick = function () {

      try {

        var rawText = textEl.value;

        if (!rawText || rawText.trim() === "") {
          setStatus("Please type some text first.");
          return;
        }

        // 1. Text Case Transformation
        var text = (caseEl.value === "UPPERCASE") ? rawText.toUpperCase() : rawText;

        var font = fontEl.value || "ArialMT";
        var initialSize = Number(sizeEl.value) || 48;

        var color = (colorEl.value || "FF0000")
          .replace(/[^0-9a-fA-F]/g, "")
          .padEnd(6, "0")
          .slice(0, 6);

        var align = alignEl.value || "CENTER";

        var padding = Number(paddingEl.value);
        if (!isFinite(padding) || padding < 0) {
          padding = 12;
        }

        var leadingFactor = Number(leadingEl.value);
        if (!isFinite(leadingFactor) || leadingFactor <= 0) {
          leadingFactor = 1.20;
        }

        var minSize = Number(minSizeEl.value);
        if (!isFinite(minSize) || minSize < 1) {
          minSize = 8;
        }

        var autoFit = fitEl.checked;
        var disableHyphenation = hyphenEl.checked;
        var mode = modeEl.value;

        setStatus("Inserting build-010...");


        /* =================================================
           ESCAPE VALUES
           ================================================= */

        function jsString(value) {
          return JSON.stringify(String(value));
        }


        /* =================================================
           PHOTOPEA SCRIPT
           ================================================= */

        var script =

          "(function(){\n" +
          "try {\n" +
          "  var d = app.activeDocument;\n" +
          "  var cx, cy;\n" +
          "  var left, top, right, bottom;\n" +
          "  var hasSelection = false;\n" +
          "  var boundsInfo = 'doc-center';\n" +

          /* Number helper */
          "  function isRealNumber(x) {\n" +
          "    return typeof x === 'number' && x === x && x !== Infinity && x !== -Infinity;\n" +
          "  }\n" +

          /* UnitValue → px */
          "  function toPx(u) {\n" +
          "    if (u === null || u === undefined) return NaN;\n" +
          "    if (u.value !== undefined && u.value !== null) {\n" +
          "      var v = Number(u.value);\n" +
          "      if (isRealNumber(v)) return v;\n" +
          "    }\n" +
          "    if (typeof u.as === 'function') {\n" +
          "      try {\n" +
          "        var p = Number(u.as('px'));\n" +
          "        if (isRealNumber(p)) return p;\n" +
          "      } catch(e) {}\n" +
          "    }\n" +
          "    return NaN;\n" +
          "  }\n" +

          /* READ SELECTION */
          "  try {\n" +
          "    var bounds = d.selection.bounds;\n" +
          "    if (bounds && bounds.length === 4) {\n" +
          "      left = toPx(bounds[0]);\n" +
          "      top = toPx(bounds[1]);\n" +
          "      right = toPx(bounds[2]);\n" +
          "      bottom = toPx(bounds[3]);\n" +
          "      if (isRealNumber(left) && isRealNumber(top) && isRealNumber(right) && isRealNumber(bottom) && right > left && bottom > top) {\n" +
          "        hasSelection = true;\n" +
          "      }\n" +
          "    }\n" +
          "  } catch(selectionError) {}\n" +

          /* FALLBACK */
          "  if (!hasSelection) {\n" +
          "    left = 0;\n" +
          "    top = 0;\n" +
          "    right = d.width;\n" +
          "    bottom = d.height;\n" +
          "    cx = d.width / 2;\n" +
          "    cy = d.height / 2;\n" +
          "    boundsInfo = 'document-center';\n" +
          "  } else {\n" +
          "    cx = (left + right) / 2;\n" +
          "    cy = (top + bottom) / 2;\n" +
          "    boundsInfo = 'selection:' + left + ',' + top + ',' + right + ',' + bottom;\n" +
          "  }\n" +

          /* PADDING */
          "  var boxLeft = left + " + padding + ";\n" +
          "  var boxTop = top + " + padding + ";\n" +
          "  var boxRight = right - " + padding + ";\n" +
          "  var boxBottom = bottom - " + padding + ";\n" +
          "  var boxWidth = boxRight - boxLeft;\n" +
          "  var boxHeight = boxBottom - boxTop;\n" +

          "  if (boxWidth < 1) boxWidth = 1;\n" +
          "  if (boxHeight < 1) boxHeight = 1;\n" +

          /* CREATE TEXT LAYER */
          "  var layer = d.artLayers.add();\n" +
          "  layer.kind = LayerKind.TEXT;\n" +
          "  layer.name = " + jsString("TTP: " + text.slice(0, 45)) + ";\n" +

          "  var ti = layer.textItem;\n" +

          "  try { ti.hyphenation = " + (!disableHyphenation) + "; } catch(eH) {}\n" +

          /* POINT TEXT */
          "  if (" + jsString(mode) + " === 'POINT') {\n" +
          "    ti.kind = TextType.POINTTEXT;\n" +
          "    ti.contents = " + jsString(text) + ";\n" +
          "    ti.font = " + jsString(font) + ";\n" +
          "    ti.size = " + initialSize + ";\n" +
          "    ti.justification = Justification." + align + ";\n" +
          "    var pointColor = new SolidColor();\n" +
          "    pointColor.rgb.hexValue = " + jsString(color) + ";\n" +
          "    ti.color = pointColor;\n" +
          "    ti.position = [cx, cy];\n" +
          "  } else {\n" +

          /* PARAGRAPH TEXT */
          "    ti.kind = TextType.PARAGRAPHTEXT;\n" +
          "    ti.position = [boxLeft, boxTop];\n" +
          "    ti.width = new UnitValue(boxWidth, 'px');\n" +
          "    ti.height = new UnitValue(boxHeight, 'px');\n" +
          "    ti.contents = " + jsString(text) + ";\n" +
          "    ti.font = " + jsString(font) + ";\n" +
          "    ti.size = " + initialSize + ";\n" +
          "    ti.justification = Justification." + align + ";\n" +
          "    var boxColor = new SolidColor();\n" +
          "    boxColor.rgb.hexValue = " + jsString(color) + ";\n" +
          "    ti.color = boxColor;\n" +

          /* AUTO FIT WITH DYNAMIC LEADING */
          "    var currentSize = " + initialSize + ";\n" +
          "    if (" + autoFit + ") {\n" +
          "      var minimum = " + minSize + ";\n" +
          "      function estimateLines(str, size, width) {\n" +
          "        var avgCharWidth = size * 0.52;\n" +
          "        var charsPerLine = Math.max(1, Math.floor(width / avgCharWidth));\n" +
          "        var explicit = str.split('\\\\n');\n" +
          "        var lines = 0;\n" +
          "        for (var i = 0; i < explicit.length; i++) {\n" +
          "          lines += Math.max(1, Math.ceil(explicit[i].length / charsPerLine));\n" +
          "        }\n" +
          "        return lines;\n" +
          "      }\n" +
          "      while (currentSize > minimum) {\n" +
          "        var lines = estimateLines(" + jsString(text) + ", currentSize, boxWidth);\n" +
          "        var estimatedHeight = lines * currentSize * " + leadingFactor + ";\n" +
          "        if (estimatedHeight <= boxHeight) break;\n" +
          "        currentSize -= 1;\n" +
          "      }\n" +
          "      ti.size = currentSize;\n" +
          "    }\n" +
          "    try {\n" +
          "      ti.useAutoLeading = false;\n" +
          "      ti.leading = currentSize * " + leadingFactor + ";\n" +
          "    } catch(eL) {}\n" +
          "  }\n" +

          "  d.activeLayer = layer;\n" +

          /* RESULT */
          "  app.echoToOE('TYPERP_OK:' + boundsInfo + ' | box=' + Math.round(boxWidth) + 'x' + Math.round(boxHeight) + ' | font=' + currentSize + 'px');\n" +

          "} catch(e) {\n" +
          "  app.echoToOE('TYPERP_ERR:' + (e && e.message ? e.message : String(e)));\n" +
          "}\n" +
          "})();";

        window.parent.postMessage(script, "*");

        setTimeout(function () {
          if (statusEl.textContent.indexOf("Inserting...") === 0) {
            setStatus("No response from Photopea.");
          }
        }, 7000);

      } catch (clickErr) {
        setStatus("Click error: " + clickErr.message);
        alert("TypeR-P click error:\n" + clickErr.message);
      }

    };

    setStatus("Ready (build-010)");

  } catch (initErr) {
    alert("TypeR-P fatal init error:\n" + initErr.message);
  }

})();
