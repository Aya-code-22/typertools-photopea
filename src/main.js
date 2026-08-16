// TypeR-P — main.js
// BUILD: TYPERP-BUILD-014
//
// Full Text
// Current Line
// Line Navigation
// Selection-aware Paragraph Text
// Padding
// Auto Fit
// Minimum Font Size
// Text Mode
// Saved Styles
// Smart Long-Word Handling

(function () {

  "use strict";

  try {

    /* =====================================================
       UI REFERENCES
       ===================================================== */

    var statusEl =
      document.getElementById("status");

    var fullTextEl =
      document.getElementById("fullText");

    var loadLinesBtn =
      document.getElementById("loadLines");

    var currentLineEl =
      document.getElementById("currentLine");

    var lineInfoEl =
      document.getElementById("lineInfo");

    var previousLineBtn =
      document.getElementById("previousLine");

    var nextLineBtn =
      document.getElementById("nextLine");

    var insertLineBtn =
      document.getElementById("insertLine");

    var fontEl =
      document.getElementById("font");

    var sizeEl =
      document.getElementById("size");

    var colorEl =
      document.getElementById("color");

    var alignEl =
      document.getElementById("align");


    /* =====================================================
       REQUIRED ELEMENT CHECK
       ===================================================== */

    var missing = [];

    if (!statusEl)
      missing.push("#status");

    if (!fullTextEl)
      missing.push("#fullText");

    if (!loadLinesBtn)
      missing.push("#loadLines");

    if (!currentLineEl)
      missing.push("#currentLine");

    if (!lineInfoEl)
      missing.push("#lineInfo");

    if (!previousLineBtn)
      missing.push("#previousLine");

    if (!nextLineBtn)
      missing.push("#nextLine");

    if (!insertLineBtn)
      missing.push("#insertLine");

    if (!fontEl)
      missing.push("#font");

    if (!sizeEl)
      missing.push("#size");

    if (!colorEl)
      missing.push("#color");

    if (!alignEl)
      missing.push("#align");


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

      statusEl.textContent =
        msg;

    }


    /* =====================================================
       HELPERS
       ===================================================== */

    function makeLabel(text) {

      var label =
        document.createElement("label");

      label.textContent =
        text;

      label.style.display =
        "block";

      label.style.marginTop =
        "8px";

      return label;

    }


    function makeNumber(
      value,
      min,
      max
    ) {

      var input =
        document.createElement("input");

      input.type =
        "number";

      input.value =
        value;

      input.min =
        min;

      input.max =
        max;

      input.step =
        "1";

      input.style.width =
        "100%";

      input.style.boxSizing =
        "border-box";

      return input;

    }


    /* =====================================================
       FIND SETTINGS PANEL
       ===================================================== */

    var settingsPanel =
      fontEl.closest(".panel");


    if (!settingsPanel) {

      settingsPanel =
        fontEl.parentElement;

    }


    /* =====================================================
       LINE STATE
       ===================================================== */

    var loadedLines = [];

    var currentLineIndex = 0;


    /* =====================================================
       LINE INFO
       ===================================================== */

    function updateLineInfo() {

      if (
        loadedLines.length === 0
      ) {

        lineInfoEl.textContent =
          "No lines loaded.";

        return;

      }


      lineInfoEl.textContent =
        "Line " +
        (currentLineIndex + 1) +
        " / " +
        loadedLines.length;

    }


    /* =====================================================
       SHOW CURRENT LINE
       ===================================================== */

    function showCurrentLine() {

      if (
        loadedLines.length === 0
      ) {

        currentLineEl.value =
          "";

        updateLineInfo();

        return;

      }


      currentLineEl.value =
        loadedLines[
          currentLineIndex
        ];


      updateLineInfo();

    }


    /* =====================================================
       SAVE CURRENT LINE EDIT
       ===================================================== */

    function saveCurrentLineEdit() {

      if (
        loadedLines.length === 0
      ) {

        return;

      }


      loadedLines[
        currentLineIndex
      ] =
        currentLineEl.value;

    }


    /* =====================================================
       LOAD LINES
       ===================================================== */

    loadLinesBtn.onclick =
      function () {

        try {

          var raw =
            fullTextEl.value;


          if (
            !raw ||
            raw.trim() === ""
          ) {

            loadedLines = [];

            currentLineIndex = 0;

            currentLineEl.value =
              "";

            updateLineInfo();

            setStatus(
              "Please enter some text first."
            );

            return;

          }


          /*
           * Normalize Windows/Mac line endings.
           */

          raw =
            raw.replace(
              /\r\n/g,
              "\n"
            );

          raw =
            raw.replace(
              /\r/g,
              "\n"
            );


          /*
           * Split ONLY on actual line breaks.
           *
           * Spaces inside a sentence are preserved.
           */

          loadedLines =
            raw.split("\n");


          /*
           * Remove completely empty lines
           * only from the end.
           */

          while (
            loadedLines.length > 0 &&
            loadedLines[
              loadedLines.length - 1
            ].trim() === ""
          ) {

            loadedLines.pop();

          }


          currentLineIndex =
            0;


          showCurrentLine();


          setStatus(
            "Loaded " +
            loadedLines.length +
            " line(s)."
          );


        } catch (e) {

          alert(
            "Load Lines Error:\n" +
            e.message
          );

        }

      };


    /* =====================================================
       CURRENT LINE EDIT
       ===================================================== */

    currentLineEl.addEventListener(
      "input",
      function () {

        saveCurrentLineEdit();

        setStatus(
          "Current line edited."
        );

      }
    );


    /* =====================================================
       PREVIOUS
       ===================================================== */

    previousLineBtn.onclick =
      function () {

        if (
          loadedLines.length === 0
        ) {

          setStatus(
            "Load lines first."
          );

          return;

        }


        saveCurrentLineEdit();


        if (
          currentLineIndex > 0
        ) {

          currentLineIndex--;

        }


        showCurrentLine();

      };


    /* =====================================================
       NEXT
       ===================================================== */

    nextLineBtn.onclick =
      function () {

        if (
          loadedLines.length === 0
        ) {

          setStatus(
            "Load lines first."
          );

          return;

        }


        saveCurrentLineEdit();


        if (
          currentLineIndex <
          loadedLines.length - 1
        ) {

          currentLineIndex++;

        }


        showCurrentLine();

      };


    updateLineInfo();


    /* =====================================================
       PADDING
       ===================================================== */

    var paddingLabel =
      makeLabel("Padding");


    var paddingEl =
      makeNumber(
        12,
        0,
        500
      );


    settingsPanel.appendChild(
      paddingLabel
    );

    settingsPanel.appendChild(
      paddingEl
    );


    /* =====================================================
       AUTO FIT
       ===================================================== */

    var fitLabel =
      makeLabel("Auto Fit");


    var fitRow =
      document.createElement("label");


    fitRow.style.display =
      "flex";

    fitRow.style.alignItems =
      "center";

    fitRow.style.gap =
      "6px";


    var fitEl =
      document.createElement("input");

    fitEl.type =
      "checkbox";

    fitEl.checked =
      true;


    fitRow.appendChild(
      fitEl
    );


    fitRow.appendChild(
      document.createTextNode(
        "Automatically reduce font size"
      )
    );


    settingsPanel.appendChild(
      fitLabel
    );

    settingsPanel.appendChild(
      fitRow
    );


    /* =====================================================
       MINIMUM FONT SIZE
       ===================================================== */

    var minSizeLabel =
      makeLabel(
        "Minimum Font Size"
      );


    var minSizeEl =
      makeNumber(
        8,
        1,
        500
      );


    settingsPanel.appendChild(
      minSizeLabel
    );

    settingsPanel.appendChild(
      minSizeEl
    );


    /* =====================================================
       TEXT MODE
       ===================================================== */

    var modeLabel =
      makeLabel(
        "Text Mode"
      );


    var modeEl =
      document.createElement(
        "select"
      );


    modeEl.style.width =
      "100%";


    var paragraphOption =
      document.createElement(
        "option"
      );


    paragraphOption.value =
      "PARAGRAPH";


    paragraphOption.textContent =
      "Text Box (recommended)";


    var pointOption =
      document.createElement(
        "option"
      );


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


    settingsPanel.appendChild(
      modeLabel
    );


    settingsPanel.appendChild(
      modeEl
    );


    /* =====================================================
       SAVED STYLES
       ===================================================== */

    var STYLES_KEY =
      "typerp_styles_v1";


    var memoryStyles =
      {};


    function loadStyles() {

      try {

        var raw =
          localStorage.getItem(
            STYLES_KEY
          );


        if (!raw) {

          return {};

        }


        var parsed =
          JSON.parse(raw);


        if (
          parsed &&
          typeof parsed ===
          "object"
        ) {

          return parsed;

        }


        return {};

      } catch (e) {

        return memoryStyles;

      }

    }


    function saveStylesObj(
      obj
    ) {

      try {

        localStorage.setItem(
          STYLES_KEY,
          JSON.stringify(obj)
        );

      } catch (e) {

        memoryStyles =
          obj;

      }

    }


    var stylesLabel =
      makeLabel(
        "Saved Styles"
      );


    settingsPanel.appendChild(
      stylesLabel
    );


    var styleSelectRow =
      document.createElement(
        "div"
      );


    styleSelectRow.style.display =
      "flex";

    styleSelectRow.style.gap =
      "6px";

    styleSelectRow.style.marginTop =
      "4px";


    var styleSelectEl =
      document.createElement(
        "select"
      );


    styleSelectEl.style.flex =
      "1";


    var applyStyleBtn =
      document.createElement(
        "button"
      );


    applyStyleBtn.type =
      "button";


    applyStyleBtn.textContent =
      "Apply";


    var deleteStyleBtn =
      document.createElement(
        "button"
      );


    deleteStyleBtn.type =
      "button";


    deleteStyleBtn.textContent =
      "Delete";


    styleSelectRow.appendChild(
      styleSelectEl
    );


    styleSelectRow.appendChild(
      applyStyleBtn
    );


    styleSelectRow.appendChild(
      deleteStyleBtn
    );


    settingsPanel.appendChild(
      styleSelectRow
    );


    var styleSaveRow =
      document.createElement(
        "div"
      );


    styleSaveRow.style.display =
      "flex";

    styleSaveRow.style.gap =
      "6px";

    styleSaveRow.style.marginTop =
      "6px";


    var styleNameEl =
      document.createElement(
        "input"
      );


    styleNameEl.type =
      "text";


    styleNameEl.placeholder =
      "Style name...";


    styleNameEl.style.flex =
      "1";


    styleNameEl.style.boxSizing =
      "border-box";


    var saveStyleBtn =
      document.createElement(
        "button"
      );


    saveStyleBtn.type =
      "button";


    saveStyleBtn.textContent =
      "Save Style";


    styleSaveRow.appendChild(
      styleNameEl
    );


    styleSaveRow.appendChild(
      saveStyleBtn
    );


    settingsPanel.appendChild(
      styleSaveRow
    );


    /* =====================================================
       REFRESH STYLES
       ===================================================== */

    function refreshStyleSelect(
      selectName
    ) {

      var styles =
        loadStyles();


      var names =
        Object.keys(
          styles
        ).sort(
          function (a, b) {

            return a.localeCompare(
              b
            );

          }
        );


      styleSelectEl.innerHTML =
        "";


      if (
        names.length === 0
      ) {

        var emptyOpt =
          document.createElement(
            "option"
          );


        emptyOpt.value =
          "";


        emptyOpt.textContent =
          "(no styles saved)";


        styleSelectEl.appendChild(
          emptyOpt
        );


        return;

      }


      for (
        var i = 0;
        i < names.length;
        i++
      ) {

        var opt =
          document.createElement(
            "option"
          );


        opt.value =
          names[i];


        opt.textContent =
          names[i];


        styleSelectEl.appendChild(
          opt
        );

      }


      if (
        selectName &&
        styles[selectName]
      ) {

        styleSelectEl.value =
          selectName;

      }

    }


    /* =====================================================
       STYLE SNAPSHOT
       ===================================================== */

    function currentSettingsSnapshot() {

      return {

        font:
          fontEl.value ||
          "ArialMT",

        size:
          Number(sizeEl.value) ||
          48,

        color:
          colorEl.value ||
          "FF0000",

        align:
          alignEl.value ||
          "CENTER",

        padding:
          Number(
            paddingEl.value
          ),

        minSize:
          Number(
            minSizeEl.value
          ),

        autoFit:
          !!fitEl.checked,

        mode:
          modeEl.value

      };

    }


    /* =====================================================
       APPLY STYLE
       ===================================================== */

    function applySettingsSnapshot(
      s
    ) {

      if (!s) {

        return;

      }


      if (
        s.font !== undefined
      ) {

        fontEl.value =
          s.font;

      }


      if (
        s.size !== undefined
      ) {

        sizeEl.value =
          s.size;

      }


      if (
        s.color !== undefined
      ) {

        colorEl.value =
          s.color;

      }


      if (
        s.align !== undefined
      ) {

        alignEl.value =
          s.align;

      }


      if (
        s.padding !== undefined
      ) {

        paddingEl.value =
          s.padding;

      }


      if (
        s.minSize !== undefined
      ) {

        minSizeEl.value =
          s.minSize;

      }


      if (
        s.autoFit !== undefined
      ) {

        fitEl.checked =
          !!s.autoFit;

      }


      if (
        s.mode !== undefined
      ) {

        modeEl.value =
          s.mode;

      }

    }


    /* =====================================================
       SAVE STYLE
       ===================================================== */

    saveStyleBtn.onclick =
      function () {

        try {

          var name =
            (
              styleNameEl.value ||
              ""
            ).trim();


          if (!name) {

            setStatus(
              "Please type a style name first."
            );

            return;

          }


          var styles =
            loadStyles();


          styles[name] =
            currentSettingsSnapshot();


          saveStylesObj(
            styles
          );


          refreshStyleSelect(
            name
          );


          styleNameEl.value =
            "";


          setStatus(
            "Style saved: " +
            name
          );


        } catch (e) {

          alert(
            "Save style error: " +
            e.message
          );

        }

      };


    /* =====================================================
       APPLY STYLE BUTTON
       ===================================================== */

    applyStyleBtn.onclick =
      function () {

        try {

          var name =
            styleSelectEl.value;


          if (!name) {

            setStatus(
              "No style selected."
            );

            return;

          }


          var styles =
            loadStyles();


          var s =
            styles[name];


          if (!s) {

            setStatus(
              "Style not found: " +
              name
            );

            return;

          }


          applySettingsSnapshot(
            s
          );


          setStatus(
            "Style applied: " +
            name
          );


        } catch (e) {

          alert(
            "Apply style error: " +
            e.message
          );

        }

      };


    /* =====================================================
       DELETE STYLE
       ===================================================== */

    deleteStyleBtn.onclick =
      function () {

        try {

          var name =
            styleSelectEl.value;


          if (!name) {

            setStatus(
              "No style selected."
            );

            return;

          }


          var styles =
            loadStyles();


          delete styles[name];


          saveStylesObj(
            styles
          );


          refreshStyleSelect();


          setStatus(
            "Style deleted: " +
            name
          );


        } catch (e) {

          alert(
            "Delete style error: " +
            e.message
          );

        }

      };


    refreshStyleSelect();


    /* =====================================================
       PHOTOPEA MESSAGE LISTENER
       ===================================================== */

    window.addEventListener(
      "message",
      function (e) {

        try {

          if (
            typeof e.data !==
            "string"
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
              "Error: " +
              err
            );


            alert(
              "TypeR-P Error:\n" +
              err
            );

          }

        } catch (listenerError) {

          setStatus(
            "Listener error."
          );

        }

      }
    );


    /* =====================================================
       STRING ESCAPE
       ===================================================== */

    function jsString(
      value
    ) {

      return JSON.stringify(
        String(value)
      );

    }


    /* =====================================================
       INSERT INTO PHOTOPEA
       ===================================================== */

    function insertTextIntoPhotopea(
      suppliedText
    ) {

      try {

        var text =
          suppliedText;


        if (
          text === null ||
          text === undefined
        ) {

          text = "";

        }


        if (
          !text ||
          text.trim() === ""
        ) {

          setStatus(
            "Current line is empty."
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
          "Inserting build-014..."
        );


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


          "  function isRealNumber(x) {\n" +

          "    return typeof x === 'number' &&\n" +

          "      x === x &&\n" +

          "      x !== Infinity &&\n" +

          "      x !== -Infinity;\n" +

          "  }\n" +


          "  function toPx(u) {\n" +

          "    if (u === null || u === undefined)\n" +

          "      return NaN;\n" +

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


          "  try {\n" +

          "    var bounds = d.selection.bounds;\n" +

          "    if (bounds && bounds.length === 4) {\n" +

          "      left = toPx(bounds[0]);\n" +

          "      top = toPx(bounds[1]);\n" +

          "      right = toPx(bounds[2]);\n" +

          "      bottom = toPx(bounds[3]);\n" +

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

          "    boundsInfo =\n" +

          "      'selection:' +\n" +

          "      Math.round(left) + ',' +\n" +

          "      Math.round(top) + ',' +\n" +

          "      Math.round(right) + ',' +\n" +

          "      Math.round(bottom);\n" +

          "  }\n" +


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


          "  var boxWidth = boxRight - boxLeft;\n" +

          "  var boxHeight = boxBottom - boxTop;\n" +


          "  if (boxWidth < 1) boxWidth = 1;\n" +

          "  if (boxHeight < 1) boxHeight = 1;\n" +


          "  var layer = d.artLayers.add();\n" +

          "  layer.kind = LayerKind.TEXT;\n" +

          "  layer.name = " +

          jsString(
            "TTP: " +
            text.slice(0, 45)
          ) +

          ";\n" +


          "  var ti = layer.textItem;\n" +


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

          "    ti.justification = Justification." +

          align +

          ";\n" +


          "    var pointColor = new SolidColor();\n" +

          "    pointColor.rgb.hexValue = " +

          jsString(color) +

          ";\n" +

          "    ti.color = pointColor;\n" +

          "    ti.position = [cx, cy];\n" +


          "  } else {\n" +

          "    ti.kind = TextType.PARAGRAPHTEXT;\n" +

          "    ti.position = [boxLeft, boxTop];\n" +

          "    ti.width = new UnitValue(boxWidth, 'px');\n" +

          "    ti.height = new UnitValue(boxHeight, 'px');\n" +

          "    ti.contents = " +

          jsString(text) +

          ";\n" +

          "    ti.font = " +

          jsString(font) +

          ";\n" +

          "    ti.size = " +

          initialSize +

          ";\n" +

          "    ti.justification = Justification." +

          align +

          ";\n" +


          "    var boxColor = new SolidColor();\n" +

          "    boxColor.rgb.hexValue = " +

          jsString(color) +

          ";\n" +

          "    ti.color = boxColor;\n" +


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

          "        var avgCharWidth = size * 0.52;\n" +

          "        var charsPerLine = Math.max(\n" +

          "          1,\n" +

          "          Math.floor(width / avgCharWidth)\n" +

          "        );\n" +


          "        var newline = String.fromCharCode(10);\n" +

          "        var explicit = str.split(newline);\n" +

          "        var lines = 0;\n" +


          "        for (var i = 0; i < explicit.length; i++) {\n" +

          "          var line = explicit[i];\n" +

          "          if (line === '') {\n" +

          "            lines += 1;\n" +

          "            continue;\n" +

          "          }\n" +


          "          var words = line.split(/\\s+/);\n" +

          "          var currentChars = 0;\n" +


          "          for (var j = 0; j < words.length; j++) {\n" +

          "            var word = words[j];\n" +

          "            if (!word) continue;\n" +


          "            var wordLen = word.length;\n" +


          "            if (wordLen > charsPerLine) {\n" +

          "              if (currentChars > 0) {\n" +

          "                lines += 1;\n" +

          "                currentChars = 0;\n" +

          "              }\n" +

          "              lines += Math.ceil(\n" +

          "                wordLen / charsPerLine\n" +

          "              );\n" +

          "            } else {\n" +

          "              var needed = wordLen;\n" +

          "              if (currentChars > 0)\n" +

          "                needed += 1;\n" +


          "              if (currentChars + needed > charsPerLine) {\n" +

          "                lines += 1;\n" +

          "                currentChars = wordLen;\n" +

          "              } else {\n" +

          "                currentChars += needed;\n" +

          "              }\n" +

          "            }\n" +

          "          }\n" +


          "          if (currentChars > 0)\n" +

          "            lines += 1;\n" +

          "        }\n" +


          "        return Math.max(1, lines);\n" +

          "      }\n" +


          "      while (currentSize > minimum) {\n" +

          "        var estimatedLines = estimateLines(\n" +

          jsString(text) +

          ",\n" +

          "          currentSize,\n" +

          "          boxWidth\n" +

          "        );\n" +


          "        var estimatedHeight =\n" +

          "          estimatedLines *\n" +

          "          currentSize *\n" +

          "          1.20;\n" +


          "        if (estimatedHeight <= boxHeight)\n" +

          "          break;\n" +


          "        currentSize -= 1;\n" +

          "        ti.size = currentSize;\n" +

          "      }\n" +

          "    }\n" +

          "  }\n" +


          "  d.activeLayer = layer;\n" +


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

          "    (e && e.message ? e.message : String(e))\n" +

          "  );\n" +

          "}\n" +

          "})();";


        window.parent.postMessage(
          script,
          "*"
        );


      } catch (e) {

        setStatus(
          "Insert error: " +
          e.message
        );


        alert(
          "TypeR-P Insert Error:\n" +
          e.message
        );

      }

    }


    /* =====================================================
       INSERT LINE
       ===================================================== */

    insertLineBtn.onclick =
      function () {

        if (
          loadedLines.length === 0
        ) {

          setStatus(
            "Load lines first."
          );

          return;

        }


        saveCurrentLineEdit();


        var line =
          loadedLines[
            currentLineIndex
          ];


        if (
          !line ||
          line.trim() === ""
        ) {

          setStatus(
            "Current line is empty."
          );

          return;

        }


        insertTextIntoPhotopea(
          line
        );

      };


    /* =====================================================
       INITIAL STATUS
       ===================================================== */

    setStatus(
      "Ready (build-014)"
    );


  } catch (initErr) {

    alert(
      "TypeR-P fatal init error:\n" +
      initErr.message
    );

  }

})();
