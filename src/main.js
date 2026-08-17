// TypeR-P — main.js
// BUILD: TYPERP-BUILD-025
//
// Clean rebuild
// - Full Text -> Lines -> Current Line
// - Selection-aware text insertion
// - Paragraph Text / Point Text
// - Padding
// - Auto Fit
// - Minimum Font Size
// - Character Spacing
// - Word Spacing
// - Vertical Alignment
// - Saved Styles
// - Load Font from Device
// - Photopea communication diagnostics
//
// IMPORTANT:
// This file intentionally contains ONE insert script only.
// Do not paste another "var script =" inside insertCurrentLine().

(function () {

  "use strict";


  /* =====================================================
     UI REFERENCES
     ===================================================== */

  var statusEl = document.getElementById("status");
  var fullTextEl = document.getElementById("fullText");
  var loadLinesBtn = document.getElementById("loadLines");
  var currentLineEl = document.getElementById("currentLine");
  var lineInfoEl = document.getElementById("lineInfo");
  var previousLineBtn = document.getElementById("previousLine");
  var nextLineBtn = document.getElementById("nextLine");
  var insertLineBtn = document.getElementById("insertLine");

  var fontEl = document.getElementById("font");
  var sizeEl = document.getElementById("size");
  var colorEl = document.getElementById("color");
  var alignEl = document.getElementById("align");


  /* =====================================================
     REQUIRED UI CHECK
     ===================================================== */

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

  for (var i = 0; i < required.length; i++) {
    if (!required[i][1]) {
      missing.push(required[i][0]);
    }
  }

  if (missing.length) {

    alert(
      "TypeR-P BUILD-025 UI ERROR\n\nMissing:\n" +
      missing.join("\n")
    );

    return;
  }


  /* =====================================================
     STATUS
     ===================================================== */

  function setStatus(text) {
    statusEl.textContent = text;
  }


  /* =====================================================
     LINE SYSTEM
     ===================================================== */

  var lines = [];
  var currentIndex = 0;


  function updateLine() {

    if (!lines.length) {

      currentLineEl.value = "";
      lineInfoEl.textContent = "No lines loaded.";

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
  }


  /* =====================================================
     LOAD LINES
     ===================================================== */

  loadLinesBtn.onclick = function () {

    var text =
      fullTextEl.value || "";

    if (!text.trim()) {

      lines = [];
      currentIndex = 0;

      updateLine();

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
      lines[lines.length - 1].trim() === ""
    ) {
      lines.pop();
    }

    currentIndex = 0;

    updateLine();

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
     PREVIOUS
     ===================================================== */

  previousLineBtn.onclick = function () {

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
  };


  /* =====================================================
     NEXT
     ===================================================== */

  nextLineBtn.onclick = function () {

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
    max,
    step
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
      step || "1";

    input.style.width =
      "100%";

    input.style.boxSizing =
      "border-box";

    return input;
  }


  /* =====================================================
     LOAD FONT FROM DEVICE
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

          var dataUrl =
            reader.result;


          var fontScript =
            "(function(){\n" +

            "try{\n" +

            "var before=0;\n" +

            "try{before=app.fonts.length;}catch(e){}\n" +

            "app.open(" +
            JSON.stringify(dataUrl) +
            ");\n" +

            "var name='';\n" +

            "try{\n" +

            "var after=app.fonts.length;\n" +

            "if(after>0){\n" +

            "var f=app.fonts[after-1];\n" +

            "if(f){\n" +

            "name=f.postScriptName||f.name||'';\n" +

            "}\n" +

            "}\n" +

            "}catch(e2){}\n" +

            "app.echoToOE(" +
            "'TYPERP_FONT_LOADED:'+name" +
            ");\n" +

            "}catch(e){\n" +

            "app.echoToOE(" +
            "'TYPERP_FONT_ERR:'+" +
            "(e&&e.message?e.message:String(e))" +
            ");\n" +

            "}\n" +

            "})();";


          window.parent.postMessage(
            fontScript,
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
     PADDING
     ===================================================== */

  settingsPanel.appendChild(
    makeLabel("Padding")
  );

  var paddingEl =
    makeNumber(
      12,
      0,
      500,
      1
    );

  settingsPanel.appendChild(
    paddingEl
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
     MINIMUM FONT SIZE
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
      500,
      1
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
    document.createElement("select");

  modeEl.style.width =
    "100%";


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
      1000,
      10
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
      20,
      1
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
    document.createElement("select");

  vAlignEl.style.width =
    "100%";


  var vAlignOptions = [
    ["TOP", "Top"],
    ["MIDDLE", "Center"],
    ["BOTTOM", "Bottom"]
  ];


  for (
    var va = 0;
    va < vAlignOptions.length;
    va++
  ) {

    var vOpt =
      document.createElement("option");

    vOpt.value =
      vAlignOptions[va][0];

    vOpt.textContent =
      vAlignOptions[va][1];

    if (
      vAlignOptions[va][0] ===
      "MIDDLE"
    ) {
      vOpt.selected =
        true;
    }

    vAlignEl.appendChild(
      vOpt
    );
  }


  settingsPanel.appendChild(
    vAlignEl
  );


  /* =====================================================
     SAVED STYLES
     ===================================================== */

  var STYLES_KEY =
    "typerp_styles_v2";

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
        typeof parsed === "object"
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

      memoryStyles =
        obj;
    }
  }


  settingsPanel.appendChild(
    makeLabel("Saved Styles")
  );


  var styleSelectRow =
    document.createElement("div");

  styleSelectRow.style.display =
    "flex";

  styleSelectRow.style.gap =
    "6px";

  styleSelectRow.style.marginTop =
    "4px";


  var styleSelectEl =
    document.createElement("select");

  styleSelectEl.style.flex =
    "1";


  var applyStyleBtn =
    document.createElement("button");

  applyStyleBtn.type =
    "button";

  applyStyleBtn.textContent =
    "Apply";


  var deleteStyleBtn =
    document.createElement("button");

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
    document.createElement("div");

  styleSaveRow.style.display =
    "flex";

  styleSaveRow.style.gap =
    "6px";

  styleSaveRow.style.marginTop =
    "6px";


  var styleNameEl =
    document.createElement("input");

  styleNameEl.type =
    "text";

  styleNameEl.placeholder =
    "Style name...";

  styleNameEl.style.flex =
    "1";

  styleNameEl.style.boxSizing =
    "border-box";


  var saveStyleBtn =
    document.createElement("button");

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
        Number(paddingEl.value) || 0,

      minSize:
        Number(minSizeEl.value) || 8,

      autoFit:
        !!fitEl.checked,

      mode:
        modeEl.value,

      charSpacing:
        Number(charSpacingEl.value) || 0,

      wordSpacing:
        Number(wordSpacingEl.value) || 0,

      vAlign:
        vAlignEl.value
    };
  }


  function applySettingsSnapshot(s) {

    if (!s) {
      return;
    }

    if (s.font !== undefined) {
      fontEl.value =
        s.font;
    }

    if (s.size !== undefined) {
      sizeEl.value =
        s.size;
    }

    if (s.color !== undefined) {
      colorEl.value =
        s.color;
    }

    if (s.align !== undefined) {
      alignEl.value =
        s.align;
    }

    if (s.padding !== undefined) {
      paddingEl.value =
        s.padding;
    }

    if (s.minSize !== undefined) {
      minSizeEl.value =
        s.minSize;
    }

    if (s.autoFit !== undefined) {
      fitEl.checked =
        !!s.autoFit;
    }

    if (s.mode !== undefined) {
      modeEl.value =
        s.mode;
    }

    if (s.charSpacing !== undefined) {
      charSpacingEl.value =
        s.charSpacing;
    }

    if (s.wordSpacing !== undefined) {
      wordSpacingEl.value =
        s.wordSpacing;
    }

    if (s.vAlign !== undefined) {
      vAlignEl.value =
        s.vAlign;
    }
  }


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

      var emptyOpt =
        document.createElement("option");

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
        document.createElement("option");

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


  saveStyleBtn.onclick =
    function () {

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
    };


  applyStyleBtn.onclick =
    function () {

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

      var style =
        styles[name];


      if (!style) {

        setStatus(
          "Style not found: " +
          name
        );

        return;
      }


      applySettingsSnapshot(
        style
      );

      setStatus(
        "Style applied: " +
        name
      );
    };


  deleteStyleBtn.onclick =
    function () {

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
    };


  refreshStyleSelect();


  /* =====================================================
     PHOTOPEA MESSAGE LISTENER
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


      var msg =
        event.data;


      if (
        msg.indexOf(
          "TYPERP_FONT_LOADED:"
        ) === 0
      ) {

        var fontName =
          msg.substring(
            "TYPERP_FONT_LOADED:".length
          );


        if (fontName) {

          fontEl.value =
            fontName;

          setStatus(
            "Font loaded: " +
            fontName
          );

        } else {

          setStatus(
            "Font loaded, but its name could not be detected."
          );
        }

        return;
      }


      if (
        msg.indexOf(
          "TYPERP_FONT_ERR:"
        ) === 0
      ) {

        var fontError =
          msg.substring(
            "TYPERP_FONT_ERR:".length
          );

        setStatus(
          "Font load error: " +
          fontError
        );

        alert(
          "TypeR-P BUILD-025\n\nFont error:\n" +
          fontError
        );

        return;
      }


      if (
        msg.indexOf(
          "TYPERP_OK:"
        ) === 0
      ) {

        setStatus(
          msg.substring(
            "TYPERP_OK:".length
          )
        );

        return;
      }


      if (
        msg.indexOf(
          "TYPERP_ERR:"
        ) === 0
      ) {

        var error =
          msg.substring(
            "TYPERP_ERR:".length
          );


        setStatus(
          "Error: " +
          error
        );


        alert(
          "TypeR-P BUILD-025\n\n" +
          error
        );

        return;
      }
    }
  );


  /* =====================================================
     SAFE JS STRING
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

    /* ---------------------------------------------------
       BASIC CHECKS
       --------------------------------------------------- */

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


    /* ---------------------------------------------------
       READ SETTINGS
       --------------------------------------------------- */

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
        .slice(
          0,
          6
        );


    while (
      color.length < 6
    ) {
      color += "0";
    }


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
      !!fitEl.checked;


    var mode =
      modeEl.value ||
      "PARAGRAPH";


    var charSpacing =
      Number(
        charSpacingEl.value
      );


    if (
      !isFinite(charSpacing)
    ) {
      charSpacing = 0;
    }


    var wordSpacingCount =
      Number(
        wordSpacingEl.value
      );


    if (
      !isFinite(wordSpacingCount) ||
      wordSpacingCount < 0
    ) {
      wordSpacingCount = 0;
    }


    var vAlign =
      vAlignEl.value ||
      "MIDDLE";


    /* ---------------------------------------------------
       WORD SPACING
       --------------------------------------------------- */

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
      wordSpacingCount > 0
    ) {

      var extraSpaces =
        "";

      for (
        var ws = 0;
        ws < wordSpacingCount;
        ws++
      ) {
        extraSpaces += " ";
      }


      text =
        text.replace(
          / /g,
          " " +
          extraSpaces
        );
    }


    /* ---------------------------------------------------
       STATUS
       --------------------------------------------------- */

    setStatus(
      "Reading active selection..."
    );


    /* ===================================================
       PHOTOPEA SCRIPT
       =================================================== */

    var script =

      "(function(){\n" +

      "\"use strict\";\n" +

      "try{\n" +


      /* -------------------------------------------------
         DOCUMENT
         ------------------------------------------------- */

      "var d=app.activeDocument;\n" +

      "if(!d){\n" +

      "throw new Error('No active document.');\n" +

      "}\n" +


      /* -------------------------------------------------
         SELECTION
         ------------------------------------------------- */

      "var b=null;\n" +

      "try{\n" +

      "b=d.selection.bounds;\n" +

      "}catch(e){\n" +

      "throw new Error('No active selection. Please make a selection first.');\n" +

      "}\n" +


      "if(!b||b.length!==4){\n" +

      "throw new Error('No active selection. Please make a selection first.');\n" +

      "}\n" +


      /* -------------------------------------------------
         CONVERT UNIT
         ------------------------------------------------- */

      "function px(v){\n" +

      "if(typeof v==='number'){\n" +

      "return Number(v);\n" +

      "}\n" +

      "try{\n" +

      "if(v&&typeof v.as==='function'){\n" +

      "var a=Number(v.as('px'));\n" +

      "if(isFinite(a))return a;\n" +

      "}\n" +

      "}catch(e1){}\n" +

      "try{\n" +

      "if(v&&v.value!==undefined){\n" +

      "var n=Number(v.value);\n" +

      "if(isFinite(n))return n;\n" +

      "}\n" +

      "}catch(e2){}\n" +

      "return NaN;\n" +

      "}\n" +


      "var L=px(b[0]);\n" +
      "var T=px(b[1]);\n" +
      "var R=px(b[2]);\n" +
      "var B=px(b[3]);\n" +


      "if(!isFinite(L)||!isFinite(T)||!isFinite(R)||!isFinite(B)){\n" +

      "throw new Error('Could not read selection coordinates.');\n" +

      "}\n" +


      "if(R<=L||B<=T){\n" +

      "throw new Error('Selection has invalid dimensions: '+L+','+T+','+R+','+B);\n" +

      "}\n" +


      /* -------------------------------------------------
         SELECTION BOX
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


      "var boxWidth=boxRight-boxLeft;\n" +

      "var boxHeight=boxBottom-boxTop;\n" +


      "if(boxWidth<=0||boxHeight<=0){\n" +

      "throw new Error('Padding is too large for the selection. Selection='+Math.round(R-L)+'x'+Math.round(B-T)+', padding='+"
      + padding +
      ");\n" +

      "}\n" +


      /* -------------------------------------------------
         CREATE TEXT LAYER
         ------------------------------------------------- */

      "var layer=d.artLayers.add();\n" +

      "layer.kind=LayerKind.TEXT;\n" +

      "layer.name=" +
      jsString(
        "TTP: " +
        text.substring(0,45)
      ) +
      ";\n" +


      "var ti=layer.textItem;\n" +


      /* -------------------------------------------------
         PARAGRAPH TEXT
         ------------------------------------------------- */

      "if(" +
      jsString(mode) +
      "==='PARAGRAPH'){\n" +


      "ti.kind=TextType.PARAGRAPHTEXT;\n" +


      /*
       * Set position and width BEFORE contents.
       * Do not rely on textItem.height here because
       * Photoshop/Photopea paragraph text handles its
       * text box differently across versions.
       */

      "ti.position=[boxLeft,boxTop];\n" +

      "ti.width=new UnitValue(boxWidth,'px');\n" +


      "ti.contents=" +
      jsString(text) +
      ";\n" +


      "ti.font=" +
      jsString(font) +
      ";\n" +


      "ti.size=" +
      initialSize +
      ";\n" +


      "ti.justification=Justification." +
      align +
      ";\n" +


      /* COLOR */

      "var c=new SolidColor();\n" +

      "c.rgb.hexValue=" +
      jsString(color) +
      ";\n" +

      "ti.color=c;\n" +


      /* TRACKING */

      "try{\n" +

      "ti.tracking=" +
      charSpacing +
      ";\n" +

      "}catch(eTracking){}\n" +


      /* -------------------------------------------------
         AUTO FIT
         ------------------------------------------------- */

      "var finalSize=" +
      initialSize +
      ";\n" +


      "if(" +
      autoFit +
      "){\n" +


      "function estimateLines(str,size,width,tracking){\n" +

      "var avg=size*0.52;\n" +

      "var trackingPx=(tracking/1000)*size;\n" +

      "avg+=trackingPx;\n" +

      "if(avg<0.1)avg=0.1;\n" +

      "var maxChars=Math.max(1,Math.floor(width/avg));\n" +

      "var paragraphs=str.split(String.fromCharCode(10));\n" +

      "var total=0;\n" +


      "for(var p=0;p<paragraphs.length;p++){\n" +

      "var paragraph=paragraphs[p];\n" +

      "if(paragraph.trim()===''){\n" +

      "total++;\n" +

      "continue;\n" +

      "}\n" +


      "var words=paragraph.trim().split(/\\s+/);\n" +

      "var chars=0;\n" +

      "var lineCount=1;\n" +


      "for(var w=0;w<words.length;w++){\n" +

      "var word=words[w];\n" +

      "var len=word.length;\n" +


      "if(len>maxChars){\n" +

      "if(chars>0){\n" +

      "lineCount++;\n" +

      "chars=0;\n" +

      "}\n" +

      "lineCount+=Math.floor(len/maxChars);\n" +

      "chars=len%maxChars;\n" +

      "if(chars===0){\n" +

      "chars=maxChars;\n" +

      "lineCount--;\n" +

      "}\n" +

      "continue;\n" +

      "}\n" +


      "var needed=len+(chars>0?1:0);\n" +


      "if(chars+needed>maxChars){\n" +

      "lineCount++;\n" +

      "chars=len;\n" +

      "}else{\n" +

      "chars+=needed;\n" +

      "}\n" +

      "}\n" +


      "total+=lineCount;\n" +

      "}\n" +


      "return Math.max(1,total);\n" +

      "}\n" +


      "var current=" +
      initialSize +
      ";\n" +

      "var minimum=" +
      minSize +
      ";\n" +


      "while(current>minimum){\n" +

      "var estimated=estimateLines(" +
      jsString(text) +
      ",current,boxWidth," +
      charSpacing +
      ");\n" +

      "var lineHeight=current*1.20;\n" +

      "var requiredHeight=estimated*lineHeight;\n" +


      "if(requiredHeight<=boxHeight){\n" +

      "break;\n" +

      "}\n" +


      "current--;\n" +

      "ti.size=current;\n" +

      "}\n" +


      "finalSize=current;\n" +


      "}\n" +


      /* -------------------------------------------------
         VERTICAL ALIGNMENT
         ------------------------------------------------- */

      /*
       * Paragraph text starts at boxTop.
       * For TOP we leave it there.
       *
       * For CENTER/BOTTOM we estimate the rendered
       * text height and move the text box downward.
       */

      "var estimatedFinalLines=1;\n" +

      "var avgFinal=" +
      "finalSize*0.52;\n" +

      "if(avgFinal<0.1)avgFinal=0.1;\n" +

      "var maxFinalChars=Math.max(1,Math.floor(boxWidth/avgFinal));\n" +

      "var finalParagraphs=" +
      jsString(text) +
      ".split(String.fromCharCode(10));\n" +

      "estimatedFinalLines=0;\n" +


      "for(var fp=0;fp<finalParagraphs.length;fp++){\n" +

      "var fpara=finalParagraphs[fp];\n" +

      "if(fpara.trim()===''){\n" +

      "estimatedFinalLines++;\n" +

      "continue;\n" +

      "}\n" +

      "var fwords=fpara.trim().split(/\\s+/);\n" +

      "var fchars=0;\n" +

      "var flines=1;\n" +


      "for(var fw=0;fw<fwords.length;fw++){\n" +

      "var flen=fwords[fw].length;\n" +

      "if(flen>maxFinalChars){\n" +

      "if(fchars>0){\n" +

      "flines++;\n" +

      "fchars=0;\n" +

      "}\n" +

      "flines+=Math.floor(flen/maxFinalChars);\n" +

      "fchars=flen%maxFinalChars;\n" +

      "if(fchars===0){\n" +

      "fchars=maxFinalChars;\n" +

      "flines--;\n" +

      "}\n" +

      "}else{\n" +

      "var fneed=flen+(fchars>0?1:0);\n" +

      "if(fchars+fneed>maxFinalChars){\n" +

      "flines++;\n" +

      "fchars=flen;\n" +

      "}else{\n" +

      "fchars+=fneed;\n" +

      "}\n" +

      "}\n" +

      "}\n" +

      "estimatedFinalLines+=flines;\n" +

      "}\n" +


      "var estimatedTextHeight=estimatedFinalLines*finalSize*1.20;\n" +

      "var freeHeight=boxHeight-estimatedTextHeight;\n" +

      "if(freeHeight<0)freeHeight=0;\n" +


      "var offsetY=0;\n" +


      "if(" +
      jsString(vAlign) +
      "==='MIDDLE'){\n" +

      "offsetY=freeHeight/2;\n" +

      "}else if(" +
      jsString(vAlign) +
      "==='BOTTOM'){\n" +

      "offsetY=freeHeight;\n" +

      "}\n" +


      "ti.position=[boxLeft,boxTop+offsetY];\n" +


      /* -------------------------------------------------
         POINT TEXT
         ------------------------------------------------- */

      "}else{\n" +


      "ti.kind=TextType.POINTTEXT;\n" +


      "ti.contents=" +
      jsString(text) +
      ";\n" +


      "ti.font=" +
      jsString(font) +
      ";\n" +


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


      "try{\n" +

      "ti.tracking=" +
      charSpacing +
      ";\n" +

      "}catch(ePointTracking){}\n" +


      /* POINT TEXT POSITION */

      "var pointX=(L+R)/2;\n" +

      "var pointY=(T+B)/2;\n" +


      "if(" +
      jsString(vAlign) +
      "==='TOP'){\n" +

      "pointY=T+" +
      initialSize +
      ";\n" +

      "}else if(" +
      jsString(vAlign) +
      "==='BOTTOM'){\n" +

      "pointY=B-(" +
      initialSize +
      "*0.30);\n" +

      "}\n" +


      "ti.position=[pointX,pointY];\n" +


      "}\n" +


      /* -------------------------------------------------
         ACTIVATE LAYER
         ------------------------------------------------- */

      "d.activeLayer=layer;\n" +


      /* -------------------------------------------------
         RESULT
         ------------------------------------------------- */

      "var result=" +

      "'TEXT INSERTED | selection='+" +

      "Math.round(L)+','+" +
      "Math.round(T)+','+" +
      "Math.round(R)+','+" +
      "Math.round(B)+" +

      "' | box='+" +

      "Math.round(boxWidth)+'x'+Math.round(boxHeight)+" +

      "' | size='+ti.size+" +

      "' | mode='+" +
      jsString(mode) +

      ";\n" +


      "app.echoToOE(" +
      "'TYPERP_OK:'+result" +
      ");\n" +


      /* -------------------------------------------------
         ERROR
         ------------------------------------------------- */

      "}catch(e){\n" +

      "var errorMessage=" +

      "(e&&e.message?" +
      "e.message:" +
      "String(e));\n" +


      "try{\n" +

      "app.echoToOE(" +

      "'TYPERP_ERR:'+errorMessage" +

      ");\n" +

      "}catch(e2){}\n" +


      "}\n" +

      "})();";


    /* ===================================================
       SEND SCRIPT TO PHOTOPEA
       =================================================== */

    window.parent.postMessage(
      script,
      "*"
    );


    /* ===================================================
       RESPONSE TIMEOUT
       =================================================== */

    var requestStarted =
      Date.now();


    setTimeout(
      function () {

        if (
          statusEl.textContent ===
          "Reading active selection..."
        ) {

          setStatus(
            "No response from Photopea."
          );

          console.log(
            "TypeR-P BUILD-025: " +
            "No Photopea response after " +
            (Date.now() -
              requestStarted) +
            "ms"
          );
        }

      },
      6000
    );
  }


  /* =====================================================
     INSERT BUTTON
     ===================================================== */

  insertLineBtn.onclick =
    insertCurrentLine;


  /* =====================================================
     DEBUG BUTTON
     ===================================================== */

  var debugBtn =
    document.createElement("button");

  debugBtn.type =
    "button";

  debugBtn.textContent =
    "DEBUG: Test Photopea Link";

  debugBtn.style.width =
    "100%";

  debugBtn.style.marginTop =
    "12px";


  settingsPanel.appendChild(
    debugBtn
  );


  debugBtn.onclick =
    function () {

      setStatus(
        "Sending raw test..."
      );


      window.parent.postMessage(
        "alert('TypeR-P BUILD-025: Photopea connection works.');",
        "*"
      );


      setTimeout(
        function () {

          if (
            statusEl.textContent ===
            "Sending raw test..."
          ) {

            setStatus(
              "No response from Photopea."
            );
          }

        },
        4000
      );
    };


  /* =====================================================
     INITIAL STATE
     ===================================================== */

  updateLine();

  setStatus(
    "Ready (BUILD-025)"
  );


  console.log(
    "TypeR-P BUILD-025 loaded successfully."
  );

})();
