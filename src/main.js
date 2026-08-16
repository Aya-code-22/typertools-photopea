(function () {

  "use strict";

  /* =====================================================
     TypeR-P
     BUILD: TYPERP-BUILD-017
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
     CHECK UI
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

  for (var r = 0; r < required.length; r++) {

    if (!required[r][1]) {
      missing.push(required[r][0]);
    }

  }

  if (missing.length) {

    alert(
      "TypeR-P BUILD-017 UI ERROR\n\n" +
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

      while (
        lines.length &&
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
     EDIT CURRENT LINE
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


  function label(text) {

    var el =
      document.createElement("label");

    el.textContent = text;

    el.style.display = "block";
    el.style.marginTop = "8px";

    return el;
  }


  function numberInput(
    value,
    min,
    max
  ) {

    var el =
      document.createElement("input");

    el.type = "number";
    el.value = value;
    el.min = min;
    el.max = max;
    el.step = "1";

    el.style.width = "100%";
    el.style.boxSizing = "border-box";

    return el;
  }


  /* Padding */

  settingsPanel.appendChild(
    label("Padding")
  );

  var paddingEl =
    numberInput(
      12,
      0,
      500
    );

  settingsPanel.appendChild(
    paddingEl
  );


  /* Auto Fit */

  settingsPanel.appendChild(
    label("Auto Fit")
  );

  var fitRow =
    document.createElement("label");

  fitRow.style.display = "flex";
  fitRow.style.alignItems = "center";
  fitRow.style.gap = "6px";


  var fitEl =
    document.createElement("input");

  fitEl.type = "checkbox";
  fitEl.checked = true;


  fitRow.appendChild(fitEl);

  fitRow.appendChild(
    document.createTextNode(
      "Automatically reduce font size"
    )
  );


  settingsPanel.appendChild(
    fitRow
  );


  /* Minimum size */

  settingsPanel.appendChild(
    label("Minimum Font Size")
  );

  var minSizeEl =
    numberInput(
      8,
      1,
      500
    );

  settingsPanel.appendChild(
    minSizeEl
  );


  /* Text mode */

  settingsPanel.appendChild(
    label("Text Mode")
  );

  var modeEl =
    document.createElement("select");

  modeEl.style.width = "100%";


  var paragraph =
    document.createElement("option");

  paragraph.value = "PARAGRAPH";
  paragraph.textContent =
    "Text Box (recommended)";


  var point =
    document.createElement("option");

  point.value = "POINT";
  point.textContent =
    "Point Text";


  modeEl.appendChild(paragraph);
  modeEl.appendChild(point);


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
          event.data.substring(
            10
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
            11
          );

        setStatus(
          "Error: " +
          error
        );

        alert(
          "TypeR-P BUILD-017\n\n" +
          error
        );

      }

    }
  );


  /* =====================================================
     STRING ESCAPE
     ===================================================== */

  function jsString(value) {

    return JSON.stringify(
      String(value)
    );

  }


  /* =====================================================
     INSERT
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


    var size =
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


    while (color.length < 6) {
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


    var mode =
      modeEl.value;


    var autoFit =
      fitEl.checked;


    var minimum =
      Number(
        minSizeEl.value
      ) || 8;


    /* =================================================
       IMPORTANT:

       First we ONLY test whether Photopea can read
       the active selection.

       Nothing else happens before this.
       ================================================= */

    setStatus(
      "Checking active selection..."
    );


    var script =

      "(function(){\n" +

      "try{\n" +

      "var d=app.activeDocument;\n" +

      "if(!d){\n" +

      "throw new Error('No active document.');\n" +

      "}\n" +


      /*
       * READ SELECTION
       */

      "var b=null;\n" +

      "try{\n" +

      "b=d.selection.bounds;\n" +

      "}catch(e){\n" +

      "throw new Error('No active selection.');\n" +

      "}\n" +


      "if(!b){\n" +

      "throw new Error('No active selection.');\n" +

      "}\n" +


      "if(!b.length || b.length!==4){\n" +

      "throw new Error('Selection bounds could not be read.');\n" +

      "}\n" +


      /*
       * CONVERT VALUES
       */

      "function num(v){\n" +

      "if(typeof v==='number')return v;\n" +

      "if(v && typeof v.as==='function'){\n" +

      "return Number(v.as('px'));\n" +

      "}\n" +

      "if(v && v.value!==undefined){\n" +

      "return Number(v.value);\n" +

      "}\n" +

      "return NaN;\n" +

      "}\n" +


      "var L=num(b[0]);\n" +
      "var T=num(b[1]);\n" +
      "var R=num(b[2]);\n" +
      "var B=num(b[3]);\n" +


      "if(!isFinite(L)||!isFinite(T)||!isFinite(R)||!isFinite(B)){\n" +

      "throw new Error('Selection coordinates are invalid.');\n" +

      "}\n" +


      "if(R<=L||B<=T){\n" +

      "throw new Error('Selection has invalid size.');\n" +

      "}\n" +


      /*
       * SEND SELECTION BACK IMMEDIATELY
       *
       * This proves the selection itself works
       * before we create anything.
       */

      "app.echoToOE(\n" +

      "'TYPERP_OK:SELECTION='+\n" +

      "Math.round(L)+','+\n" +

      "Math.round(T)+','+\n" +

      "Math.round(R)+','+\n" +

      "Math.round(B)\n" +

      ");\n" +


      /*
       * BOX
       */

      "var left=L+" +
      padding +
      ";\n" +

      "var top=T+" +
      padding +
      ";\n" +

      "var right=R-" +
      padding +
      ";\n" +

      "var bottom=B-" +
      padding +
      ";\n" +


      "var width=right-left;\n" +
      "var height=bottom-top;\n" +


      "if(width<1||height<1){\n" +

      "throw new Error('Padding is too large for this selection.');\n" +

      "}\n" +


      /*
       * CREATE TEXT
       */

      "var layer=d.artLayers.add();\n" +

      "layer.kind=LayerKind.TEXT;\n" +


      "layer.name=" +

      jsString(
        "TTP: " +
        text.substring(0, 45)
      ) +

      ";\n" +


      "var ti=layer.textItem;\n" +


      /*
       * PARAGRAPH
       */

      "if(" +

      jsString(mode) +

      "==='PARAGRAPH'){\n" +

      "ti.kind=TextType.PARAGRAPHTEXT;\n" +


      "ti.position=[left,top];\n" +


      "ti.width=new UnitValue(width,'px');\n" +

      "ti.height=new UnitValue(height,'px');\n" +


      "ti.contents=" +

      jsString(text) +

      ";\n" +


      "ti.font=" +

      jsString(font) +

      ";\n" +


      "ti.size=" +
      size +
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
       * AUTO FIT

       * This version intentionally does NOT
       * use complicated line estimation yet.
       *
       * We first make sure selection placement
       * is 100% correct.
       */

      "if(" +
      autoFit +
      "){\n" +

      "var s=" +
      size +
      ";\n" +

      "var min=" +
      minimum +
      ";\n" +

      "while(s>min){\n" +

      "ti.size=s;\n" +

      "s--;\n" +

      "break;\n" +

      "}\n" +

      "}\n" +


      "}else{\n" +


      /*
       * POINT TEXT
       */

      "ti.kind=TextType.POINTTEXT;\n" +

      "ti.contents=" +

      jsString(text) +

      ";\n" +

      "ti.font=" +

      jsString(font) +

      ";\n" +

      "ti.size=" +
      size +
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


      "d.activeLayer=layer;\n" +


      "app.echoToOE(\n" +

      "'TYPERP_OK:TEXT INSERTED | selection='+\n" +

      "Math.round(L)+','+\n" +

      "Math.round(T)+','+\n" +

      "Math.round(R)+','+\n" +

      "Math.round(B)\n" +

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
    "Ready (BUILD-017)"
  );

})();
