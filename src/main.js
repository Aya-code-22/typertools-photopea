// TypeR-P — main.js
// BUILD: TYPERP-BUILD-016
//
// Full Text -> Load Lines -> Current Line
// Previous / Next
// Selection-aware Paragraph Text
// NO selection fallback
// Padding
// Auto Fit
// Minimum Font Size
// Text Mode
// Saved Styles

(function () {

  "use strict";


  /* =====================================================
     STARTUP
     ===================================================== */

  function startTypeRP() {

    try {

      /* =================================================
         UI ELEMENTS
         ================================================= */

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


      /* =================================================
         REQUIRED ELEMENT CHECK
         ================================================= */

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
          "TypeR-P BUILD-016\n\n" +
          "Missing:\n\n" +
          missing.join("\n")
        );

        return;

      }


      /* =================================================
         STATUS
         ================================================= */

      function setStatus(msg) {

        statusEl.textContent =
          msg;

      }


      /* =================================================
         LINE SYSTEM
         ================================================= */

      var loadedLines = [];

      var currentLineIndex = 0;


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


      function saveCurrentLine() {

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


      /* =================================================
         LOAD LINES
         ================================================= */

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
                "Please enter the full text first."
              );

              return;

            }


            /*
             * Normalize line endings.
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
             * IMPORTANT:
             *
             * Only REAL new lines are split.
             *
             * Spaces between words stay intact.
             */

            loadedLines =
              raw.split("\n");


            /*
             * Remove empty lines at the end.
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
              "LOAD LINES ERROR:\n" +
              e.message
            );

          }

        };


      /* =================================================
         CURRENT LINE EDIT
         ================================================= */

      currentLineEl.addEventListener(
        "input",
        function () {

          saveCurrentLine();

        }
      );


      /* =================================================
         PREVIOUS
         ================================================= */

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


          saveCurrentLine();


          if (
            currentLineIndex > 0
          ) {

            currentLineIndex--;

          }


          showCurrentLine();

        };


      /* =================================================
         NEXT
         ================================================= */

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


          saveCurrentLine();


          if (
            currentLineIndex <
            loadedLines.length - 1
          ) {

            currentLineIndex++;

          }


          showCurrentLine();

        };


      /* =================================================
         ADD EXTRA CONTROLS
         ================================================= */

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


      /* =================================================
         PADDING
         ================================================= */

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


      /* =================================================
         AUTO FIT
         ================================================= */

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


      /* =================================================
         MINIMUM FONT SIZE
         ================================================= */

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


      /* =================================================
         TEXT MODE
         ================================================= */

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


      /* =================================================
         SAVED STYLES
         ================================================= */

      var STYLES_KEY =
        "typerp_styles_v1";


      var memoryStyles = {};


      function loadStyles() {

        try {

          var raw =
            localStorage.getItem(
              STYLES_KEY
            );


          if (!raw)
            return {};


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


      function refreshStyleSelect(
        selectedName
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


        if (
          names.length === 0
        ) {

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

          var option =
            document.createElement(
              "option"
            );


          option.value =
            names[i];


          option.textContent =
            names[i];


          styleSelectEl.appendChild(
            option
          );

        }


        if (
          selectedName &&
          styles[selectedName]
        ) {

          styleSelectEl.value =
            selectedName;

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
            modeEl.value

        };

      }


      function applySettingsSnapshot(s) {

        if (!s)
          return;


        if (s.font !== undefined)
          fontEl.value = s.font;


        if (s.size !== undefined)
          sizeEl.value = s.size;


        if (s.color !== undefined)
          colorEl.value = s.color;


        if (s.align !== undefined)
          alignEl.value = s.align;


        if (s.padding !== undefined)
          paddingEl.value = s.padding;


        if (s.minSize !== undefined)
          minSizeEl.value = s.minSize;


        if (s.autoFit !== undefined)
          fitEl.checked = !!s.autoFit;


        if (s.mode !== undefined)
          modeEl.value = s.mode;

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


          if (!styles[name]) {

            setStatus(
              "Style not found."
            );

            return;

          }


          applySettingsSnapshot(
            styles[name]
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


      /* =================================================
         PHOTOPEA MESSAGE LISTENER
         ================================================= */

      window.addEventListener(
        "message",
        function (e) {

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

            setStatus(
              "Text inserted. " +
              e.data.slice(
                "TYPERP_OK:".length
              )
            );

            return;

          }


          if (
            e.data.indexOf(
              "TYPERP_ERR:"
            ) === 0
          ) {

            var errorText =
              e.data.slice(
                "TYPERP_ERR:".length
              );


            setStatus(
              "Error: " +
              errorText
            );


            alert(
              "TypeR-P Error:\n\n" +
              errorText
            );

          }

        }
      );


      /* =================================================
         SAFE STRING
         ================================================= */

      function jsString(value) {

        return JSON.stringify(
          String(value)
        );

      }


      /* =================================================
         INSERT TEXT
         ================================================= */

      function insertText(text) {

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


        /*
         * IMPORTANT:
         *
         * We no longer allow a document-center fallback.
         */

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
           * SELECTION
           * -------------------------------------------------
           */

          "var b;\n" +

          "try{\n" +

          "b=d.selection.bounds;\n" +

          "}catch(selectionError){\n" +

          "throw new Error('No active selection. Please make a rectangular selection first.');\n" +

          "}\n" +


          "if(!b||b.length!==4){\n" +

          "throw new Error('No active selection. Please make a rectangular selection first.');\n" +

          "}\n" +


          /*
           * Convert Photopea UnitValue safely.
           */

          "function px(v){\n" +

          "try{\n" +

          "if(v===null||v===undefined)return NaN;\n" +

          "if(typeof v==='number')return v;\n" +

          "if(v.as){\n" +

          "var a=Number(v.as('px'));\n" +

          "if(isFinite(a))return a;\n" +

          "}\n" +

          "if(v.value!==undefined){\n" +

          "var n=Number(v.value);\n" +

          "if(isFinite(n))return n;\n" +

          "}\n" +

          "}catch(e){}\n" +

          "return NaN;\n" +

          "}\n" +


          "var left=px(b[0]);\n" +

          "var top=px(b[1]);\n" +

          "var right=px(b[2]);\n" +

          "var bottom=px(b[3]);\n" +


          "if(!isFinite(left)||!isFinite(top)||!isFinite(right)||!isFinite(bottom)){\n" +

          "throw new Error('Could not read the selection coordinates.');\n" +

          "}\n" +


          "if(right<=left||bottom<=top){\n" +

          "throw new Error('The active selection has invalid dimensions.');\n" +

          "}\n" +


          /*
           * -------------------------------------------------
           * BOX
           * -------------------------------------------------
           */

          "var boxLeft=left+" +
          padding +
          ";\n" +

          "var boxTop=top+" +
          padding +
          ";\n" +

          "var boxRight=right-" +
          padding +
          ";\n" +

          "var boxBottom=bottom-" +
          padding +
          ";\n" +


          "var boxWidth=boxRight-boxLeft;\n" +

          "var boxHeight=boxBottom-boxTop;\n" +


          "if(boxWidth<1||boxHeight<1){\n" +

          "throw new Error('Padding is larger than the selected area.');\n" +

          "}\n" +


          /*
           * -------------------------------------------------
           * CREATE TEXT LAYER
           * -------------------------------------------------
           */

          "var layer=d.artLayers.add();\n" +

          "layer.kind=LayerKind.TEXT;\n" +

          "layer.name=" +

          jsString(
            "TTP: " +
            text.slice(0,45)
          ) +

          ";\n" +


          "var ti=layer.textItem;\n" +


          /*
           * -------------------------------------------------
           * POINT TEXT
           * -------------------------------------------------
           */

          "if(" +

          jsString(mode) +

          "==='POINT'){\n" +

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


          "var pointColor=new SolidColor();\n" +

          "pointColor.rgb.hexValue=" +

          jsString(color) +

          ";\n" +

          "ti.color=pointColor;\n" +


          /*
           * Point text uses selection center.
           */

          "ti.position=[\n" +

          "(left+right)/2,\n" +

          "(top+bottom)/2\n" +

          "];\n" +


          "}else{\n" +


          /*
           * -------------------------------------------------
           * PARAGRAPH TEXT
           * -------------------------------------------------
           *
           * The text box itself is the selection rectangle.
           */

          "ti.kind=TextType.PARAGRAPHTEXT;\n" +


          "ti.position=[\n" +

          "boxLeft,\n" +

          "boxTop\n" +

          "];\n" +


          "ti.width=new UnitValue(\n" +

          "boxWidth,\n" +

          "'px'\n" +

          ");\n" +


          "ti.height=new UnitValue(\n" +

          "boxHeight,\n" +

          "'px'\n" +

          ");\n" +


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


          "var paragraphColor=new SolidColor();\n" +

          "paragraphColor.rgb.hexValue=" +

          jsString(color) +

          ";\n" +


          "ti.color=paragraphColor;\n" +


          /*
           * -------------------------------------------------
           * AUTO FIT
           * -------------------------------------------------
           */

          "if(" +

          autoFit +

          "){\n" +

          "var currentSize=" +

          initialSize +

          ";\n" +

          "var minimum=" +

          minSize +

          ";\n" +


          /*
           * Estimate wrapping by words.
           *
           * This is only used to select an initial font size.
           * Actual wrapping is still performed by Photopea.
           */

          "function estimateLines(str,size,width){\n" +

          "var avgCharWidth=size*0.52;\n" +

          "var maxChars=Math.max(1,Math.floor(width/avgCharWidth));\n" +

          "var paragraphs=str.split(String.fromCharCode(10));\n" +

          "var total=0;\n" +


          "for(var p=0;p<paragraphs.length;p++){\n" +

          "var words=paragraphs[p].split(/\\s+/);\n" +

          "var chars=0;\n" +

          "var lines=1;\n" +


          "for(var w=0;w<words.length;w++){\n" +

          "var word=words[w];\n" +

          "if(!word)continue;\n" +


          "var len=word.length;\n" +


          "if(len>maxChars){\n" +

          "if(chars>0){\n" +

          "lines++;\n" +

          "chars=0;\n" +

          "}\n" +

          "lines+=Math.ceil(len/maxChars)-1;\n" +

          "chars=len%maxChars;\n" +

          "if(chars===0)chars=maxChars;\n" +

          "}else{\n" +

          "var needed=len+(chars>0?1:0);\n" +

          "if(chars+needed>maxChars){\n" +

          "lines++;\n" +

          "chars=len;\n" +

          "}else{\n" +

          "chars+=needed;\n" +

          "}\n" +

          "}\n" +

          "}\n" +


          "total+=lines;\n" +

          "}\n" +


          "return Math.max(1,total);\n" +

          "}\n" +


          "while(currentSize>minimum){\n" +

          "var estimatedLines=estimateLines(\n" +

          jsString(text) +

          ",\n" +

          "currentSize,\n" +

          "boxWidth\n" +

          ");\n" +


          "var estimatedHeight=\n" +

          "estimatedLines*\n" +

          "currentSize*\n" +

          "1.20;\n" +


          "if(estimatedHeight<=boxHeight){\n" +

          "break;\n" +

          "}\n" +


          "currentSize--;\n" +

          "ti.size=currentSize;\n" +

          "}\n" +

          "}\n" +


          /*
           * -------------------------------------------------
           * FINISH
           * -------------------------------------------------
           */

          "d.activeLayer=layer;\n" +


          "app.echoToOE(\n" +

          "'TYPERP_OK:'+\n" +

          "'selection='+\n" +

          "Math.round(left)+','+\n" +

          "Math.round(top)+','+\n" +

          "Math.round(right)+','+\n" +

          "Math.round(bottom)+\n" +

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


        /*
         * Send script to Photopea.
         */

        window.parent.postMessage(
          script,
          "*"
        );

      }


      /* =================================================
         INSERT LINE
         ================================================= */

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


          saveCurrentLine();


          var text =
            loadedLines[
              currentLineIndex
            ];


          insertText(
            text
          );

        };


      /* =================================================
         READY
         ================================================= */

      setStatus(
        "Ready (BUILD-016)"
      );


    } catch (e) {

      alert(
        "TypeR-P BUILD-016 ERROR:\n\n" +
        e.message
      );

    }

  }


  /* =====================================================
     DOM READY
     ===================================================== */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      startTypeRP
    );

  } else {

    startTypeRP();

  }


})();
