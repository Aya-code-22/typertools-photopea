// TypeR-P — main.js (FIXED AUTO-FIT & WRAPPING)
// BUILD: TYPERP-BUILD-011

(function () {

  "use strict";

  try {

    /* =====================================================
       UI ELEMENTS
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
      alert("TypeR-P init error:\nMissing: " + missing.join(", "));
      return;
    }

    /* =====================================================
       STATUS HELPER
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

    // Padding
    var paddingLabel = makeLabel("Padding");
    var paddingEl = makeNumber(12, 0, 500);
    actions.parentElement.appendChild(paddingLabel);
    actions.parentElement.appendChild(paddingEl);

    // Text Case
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

    // Line Height
    var leadingLabel = makeLabel("Line Height Factor (Leading)");
    var leadingEl = makeNumber(1.20, 0.8, 2.5, "0.05");
    actions.parentElement.appendChild(leadingLabel);
    actions.parentElement.appendChild(leadingEl);

    // Auto Fit
    var fitLabel = makeLabel("Auto Fit");
    var fitRow = document.createElement("label");
    fitRow.style.display = "flex";
    fitRow.style.alignItems = "center";
    fitRow.style.gap = "6px";
    var fitEl = document.createElement("input");
    fitEl.type = "checkbox";
    fitEl.checked = true;
    fitRow.appendChild(fitEl);
    fitRow.appendChild(document.createTextNode("Automatically reduce font size"));
    actions.parentElement.appendChild(fitLabel);
    actions.parentElement.appendChild(fitRow);

    // Min Size
    var minSizeLabel = makeLabel("Minimum Font Size");
    var minSizeEl = makeNumber(8, 1, 500);
    actions.parentElement.appendChild(minSizeLabel);
    actions.parentElement.appendChild(minSizeEl);

    // Hyphenation
    var hyphenRow = document.createElement("label");
    hyphenRow.style.display = "flex";
    hyphenRow.style.alignItems = "center";
    hyphenRow.style.gap = "6px";
    hyphenRow.style.marginTop = "8px";
    var hyphenEl = document.createElement("input");
    hyphenEl.type = "checkbox";
    hyphenEl.checked = true;
    hyphenRow.appendChild(hyphenEl);
    hyphenRow.appendChild(document.createTextNode("Disable Word Hyphenation"));
    actions.parentElement.appendChild(hyphenRow);

    // Text Mode
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

    window.addEventListener("message", function (e) {
      try {
        if (typeof e.data !== "string") return;
        if (e.data.indexOf("TYPERP_OK:") === 0) {
          var payload = e.data.slice("TYPERP_OK:".length);
          setStatus("✅ Text inserted. " + payload);
          return;
        }
        if (e.data.indexOf("TYPERP_ERR:") === 0) {
          var err = e.data.slice("TYPERP_ERR:".length);
          setStatus("❌ Error: " + err);
          alert("TypeR-P Error:\n" + err);
        }
      } catch (err) {
        setStatus("Listener error.");
      }
    });

    /* =====================================================
       INSERT HANDLER (FIXED AUTO-FIT & WRAPPING)
       ===================================================== */

    insertBtn.onclick = function () {
      try {
        var rawText = textEl.value;
        if (!rawText || rawText.trim() === "") {
          setStatus("Please type some text first.");
          return;
        }

        var text = (caseEl.value === "UPPERCASE") ? rawText.toUpperCase() : rawText;
        var font = fontEl.value || "ArialMT";
        var initialSize = Number(sizeEl.value) || 48;
        var color = (colorEl.value || "FF0000").replace(/[^0-9a-fA-F]/g, "").padEnd(6, "0").slice(0, 6);
        var align = alignEl.value || "CENTER";
        var padding = Number(paddingEl.value) || 12;
        var leadingFactor = Number(leadingEl.value) || 1.20;
        var minSize = Number(minSizeEl.value) || 8;
        var autoFit = fitEl.checked;
        var disableHyphenation = hyphenEl.checked;
        var mode = modeEl.value;

        setStatus("Inserting... (Build 011)");

        function jsString(value) {
          return JSON.stringify(String(value));
        }

        // ============================================================
        // PHOTOPEA SCRIPT — با منطق دقیق‌تر برای Auto Fit و Wrap
        // ============================================================
        var script = `
          (function(){
            try {
              var d = app.activeDocument;
              var cx, cy, left, top, right, bottom;
              var hasSelection = false;
              var boundsInfo = 'doc-center';

              function isRealNumber(x) {
                return typeof x === 'number' && x === x && x !== Infinity && x !== -Infinity;
              }

              function toPx(u) {
                if (u === null || u === undefined) return NaN;
                if (u.value !== undefined && u.value !== null) {
                  var v = Number(u.value);
                  if (isRealNumber(v)) return v;
                }
                if (typeof u.as === 'function') {
                  try { var p = Number(u.as('px')); if (isRealNumber(p)) return p; } catch(e) {}
                }
                return NaN;
              }

              // 1. Selection
              try {
                var bounds = d.selection.bounds;
                if (bounds && bounds.length === 4) {
                  left = toPx(bounds[0]);
                  top = toPx(bounds[1]);
                  right = toPx(bounds[2]);
                  bottom = toPx(bounds[3]);
                  if (isRealNumber(left) && isRealNumber(top) && isRealNumber(right) && isRealNumber(bottom) && right > left && bottom > top) {
                    hasSelection = true;
                  }
                }
              } catch(selectionError) {}

              if (!hasSelection) {
                left = 0; top = 0; right = d.width; bottom = d.height;
                cx = d.width / 2; cy = d.height / 2;
                boundsInfo = 'document-center';
              } else {
                cx = (left + right) / 2; cy = (top + bottom) / 2;
                boundsInfo = 'selection:' + left + ',' + top + ',' + right + ',' + bottom;
              }

              // 2. Padding Box
              var boxLeft = left + ${padding};
              var boxTop = top + ${padding};
              var boxRight = right - ${padding};
              var boxBottom = bottom - ${padding};
              var boxWidth = Math.max(1, boxRight - boxLeft);
              var boxHeight = Math.max(1, boxBottom - boxTop);

              // 3. Create Layer
              var layer = d.artLayers.add();
              layer.kind = LayerKind.TEXT;
              layer.name = ${jsString("TTP: " + text.slice(0, 45))};
              var ti = layer.textItem;

              try { ti.hyphenation = ${(!disableHyphenation)}; } catch(eH) {}

              // ========================================================
              // POINT TEXT MODE
              // ========================================================
              if (${jsString(mode)} === 'POINT') {
                ti.kind = TextType.POINTTEXT;
                ti.contents = ${jsString(text)};
                ti.font = ${jsString(font)};
                ti.size = ${initialSize};
                ti.justification = Justification.${align};
                var pointColor = new SolidColor();
                pointColor.rgb.hexValue = ${jsString(color)};
                ti.color = pointColor;
                ti.position = [cx, cy];
              } 
              // ========================================================
              // PARAGRAPH TEXT MODE (WITH FIXED AUTO-FIT)
              // ========================================================
              else {
                ti.kind = TextType.PARAGRAPHTEXT;
                ti.position = [boxLeft, boxTop];
                ti.width = new UnitValue(boxWidth, 'px');
                ti.height = new UnitValue(boxHeight, 'px');
                ti.contents = ${jsString(text)};
                ti.font = ${jsString(font)};
                ti.size = ${initialSize};
                ti.justification = Justification.${align};
                var boxColor = new SolidColor();
                boxColor.rgb.hexValue = ${jsString(color)};
                ti.color = boxColor;

                // --- AUTO FIT (FIXED LOGIC) ---
                var currentSize = ${initialSize};
                var minimum = ${minSize};

                if (${autoFit}) {
                  // Better estimation: average character width is ~60% of size for Latin, 100% for CJK
                  // We use a safe average of 0.7 for mixed content
                  var avgCharWidth = currentSize * 0.7;
                  var maxCharsPerLine = Math.max(1, Math.floor(boxWidth / avgCharWidth));
                  
                  // Calculate lines based on newlines AND automatic wrapping
                  var paragraphs = ${jsString(text)}.split('\\n');
                  var totalLines = 0;
                  
                  for (var p = 0; p < paragraphs.length; p++) {
                    var paraText = paragraphs[p];
                    // Add explicit newline as a line
                    if (paraText.length === 0) {
                      totalLines += 1; // Empty line counts as one
                    } else {
                      // Calculate wrap: if text is longer than maxChars, it wraps
                      var linesForPara = Math.ceil(paraText.length / maxCharsPerLine);
                      totalLines += Math.max(1, linesForPara);
                    }
                  }
                  
                  // Estimate total height needed
                  var estimatedHeight = totalLines * currentSize * ${leadingFactor};
                  
                  // Shrink until it fits or hits minimum
                  while (currentSize > minimum && estimatedHeight > boxHeight) {
                    currentSize -= 1;
                    // Recalculate with new size
                    avgCharWidth = currentSize * 0.7;
                    maxCharsPerLine = Math.max(1, Math.floor(boxWidth / avgCharWidth));
                    totalLines = 0;
                    for (var p2 = 0; p2 < paragraphs.length; p2++) {
                      var paraText2 = paragraphs[p2];
                      if (paraText2.length === 0) {
                        totalLines += 1;
                      } else {
                        totalLines += Math.max(1, Math.ceil(paraText2.length / maxCharsPerLine));
                      }
                    }
                    estimatedHeight = totalLines * currentSize * ${leadingFactor};
                  }
                  
                  ti.size = currentSize;
                }

                // Apply leading
                try {
                  ti.useAutoLeading = false;
                  ti.leading = currentSize * ${leadingFactor};
                } catch(eL) {}
              }

              d.activeLayer = layer;

              // Return result to plugin
              app.echoToOE('TYPERP_OK:' + boundsInfo + ' | box=' + Math.round(boxWidth) + 'x' + Math.round(boxHeight) + ' | font=' + currentSize + 'px');

            } catch(e) {
              app.echoToOE('TYPERP_ERR:' + (e && e.message ? e.message : String(e)));
            }
          })();
        `;

        window.parent.postMessage(script, "*");

        // Timeout fallback if Photopea doesn't respond
        setTimeout(function () {
          if (statusEl.textContent.indexOf("Inserting...") === 0) {
            setStatus("No response from Photopea (check console).");
          }
        }, 8000);

      } catch (clickErr) {
        setStatus("Click error: " + clickErr.message);
        alert("TypeR-P click error:\n" + clickErr.message);
      }
    };

    setStatus("Ready (build-011)");

  } catch (initErr) {
    alert("TypeR-P fatal init error:\n" + initErr.message);
  }

})();
