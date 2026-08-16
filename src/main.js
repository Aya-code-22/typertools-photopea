// TypeR-P — main.js
// BUILD: TYPERP-BUILD-012
// Selection-aware Paragraph Text
// Padding + Auto Fit + Smart Long-Word Breaking
// Saved Styles + Font Size Controls
// Text Line Loader + Line Navigation

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
       HELPERS
       ===================================================== */

    function makeLabel(text) {

      var label =
        document.createElement("label");

      label.textContent = text;
      label.style.display = "block";
      label.style.marginTop = "8px";

      return label;
    }


    function makeNumber(value, min, max) {

      var input =
        document.createElement("input");

      input.type = "number";
      input.value = value;
      input.min = min;
      input.max = max;
      input.step = "1";

      input.style.width = "100%";
      input.style.boxSizing = "border-box";

      return input;
    }


    var actions =
      insertBtn.parentElement;


    /* =====================================================
       FONT SIZE CONTROLS
       ===================================================== */

    var fontSizeLabel =
      makeLabel("Font Size");

    var fontSizeRow =
      document.createElement("div");

    fontSizeRow.style.display = "flex";
    fontSizeRow.style.gap = "5px";
    fontSizeRow.style.alignItems = "center";


    var minusSizeBtn =
      document.createElement("button");

    minusSizeBtn.type = "button";
    minusSizeBtn.textContent = "−";


    var plusSizeBtn =
      document.createElement("button");

    plusSizeBtn.type = "button";
    plusSizeBtn.textContent = "+";


    var sizeDisplay =
      document.createElement("span");

    sizeDisplay.style.flex = "1";
    sizeDisplay.style.textAlign = "center";
    sizeDisplay.style.fontWeight = "bold";


    function updateSizeDisplay() {

      var value =
        Number(sizeEl.value) || 48;

      sizeDisplay.textContent =
        String(value) + " px";

    }


    minusSizeBtn.onclick =
      function () {

        var value =
          Number(sizeEl.value) || 48;

        value -= 1;

        if (value < 1) {
          value = 1;
        }

        sizeEl.value = value;

        updateSizeDisplay();

      };


    plusSizeBtn.onclick =
      function () {

        var value =
          Number(sizeEl.value) || 48;

        value += 1;

        if (value > 500) {
          value = 500;
        }

        sizeEl.value = value;

        updateSizeDisplay();

      };


    sizeEl.addEventListener(
      "input",
      updateSizeDisplay
    );


    fontSizeRow.appendChild(
      minusSizeBtn
    );

    fontSizeRow.appendChild(
      sizeDisplay
    );

    fontSizeRow.appendChild(
      plusSizeBtn
    );


    actions.parentElement.appendChild(
      fontSizeLabel
    );

    actions.parentElement.appendChild(
      fontSizeRow
    );

    updateSizeDisplay();


    /* =====================================================
       TEXT SOURCE / LINE LOADER
       ===================================================== */

    var sourceLabel =
      makeLabel(
        "Full Text / Dialogue List"
      );


    var sourceEl =
      document.createElement("textarea");

    sourceEl.placeholder =
      "Paste the full text here...\n\nExample:\nHello.\nHow are you?\nI'm fine.";

    sourceEl.style.width = "100%";
    sourceEl.style.height = "110px";
    sourceEl.style.boxSizing = "border-box";
    sourceEl.style.resize = "vertical";


    var loadLinesBtn =
      document.createElement("button");

    loadLinesBtn.type = "button";
    loadLinesBtn.textContent =
      "Load Lines";


    actions.parentElement.appendChild(
      sourceLabel
    );

    actions.parentElement.appendChild(
      sourceEl
    );

    actions.parentElement.appendChild(
      loadLinesBtn
    );


    /* =====================================================
       LOADED LINES
       ===================================================== */

    var linesLabel =
      makeLabel(
        "Loaded Lines"
      );


    var linesEl =
      document.createElement("textarea");

    linesEl.style.width = "100%";
    linesEl.style.height = "110px";
    linesEl.style.boxSizing = "border-box";
    linesEl.style.resize = "vertical";


    var lineInfo =
      document.createElement("div");

    lineInfo.style.textAlign =
      "center";

    lineInfo.style.marginTop =
      "4px";

    lineInfo.style.marginBottom =
      "4px";


    var previousLineBtn =
      document.createElement("button");

    previousLineBtn.type =
      "button";

    previousLineBtn.textContent =
      "Previous";


    var nextLineBtn =
      document.createElement("button");

    nextLineBtn.type =
      "button";

    nextLineBtn.textContent =
      "Next";


    var useLineBtn =
      document.createElement("button");

    useLineBtn.type =
      "button";

    useLineBtn.textContent =
      "Use Current Line";


    var insertLineBtn =
      document.createElement("button");

    insertLineBtn.type =
      "button";

    insertLineBtn.textContent =
      "Insert Current Line";


    var lineButtons =
      document.createElement("div");

    lineButtons.style.display =
      "flex";

    lineButtons.style.gap =
      "5px";

    lineButtons.style.flexWrap =
      "wrap";

    lineButtons.style.marginTop =
      "5px";


    lineButtons.appendChild(
      previousLineBtn
    );

    lineButtons.appendChild(
      nextLineBtn
    );

    lineButtons.appendChild(
      useLineBtn
    );

    lineButtons.appendChild(
      insertLineBtn
    );


    actions.parentElement.appendChild(
      linesLabel
    );

    actions.parentElement.appendChild(
      linesEl
    );

    actions.parentElement.appendChild(
      lineInfo
    );

    actions.parentElement.appendChild(
      lineButtons
    );


    var loadedLines = [];
    var currentLineIndex = 0;


    function updateLineInfo() {

      if (loadedLines.length === 0) {

        lineInfo.textContent =
          "No lines loaded.";

        return;
      }


      lineInfo.textContent =
        "Line " +
        (currentLineIndex + 1) +
        " / " +
        loadedLines.length;

    }


    function showCurrentLine() {

      if (
        loadedLines.length === 0
      ) {

        linesEl.value = "";

        updateLineInfo();

        return;
      }


      linesEl.value =
        loadedLines[
          currentLineIndex
        ];

      updateLineInfo();

    }


    loadLinesBtn.onclick =
      function () {

        try {

          var raw =
            sourceEl.value;


          if (
            raw === null ||
            raw === undefined ||
            raw === ""
          ) {

            loadedLines = [];
            currentLineIndex = 0;
            linesEl.value = "";

            updateLineInfo();

            setStatus(
              "No source text."
            );

            return;
          }


          /*
           * Normalize Windows/Mac line endings.
           *
           * IMPORTANT:
           * We do NOT trim individual lines.
           * This preserves the user's text.
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


          loadedLines =
            raw.split("\n");


          currentLineIndex = 0;


          showCurrentLine();


          setStatus(
            "Loaded " +
            loadedLines.length +
            " line(s)."
          );


        } catch (e) {

          alert(
            "Load lines error:\n" +
            e.message
          );

        }

      };


    previousLineBtn.onclick =
      function () {

        if (
          loadedLines.length === 0
        ) {

          return;
        }


        if (
          currentLineIndex > 0
        ) {

          currentLineIndex--;

          showCurrentLine();

        }

      };


    nextLineBtn.onclick =
      function () {

        if (
          loadedLines.length === 0
        ) {

          return;
        }


        if (
          currentLineIndex <
          loadedLines.length - 1
        ) {

          currentLineIndex++;

          showCurrentLine();

        }

      };


    useLineBtn.onclick =
      function () {

        if (
          loadedLines.length === 0
        ) {

          setStatus(
            "No lines loaded."
          );

          return;
        }


        textEl.value =
          loadedLines[
            currentLineIndex
          ];


        setStatus(
          "Line " +
          (currentLineIndex + 1) +
          " loaded into text."
        );

      };


    linesEl.addEventListener(
      "input",
      function () {

        if (
          loadedLines.length === 0
        ) {
          return;
        }


        loadedLines[
          currentLineIndex
        ] = linesEl.value;


        setStatus(
          "Current line edited."
        );

      }
    );


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

    actions.parentElement.appendChild(
      paddingLabel
    );

    actions.parentElement.appendChild(
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


    actions.parentElement.appendChild(
      fitLabel
    );

    actions.parentElement.appendChild(
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


    actions.parentElement.appendChild(
      minSizeLabel
    );

    actions.parentElement.appendChild(
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


    actions.parentElement.appendChild(
      modeLabel
    );

    actions.parentElement.appendChild(
      modeEl
    );


    /* =====================================================
       SAVED STYLES
       ===================================================== */

    var STYLES_KEY =
      "typerp_styles_v1";

    var memoryStyles = {};


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


    function saveStylesObj(obj) {

      try {

        localStorage.setItem(
          STYLES_KEY,
          JSON.stringify(obj)
        );

      } catch (e) {

        memoryStyles = obj;

      }

    }


    var stylesLabel =
      makeLabel(
        "Saved Styles"
      );

    actions.parentElement.appendChild(
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


    actions.parentElement.appendChild(
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


    actions.parentElement.appendChild(
      styleSaveRow
    );


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
            return a.localeCompare(b);
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


    function applySettingsSnapshot(s) {

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


      updateSizeDisplay();

    }


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


          setStatus(
            "Style saved: " +
            name
          );


          styleNameEl.value =
            "";


        } catch (e) {

          alert(
            "Save style error: " +
            e.message
          );

        }

      };


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
       PHOTOPEA COMMUNICATION
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


        } catch (err) {

          setStatus(
            "Listener error."
          );

        }

      }
    );


    /* =====================================================
       INSERT FUNCTION
       ===================================================== */

    function insertTextIntoPhotopea(
      suppliedText
    ) {

      try {

        var text =
          suppliedText;


        if (
          text === undefined ||
          text === null
        ) {

          text =
            textEl.value;

        }


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
          "Inserting build-012..."
        );


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

          "      left + ',' +\n" +

          "      top + ',' +\n" +

          "      right + ',' +\n" +

          "      bottom;\n" +

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

          "    ti.justification =\n" +

          "      Justification." +

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

          "    ti.justification =\n" +

          "      Justification." +

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

          "          var words = line.split(/\\s+/);\n" +

          "          var currentChars = 0;\n" +


          "          if (line === '') {\n" +

          "            lines += 1;\n" +

          "            continue;\n" +

          "          }\n" +


          "          for (var j = 0; j < words.length; j++) {\n" +

          "            var word = words[j];\n" +

          "            if (!word) continue;\n" +

          "            var wordLen = word.length;\n" +


          "            if (wordLen > charsPerLine) {\n" +

          "              if (currentChars > 0) {\n" +

          "                lines += 1;\n" +

          "                currentChars = 0;\n" +

          "              }\n" +

          "              lines += Math.ceil(wordLen / charsPerLine);\n" +

          "            } else {\n" +

          "              var needed = wordLen;\n" +

          "              if (currentChars > 0) needed += 1;\n" +


          "              if (currentChars + needed > charsPerLine) {\n" +

          "                lines += 1;\n" +

          "                currentChars = wordLen;\n" +

          "              } else {\n" +

          "                currentChars += needed;\n" +

          "              }\n" +

          "            }\n" +

          "          }\n" +


          "          if (currentChars > 0) lines += 1;\n" +

          "        }\n" +


          "        return Math.max(1, lines);\n" +

          "      }\n" +


          "      function breakLongWords(str, size, width) {\n" +

          "        var avgCharWidth = size * 0.52;\n" +

          "        var charsPerLine = Math.max(\n" +

          "          1,\n" +

          "          Math.floor(width / avgCharWidth)\n" +

          "        );\n" +


          "        var newline = String.fromCharCode(10);\n" +

          "        var explicit = str.split(newline);\n" +

          "        var output = [];\n" +


          "        for (var i = 0; i < explicit.length; i++) {\n" +

          "          var line = explicit[i];\n" +

          "          var parts = line.split(/(\\s+)/);\n" +

          "          var rebuilt = '';\n" +


          "          for (var j = 0; j < parts.length; j++) {\n" +

          "            var part = parts[j];\n" +


          "            if (/^\\s+$/.test(part)) {\n" +

          "              rebuilt += part;\n" +

          "              continue;\n" +

          "            }\n" +


          "            if (part.length > charsPerLine) {\n" +

          "              var start = 0;\n" +

          "              var firstChunk = true;\n" +


          "              while (start < part.length) {\n" +

          "                var chunk = part.substr(\n" +

          "                  start,\n" +

          "                  charsPerLine\n" +

          "                );\n" +


          "                if (!firstChunk) {\n" +

          "                  rebuilt += newline;\n" +

          "                }\n" +


          "                rebuilt += chunk;\n" +

          "                start += charsPerLine;\n" +

          "                firstChunk = false;\n" +

          "              }\n" +

          "            } else {\n" +

          "              rebuilt += part;\n" +

          "            }\n" +

          "          }\n" +


          "          output.push(rebuilt);\n" +

          "        }\n" +


          "        return output.join(newline);\n" +

          "      }\n" +


          "      while (currentSize > minimum) {\n" +

          "        var estimatedLines = estimateLines(\n" +

          jsString(text) +

          ",\n" +

          "          currentSize,\n" +

          "          boxWidth\n" +

          "        );\n" +


          "        var estimatedHeight =\n" +

          "          estimatedLines * currentSize * 1.20;\n" +


          "        if (estimatedHeight <= boxHeight) {\n" +

          "          break;\n" +

          "        }\n" +


          "        currentSize -= 1;\n" +

          "        ti.size = currentSize;\n" +

          "      }\n" +


          "      var processedText = breakLongWords(\n" +

          jsString(text) +

          ",\n" +

          "        currentSize,\n" +

          "        boxWidth\n" +

          "      );\n" +


          "      if (processedText !== " +

          jsString(text) +

          ") {\n" +

          "        ti.contents = processedText;\n" +

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

    }


    /* =====================================================
       NORMAL INSERT
       ===================================================== */

    insertBtn.onclick =
      function () {

        insertTextIntoPhotopea(
          textEl.value
        );

      };


    /* =====================================================
       INSERT CURRENT LINE
       ===================================================== */

    insertLineBtn.onclick =
      function () {

        if (
          loadedLines.length === 0
        ) {

          setStatus(
            "No lines loaded."
          );

          return;

        }


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
       READY
       ===================================================== */

    setStatus(
      "Ready (build-012)"
    );


  } catch (initErr) {

    alert(
      "TypeR-P fatal init error:\n" +
      initErr.message
    );

  }

})();
