// TypeR-P — main.js
// BUILD: TYPERP-BUILD-028
//
// BUILD-028
// - Persistent panel state
// - Full text survives panel close/reopen
// - Current line survives panel close/reopen
// - Current line index survives panel close/reopen
// - Font / Size / Color / Alignment survive
// - Bold / Italic survive
// - Padding survives
// - Auto Fit / Minimum Font Size survive
// - Text Mode survives
// - Character Spacing survives
// - Word Spacing survives
// - Vertical Alignment survives
// - Stroke settings survive
// - Saved Styles
// - Load / Update / Apply / Delete Style
// - Load Font from Device
// - Selection-based editable Text Layer
//
// Keeps text as editable Text Layer.

(function () {

  "use strict";


  /* =====================================================
     BASIC UI
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


  var required = [
    ["#status", statusEl],
    ["#fullText", fullTextEl],
    ["#loadLines", loadLinesBtn],
    ["#currentLine", currentLineEl],
    ["#lineInfo", lineInfoEl],
    ["#previousLine", previousLineBtn],
    ["#nextLine", nextLineBtn],
    ["#insertLine", insertLineBtn],
    ["#font", fontEl],
    ["#size", sizeEl],
    ["#color", colorEl],
    ["#align", alignEl]
  ];


  var missing = [];


  for (
    var i = 0;
    i < required.length;
    i++
  ) {

    if (!required[i][1]) {
      missing.push(required[i][0]);
    }
  }


  if (missing.length) {

    alert(
      "TypeR-P BUILD-028 UI ERROR\n\nMissing:\n" +
      missing.join("\n")
    );

    return;
  }


  /* =====================================================
     STATUS
     ===================================================== */

  function setStatus(text) {

    statusEl.textContent =
      text;
  }


  /* =====================================================
     LINE SYSTEM
     ===================================================== */

  var lines = [];

  var currentIndex = 0;


  /* =====================================================
     BUILD-028
     PERSISTENT PANEL STATE
     ===================================================== */

  var PERSIST_KEY =
    "typerp_panel_state_v2";


  var restoringState = false;


  function savePanelState() {

    if (restoringState) {
      return;
    }


    try {

      var state = {

        fullText:
          fullTextEl.value || "",

        lines:
          lines.slice(),

        currentIndex:
          currentIndex,

        currentLine:
          currentLineEl.value || "",

        font:
          fontEl.value || "ArialMT",

        size:
          sizeEl.value || "48",

        color:
          colorEl.value || "FF0000",

        align:
          alignEl.value || "CENTER"
      };


      /*
       * Dynamic controls may not exist during
       * the very early initialization stage.
       */

      if (
        typeof boldEl !==
        "undefined"
      ) {
        state.bold =
          !!boldEl.checked;
      }


      if (
        typeof italicEl !==
        "undefined"
      ) {
        state.italic =
          !!italicEl.checked;
      }


      if (
        typeof paddingEl !==
        "undefined"
      ) {
        state.padding =
          paddingEl.value;
      }


      if (
        typeof fitEl !==
        "undefined"
      ) {
        state.autoFit =
          !!fitEl.checked;
      }


      if (
        typeof minSizeEl !==
        "undefined"
      ) {
        state.minSize =
          minSizeEl.value;
      }


      if (
        typeof modeEl !==
        "undefined"
      ) {
        state.mode =
          modeEl.value;
      }


      if (
        typeof charSpacingEl !==
        "undefined"
      ) {
        state.charSpacing =
          charSpacingEl.value;
      }


      if (
        typeof wordSpacingEl !==
        "undefined"
      ) {
        state.wordSpacing =
          wordSpacingEl.value;
      }


      if (
        typeof vAlignEl !==
        "undefined"
      ) {
        state.vAlign =
          vAlignEl.value;
      }


      if (
        typeof strokeEnabledEl !==
        "undefined"
      ) {
        state.strokeEnabled =
          !!strokeEnabledEl.checked;
      }


      if (
        typeof strokeWidthEl !==
        "undefined"
      ) {
        state.strokeWidth =
          strokeWidthEl.value;
      }


      if (
        typeof strokeColorEl !==
        "undefined"
      ) {
        state.strokeColor =
          strokeColorEl.value;
      }


      if (
        typeof strokeOpacityEl !==
        "undefined"
      ) {
        state.strokeOpacity =
          strokeOpacityEl.value;
      }


      if (
        typeof strokePositionEl !==
        "undefined"
      ) {
        state.strokePosition =
          strokePositionEl.value;
      }


      localStorage.setItem(
        PERSIST_KEY,
        JSON.stringify(state)
      );

    } catch (e) {

      /*
       * localStorage can fail in some
       * embedded environments.
       * The plugin should still work.
       */

    }
  }


  function restorePanelState() {

    try {

      var raw =
        localStorage.getItem(
          PERSIST_KEY
        );


      if (!raw) {
        return false;
      }


      var state =
        JSON.parse(raw);


      if (
        !state ||
        typeof state !== "object"
      ) {
        return false;
      }


      restoringState = true;


      /* -------------------------------------------------
         FULL TEXT
         ------------------------------------------------- */

      if (
        state.fullText !==
        undefined
      ) {

        fullTextEl.value =
          state.fullText;
      }


      /* -------------------------------------------------
         LINES
         ------------------------------------------------- */

      if (
        Array.isArray(state.lines) &&
        state.lines.length
      ) {

        lines =
          state.lines.slice();


        currentIndex =
          Number(
            state.currentIndex
          );


        if (
          !isFinite(currentIndex)
        ) {
          currentIndex = 0;
        }


        currentIndex =
          Math.floor(currentIndex);


        if (currentIndex < 0) {
          currentIndex = 0;
        }


        if (
          currentIndex >=
          lines.length
        ) {

          currentIndex =
            lines.length - 1;
        }

      } else {

        /*
         * If there was full text but no
         * saved lines, reconstruct them.
         */

        if (
          state.fullText &&
          state.fullText.trim()
        ) {

          var restoredText =
            state.fullText
              .replace(/\r\n/g, "\n")
              .replace(/\r/g, "\n");


          lines =
            restoredText.split("\n");


          while (
            lines.length > 0 &&
            lines[
              lines.length - 1
            ].trim() === ""
          ) {

            lines.pop();
          }

        } else {

          lines = [];
        }


        currentIndex = 0;
      }


      /* -------------------------------------------------
         CURRENT LINE
         ------------------------------------------------- */

      if (
        state.currentLine !==
        undefined
      ) {

        currentLineEl.value =
          state.currentLine;

      } else if (
        lines.length
      ) {

        currentLineEl.value =
          lines[currentIndex] || "";
      }


      /* -------------------------------------------------
         BASIC SETTINGS
         ------------------------------------------------- */

      if (
        state.font !==
        undefined
      ) {

        fontEl.value =
          state.font;
      }


      if (
        state.size !==
        undefined
      ) {

        sizeEl.value =
          state.size;
      }


      if (
        state.color !==
        undefined
      ) {

        colorEl.value =
          state.color;
      }


      if (
        state.align !==
        undefined
      ) {

        alignEl.value =
          state.align;
      }


      /* -------------------------------------------------
         BOLD
         ------------------------------------------------- */

      if (
        typeof boldEl !==
        "undefined" &&
        state.bold !==
        undefined
      ) {

        boldEl.checked =
          !!state.bold;
      }


      /* -------------------------------------------------
         ITALIC
         ------------------------------------------------- */

      if (
        typeof italicEl !==
        "undefined" &&
        state.italic !==
        undefined
      ) {

        italicEl.checked =
          !!state.italic;
      }


      /* -------------------------------------------------
         PADDING
         ------------------------------------------------- */

      if (
        typeof paddingEl !==
        "undefined" &&
        state.padding !==
        undefined
      ) {

        paddingEl.value =
          state.padding;
      }


      /* -------------------------------------------------
         AUTO FIT
         ------------------------------------------------- */

      if (
        typeof fitEl !==
        "undefined" &&
        state.autoFit !==
        undefined
      ) {

        fitEl.checked =
          !!state.autoFit;
      }


      /* -------------------------------------------------
         MINIMUM SIZE
         ------------------------------------------------- */

      if (
        typeof minSizeEl !==
        "undefined" &&
        state.minSize !==
        undefined
      ) {

        minSizeEl.value =
          state.minSize;
      }


      /* -------------------------------------------------
         TEXT MODE
         ------------------------------------------------- */

      if (
        typeof modeEl !==
        "undefined" &&
        state.mode !==
        undefined
      ) {

        modeEl.value =
          state.mode;
      }


      /* -------------------------------------------------
         CHARACTER SPACING
         ------------------------------------------------- */

      if (
        typeof charSpacingEl !==
        "undefined" &&
        state.charSpacing !==
        undefined
      ) {

        charSpacingEl.value =
          state.charSpacing;
      }


      /* -------------------------------------------------
         WORD SPACING
         ------------------------------------------------- */

      if (
        typeof wordSpacingEl !==
        "undefined" &&
        state.wordSpacing !==
        undefined
      ) {

        wordSpacingEl.value =
          state.wordSpacing;
      }


      /* -------------------------------------------------
         VERTICAL ALIGNMENT
         ------------------------------------------------- */

      if (
        typeof vAlignEl !==
        "undefined" &&
        state.vAlign !==
        undefined
      ) {

        vAlignEl.value =
          state.vAlign;
      }


      /* -------------------------------------------------
         STROKE ENABLED
         ------------------------------------------------- */

      if (
        typeof strokeEnabledEl !==
        "undefined" &&
        state.strokeEnabled !==
        undefined
      ) {

        strokeEnabledEl.checked =
          !!state.strokeEnabled;
      }


      /* -------------------------------------------------
         STROKE WIDTH
         ------------------------------------------------- */

      if (
        typeof strokeWidthEl !==
        "undefined" &&
        state.strokeWidth !==
        undefined
      ) {

        strokeWidthEl.value =
          state.strokeWidth;
      }


      /* -------------------------------------------------
         STROKE COLOR
         ------------------------------------------------- */

      if (
        typeof strokeColorEl !==
        "undefined" &&
        state.strokeColor !==
        undefined
      ) {

        strokeColorEl.value =
          state.strokeColor;
      }


      /* -------------------------------------------------
         STROKE OPACITY
         ------------------------------------------------- */

      if (
        typeof strokeOpacityEl !==
        "undefined" &&
        state.strokeOpacity !==
        undefined
      ) {

        strokeOpacityEl.value =
          state.strokeOpacity;
      }


      /* -------------------------------------------------
         STROKE POSITION
         ------------------------------------------------- */

      if (
        typeof strokePositionEl !==
        "undefined" &&
        state.strokePosition !==
        undefined
      ) {

        strokePositionEl.value =
          state.strokePosition;
      }


      restoringState = false;


      return true;

    } catch (e) {

      restoringState = false;

      return false;
    }
  }


  /* =====================================================
     LINE DISPLAY
     ===================================================== */

  function updateLine() {

    if (!lines.length) {

      currentLineEl.value = "";

      lineInfoEl.textContent =
        "No lines loaded.";

      return;
    }


    currentLineEl.value =
      lines[currentIndex];


    lineInfoEl.textContent =
      "Line " +
      (currentIndex + 1) +
      " / " +
      lines.length;
  }


  function saveCurrentLine() {

    if (!lines.length) {
      return;
    }


    lines[currentIndex] =
      currentLineEl.value;


    savePanelState();
  }


  /* =====================================================
     LOAD LINES
     ===================================================== */

  loadLinesBtn.onclick =
    function () {

      var text =
        fullTextEl.value || "";


      if (!text.trim()) {

        lines = [];

        currentIndex = 0;

        updateLine();

        savePanelState();


        setStatus(
          "Please enter the full text first."
        );

        return;
      }


      text =
        text
          .replace(/\r\n/g, "\n")
          .replace(/\r/g, "\n");


      lines =
        text.split("\n");


      while (
        lines.length > 0 &&
        lines[
          lines.length - 1
        ].trim() === ""
      ) {

        lines.pop();
      }


      currentIndex = 0;


      updateLine();

      savePanelState();


      setStatus(
        "Loaded " +
        lines.length +
        " line(s)."
      );
    };


  /* =====================================================
     CURRENT LINE EDIT
     ===================================================== */

  currentLineEl.addEventListener(
    "input",
    function () {

      saveCurrentLine();
    }
  );


  /* =====================================================
     PREVIOUS LINE
     ===================================================== */

  previousLineBtn.onclick =
    function () {

      if (!lines.length) {

        setStatus(
          "Load lines first."
        );

        return;
      }


      saveCurrentLine();


      if (currentIndex > 0) {

        currentIndex--;
      }


      updateLine();

      savePanelState();
    };


  /* =====================================================
     NEXT LINE
     ===================================================== */

  nextLineBtn.onclick =
    function () {

      if (!lines.length) {

        setStatus(
          "Load lines first."
        );

        return;
      }


      saveCurrentLine();


      if (
        currentIndex <
        lines.length - 1
      ) {

        currentIndex++;
      }


      updateLine();

      savePanelState();
    };


  /* =====================================================
     SETTINGS PANEL
     ===================================================== */

  var settingsPanel =
    fontEl.closest(".panel");


  if (!settingsPanel) {

    settingsPanel =
      fontEl.parentElement;
  }


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
     FONT LOADER
     ===================================================== */

  var fontUploadInput =
    document.createElement("input");


  fontUploadInput.type =
    "file";


  fontUploadInput.accept =
    ".ttf,.otf,.woff,.woff2";


  fontUploadInput.style.display =
    "none";


  var fontUploadBtn =
    document.createElement("button");


  fontUploadBtn.type =
    "button";


  fontUploadBtn.textContent =
    "Load Font from Device";


  fontUploadBtn.style.width =
    "100%";


  fontUploadBtn.style.marginTop =
    "6px";


  fontEl.parentElement.insertBefore(
    fontUploadBtn,
    fontEl.nextSibling
  );


  fontEl.parentElement.insertBefore(
    fontUploadInput,
    fontUploadBtn.nextSibling
  );


  fontUploadBtn.onclick =
    function () {

      fontUploadInput.click();
    };


  fontUploadInput.onchange =
    function () {

      var file =
        fontUploadInput.files &&
        fontUploadInput.files[0];


      if (!file) {
        return;
      }


      setStatus(
        "Loading font file..."
      );


      var reader =
        new FileReader();


      reader.onload =
        function () {

          var script =
            "(function(){try{" +

            "var before=" +
            "(app.fonts&&app.fonts.length)?" +
            "app.fonts.length:0;" +

            "app.open(" +
            JSON.stringify(
              reader.result
            ) +
            ");" +

            "var after=" +
            "(app.fonts&&app.fonts.length)?" +
            "app.fonts.length:0;" +

            "var name='';" +

            "if(app.fonts&&after>0){" +

            "var last=" +
            "app.fonts[after-1];" +

            "name=(last&&last.postScriptName)?" +
            "last.postScriptName:" +

            "(last&&last.name?" +
            "last.name:'');" +

            "}" +

            "app.echoToOE(" +
            "'TYPERP_FONT_LOADED:'+name" +
            ");" +

            "}catch(e){" +

            "app.echoToOE(" +
            "'TYPERP_FONT_ERR:'+" +
            "(e&&e.message?" +
            "e.message:String(e))" +
            ");" +

            "}})();";


          window.parent.postMessage(
            script,
            "*"
          );
        };


      reader.onerror =
        function () {

          setStatus(
            "Could not read the font file."
          );
        };


      reader.readAsDataURL(file);
    };


  /* =====================================================
     BASIC EXTRA SETTINGS
     ===================================================== */

  settingsPanel.appendChild(
    makeLabel("Padding")
  );


  var paddingEl =
    makeNumber(
      12,
      0,
      500
    );


  settingsPanel.appendChild(
    paddingEl
  );


  /* =====================================================
     BOLD / ITALIC
     ===================================================== */

  settingsPanel.appendChild(
    makeLabel("Font Style")
  );


  var styleRow =
    document.createElement("div");


  styleRow.style.display =
    "flex";


  styleRow.style.gap =
    "6px";


  var boldLabel =
    document.createElement("label");


  boldLabel.style.flex =
    "1";


  var boldEl =
    document.createElement("input");


  boldEl.type =
    "checkbox";


  boldLabel.appendChild(
    boldEl
  );


  boldLabel.appendChild(
    document.createTextNode(
      " Bold"
    )
  );


  var italicLabel =
    document.createElement("label");


  italicLabel.style.flex =
    "1";


  var italicEl =
    document.createElement("input");


  italicEl.type =
    "checkbox";


  italicLabel.appendChild(
    italicEl
  );


  italicLabel.appendChild(
    document.createTextNode(
      " Italic"
    )
  );


  styleRow.appendChild(
    boldLabel
  );


  styleRow.appendChild(
    italicLabel
  );


  settingsPanel.appendChild(
    styleRow
  );


  /* =====================================================
     AUTO FIT
     ===================================================== */

  settingsPanel.appendChild(
    makeLabel("Auto Fit")
  );


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
    fitRow
  );


  /* =====================================================
     MINIMUM SIZE
     ===================================================== */

  settingsPanel.appendChild(
    makeLabel(
      "Minimum Font Size"
    )
  );


  var minSizeEl =
    makeNumber(
      8,
      1,
      500
    );


  settingsPanel.appendChild(
    minSizeEl
  );


  /* =====================================================
     TEXT MODE
     ===================================================== */

  settingsPanel.appendChild(
    makeLabel(
      "Text Mode"
    )
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
    modeEl
  );


  /* =====================================================
     CHARACTER SPACING
     ===================================================== */

  settingsPanel.appendChild(
    makeLabel(
      "Character Spacing (Tracking)"
    )
  );


  var charSpacingEl =
    makeNumber(
      0,
      -1000,
      1000
    );


  settingsPanel.appendChild(
    charSpacingEl
  );


  /* =====================================================
     WORD SPACING
     ===================================================== */

  settingsPanel.appendChild(
    makeLabel(
      "Word Spacing (extra spaces)"
    )
  );


  var wordSpacingEl =
    makeNumber(
      0,
      0,
      20
    );


  settingsPanel.appendChild(
    wordSpacingEl
  );


  /* =====================================================
     VERTICAL ALIGNMENT
     ===================================================== */

  settingsPanel.appendChild(
    makeLabel(
      "Vertical Alignment"
    )
  );


  var vAlignEl =
    document.createElement(
      "select"
    );


  vAlignEl.style.width =
    "100%";


  [
    ["TOP", "Top"],
    ["MIDDLE", "Center"],
    ["BOTTOM", "Bottom"]
  ].forEach(
    function (pair) {

      var opt =
        document.createElement(
          "option"
        );


      opt.value =
        pair[0];


      opt.textContent =
        pair[1];


      if (
        pair[0] ===
        "MIDDLE"
      ) {

        opt.selected =
          true;
      }


      vAlignEl.appendChild(
        opt
      );
    }
  );


  settingsPanel.appendChild(
    vAlignEl
  );


  /* =====================================================
     STROKE
     ===================================================== */

  settingsPanel.appendChild(
    makeLabel(
      "Stroke / Outline"
    )
  );


  var strokeRow =
    document.createElement(
      "label"
    );


  strokeRow.style.display =
    "flex";


  strokeRow.style.alignItems =
    "center";


  strokeRow.style.gap =
    "6px";


  var strokeEnabledEl =
    document.createElement(
      "input"
    );


  strokeEnabledEl.type =
    "checkbox";


  strokeRow.appendChild(
    strokeEnabledEl
  );


  strokeRow.appendChild(
    document.createTextNode(
      "Enable Stroke"
    )
  );


  settingsPanel.appendChild(
    strokeRow
  );


  settingsPanel.appendChild(
    makeLabel(
      "Stroke Width (px)"
    )
  );


  var strokeWidthEl =
    makeNumber(
      3,
      0,
      100
    );


  settingsPanel.appendChild(
    strokeWidthEl
  );


  settingsPanel.appendChild(
    makeLabel(
      "Stroke Color"
    )
  );


  var strokeColorEl =
    document.createElement(
      "input"
    );


  strokeColorEl.type =
    "text";


  strokeColorEl.value =
    "000000";


  strokeColorEl.placeholder =
    "000000";


  strokeColorEl.style.width =
    "100%";


  strokeColorEl.style.boxSizing =
    "border-box";


  settingsPanel.appendChild(
    strokeColorEl
  );


  settingsPanel.appendChild(
    makeLabel(
      "Stroke Opacity (%)"
    )
  );


  var strokeOpacityEl =
    makeNumber(
      100,
      0,
      100
    );


  settingsPanel.appendChild(
    strokeOpacityEl
  );


  settingsPanel.appendChild(
    makeLabel(
      "Stroke Position"
    )
  );


  var strokePositionEl =
    document.createElement(
      "select"
    );


  strokePositionEl.style.width =
    "100%";


  [
    ["OUTSIDE", "Outside"],
    ["CENTER", "Center"],
    ["INSIDE", "Inside"]
  ].forEach(
    function (pair) {

      var opt =
        document.createElement(
          "option"
        );


      opt.value =
        pair[0];


      opt.textContent =
        pair[1];


      strokePositionEl.appendChild(
        opt
      );
    }
  );


  settingsPanel.appendChild(
    strokePositionEl
  );


  /* =====================================================
     SAVED STYLES
     ===================================================== */

  var STYLES_KEY =
    "typerp_styles_v4";


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


      return (
        parsed &&
        typeof parsed ===
        "object"
      )
        ? parsed
        : {};

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

      memoryStyles =
        obj;
    }
  }


  settingsPanel.appendChild(
    makeLabel(
      "Saved Styles"
    )
  );


  var styleSelectRow =
    document.createElement(
      "div"
    );


  styleSelectRow.style.display =
    "flex";


  styleSelectRow.style.gap =
    "5px";


  styleSelectRow.style.marginTop =
    "4px";


  var styleSelectEl =
    document.createElement(
      "select"
    );


  styleSelectEl.style.flex =
    "1";


  var loadStyleBtn =
    document.createElement(
      "button"
    );


  loadStyleBtn.type =
    "button";


  loadStyleBtn.textContent =
    "Load";


  var updateStyleBtn =
    document.createElement(
      "button"
    );


  updateStyleBtn.type =
    "button";


  updateStyleBtn.textContent =
    "Update";


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
    loadStyleBtn
  );


  styleSelectRow.appendChild(
    updateStyleBtn
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


  var editingStyleName =
    "";


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

      bold:
        !!boldEl.checked,

      italic:
        !!italicEl.checked,

      padding:
        Number(paddingEl.value) ||
        0,

      minSize:
        Number(minSizeEl.value) ||
        8,

      autoFit:
        !!fitEl.checked,

      mode:
        modeEl.value,

      charSpacing:
        Number(
          charSpacingEl.value
        ) || 0,

      wordSpacing:
        Number(
          wordSpacingEl.value
        ) || 0,

      vAlign:
        vAlignEl.value,

      strokeEnabled:
        !!strokeEnabledEl.checked,

      strokeWidth:
        Number(
          strokeWidthEl.value
        ) || 0,

      strokeColor:
        strokeColorEl.value ||
        "000000",

      strokeOpacity:
        Number(
          strokeOpacityEl.value
        ),

      strokePosition:
        strokePositionEl.value
    };
  }


  function applySettingsSnapshot(s) {

    if (!s) {
      return;
    }


    if (
      s.font !==
      undefined
    ) {

      fontEl.value =
        s.font;
    }


    if (
      s.size !==
      undefined
    ) {

      sizeEl.value =
        s.size;
    }


    if (
      s.color !==
      undefined
    ) {

      colorEl.value =
        s.color;
    }


    if (
      s.align !==
      undefined
    ) {

      alignEl.value =
        s.align;
    }


    if (
      s.bold !==
      undefined
    ) {

      boldEl.checked =
        !!s.bold;
    }


    if (
      s.italic !==
      undefined
    ) {

      italicEl.checked =
        !!s.italic;
    }


    if (
      s.padding !==
      undefined
    ) {

      paddingEl.value =
        s.padding;
    }


    if (
      s.minSize !==
      undefined
    ) {

      minSizeEl.value =
        s.minSize;
    }


    if (
      s.autoFit !==
      undefined
    ) {

      fitEl.checked =
        !!s.autoFit;
    }


    if (
      s.mode !==
      undefined
    ) {

      modeEl.value =
        s.mode;
    }


    if (
      s.charSpacing !==
      undefined
    ) {

      charSpacingEl.value =
        s.charSpacing;
    }


    if (
      s.wordSpacing !==
      undefined
    ) {

      wordSpacingEl.value =
        s.wordSpacing;
    }


    if (
      s.vAlign !==
      undefined
    ) {

      vAlignEl.value =
        s.vAlign;
    }


    if (
      s.strokeEnabled !==
      undefined
    ) {

      strokeEnabledEl.checked =
        !!s.strokeEnabled;
    }


    if (
      s.strokeWidth !==
      undefined
    ) {

      strokeWidthEl.value =
        s.strokeWidth;
    }


    if (
      s.strokeColor !==
      undefined
    ) {

      strokeColorEl.value =
        s.strokeColor;
    }


    if (
      s.strokeOpacity !==
      undefined
    ) {

      strokeOpacityEl.value =
        s.strokeOpacity;
    }


    if (
      s.strokePosition !==
      undefined
    ) {

      strokePositionEl.value =
        s.strokePosition;
    }


    savePanelState();
  }


  /* =====================================================
     REFRESH STYLE LIST
     ===================================================== */

  function refreshStyleSelect(
    selectName
  ) {

    var styles =
      loadStyles();


    var names =
      Object.keys(styles).sort(
        function (a, b) {

          return a.localeCompare(b);
        }
      );


    styleSelectEl.innerHTML =
      "";


    if (!names.length) {

      var empty =
        document.createElement(
          "option"
        );


      empty.value =
        "";


      empty.textContent =
        "(no styles saved)";


      styleSelectEl.appendChild(
        empty
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
     SAVE NEW STYLE
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


        saveStylesObj(styles);


        refreshStyleSelect(
          name
        );


        editingStyleName =
          name;


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


  /* =====================================================
     LOAD STYLE FOR EDITING
     ===================================================== */

  loadStyleBtn.onclick =
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


        if (!styles[name]) {

          setStatus(
            "Style not found: " +
            name
          );

          return;
        }


        applySettingsSnapshot(
          styles[name]
        );


        editingStyleName =
          name;


        styleNameEl.value =
          name;


        setStatus(
          "Loaded style for editing: " +
          name
        );

      } catch (e) {

        alert(
          "Load style error: " +
          e.message
        );
      }
    };


  /* =====================================================
     UPDATE EXISTING STYLE
     ===================================================== */

  updateStyleBtn.onclick =
    function () {

      try {

        var name =
          editingStyleName ||
          styleSelectEl.value;


        if (!name) {

          setStatus(
            "Load a style for editing first."
          );

          return;
        }


        var styles =
          loadStyles();


        if (!styles[name]) {

          setStatus(
            "Style not found: " +
            name
          );

          return;
        }


        styles[name] =
          currentSettingsSnapshot();


        saveStylesObj(styles);


        refreshStyleSelect(
          name
        );


        editingStyleName =
          name;


        styleNameEl.value =
          "";


        setStatus(
          "Style updated: " +
          name
        );

      } catch (e) {

        alert(
          "Update style error: " +
          e.message
        );
      }
    };


  /* =====================================================
     APPLY STYLE
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


        editingStyleName =
          name;


        styleNameEl.value =
          name;


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


        if (
          editingStyleName ===
          name
        ) {

          editingStyleName =
            "";
        }


        refreshStyleSelect();


        styleNameEl.value =
          "";


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
     MESSAGE LISTENER
     ===================================================== */

  window.addEventListener(
    "message",
    function (event) {

      if (
        typeof event.data !==
        "string"
      ) {

        return;
      }


      /* -------------------------------------------------
         FONT LOADED
         ------------------------------------------------- */

      if (
        event.data.indexOf(
          "TYPERP_FONT_LOADED:"
        ) === 0
      ) {

        var name =
          event.data
            .substring(
              "TYPERP_FONT_LOADED:"
                .length
            )
            .split(" | ")[0];


        if (name) {

          fontEl.value =
            name;


          savePanelState();


          setStatus(
            "Font loaded and applied: " +
            name
          );

        } else {

          setStatus(
            "Font loaded, but its name could not be read."
          );
        }


        return;
      }


      /* -------------------------------------------------
         FONT ERROR
         ------------------------------------------------- */

      if (
        event.data.indexOf(
          "TYPERP_FONT_ERR:"
        ) === 0
      ) {

        var ferr =
          event.data.substring(
            "TYPERP_FONT_ERR:"
              .length
          );


        setStatus(
          "Font load error: " +
          ferr
        );


        alert(
          "TypeR-P BUILD-028 font error:\n" +
          ferr
        );


        return;
      }


      /* -------------------------------------------------
         PHOTOPEA OK
         ------------------------------------------------- */

      if (
        event.data.indexOf(
          "TYPERP_OK:"
        ) === 0
      ) {

        setStatus(
          event.data.substring(
            "TYPERP_OK:".length
          )
        );


        return;
      }


      /* -------------------------------------------------
         PHOTOPEA ERROR
         ------------------------------------------------- */

      if (
        event.data.indexOf(
          "TYPERP_ERR:"
        ) === 0
      ) {

        var error =
          event.data.substring(
            "TYPERP_ERR:".length
          );


        setStatus(
          "Error: " +
          error
        );


        alert(
          "TypeR-P BUILD-028\n\n" +
          error
        );
      }

    }
  );


  /* =====================================================
     STRING HELPER
     ===================================================== */

  function jsString(value) {

    return JSON.stringify(
      String(value)
    );
  }


  /* =====================================================
     INSERT CURRENT LINE
     ===================================================== */

  function insertCurrentLine() {

    if (!lines.length) {

      setStatus(
        "Load lines first."
      );

      return;
    }


    saveCurrentLine();


    var text =
      lines[currentIndex];


    if (
      !text ||
      !text.trim()
    ) {

      setStatus(
        "Current line is empty."
      );

      return;
    }


    /* -------------------------------------------------
       SETTINGS
       ------------------------------------------------- */

    var font =
      fontEl.value ||
      "ArialMT";


    var initialSize =
      Number(sizeEl.value) ||
      48;


    var color =
      (
        colorEl.value ||
        "FF0000"
      )
        .replace(
          /[^0-9a-fA-F]/g,
          ""
        )
        .slice(0, 6);


    while (
      color.length < 6
    ) {

      color += "0";
    }


    var align =
      alignEl.value ||
      "CENTER";


    var padding =
      Number(paddingEl.value);


    if (
      !isFinite(padding) ||
      padding < 0
    ) {

      padding = 12;
    }


    var minSize =
      Number(minSizeEl.value);


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


    var tracking =
      Number(
        charSpacingEl.value
      );


    if (
      !isFinite(tracking)
    ) {

      tracking = 0;
    }


    var wordSpacing =
      Number(
        wordSpacingEl.value
      );


    if (
      !isFinite(wordSpacing) ||
      wordSpacing < 0
    ) {

      wordSpacing = 0;
    }


    var vAlign =
      vAlignEl.value ||
      "MIDDLE";


    var bold =
      !!boldEl.checked;


    var italic =
      !!italicEl.checked;


    /* -------------------------------------------------
       STROKE
       ------------------------------------------------- */

    var strokeEnabled =
      !!strokeEnabledEl.checked;


    var strokeWidth =
      Number(
        strokeWidthEl.value
      );


    if (
      !isFinite(strokeWidth) ||
      strokeWidth < 0
    ) {

      strokeWidth = 3;
    }


    var strokeColor =
      (
        strokeColorEl.value ||
        "000000"
      )
        .replace(
          /[^0-9a-fA-F]/g,
          ""
        )
        .slice(0, 6);


    while (
      strokeColor.length < 6
    ) {

      strokeColor += "0";
    }


    var strokeOpacity =
      Number(
        strokeOpacityEl.value
      );


    if (
      !isFinite(strokeOpacity)
    ) {

      strokeOpacity = 100;
    }


    strokeOpacity =
      Math.max(
        0,
        Math.min(
          100,
          strokeOpacity
        )
      );


    var strokePosition =
      strokePositionEl.value ||
      "OUTSIDE";


    /* -------------------------------------------------
       WORD SPACING
       ------------------------------------------------- */

    text =
      text
        .replace(
          /\u060C(?!\s)/g,
          "\u060C "
        )
        .replace(
          /,(?!\s)/g,
          ", "
        );


    if (
      wordSpacing > 0
    ) {

      var extra = "";


      for (
        var w = 0;
        w < wordSpacing;
        w++
      ) {

        extra += " ";
      }


      text =
        text.replace(
          / /g,
          " " + extra
        );
    }


    setStatus(
      "Checking active selection..."
    );


    /* =================================================
       PHOTOPEA SCRIPT
       ================================================= */

    var script =
      "(function(){\n" +

      "try{\n" +

      "var d=app.activeDocument;\n" +

      "if(!d)throw new Error('No active document.');\n" +


      /* -------------------------------------------------
         SELECTION
         ------------------------------------------------- */

      "var b;\n" +

      "try{b=d.selection.bounds;}" +

      "catch(e){" +

      "throw new Error(" +
      "'No active selection. Please make a selection first.'" +
      ");" +

      "}\n" +


      "if(!b||b.length!==4)" +

      "throw new Error(" +
      "'No active selection. Please make a selection first.'" +
      ");\n" +


      /* -------------------------------------------------
         PIXEL CONVERSION
         ------------------------------------------------- */

      "function px(v){\n" +

      "try{" +

      "if(typeof v==='number')" +

      "return v;" +

      "}catch(e){}\n" +

      "try{" +

      "if(v&&typeof v.as==='function')" +

      "return Number(v.as('px'));" +

      "}catch(e){}\n" +

      "try{" +

      "if(v&&v.value!==undefined)" +

      "return Number(v.value);" +

      "}catch(e){}\n" +

      "return NaN;\n" +

      "}\n" +


      "var L=px(b[0])," +
      "T=px(b[1])," +
      "R=px(b[2])," +
      "B=px(b[3]);\n" +


      "if(!isFinite(L)||" +
      "!isFinite(T)||" +
      "!isFinite(R)||" +
      "!isFinite(B))" +

      "throw new Error(" +
      "'Could not read selection coordinates.'" +
      ");\n" +


      "if(R<=L||B<=T)" +

      "throw new Error(" +
      "'Selection has invalid dimensions.'" +
      ");\n" +


      /* -------------------------------------------------
         TEXT BOX
         ------------------------------------------------- */

      "var boxLeft=L+" +
      padding +
      ";\n" +

      "var boxTop=T+" +
      padding +
      ";\n" +

      "var boxRight=R-" +
      padding +
      ";\n" +

      "var boxBottom=B-" +
      padding +
      ";\n" +


      "var boxWidth=" +
      "boxRight-boxLeft;\n" +

      "var boxHeight=" +
      "boxBottom-boxTop;\n" +


      "if(boxWidth<1||" +
      "boxHeight<1)" +

      "throw new Error(" +
      "'Padding is too large for the selection.'" +
      ");\n" +


      /* -------------------------------------------------
         LAYER
         ------------------------------------------------- */

      "var layer=d.artLayers.add();\n" +

      "layer.kind=LayerKind.TEXT;\n" +

      "layer.name=" +
      jsString(
        "TTP: " +
        text.substring(0, 45)
      ) +
      ";\n" +


      "var ti=layer.textItem;\n" +


      /* -------------------------------------------------
         TRACKING
         ------------------------------------------------- */

      "try{" +

      "ti.tracking=" +
      tracking +
      ";" +

      "}catch(eTrack){}\n" +


      /* -------------------------------------------------
         FONT
         ------------------------------------------------- */

      "var fontName=" +
      jsString(font) +
      ";\n" +


      "var fontStyle=" +
      jsString(
        bold && italic
          ? "Bold Italic"
          : bold
          ? "Bold"
          : italic
          ? "Italic"
          : "Regular"
      ) +
      ";\n" +


      /* =================================================
         PARAGRAPH TEXT
         ================================================= */

      "if(" +
      jsString(mode) +
      "==='PARAGRAPH'){\n" +

      "ti.kind=TextType.PARAGRAPHTEXT;\n" +


      "ti.width=boxWidth;\n" +

      "ti.height=boxHeight;\n" +


      "ti.contents=" +
      jsString(text) +
      ";\n" +


      "ti.font=fontName;\n" +


      "try{" +

      "ti.fontStyle=fontStyle;" +

      "}catch(eStyle){}\n" +


      "ti.size=" +
      initialSize +
      ";\n" +


      "ti.justification=Justification." +
      align +
      ";\n" +


      /* -------------------------------------------------
         COLOR
         ------------------------------------------------- */

      "var c=new SolidColor();\n" +

      "c.rgb.hexValue=" +
      jsString(color) +
      ";\n" +

      "ti.color=c;\n" +


      /* -------------------------------------------------
         AUTO FIT
         ------------------------------------------------- */

      "var finalSize=" +
      initialSize +
      ";\n" +


      "function estimateLines(" +
      "str,size,width){\n" +

      "var avg=size*0.52;\n" +

      "var maxChars=" +
      "Math.max(1,Math.floor(width/avg));\n" +

      "var parts=" +
      "str.split(String.fromCharCode(10));\n" +

      "var total=0;\n" +


      "for(var p=0;p<parts.length;p++){\n" +

      "var line=parts[p];\n" +


      "if(line.trim()===''){" +

      "total++;" +

      "continue;" +

      "}\n" +


      "var words=" +
      "line.trim().split(/\\s+/);\n" +

      "var chars=0;\n" +

      "var count=1;\n" +


      "for(var q=0;q<words.length;q++){\n" +

      "var len=words[q].length;\n" +

      "var need=len+(chars>0?1:0);\n" +


      "if(chars+need>maxChars){" +

      "count++;" +

      "chars=len;" +

      "}else{" +

      "chars+=need;" +

      "}\n" +

      "}\n" +

      "total+=count;\n" +

      "}\n" +

      "return Math.max(1,total);\n" +

      "}\n" +


      "if(" +
      autoFit +
      "){\n" +

      "var current=" +
      initialSize +
      ";\n" +


      "while(current>" +
      minSize +
      "){\n" +

      "var est=" +
      "estimateLines(" +
      jsString(text) +
      ",current,boxWidth);\n" +


      "if(est*current*1.20<=boxHeight)" +

      "break;\n" +


      "current--;\n" +

      "ti.size=current;\n" +

      "}\n" +


      "finalSize=current;\n" +

      "}\n" +


      /* -------------------------------------------------
         VERTICAL ALIGNMENT
         ------------------------------------------------- */

      "var offset=0;\n" +


      "if(" +
      jsString(vAlign) +
      "==='MIDDLE'){" +

      "offset=Math.max(" +
      "0," +
      "boxHeight-finalSize*1.20" +
      ")/2;" +

      "}\n" +


      "else if(" +
      jsString(vAlign) +
      "==='BOTTOM'){" +

      "offset=Math.max(" +
      "0," +
      "boxHeight-finalSize*1.20" +
      ");" +

      "}\n" +


      "ti.position=[" +
      "boxLeft," +
      "boxTop+offset" +
      "];\n" +


      "}else{\n" +


      /* =================================================
         POINT TEXT
         ================================================= */

      "ti.kind=TextType.POINTTEXT;\n" +


      "ti.contents=" +
      jsString(text) +
      ";\n" +


      "ti.font=fontName;\n" +


      "try{" +

      "ti.fontStyle=fontStyle;" +

      "}catch(eStyle2){}\n" +


      "ti.size=" +
      initialSize +
      ";\n" +


      "ti.justification=Justification." +
      align +
      ";\n" +


      "var pc=new SolidColor();\n" +

      "pc.rgb.hexValue=" +
      jsString(color) +
      ";\n" +


      "ti.color=pc;\n" +


      "var py=(T+B)/2;\n" +


      "if(" +
      jsString(vAlign) +
      "==='TOP')" +

      "py=T+" +
      initialSize +
      ";\n" +


      "else if(" +
      jsString(vAlign) +
      "==='BOTTOM')" +

      "py=B-(" +
      initialSize +
      "*0.3);\n" +


      "ti.position=[" +
      "(L+R)/2,py];\n" +


      "}\n" +


      /* =================================================
         ACTIVE LAYER
         ================================================= */

      "d.activeLayer=layer;\n" +


      /* =================================================
         STROKE
         ================================================= */

      "var strokeStatus='disabled';\n" +


      "if(" +
      strokeEnabled +
      "&&" +
      strokeWidth +
      ">0){\n" +


      "try{\n" +


      "function cTID(s){" +
      "return app.charIDToTypeID(s);" +
      "}\n" +


      "function sTID(s){" +
      "return app.stringIDToTypeID(s);" +
      "}\n" +


      "var strokePos='OutF';\n" +


      "if(" +
      jsString(strokePosition) +
      "==='CENTER')" +

      "strokePos='CtrF';\n" +


      "else if(" +
      jsString(strokePosition) +
      "==='INSIDE')" +

      "strokePos='InsF';\n" +


      "var hex=" +
      jsString(strokeColor) +
      ";\n" +


      "var rr=parseInt(" +
      "hex.substring(0,2),16);\n" +


      "var gg=parseInt(" +
      "hex.substring(2,4),16);\n" +


      "var bb=parseInt(" +
      "hex.substring(4,6),16);\n" +


      "var desc=" +
      "new ActionDescriptor();\n" +


      "var ref=" +
      "new ActionReference();\n" +


      "ref.putProperty(" +
      "cTID('Prpr')," +
      "cTID('Lefx')" +
      ");\n" +


      "ref.putEnumerated(" +
      "cTID('Lyr ')," +
      "cTID('Ordn')," +
      "cTID('Trgt')" +
      ");\n" +


      "desc.putReference(" +
      "cTID('null'),ref" +
      ");\n" +


      "var fx=" +
      "new ActionDescriptor();\n" +


      "var st=" +
      "new ActionDescriptor();\n" +


      "st.putBoolean(" +
      "cTID('enab'),true" +
      ");\n" +


      "st.putBoolean(" +
      "sTID('present'),true" +
      ");\n" +


      "st.putBoolean(" +
      "sTID('showInDialog'),true" +
      ");\n" +


      "st.putEnumerated(" +
      "cTID('Styl')," +
      "cTID('FStl')," +
      "cTID(strokePos)" +
      ");\n" +


      "st.putEnumerated(" +
      "cTID('PntT')," +
      "cTID('FrFl')," +
      "cTID('SClr')" +
      ");\n" +


      "st.putEnumerated(" +
      "cTID('Md  ')," +
      "cTID('BlnM')," +
      "cTID('Nrml')" +
      ");\n" +


      "st.putUnitDouble(" +
      "cTID('Opct')," +
      "cTID('#Prc')," +
      strokeOpacity +
      ");\n" +


      "st.putUnitDouble(" +
      "cTID('Sz  ')," +
      "cTID('#Pxl')," +
      strokeWidth +
      ");\n" +


      "var sc=" +
      "new ActionDescriptor();\n" +


      "sc.putDouble(" +
      "cTID('Rd  '),rr" +
      ");\n" +


      "sc.putDouble(" +
      "cTID('Grn '),gg" +
      ");\n" +


      "sc.putDouble(" +
      "cTID('Bl  '),bb" +
      ");\n" +


      "st.putObject(" +
      "cTID('Clr ')," +
      "cTID('RGBC'),sc" +
      ");\n" +


      "st.putBoolean(" +
      "sTID('overprint'),false" +
      ");\n" +


      "fx.putObject(" +
      "cTID('FrFX')," +
      "cTID('FrFX'),st" +
      ");\n" +


      "desc.putObject(" +
      "cTID('T   ')," +
      "cTID('Lefx'),fx" +
      ");\n" +


      "executeAction(" +
      "cTID('setd')," +
      "desc," +
      "DialogModes.NO" +
      ");\n" +


      "strokeStatus='enabled';\n" +


      "}catch(se){" +


      "strokeStatus=" +
      "'failed:'+" +
      "(se&&se.message?" +
      "se.message:String(se));" +


      "}\n" +


      "}\n" +


      /* =================================================
         RESULT
         ================================================= */

      "var msg=" +

      "'TEXT INSERTED | selection='+" +

      "Math.round(L)+','+" +
      "Math.round(T)+','+" +
      "Math.round(R)+','+" +
      "Math.round(B)+" +

      "' | size='+ti.size+" +

      "' | bold=" +
      bold +

      "' | italic=" +
      italic +

      "' | stroke='+strokeStatus;\n" +


      "try{" +

      "app.echoToOE(" +

      "'TYPERP_OK:'+msg" +

      ");" +

      "}catch(eEcho){}\n" +


      "}catch(e){\n" +


      "try{" +

      "app.echoToOE(" +

      "'TYPERP_ERR:'+" +

      "(e&&e.message?" +
      "e.message:String(e))" +

      ");" +

      "}catch(eEcho2){}\n" +


      "}\n" +

      "})();";


    window.parent.postMessage(
      script,
      "*"
    );


    /* -------------------------------------------------
       RESPONSE TIMEOUT
       ------------------------------------------------- */

    setTimeout(
      function () {

        if (
          statusEl.textContent.indexOf(
            "Checking active selection..."
          ) === 0
        ) {

          setStatus(
            "No response from Photopea after 6s."
          );
        }

      },
      6000
    );
  }


  insertLineBtn.onclick =
    insertCurrentLine;


  /* =====================================================
     BUILD-028
     AUTO SAVE
     ===================================================== */

  function watchPersistentElement(
    element
  ) {

    if (!element) {
      return;
    }


    element.addEventListener(
      "input",
      function () {

        savePanelState();
      }
    );


    element.addEventListener(
      "change",
      function () {

        savePanelState();
      }
    );
  }


  /*
   * Basic controls
   */

  watchPersistentElement(
    fullTextEl
  );


  watchPersistentElement(
    currentLineEl
  );


  watchPersistentElement(
    fontEl
  );


  watchPersistentElement(
    sizeEl
  );


  watchPersistentElement(
    colorEl
  );


  watchPersistentElement(
    alignEl
  );


  /*
   * Dynamic controls
   */

  watchPersistentElement(
    boldEl
  );


  watchPersistentElement(
    italicEl
  );


  watchPersistentElement(
    paddingEl
  );


  watchPersistentElement(
    fitEl
  );


  watchPersistentElement(
    minSizeEl
  );


  watchPersistentElement(
    modeEl
  );


  watchPersistentElement(
    charSpacingEl
  );


  watchPersistentElement(
    wordSpacingEl
  );


  watchPersistentElement(
    vAlignEl
  );


  watchPersistentElement(
    strokeEnabledEl
  );


  watchPersistentElement(
    strokeWidthEl
  );


  watchPersistentElement(
    strokeColorEl
  );


  watchPersistentElement(
    strokeOpacityEl
  );


  watchPersistentElement(
    strokePositionEl
  );


  /* =====================================================
     RESTORE SAVED STATE
     ===================================================== */

  var restored =
    restorePanelState();


  updateLine();


  /*
   * updateLine() can replace currentLineEl,
   * so save once after restoration.
   */

  savePanelState();


  /* =====================================================
     READY
     ===================================================== */

  setStatus(
    restored
      ? "Restored (BUILD-028)"
      : "Ready (BUILD-028)"
  );


  /* =====================================================
     DEBUG
     ===================================================== */

  var debugBtn =
    document.createElement(
      "button"
    );


  debugBtn.type =
    "button";


  debugBtn.textContent =
    "DEBUG: Test Photopea Link";


  debugBtn.style.width =
    "100%";


  debugBtn.style.marginTop =
    "12px";


  debugBtn.style.background =
    "#333";


  settingsPanel.appendChild(
    debugBtn
  );


  debugBtn.onclick =
    function () {

      setStatus(
        "Sending raw test script..."
      );


      window.parent.postMessage(
        "alert('HELLO FROM TYPERP BUILD-028 - LINK WORKS');",
        "*"
      );


      setTimeout(
        function () {

          if (
            statusEl.textContent.indexOf(
              "Sending raw test"
            ) === 0
          ) {

            setStatus(
              "Raw test also got NO response — link itself is broken."
            );
          }

        },
        4000
      );
    };


})();
