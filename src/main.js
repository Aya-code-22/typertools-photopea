// TypeR-P — main.js
// BUILD: TYPERP-BUILD-021
//
// Full Text -> Lines -> Current Line
// Selection-aware Paragraph Text
// Padding
// Auto Fit
// Minimum Font Size
// Text Mode
// Letter Spacing
// Line Spacing
// Horizontal Scale
//
// BUILD-021:
// - Step-by-step Photopea diagnostics
// - Safer selection reading
// - Safer text-layer creation
// - No silent hangs
// - Paragraph text stays inside selection
// - Long words are force-wrapped

(function () {

  "use strict";


  /* =====================================================
     UI
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
      "TypeR-P BUILD-021 UI ERROR\n\n" +
      "Missing:\n" +
      missing.join("\n")
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
      text.replace(/\r\n/g, "\n");

    text =
      text.replace(/\r/g, "\n");


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
     EXTRA CONTROLS
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

    label.style.display = "block";

    label.style.marginTop = "8px";

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


    input.type = "number";

    input.value = value;

    input.min = min;

    input.max = max;

    input.step =
      step || "1";


    input.style.width =
      "100%";

    input.style.boxSizing =
      "border-box";


    return input;

  }


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
     LETTER SPACING
     ===================================================== */

  settingsPanel.appendChild(
    makeLabel(
      "Letter Spacing"
    )
  );


  var trackingEl =
    makeNumber(
      0,
      -1000,
      10000,
      10
    );


  settingsPanel.appendChild(
    trackingEl
  );


  /* =====================================================
     LINE SPACING
     ===================================================== */

  settingsPanel.appendChild(
    makeLabel(
      "Line Spacing"
    )
  );


  var leadingEl =
    makeNumber(
      0,
      0,
      1000,
      1
    );


  settingsPanel.appendChild(
    leadingEl
  );


  /* =====================================================
     HORIZONTAL SCALE
     ===================================================== */

  settingsPanel.appendChild(
    makeLabel(
      "Horizontal Scale (%)"
    )
  );


  var horizontalScaleEl =
    makeNumber(
      100,
      10,
      1000,
      1
    );


  settingsPanel.appendChild(
    horizontalScaleEl
  );


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
          "TYPERP_STEP:"
        ) === 0
      ) {

        setStatus(
          event.data.substring(
            "TYPERP_STEP:".length
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
          "Error: " + error
        );


        alert(
          "TypeR-P BUILD-021\n\n" +
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
     INSERT LINE
     ===================================================== */

  insertLineBtn.onclick =
    function () {

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


      var tracking =
        Number(
          trackingEl.value
        );


      if (!isFinite(tracking)) {

        tracking = 0;

      }


      var leading =
        Number(
          leadingEl.value
        );


      if (
        !isFinite(leading) ||
        leading < 0
      ) {

        leading = 0;

      }


      var horizontalScale =
        Number(
          horizontalScaleEl.value
        );


      if (
        !isFinite(
          horizontalScale
        )
      ) {

        horizontalScale = 100;

      }


      /* -------------------------------------------------
         START
         ------------------------------------------------- */

      setStatus(
        "Sending BUILD-021..."
      );


      /* =================================================
         PHOTOPEA SCRIPT
         ================================================= */

      var script =

        "(function(){\n" +

        "try{\n" +

        "app.echoToOE('TYPERP_STEP:SCRIPT_STARTED');\n" +


        /* DOCUMENT */

        "var d=app.activeDocument;\n" +

        "if(!d){throw new Error('NO_ACTIVE_DOCUMENT');}\n" +

        "app.echoToOE('TYPERP_STEP:DOCUMENT_VALID');\n" +


        /* SELECTION */

        "var b;\n" +

        "try{\n" +

        "b=d.selection.bounds;\n" +

        "}catch(e){\n" +

        "throw new Error('NO_ACTIVE_SELECTION');\n" +

        "}\n" +


        "if(!b||b.length!==4){\n" +

        "throw new Error('NO_ACTIVE_SELECTION');\n" +

        "}\n" +


        "app.echoToOE('TYPERP_STEP:SELECTION_VALID');\n" +


        /* SAFE NUMBER */

        "function num(v){\n" +

        "if(typeof v==='number'&&isFinite(v))return v;\n" +

        "try{\n" +

        "if(v&&typeof v.as==='function'){\n" +

        "var x=Number(v.as('px'));\n" +

        "if(isFinite(x))return x;\n" +

        "}\n" +

        "}catch(e){}\n" +

        "try{\n" +

        "if(v&&v.value!==undefined){\n" +

        "var y=Number(v.value);\n" +

        "if(isFinite(y))return y;\n" +

        "}\n" +

        "}catch(e){}\n" +

        "return NaN;\n" +

        "}\n" +


        "var L=num(b[0]);\n" +

        "var T=num(b[1]);\n" +

        "var R=num(b[2]);\n" +

        "var B=num(b[3]);\n" +


        "if(!isFinite(L)||!isFinite(T)||!isFinite(R)||!isFinite(B)){\n" +

        "throw new Error('SELECTION_COORDINATES_INVALID');\n" +

        "}\n" +


        "app.echoToOE('TYPERP_STEP:COORDINATES_VALID');\n" +


        /* DIMENSIONS */

        "if(R<=L||B<=T){\n" +

        "throw new Error('SELECTION_DIMENSIONS_INVALID');\n" +

        "}\n" +


        "var W=R-L;\n" +

        "var H=B-T;\n" +


        "app.echoToOE('TYPERP_STEP:DIMENSIONS_VALID');\n" +


        /* BOX */

        "var pad=" +
        padding +
        ";\n" +

        "var boxL=L+pad;\n" +

        "var boxT=T+pad;\n" +

        "var boxR=R-pad;\n" +

        "var boxB=B-pad;\n" +

        "var boxW=boxR-boxL;\n" +

        "var boxH=boxB-boxT;\n" +


        "if(boxW<=1||boxH<=1){\n" +

        "throw new Error('PADDING_TOO_LARGE');\n" +

        "}\n" +


        "app.echoToOE('TYPERP_STEP:BOX_VALID');\n" +


        /* CREATE LAYER */

        "var layer=d.artLayers.add();\n" +

        "app.echoToOE('TYPERP_STEP:LAYER_CREATED');\n" +


        "layer.kind=LayerKind.TEXT;\n" +

        "app.echoToOE('TYPERP_STEP:TEXT_LAYER_CREATED');\n" +


        "var ti=layer.textItem;\n" +

        "if(!ti){throw new Error('TEXT_ITEM_NOT_AVAILABLE');}\n" +


        "app.echoToOE('TYPERP_STEP:TEXT_ITEM_VALID');\n" +


        /* PARAGRAPH */

        "if(" +
        jsString(mode) +
        "==='PARAGRAPH'){\n" +

        "app.echoToOE('TYPERP_STEP:PARAGRAPH_MODE');\n" +


        "ti.kind=TextType.PARAGRAPHTEXT;\n" +

        "app.echoToOE('TYPERP_STEP:PARAGRAPH_KIND_SET');\n" +


        "ti.position=[boxL,boxT];\n" +

        "app.echoToOE('TYPERP_STEP:POSITION_SET');\n" +


        "ti.width=new UnitValue(boxW,'px');\n" +

        "app.echoToOE('TYPERP_STEP:WIDTH_SET');\n" +


        "ti.height=new UnitValue(boxH,'px');\n" +

        "app.echoToOE('TYPERP_STEP:HEIGHT_SET');\n" +


        "ti.contents=" +
        jsString(text) +
        ";\n" +

        "app.echoToOE('TYPERP_STEP:CONTENTS_SET');\n" +


        "ti.font=" +
        jsString(font) +
        ";\n" +

        "app.echoToOE('TYPERP_STEP:FONT_SET');\n" +


        "ti.size=" +
        initialSize +
        ";\n" +

        "app.echoToOE('TYPERP_STEP:SIZE_SET');\n" +


        "ti.justification=Justification." +
        align +
        ";\n" +

        "app.echoToOE('TYPERP_STEP:ALIGN_SET');\n" +


        /* COLOR */

        "var c=new SolidColor();\n" +

        "c.rgb.hexValue=" +
        jsString(color) +
        ";\n" +

        "ti.color=c;\n" +

        "app.echoToOE('TYPERP_STEP:COLOR_SET');\n" +


        /* TRACKING */

        "try{\n" +

        "ti.tracking=" +
        tracking +
        ";\n" +

        "}catch(e){}\n" +


        /* LEADING */

        "try{\n" +

        "if(" +
        leading +
        ">0){\n" +

        "ti.useAutoLeading=false;\n" +

        "ti.leading=new UnitValue(" +
        leading +
        ",'pt');\n" +

        "}else{\n" +

        "ti.useAutoLeading=true;\n" +

        "}\n" +

        "}catch(e){}\n" +


        /* HORIZONTAL SCALE */

        "try{\n" +

        "ti.horizontalScale=" +
        horizontalScale +
        ";\n" +

        "}catch(e){}\n" +


        "app.echoToOE('TYPERP_STEP:TEXT_SETTINGS_DONE');\n" +


        /* AUTO FIT */

        "if(" +
        autoFit +
        "){\n" +

        "app.echoToOE('TYPERP_STEP:AUTOFIT_START');\n" +


        "var current=" +
        initialSize +
        ";\n" +

        "var minimum=" +
        minSize +
        ";\n" +


        "function estimateLines(str,size,width){\n" +

        "var avg=size*0.52;\n" +

        "if(avg<0.1)avg=0.1;\n" +

        "var maxChars=Math.max(1,Math.floor(width/avg));\n" +

        "var parts=str.split(String.fromCharCode(10));\n" +

        "var total=0;\n" +


        "for(var p=0;p<parts.length;p++){\n" +

        "var s=parts[p];\n" +

        "if(s.length===0){total++;continue;}\n" +


        "var words=s.split(/\\s+/);\n" +

        "var chars=0;\n" +

        "var count=1;\n" +


        "for(var w=0;w<words.length;w++){\n" +

        "var word=words[w];\n" +

        "var remaining=word.length;\n" +


        "if(remaining>maxChars){\n" +

        "if(chars>0){count++;chars=0;}\n" +

        "while(remaining>maxChars){\n" +

        "count++;\n" +

        "remaining-=maxChars;\n" +

        "}\n" +

        "chars=remaining;\n" +

        "continue;\n" +

        "}\n" +


        "var needed=word.length+(chars>0?1:0);\n" +


        "if(chars+needed>maxChars){\n" +

        "count++;\n" +

        "chars=word.length;\n" +

        "}else{\n" +

        "chars+=needed;\n" +

        "}\n" +

        "}\n" +


        "total+=count;\n" +

        "}\n" +


        "return Math.max(1,total);\n" +

        "}\n" +


        "var guard=0;\n" +


        "while(current>minimum&&guard<1000){\n" +

        "guard++;\n" +

        "var estimated=estimateLines(" +
        jsString(text) +
        ",current,boxW);\n" +

        "var lh=" +
        leading +
        ">0?" +
        leading +
        ":current*1.2;\n" +

        "if(estimated*lh<=boxH){break;}\n" +

        "current--;\n" +

        "ti.size=current;\n" +

        "}\n" +


        "app.echoToOE('TYPERP_STEP:AUTOFIT_DONE');\n" +

        "}\n" +


        /* POINT */

        "}else{\n" +

        "app.echoToOE('TYPERP_STEP:POINT_MODE');\n" +

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

        "ti.position=[(L+R)/2,(T+B)/2];\n" +

        "}\n" +


        /* FINISH */

        "app.echoToOE('TYPERP_STEP:BEFORE_ACTIVE_LAYER');\n" +

        "d.activeLayer=layer;\n" +

        "app.echoToOE('TYPERP_STEP:ACTIVE_LAYER_SET');\n" +


        "app.echoToOE(" +

        "'TYPERP_OK:TEXT INSERTED | selection='+" +

        "Math.round(L)+','+" +

        "Math.round(T)+','+" +

        "Math.round(R)+','+" +

        "Math.round(B)+" +

        "' | box='+" +

        "Math.round(boxW)+'x'+Math.round(boxH)+" +

        "' | size='+ti.size" +

        ");\n" +


        "}catch(e){\n" +

        "app.echoToOE(" +

        "'TYPERP_ERR:'+" +

        "(e&&e.message?" +

        "e.message:String(e))" +

        ");\n" +

        "}\n" +

        "})();";


      /* =================================================
         SEND
         ================================================= */

      window.parent.postMessage(
        script,
        "*"
      );

    };


  /* =====================================================
     READY
     ===================================================== */

  updateLine();


  setStatus(
    "Ready (BUILD-021)"
  );


})();
