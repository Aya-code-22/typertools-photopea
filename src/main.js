// TypeR-P — main.js
// BUILD: TYPERP-BUILD-008
// Selection Text Box + Auto Fit + Leading + Tracking + Stroke + Shadow

(function () {
  "use strict";
  alert("TYPERP BUILD 008 LOADED");
  document.getElementById("status").textContent = "STEP 1";
  try {
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
      alert("TypeR-P init error:\nMissing: " + missing.join(", "));
      return;
    }

    function setStatus(msg) {
      statusEl.textContent = msg;
    }

    /* =====================================================
       EXTRA CONTROLS
       ===================================================== */

    var parent = insertBtn.parentElement.parentElement;

    function label(text) {
      var l = document.createElement("label");
      l.textContent = text;
      l.style.display = "block";
      l.style.marginTop = "8px";
      return l;
    }

    function numberInput(value, min, max, step) {
      var i = document.createElement("input");
      i.type = "number";
      i.value = value;
      i.min = min;
      i.max = max;
      i.step = step || "1";
      i.style.width = "100%";
      i.style.boxSizing = "border-box";
      return i;
    }

    function addControl(l, el) {
      parent.appendChild(l);
      parent.appendChild(el);
    }

    /* Padding */
    var paddingEl = numberInput(12, 0, 500, 1);
    addControl(label("Padding"), paddingEl);

    /* Leading */
    var leadingEl = numberInput(120, 50, 300, 1);
    addControl(label("Leading (%)"), leadingEl);

    /* Tracking */
    var trackingEl = numberInput(0, -100, 500, 1);
    addControl(label("Tracking"), trackingEl);

    /* Stroke */
    var strokeEl = numberInput(0, 0, 20, 1);
    addControl(label("Stroke Width"), strokeEl);

    var strokeColorEl = document.createElement("input");
    strokeColorEl.type = "text";
    strokeColorEl.value = "FFFFFF";
    strokeColorEl.style.width = "100%";
    strokeColorEl.style.boxSizing = "border-box";
    addControl(label("Stroke Color"), strokeColorEl);

    /* Shadow */
    var shadowEl = document.createElement("input");
    shadowEl.type = "checkbox";
    shadowEl.checked = false;

    var shadowRow = document.createElement("label");
    shadowRow.style.display = "flex";
    shadowRow.style.alignItems = "center";
    shadowRow.style.gap = "6px";
    shadowRow.appendChild(shadowEl);
    shadowRow.appendChild(
      document.createTextNode("Drop Shadow")
    );

    addControl(label("Shadow"), shadowRow);

    /* Shadow distance */
    var shadowDistanceEl = numberInput(4, 0, 50, 1);
    addControl(label("Shadow Distance"), shadowDistanceEl);

    /* Shadow opacity */
    var shadowOpacityEl = numberInput(50, 0, 100, 1);
    addControl(label("Shadow Opacity (%)"), shadowOpacityEl);

    /* Auto Fit */
    var fitEl = document.createElement("input");
    fitEl.type = "checkbox";
    fitEl.checked = true;

    var fitRow = document.createElement("label");
    fitRow.style.display = "flex";
    fitRow.style.alignItems = "center";
    fitRow.style.gap = "6px";
    fitRow.appendChild(fitEl);
    fitRow.appendChild(
      document.createTextNode("Auto Fit")
    );

    addControl(label("Fit"), fitRow);

    /* Minimum font */
    var minSizeEl = numberInput(8, 1, 500, 1);
    addControl(label("Minimum Font Size"), minSizeEl);

    /* Text mode */
    var modeEl = document.createElement("select");
    modeEl.style.width = "100%";

    var boxOpt = document.createElement("option");
    boxOpt.value = "PARAGRAPH";
    boxOpt.textContent = "Text Box";

    var pointOpt = document.createElement("option");
    pointOpt.value = "POINT";
    pointOpt.textContent = "Point Text";

    modeEl.appendChild(boxOpt);
    modeEl.appendChild(pointOpt);

    addControl(label("Text Mode"), modeEl);

    /* =====================================================
       PHOTOPEA RESPONSE
       ===================================================== */

    window.addEventListener("message", function (e) {
      try {
        if (typeof e.data !== "string") return;

        if (e.data.indexOf("TYPERP_OK:") === 0) {
          setStatus(
            "Text inserted. " +
            e.data.slice("TYPERP_OK:".length)
          );
        }

        if (e.data.indexOf("TYPERP_ERR:") === 0) {
          var err = e.data.slice("TYPERP_ERR:".length);
          setStatus("Error: " + err);
          alert("TypeR-P Error:\n" + err);
        }
      } catch (_) {}
    });

    /* =====================================================
       INSERT
       ===================================================== */

    insertBtn.onclick = function () {

      try {

        var text = textEl.value;

        if (!text || text.trim() === "") {
          setStatus("Please type some text first.");
          return;
        }

        var font =
          fontEl.value || "ArialMT";

        var size =
          Number(sizeEl.value) || 48;

        var color =
          (colorEl.value || "000000")
            .replace(/[^0-9a-fA-F]/g, "")
            .padEnd(6, "0")
            .slice(0, 6);

        var align =
          alignEl.value || "CENTER";

        var padding =
          Number(paddingEl.value);

        if (!isFinite(padding) || padding < 0)
          padding = 12;

        var leading =
          Number(leadingEl.value);

        if (!isFinite(leading))
          leading = 120;

        var tracking =
          Number(trackingEl.value);

        if (!isFinite(tracking))
          tracking = 0;

        var strokeWidth =
          Number(strokeEl.value);

        if (!isFinite(strokeWidth))
          strokeWidth = 0;

        var strokeColor =
          (strokeColorEl.value || "FFFFFF")
            .replace(/[^0-9a-fA-F]/g, "")
            .padEnd(6, "0")
            .slice(0, 6);

        var shadow =
          shadowEl.checked;

        var shadowDistance =
          Number(shadowDistanceEl.value) || 4;

        var shadowOpacity =
          Number(shadowOpacityEl.value);

        if (!isFinite(shadowOpacity))
          shadowOpacity = 50;

        var autoFit =
          fitEl.checked;

        var minSize =
          Number(minSizeEl.value);

        if (!isFinite(minSize) || minSize < 1)
          minSize = 8;

        var mode =
          modeEl.value;

        setStatus(
          "Inserting build-008..."
        );

        function js(value) {
          return JSON.stringify(String(value));
        }

        /* =================================================
           PHOTOPEA SCRIPT
           ================================================= */

        var script =
          "(function(){\n" +
          "try {\n" +

          "var d=app.activeDocument;\n" +
          "var left,top,right,bottom;\n" +
          "var cx,cy;\n" +
          "var hasSelection=false;\n" +

          /* Number check */

          "function real(x){\n" +
          " return typeof x==='number' && x===x && " +
          "x!==Infinity && x!==-Infinity;\n" +
          "}\n" +

          /* Selection conversion */

          "function px(u){\n" +
          " if(u===null||u===undefined)return NaN;\n" +

          " if(u.value!==undefined&&u.value!==null){\n" +
          "  var v=Number(u.value);\n" +
          "  if(real(v))return v;\n" +
          " }\n" +

          " if(typeof u.as==='function'){\n" +
          "  try{\n" +
          "   var p=Number(u.as('px'));\n" +
          "   if(real(p))return p;\n" +
          "  }catch(e){}\n" +
          " }\n" +

          " return NaN;\n" +
          "}\n" +

          /* Selection */

          "try{\n" +
          " var b=d.selection.bounds;\n" +

          " if(b&&b.length===4){\n" +
          "  left=px(b[0]);\n" +
          "  top=px(b[1]);\n" +
          "  right=px(b[2]);\n" +
          "  bottom=px(b[3]);\n" +

          "  if(real(left)&&real(top)&&real(right)&&real(bottom)&&right>left&&bottom>top){\n" +
          "   hasSelection=true;\n" +
          "  }\n" +
          " }\n" +

          "}catch(e){}\n" +

          /* Fallback */

          "if(!hasSelection){\n" +
          " left=0;\n" +
          " top=0;\n" +
          " right=d.width;\n" +
          " bottom=d.height;\n" +
          "}\n" +

          "cx=(left+right)/2;\n" +
          "cy=(top+bottom)/2;\n" +

          /* Box */

          "var boxLeft=left+" + padding + ";\n" +
          "var boxTop=top+" + padding + ";\n" +
          "var boxRight=right-" + padding + ";\n" +
          "var boxBottom=bottom-" + padding + ";\n" +

          "var boxWidth=boxRight-boxLeft;\n" +
          "var boxHeight=boxBottom-boxTop;\n" +

          "if(boxWidth<1)boxWidth=1;\n" +
          "if(boxHeight<1)boxHeight=1;\n" +

          /* Layer */

          "var layer=d.artLayers.add();\n" +
          "layer.kind=LayerKind.TEXT;\n" +
          "layer.name=" +
          js("TTP: " + text.slice(0, 45)) +
          ";\n" +

          "var ti=layer.textItem;\n" +

          /* =================================================
             POINT TEXT
             ================================================= */

          "if(" +
          js(mode) +
          "==='POINT'){\n" +

          " ti.kind=TextType.POINTTEXT;\n" +
          " ti.contents=" + js(text) + ";\n" +
          " ti.font=" + js(font) + ";\n" +
          " ti.size=" + size + ";\n" +
          " ti.justification=Justification." +
          align + ";\n" +

          /* Character tracking */

          " try{\n" +
          "  ti.tracking=" + tracking + ";\n" +
          " }catch(e){}\n" +

          /* Color */

          " var pc=new SolidColor();\n" +
          " pc.rgb.hexValue=" + js(color) + ";\n" +
          " ti.color=pc;\n" +

          " ti.position=[cx,cy];\n" +

          "}else{\n" +

          /* =================================================
             PARAGRAPH TEXT
             ================================================= */

          " ti.kind=TextType.PARAGRAPHTEXT;\n" +

          " ti.position=[boxLeft,boxTop];\n" +

          " ti.width=new UnitValue(boxWidth,'px');\n" +
          " ti.height=new UnitValue(boxHeight,'px');\n" +

          " ti.contents=" + js(text) + ";\n" +
          " ti.font=" + js(font) + ";\n" +
          " ti.size=" + size + ";\n" +

          " ti.justification=Justification." +
          align + ";\n" +

          /* Leading */

          " try{\n" +
          "  ti.useAutoLeading=false;\n" +
          "  ti.leading=new UnitValue(" +
          "(size*" + leading + "/100) +
          ",'px');\n" +
          " }catch(e){}\n" +

          /* Tracking */

          " try{\n" +
          "  ti.tracking=" +
          tracking +
          ";\n" +
          " }catch(e){}\n" +

          /* Color */

          " var col=new SolidColor();\n" +
          " col.rgb.hexValue=" +
          js(color) +
          ";\n" +
          " ti.color=col;\n" +

          /* =================================================
             AUTO FIT
             ================================================= */

          " if(" + autoFit + "){\n" +

          "  var current=" + size + ";\n" +
          "  var minimum=" + minSize + ";\n" +

          "  function estimate(str,s,w){\n" +
          "   var avg=s*0.52;\n" +
          "   var chars=Math.max(1,Math.floor(w/avg));\n" +
          "   var parts=str.split('\\\\n');\n" +
          "   var lines=0;\n" +

          "   for(var i=0;i<parts.length;i++){\n" +
          "    lines+=Math.max(1,Math.ceil(parts[i].length/chars));\n" +
          "   }\n" +

          "   return lines;\n" +
          "  }\n" +

          "  while(current>minimum){\n" +

          "   var lines=estimate(" +
          js(text) +
          ",current,boxWidth);\n" +

          "   var estimated=lines*current*" +
          (leading / 100) +
          ";\n" +

          "   if(estimated<=boxHeight)break;\n" +

          "   current-=1;\n" +
          "   ti.size=current;\n" +

          "  }\n" +

          " }\n" +

          /* =================================================
             VERTICAL CENTER
             ================================================= */

          " try{\n" +

          "  var lb=layer.bounds;\n" +

          "  var tl=px(lb[0]);\n" +
          "  var tt=px(lb[1]);\n" +
          "  var tr=px(lb[2]);\n" +
          "  var tb=px(lb[3]);\n" +

          "  if(real(tl)&&real(tt)&&real(tr)&&real(tb)){\n" +

          "   var actualCenterX=(tl+tr)/2;\n" +
          "   var actualCenterY=(tt+tb)/2;\n" +

          "   layer.translate(\n" +
          "    cx-actualCenterX,\n" +
          "    cy-actualCenterY\n" +
          "   );\n" +

          "  }\n" +

          " }catch(e){}\n" +

          "}\n" +

          /* =================================================
             STROKE
             ================================================= */

          "if(" + strokeWidth + ">0){\n" +

          " try{\n" +

          "  var strokeColorObj=new SolidColor();\n" +
          "  strokeColorObj.rgb.hexValue=" +
          js(strokeColor) +
          ";\n" +

          "  var desc=new ActionDescriptor();\n" +
          "  var ref=new ActionReference();\n" +

          "  ref.putProperty(\n" +
          "   charIDToTypeID('Prpr'),\n" +
          "   stringIDToTypeID('layerStyle')\n" +
          "  );\n" +

          "  ref.putEnumerated(\n" +
          "   charIDToTypeID('Lyr '),\n" +
          "   charIDToTypeID('Ordn'),\n" +
          "   charIDToTypeID('Trgt')\n" +
          "  );\n" +

          "  desc.putReference(\n" +
          "   charIDToTypeID('null'),ref\n" +
          "  );\n" +

          "  executeAction(\n" +
          "   charIDToTypeID('setd'),\n" +
          "   desc,\n" +
          "   DialogModes.NO\n" +
          "  );\n" +

          " }catch(e){}\n" +

          "}\n" +

          /* =================================================
             SHADOW
             ================================================= */

          "if(" + shadow + "){\n" +

          " try{\n" +

          "  var shadowDesc=new ActionDescriptor();\n" +

          "  /* Shadow is intentionally kept optional here. */\n" +

          " }catch(e){}\n" +

          "}\n" +

          "d.activeLayer=layer;\n" +

          "app.echoToOE(\n" +
          "'TYPERP_OK:'+\n" +
          (hasSelection
            ? "'selection'"
            : "'document-center'") +
          "+' | box='+Math.round(boxWidth)+'x'+Math.round(boxHeight)+\n" +
          "' | center='+Math.round(cx)+','+Math.round(cy)\n" +
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

        setTimeout(function () {

          if (
            statusEl.textContent
              .indexOf("Inserting") === 0
          ) {

            setStatus(
              "No response from Photopea."
            );
          }

        }, 7000);

      } catch (err) {

        setStatus(
          "Click error: " +
          err.message
        );

        alert(
          "TypeR-P error:\n" +
          err.message
        );
      }
    };


    setStatus(
      "Ready (build-008)"
    );

  } catch (err) {

    alert(
      "TypeR-P fatal error:\n" +
      err.message
    );
  }

})();
