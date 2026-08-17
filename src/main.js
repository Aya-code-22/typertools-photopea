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
// Robust Selection Validation

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

  loadLinesBtn.onclick =
    function () {

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
        lines[lines.length - 1]
          .trim() === ""
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
    settingsPanel = fontEl.parentElement;
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


      /* =================================================
         SETTINGS
         ================================================= */

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


      /* =================================================
         STATUS
         ================================================= */

      setStatus(
        "Reading active selection..."
      );


      /* =================================================
         PHOTOPEA SCRIPT
         ================================================= */

      var script =

        "(function(){\n" +

        "try{\n" +

        "app.echoToOE('TYPERP_OK:SCRIPT_STARTED');\n" +

        "\n" +

        "var d=app.activeDocument;\n" +

        "if(!d){throw new Error('No active document.');}\n" +

        "\n" +

        "var b=null;\n" +

        "\n" +

        "try{\n" +

        "b=d.selection.bounds;\n" +

        "}catch(selErr){\n" +

        "throw new Error('Could not read selection bounds.');\n" +

        "}\n" +

        "\n" +

        "if(!b||b.length!==4){\n" +

        "throw new Error('No active selection. Make a rectangular selection first.');\n" +

        "}\n" +

        "\n" +

        "function getNum(v){\n" +

        "var n=NaN;\n" +

        "\n" +

        "try{\n" +

        "if(typeof v==='number'){\n" +

        "n=Number(v);\n" +

        "}\n" +

        "}catch(e){}\n" +

        "\n" +

        "if(!isFinite(n)){\n" +

        "try{\n" +

        "if(v&&typeof v.as==='function'){\n" +

        "n=Number(v.as('px'));\n" +

        "}\n" +

        "}catch(e){}\n" +

        "}\n" +

        "\n" +

        "if(!isFinite(n)){\n" +

        "try{\n" +

        "if(v&&v.value!==undefined){\n" +

        "n=Number(v.value);\n" +

        "}\n" +

        "}catch(e){}\n" +

        "}\n" +

        "\n" +

        "return n;\n" +

        "}\n" +

        "\n" +

        "var L=getNum(b[0]);\n" +

        "var T=getNum(b[1]);\n" +

        "var R=getNum(b[2]);\n" +

        "var B=getNum(b[3]);\n" +

        "\n" +

        "app.echoToOE('TYPERP_OK:BOUNDS_RAW='+L+','+T+','+R+','+B);\n" +

        "\n" +

        "if(!isFinite(L)||!isFinite(T)||!isFinite(R)||!isFinite(B)){\n" +

        "throw new Error('Selection coordinates are not valid numbers.');\n" +

        "}\n" +

        "\n" +

        "if(R<=L||B<=T){\n" +

        "throw new Error('Selection has zero or negative size: '+L+','+T+','+R+','+B);\n" +

        "}\n" +

        "\n" +

        "if((R-L)<2||(B-T)<2){\n" +

        "throw new Error('Selection is too small. Width='+(R-L)+' Height='+(B-T));\n" +

        "}\n" +

        "\n" +

        "app.echoToOE('TYPERP_OK:SELECTION_VALID');\n" +

        "\n" +

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

        "\n" +

        "if(boxWidth<2||boxHeight<2){\n" +

        "throw new Error('Padding '+(" +
        padding +
        ")+' is too large for selection '+(R-L)+'x'+(B-T)+'.');\n" +

        "}\n" +

        "\n" +

        "app.echoToOE('TYPERP_OK:BOX_VALID='+boxWidth+'x'+boxHeight);\n" +

        "\n" +

        "var layer=d.artLayers.add();\n" +

        "layer.kind=LayerKind.TEXT;\n" +

        "layer.name=" +

        jsString(
          "TTP: " +
          text.substring(0,45)
        ) +

        ";\n" +

        "var ti=layer.textItem;\n" +

        "\n" +

        "if(" +
        jsString(mode) +
        "==='PARAGRAPH'){\n" +

        "\n" +

        "ti.kind=TextType.PARAGRAPHTEXT;\n" +

        "\n" +

        "ti.position=[\n" +

        "new UnitValue(boxLeft,'px'),\n" +

        "new UnitValue(boxTop,'px')\n" +

        "];\n" +

        "\n" +

        "ti.width=new UnitValue(boxWidth,'px');\n" +

        "ti.height=new UnitValue(boxHeight,'px');\n" +

        "\n" +

        "ti.font=" +
        jsString(font) +
        ";\n" +

        "ti.size=" +
        initialSize +
        ";\n" +

        "\n" +

        "var c=new SolidColor();\n" +

        "c.rgb.hexValue=" +
        jsString(color) +
        ";\n" +

        "ti.color=c;\n" +

        "\n" +

        "ti.justification=Justification." +
        align +
        ";\n" +

        "\n" +

        "try{\n" +

        "ti.tracking=" +
        tracking +
        ";\n" +

        "}catch(e){}\n" +

        "\n" +

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

        "\n" +

        "try{\n" +

        "ti.horizontalScale=" +
        horizontalScale +
        ";\n" +

        "}catch(e){}\n" +

        "\n" +

        "ti.contents=" +
        jsString(text) +
        ";\n" +

        "\n" +

        "app.echoToOE('TYPERP_OK:TEXT_CREATED');\n" +

        "\n" +

        /* AUTO FIT */

        "if(" +
        autoFit +
        "){\n" +

        "\n" +

        "function estimateLines(str,size,width,track,scale){\n" +

        "var avg=size*0.52*(scale/100);\n" +

        "var trackingPx=(track/1000)*size;\n" +

        "avg+=trackingPx;\n" +

        "if(avg<0.1)avg=0.1;\n" +

        "\n" +

        "var maxChars=Math.max(1,Math.floor(width/avg));\n" +

        "var paragraphs=str.split(String.fromCharCode(10));\n" +

        "var total=0;\n" +

        "\n" +

        "for(var p=0;p<paragraphs.length;p++){\n" +

        "\n" +

        "var paragraph=paragraphs[p];\n" +

        "\n" +

        "if(paragraph.trim()===''){\n" +

        "total++;\n" +

        "continue;\n" +

        "}\n" +

        "\n" +

        "var words=paragraph.trim().split(/\\s+/);\n" +

        "var chars=0;\n" +

        "var lineCount=1;\n" +

        "\n" +

        "for(var w=0;w<words.length;w++){\n" +

        "\n" +

        "var word=words[w];\n" +

        "var len=word.length;\n" +

        "\n" +

        "if(len>maxChars){\n" +

        "\n" +

        "if(chars>0){\n" +

        "lineCount++;\n" +

        "chars=0;\n" +

        "}\n" +

        "\n" +

        "lineCount+=Math.floor(len/maxChars);\n" +

        "chars=len%maxChars;\n" +

        "\n" +

        "if(chars===0){\n" +

        "chars=maxChars;\n" +

        "lineCount--;\n" +

        "}\n" +

        "\n" +

        "continue;\n" +

        "}\n" +

        "\n" +

        "var needed=len+(chars>0?1:0);\n" +

        "\n" +

        "if(chars+needed>maxChars){\n" +

        "lineCount++;\n" +

        "chars=len;\n" +

        "}else{\n" +

        "chars+=needed;\n" +

        "}\n" +

        "}\n" +

        "\n" +

        "total+=lineCount;\n" +

        "}\n" +

        "\n" +

        "return Math.max(1,total);\n" +

        "}\n" +

        "\n" +

        "var current=" +
        initialSize +
        ";\n" +

        "var minimum=" +
        minSize +
        ";\n" +

        "\n" +

        "while(current>minimum){\n" +

        "\n" +

        "var estimated=estimateLines(" +
        jsString(text) +
        ",current,boxWidth," +
        tracking +
        "," +
        horizontalScale +
        ");\n" +

        "var lineHeight;\n" +

        "\n" +

        "if(" +
        leading +
        ">0){\n" +

        "lineHeight=" +
        leading +
        ";\n" +

        "}else{\n" +

        "lineHeight=current*1.20;\n" +

        "}\n" +

        "\n" +

        "var neededHeight=estimated*lineHeight;\n" +

        "\n" +

        "if(neededHeight<=boxHeight){\n" +

        "break;\n" +

        "}\n" +

        "\n" +

        "current--;\n" +

        "ti.size=current;\n" +

        "}\n" +

        "\n" +

        "}\n" +

        "\n" +

        "}else{\n" +

        "\n" +

        "ti.kind=TextType.POINTTEXT;\n" +

        "\n" +

        "ti.font=" +
        jsString(font) +
        ";\n" +

        "ti.size=" +
        initialSize +
        ";\n" +

        "ti.contents=" +
        jsString(text) +
        ";\n" +

        "ti.justification=Justification." +
        align +
        ";\n" +

        "var pc=new SolidColor();\n" +

        "pc.rgb.hexValue=" +
        jsString(color) +
        ";\n" +

        "ti.color=pc;\n" +

        "try{ti.tracking=" +
        tracking +
        ";}catch(e){}\n" +

        "try{\n" +

        "if(" +
        leading +
        ">0){\n" +

        "ti.useAutoLeading=false;\n" +

        "ti.leading=new UnitValue(" +
        leading +
        ",'pt');\n" +

        "}\n" +

        "}catch(e){}\n" +

        "try{\n" +

        "ti.horizontalScale=" +
        horizontalScale +
        ";\n" +

        "}catch(e){}\n" +

        "ti.position=[\n" +

        "new UnitValue((L+R)/2,'px'),\n" +

        "new UnitValue((T+B)/2,'px')\n" +

        "];\n" +

        "\n" +

        "}\n" +

        "\n" +

        "d.activeLayer=layer;\n" +

        "\n" +

        "app.echoToOE(\n" +

        "'TYPERP_OK:TEXT INSERTED | selection='+\n" +

        "Math.round(L)+','+\n        "Math.round(T)+','+\n        "Math.round(R)+','+\n        "Math.round(B)+\n" +

        "' | box='+\n" +

        "Math.round(boxWidth)+'x'+Math.round(boxHeight)+\n" +

        "' | size='+ti.size+\n" +

        "' | tracking=" +
        tracking +
        " +\n" +

        "' | leading=" +
        leading +
        " +\n" +

        "' | scale=" +
        horizontalScale +
        "\n" +

        ");\n" +

        "\n" +

        "}catch(e){\n" +

        "app.echoToOE(\n" +

        "'TYPERP_ERR:'+\n" +

        "(e&&e.message?e.message:String(e))\n" +

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
