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
// - Safer Photopea communication
// - Explicit script-start response
// - Safer selection reading
// - Fixed generated-script construction
// - No hanging at "Checking active selection..."

(function () {

  "use strict";


  /* =====================================================
     UI
     ===================================================== */

  var statusEl = document.getElementById("status");

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


  for (var i = 0; i < required.length; i++) {

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
          "TypeR-P BUILD-021\n\n" +
          error
        );

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


      /* -----------------------------------------------
         SETTINGS
         ----------------------------------------------- */

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
        !isFinite(horizontalScale) ||
        horizontalScale <= 0
      ) {

        horizontalScale = 100;

      }


      /* -----------------------------------------------
         STATUS
         ----------------------------------------------- */

      setStatus(
        "Sending to Photopea..."
      );


      /* =================================================
         PHOTOPEA SCRIPT
         ================================================= */

      var script = "";


      script +=
        "(function(){\n";


      script +=
        "try{\n";


      /* -----------------------------------------------
         START CONFIRMATION
         ----------------------------------------------- */

      script +=
        "app.echoToOE('TYPERP_OK:SCRIPT_STARTED');\n";


      /* -----------------------------------------------
         DOCUMENT
         ----------------------------------------------- */

      script +=
        "var d=app.activeDocument;\n";


      script +=
        "if(!d){throw new Error('No active document.');}\n";


      /* -----------------------------------------------
         SELECTION
         ----------------------------------------------- */

      script +=
        "var b=null;\n";


      script +=
        "try{b=d.selection.bounds;}catch(e){b=null;}\n";


      script +=
        "if(!b||b.length!==4){\n";


      script +=
        "throw new Error('No active selection. Please make a selection first.');\n";


      script +=
        "}\n";


      /* -----------------------------------------------
         UNIT CONVERSION
         ----------------------------------------------- */

      script +=
        "function px(v){\n";


      script +=
        "if(typeof v==='number'&&isFinite(v))return v;\n";


      script +=
        "try{\n";


      script +=
        "if(v&&typeof v.as==='function'){\n";


      script +=
        "var a=Number(v.as('px'));\n";


      script +=
        "if(isFinite(a))return a;\n";


      script +=
        "}\n";


      script +=
        "}catch(e){}\n";


      script +=
        "try{\n";


      script +=
        "if(v&&v.value!==undefined){\n";


      script +=
        "var n=Number(v.value);\n";


      script +=
        "if(isFinite(n))return n;\n";


      script +=
        "}\n";


      script +=
        "}catch(e){}\n";


      script +=
        "return NaN;\n";


      script +=
        "}\n";


      script +=
        "var L=px(b[0]);\n";


      script +=
        "var T=px(b[1]);\n";


      script +=
        "var R=px(b[2]);\n";


      script +=
        "var B=px(b[3]);\n";


      script +=
        "if(!isFinite(L)||!isFinite(T)||!isFinite(R)||!isFinite(B)){\n";


      script +=
        "throw new Error('Could not read selection coordinates.');\n";


      script +=
        "}\n";


      script +=
        "if(R<=L||B<=T){\n";


      script +=
        "throw new Error('Selection has invalid dimensions.');\n";


      script +=
        "}\n";


      /* -----------------------------------------------
         TEXT BOX
         ----------------------------------------------- */

      script +=
        "var boxLeft=L+" +
        padding +
        ";\n";


      script +=
        "var boxTop=T+" +
        padding +
        ";\n";


      script +=
        "var boxRight=R-" +
        padding +
        ";\n";


      script +=
        "var boxBottom=B-" +
        padding +
        ";\n";


      script +=
        "var boxWidth=boxRight-boxLeft;\n";


      script +=
        "var boxHeight=boxBottom-boxTop;\n";


      script +=
        "if(boxWidth<1||boxHeight<1){\n";


      script +=
        "throw new Error('Padding is too large for the selection.');\n";


      script +=
        "}\n";


      /* -----------------------------------------------
         CREATE TEXT LAYER
         ----------------------------------------------- */

      script +=
        "var layer=d.artLayers.add();\n";


      script +=
        "layer.kind=LayerKind.TEXT;\n";


      script +=
        "layer.name=" +
        jsString(
          "TTP: " +
          text.substring(0, 45)
        ) +
        ";\n";


      script +=
        "var ti=layer.textItem;\n";


      /* =================================================
         PARAGRAPH TEXT
         ================================================= */

      script +=
        "if(" +
        jsString(mode) +
        "==='PARAGRAPH'){\n";


      script +=
        "ti.kind=TextType.PARAGRAPHTEXT;\n";


      script +=
        "ti.position=[boxLeft,boxTop];\n";


      script +=
        "ti.width=new UnitValue(boxWidth,'px');\n";


      script +=
        "ti.height=new UnitValue(boxHeight,'px');\n";


      script +=
        "ti.contents=" +
        jsString(text) +
        ";\n";


      script +=
        "ti.font=" +
        jsString(font) +
        ";\n";


      script +=
        "ti.size=" +
        initialSize +
        ";\n";


      script +=
        "ti.justification=Justification." +
        align +
        ";\n";


      /* COLOR */

      script +=
        "var c=new SolidColor();\n";


      script +=
        "c.rgb.hexValue=" +
        jsString(color) +
        ";\n";


      script +=
        "ti.color=c;\n";


      /* TRACKING */

      script +=
        "try{ti.tracking=" +
        tracking +
        ";}catch(e){}\n";


      /* LEADING */

      script +=
        "try{\n";


      script +=
        "if(" +
        leading +
        ">0){\n";


      script +=
        "ti.useAutoLeading=false;\n";


      script +=
        "ti.leading=new UnitValue(" +
        leading +
        ",'pt');\n";


      script +=
        "}else{\n";


      script +=
        "ti.useAutoLeading=true;\n";


      script +=
        "}\n";


      script +=
        "}catch(e){}\n";


      /* HORIZONTAL SCALE */

      script +=
        "try{\n";


      script +=
        "ti.horizontalScale=" +
        horizontalScale +
        ";\n";


      script +=
        "}catch(e){}\n";


      /* =================================================
         AUTO FIT
         ================================================= */

      script +=
        "if(" +
        autoFit +
        "){\n";


      script +=
        "function estimateLines(str,size,width,track,scale){\n";


      script +=
        "var avg=size*0.52*(scale/100);\n";


      script +=
        "var trackingPx=(track/1000)*size;\n";


      script +=
        "avg+=trackingPx;\n";


      script +=
        "if(avg<0.1)avg=0.1;\n";


      script +=
        "var maxChars=Math.max(1,Math.floor(width/avg));\n";


      script +=
        "var paragraphs=str.split(String.fromCharCode(10));\n";


      script +=
        "var total=0;\n";


      script +=
        "for(var p=0;p<paragraphs.length;p++){\n";


      script +=
        "var paragraph=paragraphs[p];\n";


      script +=
        "if(paragraph.trim()===''){total++;continue;}\n";


      script +=
        "var words=paragraph.trim().split(/\\s+/);\n";


      script +=
        "var chars=0;\n";


      script +=
        "var lineCount=1;\n";


      script +=
        "for(var w=0;w<words.length;w++){\n";


      script +=
        "var word=words[w];\n";


      script +=
        "var len=word.length;\n";


      script +=
        "if(len>maxChars){\n";


      script +=
        "if(chars>0){lineCount++;chars=0;}\n";


      script +=
        "lineCount+=Math.floor(len/maxChars);\n";


      script +=
        "chars=len%maxChars;\n";


      script +=
        "if(chars===0){chars=maxChars;lineCount--;}\n";


      script +=
        "continue;\n";


      script +=
        "}\n";


      script +=
        "var needed=len+(chars>0?1:0);\n";


      script +=
        "if(chars+needed>maxChars){\n";


      script +=
        "lineCount++;\n";


      script +=
        "chars=len;\n";


      script +=
        "}else{\n";


      script +=
        "chars+=needed;\n";


      script +=
        "}\n";


      script +=
        "}\n";


      script +=
        "total+=lineCount;\n";


      script +=
        "}\n";


      script +=
        "return Math.max(1,total);\n";


      script +=
        "}\n";


      script +=
        "var current=" +
        initialSize +
        ";\n";


      script +=
        "var minimum=" +
        minSize +
        ";\n";


      script +=
        "while(current>minimum){\n";


      script +=
        "var estimated=estimateLines(" +
        jsString(text) +
        ",current,boxWidth," +
        tracking +
        "," +
        horizontalScale +
        ");\n";


      script +=
        "var lineHeight;\n";


      script +=
        "if(" +
        leading +
        ">0){\n";


      script +=
        "lineHeight=" +
        leading +
        ";\n";


      script +=
        "}else{\n";


      script +=
        "lineHeight=current*1.20;\n";


      script +=
        "}\n";


      script +=
        "var neededHeight=estimated*lineHeight;\n";


      script +=
        "if(neededHeight<=boxHeight){break;}\n";


      script +=
        "current--;\n";


      script +=
        "ti.size=current;\n";


      script +=
        "}\n";


      script +=
        "}\n";


      /* =================================================
         POINT TEXT
         ================================================= */

      script +=
        "}else{\n";


      script +=
        "ti.kind=TextType.POINTTEXT;\n";


      script +=
        "ti.contents=" +
        jsString(text) +
        ";\n";


      script +=
        "ti.font=" +
        jsString(font) +
        ";\n";


      script +=
        "ti.size=" +
        initialSize +
        ";\n";


      script +=
        "ti.justification=Justification." +
        align +
        ";\n";


      script +=
        "var pc=new SolidColor();\n";


      script +=
        "pc.rgb.hexValue=" +
        jsString(color) +
        ";\n";


      script +=
        "ti.color=pc;\n";


      script +=
        "try{ti.tracking=" +
        tracking +
        ";}catch(e){}\n";


      script +=
        "try{\n";


      script +=
        "if(" +
        leading +
        ">0){\n";


      script +=
        "ti.useAutoLeading=false;\n";


      script +=
        "ti.leading=new UnitValue(" +
        leading +
        ",'pt');\n";


      script +=
        "}\n";


      script +=
        "}catch(e){}\n";


      script +=
        "try{\n";


      script +=
        "ti.horizontalScale=" +
        horizontalScale +
        ";\n";


      script +=
        "}catch(e){}\n";


      script +=
        "ti.position=[(L+R)/2,(T+B)/2];\n";


      script +=
        "}\n";


      /* -----------------------------------------------
         FINISH
         ----------------------------------------------- */

      script +=
        "d.activeLayer=layer;\n";


      script +=
        "app.echoToOE(";


      script +=
        "'TYPERP_OK:TEXT INSERTED | selection=' +";


      script +=
        "Math.round(L)+','+" +
        "Math.round(T)+','+" +
        "Math.round(R)+','+" +
        "Math.round(B)+" +
        "' | box='+" +
        "Math.round(boxWidth)+'x'+Math.round(boxHeight)+" +
        "' | size='+ti.size+" +
        "' | tracking='+" +
        tracking +
        "+' | leading='+" +
        leading +
        "+' | scale='+" +
        horizontalScale +
        ");\n";


      script +=
        "}catch(e){\n";


      script +=
        "app.echoToOE(";


      script +=
        "'TYPERP_ERR:'+";


      script +=
        "(e&&e.message?e.message:String(e))";


      script +=
        ");\n";


      script +=
        "}\n";


      script +=
        "})();";


      /* =================================================
         SEND
         ================================================= */

      try {

        window.parent.postMessage(
          script,
          "*"
        );

      } catch (sendError) {

        setStatus(
          "Send error: " +
          sendError.message
        );

        return;

      }


      /* =================================================
         TIMEOUT
         ================================================= */

      var waiting = true;


      var timeoutId =
        setTimeout(
          function () {

            if (!waiting) {
              return;
            }


            waiting = false;


            if (
              statusEl.textContent ===
              "Sending to Photopea..."
            ) {

              setStatus(
                "Photopea did not respond."
              );

            }

          },
          7000
        );


      /* We don't actually need to clear the timeout
         because the status listener will replace it.
         The variable exists to keep the logic explicit. */

    };


  /* =====================================================
     READY
     ===================================================== */

  updateLine();


  setStatus(
    "Ready (BUILD-021)"
  );


})();
