// TypeR-P — main.js
// BUILD: TYPERP-BUILD-025
//
// BUILD-025
// - Fixed corrupted/duplicated insert script
// - Selection-aware text insertion
// - Paragraph Text Box
// - Point Text
// - Padding
// - Auto Fit
// - Minimum Font Size
// - Character Spacing
// - Word Spacing
// - Vertical Alignment
// - Saved Styles
// - Load Font from Device
// - Photopea communication diagnostics

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
      text.replace(/\r\n/g, "\n")
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
     CURRENT LINE
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

    };


  /* =====================================================
     NEXT
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

    label.textContent = text;

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

    input.type = "number";
    input.value = value;
    input.min = min;
    input.max = max;
    input.step = "1";

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


          var script =
            "(function(){\n" +

            "try{\n" +

            "var before=(app.fonts&&app.fonts.length)?app.fonts.length:0;\n" +

            "app.open(" +
            JSON.stringify(dataUrl) +
            ");\n" +

            "var after=(app.fonts&&app.fonts.length)?app.fonts.length:0;\n" +

            "var name='';\n" +

            "if(app.fonts&&after>0){\n" +

            "var last=app.fonts[after-1];\n" +

            "name=(last&&last.postScriptName)?last.postScriptName:(last&&last.name?last.name:'');\n" +

            "}\n" +

            "app.echoToOE('TYPERP_FONT_LOADED:'+name+' | before='+before+' after='+after);\n" +

            "}catch(e){\n" +

            "app.echoToOE('TYPERP_FONT_ERR:'+(e&&e.message?e.message:String(e)));\n" +

            "}\n" +

            "})();";


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
     PADDING
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
    document.createElement("select");

  vAlignEl.style.width =
    "100%";


  [
    ["TOP", "Top"],
    ["MIDDLE", "Center"],
    ["BOTTOM", "Bottom"]
  ].forEach(
    function (pair) {

      var opt =
        document.createElement("option");

      opt.value =
        pair[0];

      opt.textContent =
        pair[1];

      if (
        pair[0] === "MIDDLE"
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

      return (
        parsed &&
        typeof parsed === "object"
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
        Number(paddingEl.value),

      minSize:
        Number(minSizeEl.value),

      autoFit:
        !!fitEl.checked,

      mode:
        modeEl.value,

      charSpacing:
        Number(
          charSpacingEl.value
        ),

      wordSpacing:
        Number(
          wordSpacingEl.value
        ),

      vAlign:
        vAlignEl.value

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

    if (
      s.charSpacing !== undefined
    ) {
      charSpacingEl.value =
        s.charSpacing;
    }

    if (
      s.wordSpacing !== undefined
    ) {
      wordSpacingEl.value =
        s.wordSpacing;
    }

    if (
      s.vAlign !== undefined
    ) {
      vAlignEl.value =
        s.vAlign;
    }

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


      if (
        event.data.indexOf(
          "TYPERP_FONT_LOADED:"
        ) === 0
      ) {

        var rest =
          event.data.slice(
            "TYPERP_FONT_LOADED:".length
          );

        var name =
          rest.split(
            " | "
          )[0];


        if (name) {

          fontEl.value =
            name;

          setStatus(
            "Font loaded and applied: " +
            name
          );

        } else {

          setStatus(
            "Font loaded, but could not read its name automatically."
          );

        }

        return;
      }


      if (
        event.data.indexOf(
          "TYPERP_FONT_ERR:"
        ) === 0
      ) {

        var ferr =
          event.data.slice(
            "TYPERP_FONT_ERR:".length
          );

        setStatus(
          "Font load error: " +
          ferr
        );

        alert(
          "TypeR-P font load error:\n" +
          ferr
        );

        return;
      }


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
          "TypeR-P BUILD-025\n\n" +
          error
        );

      }

    }
  );


  /* =====================================================
     SAFE STRING
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

      var extra = "";

      for (
        var w = 0;
        w < wordSpacingCount;
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


    /* ---------------------------------------------------
       STATUS
       --------------------------------------------------- */

    setStatus(
      "Checking active selection..."
    );


    /* =====================================================
       PHOTOPEA SCRIPT
       ===================================================== */

    var script =

      "(function(){\n" +

      "try{\n" +

      "var d=app.activeDocument;\n" +

      "if(!d){throw new Error('No active document.');}\n" +


      /* -------------------------------------------------
         READ SELECTION
         ------------------------------------------------- */

      "var b;\n" +

      "try{\n" +

      "b=d.selection.bounds;\n" +

      "}catch(e){\n" +

      "throw new Error('No active selection. Please make a selection first.');\n" +

      "}\n" +


      "if(!b||b.length!==4){\n" +

      "throw new Error('No active selection. Please make a selection first.');\n" +

      "}\n" +


      /* -------------------------------------------------
         UNIT CONVERSION
         ------------------------------------------------- */

      "function px(v){\n" +

      "if(typeof v==='number')return v;\n" +

      "try{\n" +

      "if(v&&typeof v.as==='function'){\n" +

      "var a=Number(v.as('px'));\n" +

      "if(isFinite(a))return a;\n" +

      "}\n" +

      "}catch(e){}\n" +

      "try{\n" +

      "if(v&&v.value!==undefined){\n" +

      "var n=Number(v.value);\n" +

      "if(isFinite(n))return n;\n" +

      "}\n" +

      "}catch(e){}\n" +

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
         BOX
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


      "if(boxWidth<1||boxHeight<1){\n" +

      "throw new Error('Padding is too large for the selection.');\n" +

      "}\n" +


      /* -------------------------------------------------
         CREATE TEXT LAYER
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


      /* =================================================
         PARAGRAPH TEXT
         ================================================= */

      "if(" +
      jsString(mode) +
      "==='PARAGRAPH'){\n" +


      "ti.kind=TextType.PARAGRAPHTEXT;\n" +


      /*
       * IMPORTANT:
       * Photoshop DOM expects dimensions as UnitValue.
       */

      "ti.width=new UnitValue(boxWidth,'px');\n" +

      "ti.height=new UnitValue(boxHeight,'px');\n" +


      "ti.position=[boxLeft,boxTop];\n" +


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


      /* -------------------------------------------------
         TRACKING
         ------------------------------------------------- */

      "var trackingReadback='unread';\n" +

      "var trackingErr='';\n" +

      "try{\n" +

      "ti.tracking=" +
      charSpacing +
      ";\n" +

      "trackingReadback=''+ti.tracking;\n" +

      "}catch(eTrack){\n" +

      "trackingErr=' | tracking-failed:'+(eTrack&&eTrack.message?eTrack.message:String(eTrack));\n" +

      "}\n" +


      /* -------------------------------------------------
         AUTO FIT
         ------------------------------------------------- */

      "var estimatedLines=1;\n" +

      "var finalSize=" +
      initialSize +
      ";\n" +


      "if(" +
      autoFit +
      "){\n" +


      "function estimateLines(str,size,width){\n" +

      "var avg=size*0.52;\n" +

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


      "var guard=0;\n" +


      "while(current>minimum){\n" +

      "guard++;\n" +

      "if(guard>1000){break;}\n" +


      "var est=estimateLines(" +
      jsString(text) +
      ",current,boxWidth);\n" +


      "var lh=current*1.20;\n" +

      "var neededHeight=est*lh;\n" +


      "estimatedLines=est;\n" +


      "if(neededHeight<=boxHeight){\n" +

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

      "var effLineHeight=finalSize*1.20;\n" +

      "var actualTextHeight=estimatedLines*effLineHeight;\n" +

      "var extraSpace=boxHeight-actualTextHeight;\n" +


      "if(extraSpace<0)extraSpace=0;\n" +


      "var vAlignOffset=0;\n" +


      "if(" +
      jsString(vAlign) +
      "==='MIDDLE'){\n" +

      "vAlignOffset=extraSpace/2;\n" +

      "}else if(" +
      jsString(vAlign) +
      "==='BOTTOM'){\n" +

      "vAlignOffset=extraSpace;\n" +

      "}\n" +


      "ti.position=[boxLeft,boxTop+vAlignOffset];\n" +


      /* =================================================
         POINT TEXT
         ================================================= */

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

      "}catch(eTrackingPoint){}\n" +


      "var py=(T+B)/2;\n" +


      "if(" +
      jsString(vAlign) +
      "==='TOP'){\n" +

      "py=T+" +
      initialSize +
      ";\n" +

      "}else if(" +
      jsString(vAlign) +
      "==='BOTTOM'){\n" +

      "py=B-(" +
      initialSize +
      "*0.3);\n" +

      "}\n" +


      "ti.position=[(L+R)/2,py];\n" +

      "}\n" +


      /* -------------------------------------------------
         FINISH
         ------------------------------------------------- */

      "d.activeLayer=layer;\n" +


      "var __resultMsg=" +

      "'TEXT INSERTED | selection='+" +

      "Math.round(L)+','+" +
      "Math.round(T)+','+" +
      "Math.round(R)+','+" +
      "Math.round(B)+" +

      "' | box='+" +

      "Math.round(boxWidth)+'x'+Math.round(boxHeight)+" +

      "' | size='+ti.size+" +

      "' | trackingSet=" +
      charSpacing +

      " | trackingReadback='+trackingReadback+trackingErr;\n" +


      "try{\n" +

      "app.echoToOE('TYPERP_OK:'+__resultMsg);\n" +

      "}catch(eEcho){}\n" +


      "}catch(e){\n" +


      "var __errMsg=(e&&e.message?e.message:String(e));\n" +


      "try{\n" +

      "app.echoToOE('TYPERP_ERR:'+__errMsg);\n" +

      "}catch(eEcho2){}\n" +


      "try{\n" +

      "alert('TypeR-P ERROR: '+__errMsg);\n" +

      "}catch(eAlert){}\n" +


      "}\n" +

      "})();";


    /* =====================================================
       SEND TO PHOTOPEA
       ===================================================== */

    window.parent.postMessage(
      script,
      "*"
    );


    /* =====================================================
       RESPONSE TIMEOUT
       ===================================================== */

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


  /* =====================================================
     INSERT BUTTON
     ===================================================== */

  insertLineBtn.onclick =
    insertCurrentLine;


  /* =====================================================
     INITIAL STATE
     ===================================================== */

  updateLine();

  setStatus(
    "Ready (BUILD-025)"
  );


  /* =====================================================
     DEBUG BUTTON
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


  settingsPanel.appendChild(
    debugBtn
  );


  debugBtn.onclick =
    function () {

      setStatus(
        "Sending raw test script..."
      );


      window.parent.postMessage(
        "alert('HELLO FROM TYPERP BUILD-025 - LINK WORKS');",
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
              "Raw test got no response."
            );

          }

        },
        4000
      );

    };


})();
