// TypeR-P — main.js
// BUILD: TYPERP-BUILD-007
// Selection-aware Paragraph Text + Padding + Auto Fit

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
       ADD EXTRA CONTROLS
       ===================================================== */

    var actions = insertBtn.parentElement;

    function makeLabel(text) {
      var label = document.createElement("label");
      label.textContent = text;
      label.style.display = "block";
      label.style.marginTop = "8px";
      return label;
    }

    function makeNumber(value, min, max) {
      var input = document.createElement("input");

      input.type = "number";
      input.value = value;
      input.min = min;
      input.max = max;
      input.step = "1";

      input.style.width = "100%";
      input.style.boxSizing = "border-box";

      return input;
    }


    /* Padding */

    var paddingLabel = makeLabel("Padding");

    var paddingEl = makeNumber(
      12,
      0,
      500
    );

    actions.parentElement.appendChild(paddingLabel);
    actions.parentElement.appendChild(paddingEl);


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

    var minSizeLabel = makeLabel(
      "Minimum Font Size"
    );

    var minSizeEl = makeNumber(
      8,
      1,
      500
    );

    actions.parentElement.appendChild(
      minSizeLabel
    );

    actions.parentElement.appendChild(
      minSizeEl
    );


    /* Text mode */

    var modeLabel = makeLabel(
      "Text Mode"
    );

    var modeEl = document.createElement(
      "select"
    );

    modeEl.style.width = "100%";

    var paragraphOption =
      document.createElement("option");

    paragraphOption.value =
      "PARAGRAPH";

    paragraphOption.textContent =
      "Text Box (recommended)";

    var pointOption =
      document.createElement("option");

    pointOption.value =
      "POINT";

    pointOption.textContent =
      "Point Text";

    modeEl.appendChild(
      paragraphOption
    );

    modeEl.appendChild(
      pointOption
    );

    actions.parentElement.appendChild(
      modeLabel
    );

    actions.parentElement.appendChild(
      modeEl
    );


    /* =====================================================
       PHOTOPEA COMMUNICATION
       ===================================================== */

    window.addEventListener(
      "message",
      function (e) {

        try {

          if (
            typeof e.data !== "string"
          ) {
            return;
          }

          if (
            e.data.indexOf(
              "TYPERP_OK:"
            ) === 0
          ) {

            var payload =
              e.data.slice(
                "TYPERP_OK:".length
              );

            setStatus(
              "Text inserted. " +
              payload
            );

            return;
          }

          if (
            e.data.indexOf(
              "TYPERP_ERR:"
            ) === 0
          ) {

            var err =
              e.data.slice(
                "TYPERP_ERR:".length
              );

            setStatus(
              "Error: " + err
            );

            alert(
              "TypeR-P Error:\n" +
              err
            );
          }

        } catch (err) {

          setStatus(
            "Listener error."
          );
        }

      }
    );


    /* =====================================================
       INSERT
       ===================================================== */

    insertBtn.onclick = function () {

      try {

        var text =
          textEl.value;

        if (
          !text ||
          text.trim() === ""
        ) {

          setStatus(
            "Please type some text first."
          );

          return;
        }


        var font =
          fontEl.value ||
          "ArialMT";


        var initialSize =
          Number(
            sizeEl.value
          ) || 48;


        var color =
          (
            colorEl.value ||
            "FF0000"
          )
            .replace(
              /[^0-9a-fA-F]/g,
              ""
            )
            .padEnd(
              6,
              "0"
            )
            .slice(
              0,
              6
            );


        var align =
          alignEl.value ||
          "CENTER";


        var padding =
          Number(
            paddingEl.value
          );

        if (
          !isFinite(padding) ||
          padding < 0
        ) {
          padding = 12;
        }


        var minSize =
          Number(
            minSizeEl.value
          );

        if (
          !isFinite(minSize) ||
          minSize < 1
        ) {
          minSize = 8;
        }


        var autoFit =
          fitEl.checked;


        var mode =
          modeEl.value;


        setStatus(
          "Inserting build-007..."
        );


        /* =================================================
           ESCAPE VALUES
           ================================================= */

        function jsString(value) {

          return JSON.stringify(
            String(value)
          );

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


          /* ---------------------------------------------
             Number helper
             --------------------------------------------- */

          "  function isRealNumber(x) {\n" +

          "    return typeof x === 'number' &&\n" +

          "      x === x &&\n" +

          "      x !== Infinity &&\n" +

          "      x !== -Infinity;\n" +

          "  }\n" +


          /* ---------------------------------------------
             UnitValue → px
             IMPORTANT:
             This is the method proven by build-006.
             --------------------------------------------- */

          "  function toPx(u) { \n" +

          "    if (u === null || u === undefined)\n" +

          "      return NaN;\n" +
          // این خط جدید است — اگر خودش از قبل عدد ساده بود، مستقیم برگردان
              if (typeof u === 'number' && u === u && u !== Infinity && u !== -Infinity) return u;

          "    \n" +

          "    if (u.value !== undefined && u.value !== null) {\n" +

          "      var v = Number(u.value);\n" +

          "      if (isRealNumber(v)) return v;\n" +

          "    }\n" +

          "    \n" +

          "    if (typeof u.as === 'function') {\n" +

          "      try {\n" +

          "        var p = Number(u.as('px'));\n" +

          "        if (isRealNumber(p)) return p;\n" +

          "      } catch(e) {}\n" +

          "    }\n" +

          "    \n" +

          "    return NaN;\n" +

          "  }\n" +


          /* ---------------------------------------------
             READ SELECTION
             --------------------------------------------- */

          "  try {\n" +

          "    var bounds = d.selection.bounds;\n" +

          "    \n" +

          "    if (bounds && bounds.length === 4) {\n" +

          "      left = toPx(bounds[0]);\n" +

          "      top = toPx(bounds[1]);\n" +

          "      right = toPx(bounds[2]);\n" +

          "      bottom = toPx(bounds[3]);\n" +

          "      \n" +

          "      if (\n" +

          "        isRealNumber(left) &&\n" +

          "        isRealNumber(top) &&\n" +

          "        isRealNumber(right) &&\n" +

          "        isRealNumber(bottom) &&\n" +

          "        right > left &&\n" +

          "        bottom > top\n" +

          "      ) {\n" +

          "        hasSelection = true;\n" +

          "      }\n" +

          "    }\n" +

          "  } catch(selectionError) {}\n" +


          /* ---------------------------------------------
             FALLBACK
             --------------------------------------------- */

          "  if (!hasSelection) {\n" +

          "    left = 0;\n" +

          "    top = 0;\n" +

          "    right = d.width;\n" +

          "    bottom = d.height;\n" +

          "    \n" +

          "    cx = d.width / 2;\n" +

          "    cy = d.height / 2;\n" +

          "    \n" +

          "    boundsInfo = 'document-center';\n" +

          "  } else {\n" +

          "    cx = (left + right) / 2;\n" +

          "    cy = (top + bottom) / 2;\n" +

          "    \n" +

          "    boundsInfo =\n" +

          "      'selection:' +\n" +

          "      left + ',' +\n" +

          "      top + ',' +\n" +

          "      right + ',' +\n" +

          "      bottom;\n" +

          "  }\n" +


          /* ---------------------------------------------
             PADDING
             --------------------------------------------- */

          "  var boxLeft = left + " +
          padding +
          ";\n" +

          "  var boxTop = top + " +
          padding +
          ";\n" +

          "  var boxRight = right - " +
          padding +
          ";\n" +

          "  var boxBottom = bottom - " +
          padding +
          ";\n" +


          "  var boxWidth =\n" +
          "    boxRight - boxLeft;\n" +

          "  var boxHeight =\n" +
          "    boxBottom - boxTop;\n" +


          /* Prevent negative box dimensions */

          "  if (boxWidth < 1) boxWidth = 1;\n" +

          "  if (boxHeight < 1) boxHeight = 1;\n" +


          /* ---------------------------------------------
             CREATE TEXT LAYER
             --------------------------------------------- */

          "  var layer =\n" +
          "    d.artLayers.add();\n" +

          "  layer.kind = LayerKind.TEXT;\n" +

          "  layer.name = " +
          jsString(
            "TTP: " +
            text
              .slice(0, 45)
          ) +
          ";\n" +


          "  var ti = layer.textItem;\n" +


          /* ---------------------------------------------
             POINT TEXT
             --------------------------------------------- */

          "  if (" +
          jsString(mode) +
          " === 'POINT') {\n" +

          "    ti.kind = TextType.POINTTEXT;\n" +

          "    ti.contents = " +
          jsString(text) +
          ";\n" +

          "    ti.font = " +
          jsString(font) +
          ";\n" +

          "    ti.size = " +
          initialSize +
          ";\n" +

          "    ti.justification =\n" +
          "      Justification." +
          align +
          ";\n" +


          "    var pointColor =\n" +
          "      new SolidColor();\n" +

          "    pointColor.rgb.hexValue = " +
          jsString(color) +
          ";\n" +

          "    ti.color = pointColor;\n" +


          "    ti.position = [cx, cy];\n" +

          "  } else {\n" +


          /* ---------------------------------------------
             PARAGRAPH TEXT
             --------------------------------------------- */

          "    ti.kind =\n" +
          "      TextType.PARAGRAPHTEXT;\n" +


          "    ti.position = [\n" +
          "      boxLeft,\n" +
          "      boxTop\n" +
          "    ];\n" +


          "    ti.width =\n" +
          "      new UnitValue(\n" +
          "        boxWidth,\n" +
          "        'px'\n" +
          "      );\n" +


          "    ti.height =\n" +
          "      new UnitValue(\n" +
          "        boxHeight,\n" +
          "        'px'\n" +
          "      );\n" +


          "    ti.contents = " +
          jsString(text) +
          ";\n" +

          "    ti.font = " +
          jsString(font) +
          ";\n" +

          "    ti.size = " +
          initialSize +
          ";\n" +


          "    ti.justification =\n" +
          "      Justification." +
          align +
          ";\n" +


          "    var boxColor =\n" +
          "      new SolidColor();\n" +

          "    boxColor.rgb.hexValue = " +
          jsString(color) +
          ";\n" +

          "    ti.color = boxColor;\n" +


          /* ---------------------------------------------
             AUTO FIT
             --------------------------------------------- */

          "    if (" +
          autoFit +
          ") {\n" +

          "      var currentSize = " +
          initialSize +
          ";\n" +

          "      var minimum = " +
          minSize +
          ";\n" +


          "      function estimateLines(str, size, width) {\n" +

          "        var chars = str.length;\n" +

          "        var avgCharWidth = size * 0.52;\n" +

          "        var charsPerLine = Math.max(\n" +

          "          1,\n" +

          "          Math.floor(\n" +

          "            width / avgCharWidth\n" +

          "          )\n" +

          "        );\n" +


          "        var explicit =\n" +

          "          str.split('\\\\n');\n" +


          "        var lines = 0;\n" +


          "        for (\n" +

          "          var i = 0;\n" +

          "          i < explicit.length;\n" +

          "          i++\n" +

          "        ) {\n" +

          "          var n =\n" +

          "            explicit[i].length;\n" +

          "          \n" +

          "          lines += Math.max(\n" +

          "            1,\n" +

          "            Math.ceil(\n" +

          "              n / charsPerLine\n" +

          "            )\n" +

          "          );\n" +

          "        }\n" +


          "        return lines;\n" +

          "      }\n" +


          "      while (\n" +

          "        currentSize > minimum\n" +

          "      ) {\n" +

          "        var lines =\n" +

          "          estimateLines(\n" +

          "            " +
          jsString(text) +
          ",\n" +

          "            currentSize,\n" +

          "            boxWidth\n" +

          "          );\n" +


          "        var estimatedHeight =\n" +

          "          lines *\n" +

          "          currentSize *\n" +

          "          1.20;\n" +


          "        if (\n" +

          "          estimatedHeight <=\n" +

          "          boxHeight\n" +

          "        ) {\n" +

          "          break;\n" +

          "        }\n" +


          "        currentSize -= 1;\n" +

          "        ti.size = currentSize;\n" +

          "      }\n" +

          "    }\n" +

          "  }\n" +


          "  d.activeLayer = layer;\n" +


          /* ---------------------------------------------
             RESULT
             --------------------------------------------- */

          "  app.echoToOE(\n" +

          "    'TYPERP_OK:' +\n" +

          "    boundsInfo +\n" +

          "    ' | box=' +\n" +

          "    Math.round(boxWidth) +\n" +

          "    'x' +\n" +

          "    Math.round(boxHeight) +\n" +

          "    ' | center=' +\n" +

          "    Math.round(cx) +\n" +

          "    ',' +\n" +

          "    Math.round(cy)\n" +

          "  );\n" +


          "} catch(e) {\n" +

          "  app.echoToOE(\n" +

          "    'TYPERP_ERR:' +\n" +

          "    (e && e.message ?\n" +

          "      e.message :\n" +

          "      String(e))\n" +

          "  );\n" +

          "}\n" +

          "})();";


        window.parent.postMessage(
          script,
          "*"
        );


        setTimeout(
          function () {

            if (
              statusEl.textContent
                .indexOf(
                  "Inserting..."
                ) === 0
            ) {

              setStatus(
                "No response from Photopea."
              );

            }

          },
          7000
        );


      } catch (clickErr) {

        setStatus(
          "Click error: " +
          clickErr.message
        );

        alert(
          "TypeR-P click error:\n" +
          clickErr.message
        );
      }

    };


    setStatus(
      "Ready (build-007)"
    );


  } catch (initErr) {

    alert(
      "TypeR-P fatal init error:\n" +
      initErr.message
    );

  }

})();
