// TypeR-P â€” main.js
// BUILD: TYPERP-BUILD-019
//
// Ø§Ø¶Ø§ÙÙ‡â€ŒØ´Ø¯Ù‡ Ù†Ø³Ø¨Øª Ø¨Ù‡ build-018:
//   - Character Spacing (ti.tracking)
//   - Line Spacing (ti.leading, Ø¨Ø§ autoLeading=false)
//   - Word Spacing (Ø´Ø¨ÛŒÙ‡â€ŒØ³Ø§Ø²ÛŒ Ø¨Ø§ ØªØ²Ø±ÛŒÙ‚ space Ø§Ø¶Ø§ÙÙ‡ Ø¨ÛŒÙ† Ú©Ù„Ù…Ø§Øª)
//   - Vertical Alignment: Top / Center / Bottom (Ù…Ø­Ø§Ø³Ø¨Ù‡ Ø¯Ø³ØªÛŒ Ø¨Ø¹Ø¯ Ø§Ø² Auto Fit)

(function () {

  "use strict";

  /* =====================================================
     UI - Ø¹Ù†Ø§ØµØ± Ù…ÙˆØ¬ÙˆØ¯
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

  var required = [
    ["#status", statusEl], ["#fullText", fullTextEl], ["#loadLines", loadLinesBtn],
    ["#currentLine", currentLineEl], ["#lineInfo", lineInfoEl], ["#previousLine", previousLineBtn],
    ["#nextLine", nextLineBtn], ["#insertLine", insertLineBtn], ["#font", fontEl],
    ["#size", sizeEl], ["#color", colorEl], ["#align", alignEl]
  ];

  var missing = [];
  for (var i = 0; i < required.length; i++) {
    if (!required[i][1]) missing.push(required[i][0]);
  }

  if (missing.length) {
    alert("TypeR-P BUILD-019 UI ERROR\n\nMissing:\n" + missing.join("\n"));
    return;
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  /* =====================================================
     LINE SYSTEM (Ø¨Ø¯ÙˆÙ† ØªØºÛŒÛŒØ± Ù†Ø³Ø¨Øª Ø¨Ù‡ build-018)
     ===================================================== */

  var lines = [];
  var currentIndex = 0;

  function updateLine() {
    if (!lines.length) {
      currentLineEl.value = "";
      lineInfoEl.textContent = "No lines loaded.";
      return;
    }
    currentLineEl.value = lines[currentIndex];
    lineInfoEl.textContent = "Line " + (currentIndex + 1) + " / " + lines.length;
  }

  function saveCurrentLine() {
    if (!lines.length) return;
    lines[currentIndex] = currentLineEl.value;
  }

  loadLinesBtn.onclick = function () {
    var text = fullTextEl.value || "";
    if (!text.trim()) {
      lines = [];
      currentIndex = 0;
      updateLine();
      setStatus("Please enter the full text first.");
      return;
    }
    text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    lines = text.split("\n");
    while (lines.length > 0 && lines[lines.length - 1].trim() === "") lines.pop();
    currentIndex = 0;
    updateLine();
    setStatus("Loaded " + lines.length + " line(s).");
  };

  currentLineEl.addEventListener("input", function () { saveCurrentLine(); });

  previousLineBtn.onclick = function () {
    if (!lines.length) { setStatus("Load lines first."); return; }
    saveCurrentLine();
    if (currentIndex > 0) currentIndex--;
    updateLine();
  };

  nextLineBtn.onclick = function () {
    if (!lines.length) { setStatus("Load lines first."); return; }
    saveCurrentLine();
    if (currentIndex < lines.length - 1) currentIndex++;
    updateLine();
  };

  /* =====================================================
     EXTRA SETTINGS
     ===================================================== */

  var settingsPanel = fontEl.closest(".panel");
  if (!settingsPanel) settingsPanel = fontEl.parentElement;

  function makeLabel(text) {
    var label = document.createElement("label");
    label.textContent = text;
    label.style.display = "block";
    label.style.marginTop = "8px";
    return label;
  }

  function makeNumber(value, min, max) {
    var input = document.createElement("input");
    input.type = "number";
    input.value = value;
    input.min = min;
    input.max = max;
    input.step = "1";
    input.style.width = "100%";
    input.style.boxSizing = "border-box";
    return input;
  }

  // Padding
  settingsPanel.appendChild(makeLabel("Padding"));
  var paddingEl = makeNumber(12, 0, 500);
  settingsPanel.appendChild(paddingEl);

  // Auto Fit
  settingsPanel.appendChild(makeLabel("Auto Fit"));
  var fitRow = document.createElement("label");
  fitRow.style.display = "flex";
  fitRow.style.alignItems = "center";
  fitRow.style.gap = "6px";
  var fitEl = document.createElement("input");
  fitEl.type = "checkbox";
  fitEl.checked = true;
  fitRow.appendChild(fitEl);
  fitRow.appendChild(document.createTextNode("Automatically reduce font size"));
  settingsPanel.appendChild(fitRow);

  // Minimum Font Size
  settingsPanel.appendChild(makeLabel("Minimum Font Size"));
  var minSizeEl = makeNumber(8, 1, 500);
  settingsPanel.appendChild(minSizeEl);

  // Text Mode
  settingsPanel.appendChild(makeLabel("Text Mode"));
  var modeEl = document.createElement("select");
  modeEl.style.width = "100%";
  var paragraphOption = document.createElement("option");
  paragraphOption.value = "PARAGRAPH";
  paragraphOption.textContent = "Text Box (recommended)";
  var pointOption = document.createElement("option");
  pointOption.value = "POINT";
  pointOption.textContent = "Point Text";
  modeEl.appendChild(paragraphOption);
  modeEl.appendChild(pointOption);
  settingsPanel.appendChild(modeEl);

  // --- Ø¬Ø¯ÛŒØ¯: Line Spacing ---
  settingsPanel.appendChild(makeLabel("Line Spacing (px, 0 = auto)"));
  var lineSpacingEl = makeNumber(0, 0, 1000);
  settingsPanel.appendChild(lineSpacingEl);

  // --- Ø¬Ø¯ÛŒØ¯: Character Spacing (Tracking) ---
  settingsPanel.appendChild(makeLabel("Character Spacing (Tracking)"));
  var charSpacingEl = makeNumber(0, -1000, 1000);
  settingsPanel.appendChild(charSpacingEl);

  // --- Ø¬Ø¯ÛŒØ¯: Word Spacing (Ø´Ø¨ÛŒÙ‡â€ŒØ³Ø§Ø²ÛŒâ€ŒØ´Ø¯Ù‡) ---
  settingsPanel.appendChild(makeLabel("Word Spacing (extra spaces)"));
  var wordSpacingEl = makeNumber(0, 0, 20);
  settingsPanel.appendChild(wordSpacingEl);

  // --- Ø¬Ø¯ÛŒØ¯: Vertical Alignment ---
  settingsPanel.appendChild(makeLabel("Vertical Alignment"));
  var vAlignEl = document.createElement("select");
  vAlignEl.style.width = "100%";
  [["TOP", "Top"], ["MIDDLE", "Center"], ["BOTTOM", "Bottom"]].forEach(function (pair) {
    var opt = document.createElement("option");
    opt.value = pair[0];
    opt.textContent = pair[1];
    if (pair[0] === "MIDDLE") opt.selected = true;
    vAlignEl.appendChild(opt);
  });
  settingsPanel.appendChild(vAlignEl);

  /* =====================================================
     PHOTOPEA MESSAGE LISTENER
     ===================================================== */

  window.addEventListener("message", function (event) {
    if (typeof event.data !== "string") return;

    if (event.data.indexOf("TYPERP_OK:") === 0) {
      setStatus(event.data.substring(10));
      return;
    }

    if (event.data.indexOf("TYPERP_ERR:") === 0) {
      var error = event.data.substring(11);
      setStatus("Error: " + error);
      alert("TypeR-P BUILD-019\n\n" + error);
    }
  });

  function jsString(value) {
    return JSON.stringify(String(value));
  }

  /* =====================================================
     INSERT CURRENT LINE
     ===================================================== */

  function insertCurrentLine() {

    if (!lines.length) {
      setStatus("Load lines first.");
      return;
    }

    saveCurrentLine();

    var text = lines[currentIndex];

    if (!text || !text.trim()) {
      setStatus("Current line is empty.");
      return;
    }

    var font = fontEl.value || "ArialMT";
    var initialSize = Number(sizeEl.value) || 48;

    var color = (colorEl.value || "FF0000").replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
    while (color.length < 6) color += "0";

    var align = alignEl.value || "CENTER";

    var padding = Number(paddingEl.value);
    if (!isFinite(padding) || padding < 0) padding = 12;

    var minSize = Number(minSizeEl.value);
    if (!isFinite(minSize) || minSize < 1) minSize = 8;

    var autoFit = fitEl.checked;
    var mode = modeEl.value;

    var lineSpacing = Number(lineSpacingEl.value);
    if (!isFinite(lineSpacing) || lineSpacing < 0) lineSpacing = 0;

    var charSpacing = Number(charSpacingEl.value);
    if (!isFinite(charSpacing)) charSpacing = 0;

    var wordSpacingCount = Number(wordSpacingEl.value);
    if (!isFinite(wordSpacingCount) || wordSpacingCount < 0) wordSpacingCount = 0;

    var vAlign = vAlignEl.value || "MIDDLE";

    // --- Ø´Ø¨ÛŒÙ‡â€ŒØ³Ø§Ø²ÛŒ Word Spacing: ÙØ§ØµÙ„Ù‡Ù” Ø§Ø¶Ø§ÙÙ‡ Ø¨ÛŒÙ† Ú©Ù„Ù…Ø§ØªØŒ Ù‡Ù…ÛŒÙ†Ø¬Ø§ Ø¯Ø± Ø³Ù…Øª Ù¾Ù„Ø§Ú¯ÛŒÙ† ---
    if (wordSpacingCount > 0) {
      var extra = "";
      for (var w = 0; w < wordSpacingCount; w++) extra += " ";
      text = text.replace(/ /g, " " + extra);
    }

    setStatus("Checking active selection...");

    /* =================================================
       PHOTOPEA SCRIPT
       ================================================= */

    var script =
      "(function(){\n" +
      "try{\n" +
      "var d=app.activeDocument;\n" +
      "if(!d){throw new Error('No active document.');}\n" +

      "var b;\n" +
      "try{ b=d.selection.bounds; }catch(e){ throw new Error('No active selection. Please make a selection first.'); }\n" +
      "if(!b||b.length!==4){ throw new Error('No active selection. Please make a selection first.'); }\n" +

      "function px(v){\n" +
      "if(typeof v==='number')return v;\n" +
      "try{ if(v&&typeof v.as==='function'){ var a=Number(v.as('px')); if(isFinite(a))return a; } }catch(e){}\n" +
      "try{ if(v&&v.value!==undefined){ var n=Number(v.value); if(isFinite(n))return n; } }catch(e){}\n" +
      "return NaN;\n" +
      "}\n" +

      "var L=px(b[0]); var T=px(b[1]); var R=px(b[2]); var B=px(b[3]);\n" +
      "if(!isFinite(L)||!isFinite(T)||!isFinite(R)||!isFinite(B)){ throw new Error('Could not read selection coordinates.'); }\n" +
      "if(R<=L||B<=T){ throw new Error('Selection has invalid dimensions.'); }\n" +

      "var boxLeft=L+" + padding + ";\n" +
      "var boxTop=T+" + padding + ";\n" +
      "var boxRight=R-" + padding + ";\n" +
      "var boxBottom=B-" + padding + ";\n" +
      "var boxWidth=boxRight-boxLeft;\n" +
      "var boxHeight=boxBottom-boxTop;\n" +
      "if(boxWidth<1||boxHeight<1){ throw new Error('Padding is too large for the selection.'); }\n" +

      "var layer=d.artLayers.add();\n" +
      "layer.kind=LayerKind.TEXT;\n" +
      "layer.name=" + jsString("TTP: " + text.substring(0, 45)) + ";\n" +
      "var ti=layer.textItem;\n" +

      "var trackingErr='';\n" +
      "try{ ti.tracking=" + charSpacing + "; }catch(eTrack){ trackingErr=' | tracking-failed:'+eTrack.message; }\n" +

      "var leadingErr='';\n" +
      "var leadingApplied='auto';\n" +
      (lineSpacing > 0 ?
        "try{\n" +
        "  ti.autoLeading=false;\n" +
        "  try{ ti.leading=new UnitValue(" + lineSpacing + ",'px'); leadingApplied='" + lineSpacing + "px(UnitValue)'; }\n" +
        "  catch(eL1){ try{ ti.leading=" + lineSpacing + "; leadingApplied='" + lineSpacing + "px(plain)'; } catch(eL2){ leadingErr=' | leading-failed:'+eL2.message; } }\n" +
        "}catch(eLead){ leadingErr=' | leading-outer-failed:'+eLead.message; }\n"
        : "") +

      "if(" + jsString(mode) + "==='PARAGRAPH'){\n" +
      "ti.kind=TextType.PARAGRAPHTEXT;\n" +
      "ti.width=new UnitValue(boxWidth,'px');\n" +
      "ti.height=new UnitValue(boxHeight,'px');\n" +
      "ti.contents=" + jsString(text) + ";\n" +
      "ti.font=" + jsString(font) + ";\n" +
      "ti.size=" + initialSize + ";\n" +
      "ti.justification=Justification." + align + ";\n" +
      "var c=new SolidColor();\n" +
      "c.rgb.hexValue=" + jsString(color) + ";\n" +
      "ti.color=c;\n" +

      "var estimatedLines=1;\n" +
      "var finalSize=" + initialSize + ";\n" +
      "if(" + autoFit + "){\n" +
      "function estimateLines(str,size,width){\n" +
      "var avg=size*0.52;\n" +
      "var maxChars=Math.max(1,Math.floor(width/avg));\n" +
      "var paragraphs=str.split(String.fromCharCode(10));\n" +
      "var total=0;\n" +
      "for(var p=0;p<paragraphs.length;p++){\n" +
      "var paragraph=paragraphs[p];\n" +
      "if(paragraph.trim()===''){ total++; continue; }\n" +
      "var words=paragraph.trim().split(/\\s+/);\n" +
      "var chars=0; var lineCount=1;\n" +
      "for(var w=0;w<words.length;w++){\n" +
      "var word=words[w]; var len=word.length;\n" +
      "if(len>maxChars){\n" +
      "if(chars>0){ lineCount++; chars=0; }\n" +
      "lineCount+=Math.floor(len/maxChars);\n" +
      "chars=len%maxChars;\n" +
      "if(chars===0){ chars=maxChars; lineCount--; }\n" +
      "continue;\n" +
      "}\n" +
      "var needed=len+(chars>0?1:0);\n" +
      "if(chars+needed>maxChars){ lineCount++; chars=len; } else { chars+=needed; }\n" +
      "}\n" +
      "total+=lineCount;\n" +
      "}\n" +
      "return Math.max(1,total);\n" +
      "}\n" +
      "var current=" + initialSize + ";\n" +
      "var minimum=" + minSize + ";\n" +
      "while(current>minimum){\n" +
      "var est=estimateLines(" + jsString(text) + ",current,boxWidth);\n" +
      "var lh=" + (lineSpacing > 0 ? lineSpacing : "current*1.20") + ";\n" +
      "var neededHeight=est*lh;\n" +
      "if(neededHeight<=boxHeight){ estimatedLines=est; break; }\n" +
      "current--;\n" +
      "ti.size=current;\n" +
      "estimatedLines=est;\n" +
      "}\n" +
      "finalSize=current;\n" +
      "}\n" +

      "var effLineHeight=" + (lineSpacing > 0 ? lineSpacing : "finalSize*1.20") + ";\n" +
      "var actualTextHeight=estimatedLines*effLineHeight;\n" +
      "var extraSpace=boxHeight-actualTextHeight;\n" +
      "if(extraSpace<0)extraSpace=0;\n" +
      "var vAlignOffset=0;\n" +
      "if(" + jsString(vAlign) + "==='MIDDLE'){ vAlignOffset=extraSpace/2; }\n" +
      "else if(" + jsString(vAlign) + "==='BOTTOM'){ vAlignOffset=extraSpace; }\n" +
      "ti.position=[boxLeft,boxTop+vAlignOffset];\n" +

      "}else{\n" +
      "ti.kind=TextType.POINTTEXT;\n" +
      "ti.contents=" + jsString(text) + ";\n" +
      "ti.font=" + jsString(font) + ";\n" +
      "ti.size=" + initialSize + ";\n" +
      "ti.justification=Justification." + align + ";\n" +
      "var pc=new SolidColor();\n" +
      "pc.rgb.hexValue=" + jsString(color) + ";\n" +
      "ti.color=pc;\n" +
      "var py=(T+B)/2;\n" +
      "if(" + jsString(vAlign) + "==='TOP'){ py=T+" + initialSize + "; }\n" +
      "else if(" + jsString(vAlign) + "==='BOTTOM'){ py=B-(" + initialSize + "*0.3); }\n" +
      "ti.position=[(L+R)/2,py];\n" +
      "}\n" +

      "d.activeLayer=layer;\n" +

      "app.echoToOE(\n" +
      "'TYPERP_OK:TEXT INSERTED | selection='+Math.round(L)+','+Math.round(T)+','+Math.round(R)+','+Math.round(B)+\n" +
      "' | box='+Math.round(boxWidth)+'x'+Math.round(boxHeight)+\n" +
      "' | size='+ti.size+trackingErr+leadingErr\n" +
      ");\n" +

      "}catch(e){\n" +
      "app.echoToOE('TYPERP_ERR:'+(e&&e.message?e.message:String(e)));\n" +
      "}\n" +
      "})();";

    window.parent.postMessage(script, "*");
  }

  insertLineBtn.onclick = insertCurrentLine;

  updateLine();
  setStatus("Ready (BUILD-019)");

})();
