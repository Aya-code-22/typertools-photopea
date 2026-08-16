// TypeR-P — main.js
// BUILD: TYPERP-BUILD-018
//
// Selection-aware Paragraph Text
// Full Text -> Lines -> Current Line
// Word-aware wrapping
// Auto Fit
// Padding
// Saved basic settings

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


  /* =====================================================
     UI CHECK
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
      "TypeR-P BUILD-018 UI ERROR\n\n" +
      "Missing:\n" +
      missing.join("\n")
    );

    return;
  }


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


      /*
       * Remove empty lines at the end.
       */

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
     EXTRA SETTINGS
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
    max
  ) {

    var input =
      document.createElement("input");

    input.type = "number";

    input.value = value;

    input.min = min;

    input.max = max;

    input.step = "1";

    input.style.width = "100%";

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
          event.data.substring(10)
        );

        return;

      }


      if (
        event.data.indexOf(
          "TYPERP_ERR:"
        ) === 0
      ) {

        var error =
          event.data.substring(11);


        setStatus(
          "Error: " +
          error
        );


        alert(
          "TypeR-P BUILD-018\n\n" +
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
      fitEl.checked;


    var mode =
      modeEl.value;


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

      "if(!d){throw new Error('No active document.');}\n" +


      /*
       * -------------------------------------------------
       * GET SELECTION
       * -------------------------------------------------
       */

      "var b;\n" +

      "try{\n" +

      "b=d.selection.bounds;\n" +

      "}catch(e){\n" +

      "throw new Error('No active selection. Please make a selection first.');\n" +

      "}\n" +


      "if(!b||b.length!==4){\n" +

      "throw new Error('No active selection. Please make a selection first.');\n" +

      "}\n" +


      /*
       * Convert UnitValue / number
       */

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

      "throw new Error('Selection has invalid dimensions.');\n" +

      "}\n" +


      /*
       * -------------------------------------------------
       * INNER TEXT BOX
       * -------------------------------------------------
       */

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


      /*
       * -------------------------------------------------
       * CREATE LAYER
       * -------------------------------------------------
       */

      "var layer=d.artLayers.add();\n" +

      "layer.kind=LayerKind.TEXT;\n" +


      "layer.name=" +

      jsString(
        "TTP: " +
        text.substring(0,45)
      ) +

      ";\n" +


      "var ti=layer.textItem;\n" +


      /*
       * -------------------------------------------------
       * PARAGRAPH TEXT
       * -------------------------------------------------
       */

      "if(" +

      jsString(mode) +

      "==='PARAGRAPH'){\n" +

      "ti.kind=TextType.PARAGRAPHTEXT;\n" +


      "ti.position=[boxLeft,boxTop];\n" +


      "ti.width=new UnitValue(boxWidth,'px');\n" +

      "ti.height=new UnitValue(boxHeight,'px');\n" +


      "ti.contents=" +

      jsString(text) +

      ";\n" +


      "ti.font=" +

      jsString(font) +

      ";\n" +


      /*
       * Start at requested size.
       */

      "ti.size=" +
      initialSize +
      ";\n" +


      "ti.justification=Justification." +
      align +
      ";\n" +


      "var c=new SolidColor();\n" +

      "c.rgb.hexValue=" +

      jsString(color) +

      ";\n" +

      "ti.color=c;\n" +


      /*
       * -------------------------------------------------
       * WORD-AWARE AUTO FIT
       * -------------------------------------------------
       *
       * We calculate a conservative font size based
       * on words instead of blindly splitting every
       * character.
       */

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


      /*
       * A word wider than the entire line
       * is the only case where character
       * breaking is allowed.
       */

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


      /*
       * Normal word wrapping.
       */

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


      /*
       * Approximate line height.
       */

      "var current=" +
      initialSize +
      ";\n" +

      "var minimum=" +
      minSize +
      ";\n" +


      "while(current>minimum){\n" +

      "var estimated=estimateLines(\n" +

      jsString(text) +

      ",current,boxWidth);\n" +


      "var lineHeight=current*1.20;\n" +

      "var neededHeight=estimated*lineHeight;\n" +


      "if(neededHeight<=boxHeight){\n" +

      "break;\n" +

      "}\n" +


      "current--;\n" +

      "ti.size=current;\n" +

      "}\n" +


      "}\n" +


      "}else{\n" +


      /*
       * -------------------------------------------------
       * POINT TEXT
       * -------------------------------------------------
       */

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


      "ti.position=[\n" +

      "(L+R)/2,\n" +

      "(T+B)/2\n" +

      "];\n" +


      "}\n" +


      /*
       * -------------------------------------------------
       * FINISH
       * -------------------------------------------------
       */

      "d.activeLayer=layer;\n" +


      "app.echoToOE(\n" +

      "'TYPERP_OK:TEXT INSERTED | selection='+\n" +

      "Math.round(L)+','+\n" +

      "Math.round(T)+','+\n" +

      "Math.round(R)+','+\n" +

      "Math.round(B)+\n" +

      "' | box='+\n" +

      "Math.round(boxWidth)+'x'+\n" +

      "Math.round(boxHeight)+\n" +

      "' | size='+\n" +

      "ti.size\n" +

      ");\n" +


      "}catch(e){\n" +

      "app.echoToOE(\n" +

      "'TYPERP_ERR:'+\n" +

      "(e&&e.message?e.message:String(e))\n" +

      ");\n" +

      "}\n" +

      "})();";


    window.parent.postMessage(
      script,
      "*"
    );

  }


  /* =====================================================
     INSERT BUTTON
     ===================================================== */

  insertLineBtn.onclick =
    insertCurrentLine;


  /* =====================================================
     READY
     ===================================================== */

  updateLine();

  setStatus(
    "Ready (BUILD-018)"
  );

})();
