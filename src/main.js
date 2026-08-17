// TypeR-P — main.js
// BUILD: TYPERP-BUILD-024
//
// تغییرات نسبت به build-023:
//   - حذف کامل requestFontList / replaceFontInputWithSelect (علت هنگی گوشی)
//   - اضافه شدن "Load Font from Device" سبک با app.open (فقط اسم فونت جدید برمی‌گردد، نه کل لیست)
//   - برگرداندن Saved Styles (که در build-023 گم شده بود) با فیلدهای جدید

(function () {

  "use strict";

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
    alert("TypeR-P BUILD-024 UI ERROR\n\nMissing:\n" + missing.join("\n"));
    return;
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  /* =====================================================
     LINE SYSTEM (بدون تغییر)
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

  /* ---------- Load Font from Device (سبک، بدون لیست کامل) ---------- */

  var fontUploadInput = document.createElement("input");
  fontUploadInput.type = "file";
  fontUploadInput.accept = ".ttf,.otf,.woff,.woff2";
  fontUploadInput.style.display = "none";

  var fontUploadBtn = document.createElement("button");
  fontUploadBtn.type = "button";
  fontUploadBtn.textContent = "Load Font from Device";
  fontUploadBtn.style.width = "100%";
  fontUploadBtn.style.marginTop = "6px";

  fontEl.parentElement.insertBefore(fontUploadBtn, fontEl.nextSibling);
  fontEl.parentElement.insertBefore(fontUploadInput, fontUploadBtn.nextSibling);

  fontUploadBtn.onclick = function () {
    fontUploadInput.click();
  };

  fontUploadInput.onchange = function () {
    var file = fontUploadInput.files && fontUploadInput.files[0];
    if (!file) return;

    setStatus("Loading font file...");

    var reader = new FileReader();

    reader.onload = function () {
      var dataUrl = reader.result;

      var script =
        "(function(){\n" +
        "try{\n" +
        "  var before = (app.fonts && app.fonts.length) ? app.fonts.length : 0;\n" +
        "  app.open(" + JSON.stringify(dataUrl) + ");\n" +
        "  var after = (app.fonts && app.fonts.length) ? app.fonts.length : 0;\n" +
        "  var name = '';\n" +
        "  if (app.fonts && after > 0) {\n" +
        "    var last = app.fonts[after - 1];\n" +
        "    name = (last && last.postScriptName) ? last.postScriptName : (last && last.name ? last.name : '');\n" +
        "  }\n" +
        "  app.echoToOE('TYPERP_FONT_LOADED:' + name + ' | before=' + before + ' after=' + after);\n" +
        "}catch(e){\n" +
        "  app.echoToOE('TYPERP_FONT_ERR:' + (e && e.message ? e.message : String(e)));\n" +
        "}\n" +
        "})();";

      window.parent.postMessage(script, "*");
    };

    reader.onerror = function () {
      setStatus("Could not read the font file.");
    };

    reader.readAsDataURL(file);
  };

  /* ---------- Padding ---------- */

  settingsPanel.appendChild(makeLabel("Padding"));
  var paddingEl = makeNumber(12, 0, 500);
  settingsPanel.appendChild(paddingEl);

  /* ---------- Auto Fit ---------- */

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

  /* ---------- Minimum Font Size ---------- */

  settingsPanel.appendChild(makeLabel("Minimum Font Size"));
  var minSizeEl = makeNumber(8, 1, 500);
  settingsPanel.appendChild(minSizeEl);

  /* ---------- Text Mode ---------- */

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

  /* ---------- Character Spacing (Tracking) ---------- */

  settingsPanel.appendChild(makeLabel("Character Spacing (Tracking)"));
  var charSpacingEl = makeNumber(0, -1000, 1000);
  settingsPanel.appendChild(charSpacingEl);

  /* ---------- Word Spacing (شبیه‌سازی‌شده) ---------- */

  settingsPanel.appendChild(makeLabel("Word Spacing (extra spaces)"));
  var wordSpacingEl = makeNumber(0, 0, 20);
  settingsPanel.appendChild(wordSpacingEl);

  /* ---------- Vertical Alignment ---------- */

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
     SAVED STYLES (برگردانده‌شده از build-008/009)
     ===================================================== */

  var STYLES_KEY = "typerp_styles_v2";
  var memoryStyles = {};

  function loadStyles() {
    try {
      var raw = localStorage.getItem(STYLES_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      return (parsed && typeof parsed === "object") ? parsed : {};
    } catch (e) {
      return memoryStyles;
    }
  }

  function saveStylesObj(obj) {
    try {
      localStorage.setItem(STYLES_KEY, JSON.stringify(obj));
    } catch (e) {
      memoryStyles = obj;
    }
  }

  settingsPanel.appendChild(makeLabel("Saved Styles"));

  var styleSelectRow = document.createElement("div");
  styleSelectRow.style.display = "flex";
  styleSelectRow.style.gap = "6px";
  styleSelectRow.style.marginTop = "4px";

  var styleSelectEl = document.createElement("select");
  styleSelectEl.style.flex = "1";

  var applyStyleBtn = document.createElement("button");
  applyStyleBtn.type = "button";
  applyStyleBtn.textContent = "Apply";

  var deleteStyleBtn = document.createElement("button");
  deleteStyleBtn.type = "button";
  deleteStyleBtn.textContent = "Delete";

  styleSelectRow.appendChild(styleSelectEl);
  styleSelectRow.appendChild(applyStyleBtn);
  styleSelectRow.appendChild(deleteStyleBtn);
  settingsPanel.appendChild(styleSelectRow);

  var styleSaveRow = document.createElement("div");
  styleSaveRow.style.display = "flex";
  styleSaveRow.style.gap = "6px";
  styleSaveRow.style.marginTop = "6px";

  var styleNameEl = document.createElement("input");
  styleNameEl.type = "text";
  styleNameEl.placeholder = "Style name...";
  styleNameEl.style.flex = "1";
  styleNameEl.style.boxSizing = "border-box";

  var saveStyleBtn = document.createElement("button");
  saveStyleBtn.type = "button";
  saveStyleBtn.textContent = "Save Style";

  styleSaveRow.appendChild(styleNameEl);
  styleSaveRow.appendChild(saveStyleBtn);
  settingsPanel.appendChild(styleSaveRow);

  function refreshStyleSelect(selectName) {
    var styles = loadStyles();
    var names = Object.keys(styles).sort(function (a, b) { return a.localeCompare(b); });

    styleSelectEl.innerHTML = "";

    if (names.length === 0) {
      var emptyOpt = document.createElement("option");
      emptyOpt.value = "";
      emptyOpt.textContent = "(no styles saved)";
      styleSelectEl.appendChild(emptyOpt);
      return;
    }

    for (var i = 0; i < names.length; i++) {
      var opt = document.createElement("option");
      opt.value = names[i];
      opt.textContent = names[i];
      styleSelectEl.appendChild(opt);
    }

    if (selectName && styles[selectName]) styleSelectEl.value = selectName;
  }

  function currentSettingsSnapshot() {
    return {
      font: fontEl.value || "ArialMT",
      size: Number(sizeEl.value) || 48,
      color: colorEl.value || "FF0000",
      align: alignEl.value || "CENTER",
      padding: Number(paddingEl.value),
      minSize: Number(minSizeEl.value),
      autoFit: !!fitEl.checked,
      mode: modeEl.value,
      charSpacing: Number(charSpacingEl.value),
      wordSpacing: Number(wordSpacingEl.value),
      vAlign: vAlignEl.value
    };
  }

  function applySettingsSnapshot(s) {
    if (!s) return;
    if (s.font !== undefined) fontEl.value = s.font;
    if (s.size !== undefined) sizeEl.value = s.size;
    if (s.color !== undefined) colorEl.value = s.color;
    if (s.align !== undefined) alignEl.value = s.align;
    if (s.padding !== undefined) paddingEl.value = s.padding;
    if (s.minSize !== undefined) minSizeEl.value = s.minSize;
    if (s.autoFit !== undefined) fitEl.checked = !!s.autoFit;
    if (s.mode !== undefined) modeEl.value = s.mode;
    if (s.charSpacing !== undefined) charSpacingEl.value = s.charSpacing;
    if (s.wordSpacing !== undefined) wordSpacingEl.value = s.wordSpacing;
    if (s.vAlign !== undefined) vAlignEl.value = s.vAlign;
  }

  saveStyleBtn.onclick = function () {
    try {
      var name = (styleNameEl.value || "").trim();
      if (!name) { setStatus("Please type a style name first."); return; }

      var styles = loadStyles();
      styles[name] = currentSettingsSnapshot();
      saveStylesObj(styles);

      refreshStyleSelect(name);
      setStatus("Style saved: " + name);
      styleNameEl.value = "";
    } catch (e) {
      alert("Save style error: " + e.message);
    }
  };

  applyStyleBtn.onclick = function () {
    try {
      var name = styleSelectEl.value;
      if (!name) { setStatus("No style selected."); return; }

      var styles = loadStyles();
      var s = styles[name];
      if (!s) { setStatus("Style not found: " + name); return; }

      applySettingsSnapshot(s);
      setStatus("Style applied: " + name);
    } catch (e) {
      alert("Apply style error: " + e.message);
    }
  };

  deleteStyleBtn.onclick = function () {
    try {
      var name = styleSelectEl.value;
      if (!name) { setStatus("No style selected."); return; }

      var styles = loadStyles();
      delete styles[name];
      saveStylesObj(styles);

      refreshStyleSelect();
      setStatus("Style deleted: " + name);
    } catch (e) {
      alert("Delete style error: " + e.message);
    }
  };

  refreshStyleSelect();

  /* =====================================================
     PHOTOPEA MESSAGE LISTENER
     ===================================================== */

  window.addEventListener("message", function (event) {
    if (typeof event.data !== "string") return;

    if (event.data.indexOf("TYPERP_FONT_LOADED:") === 0) {
      var rest = event.data.slice("TYPERP_FONT_LOADED:".length);
      var name = rest.split(" | ")[0];
      if (name) {
        fontEl.value = name;
        setStatus("Font loaded and applied: " + name);
      } else {
        setStatus("Font loaded, but could not read its name automatically. " + rest);
      }
      return;
    }

    if (event.data.indexOf("TYPERP_FONT_ERR:") === 0) {
      var ferr = event.data.slice("TYPERP_FONT_ERR:".length);
      setStatus("Font load error: " + ferr);
      alert("TypeR-P font load error:\n" + ferr);
      return;
    }

    if (event.data.indexOf("TYPERP_OK:") === 0) {
      setStatus(event.data.substring(10));
      return;
    }

    if (event.data.indexOf("TYPERP_ERR:") === 0) {
      var error = event.data.substring(11);
      setStatus("Error: " + error);
      alert("TypeR-P BUILD-024\n\n" + error);
    }
  });

  function jsString(value) {
    return JSON.stringify(String(value));
  }

  /* =====================================================
     INSERT CURRENT LINE
     ===================================================== */

  function insertCurrentLine() {

    if (!lines.length) { setStatus("Load lines first."); return; }

    saveCurrentLine();

    var text = lines[currentIndex];
    if (!text || !text.trim()) { setStatus("Current line is empty."); return; }

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

    var charSpacing = Number(charSpacingEl.value);
    if (!isFinite(charSpacing)) charSpacing = 0;

    var wordSpacingCount = Number(wordSpacingEl.value);
    if (!isFinite(wordSpacingCount) || wordSpacingCount < 0) wordSpacingCount = 0;

    var vAlign = vAlignEl.value || "MIDDLE";

    text = text.replace(/\u060C(?!\s)/g, "\u060C ").replace(/,(?!\s)/g, ", ");

    if (wordSpacingCount > 0) {
      var extra = "";
      for (var w = 0; w < wordSpacingCount; w++) extra += " ";
      text = text.replace(/ /g, " " + extra);
    }

    setStatus("Checking active selection...");

    var script =
      "(function(){\n" +
      "alert('STEP1: script parsed and started');\n" +
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

      "try { app.preferences.rulerUnits = Units.PIXELS; app.preferences.typeUnits = TypeUnits.PIXELS; } catch(eUnits) {}\n" +

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
      "var trackingReadback='unread';\n" +
      "try{ ti.tracking=" + charSpacing + "; trackingReadback=''+ti.tracking; }catch(eTrack){ trackingErr=' | tracking-failed:'+eTrack.message; }\n" +

      "if(" + jsString(mode) + "==='PARAGRAPH'){\n" +
      "ti.kind=TextType.PARAGRAPHTEXT;\n" +
      "ti.width=boxWidth;\n" +
      "ti.height=boxHeight;\n" +
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
      "var lh=current*1.20;\n" +
      "var neededHeight=est*lh;\n" +
      "if(neededHeight<=boxHeight){ estimatedLines=est; break; }\n" +
      "current--;\n" +
      "ti.size=current;\n" +
      "estimatedLines=est;\n" +
      "}\n" +
      "finalSize=current;\n" +
      "}\n" +

      "var effLineHeight=finalSize*1.20;\n" +
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

      "var __resultMsg = 'TEXT INSERTED | selection='+L+','+T+','+R+','+B+' | box='+boxWidth+'x'+boxHeight+' | size='+ti.size+' | trackingSet=" + charSpacing + " trackingReadback='+trackingReadback+trackingErr;\n" +
      "try{ app.echoToOE('TYPERP_OK:'+__resultMsg); }catch(eEcho){}\n" +
      "alert('TypeR-P OK: '+__resultMsg);\n" +

      "}catch(e){\n" +
      "var __errMsg = (e&&e.message?e.message:String(e));\n" +
      "try{ app.echoToOE('TYPERP_ERR:'+__errMsg); }catch(eEcho2){}\n" +
      "alert('TypeR-P ERROR: '+__errMsg);\n" +
      "}\n" +
      "})();";

    window.parent.postMessage(script, "*");

    setTimeout(function () {
      if (statusEl.textContent.indexOf("Checking active selection...") === 0) {
        setStatus("No response from Photopea after 6s — check if a selection exists, and if the plugin was re-added after the last push (cache).");
      }
    }, 6000);
  }

  insertLineBtn.onclick = insertCurrentLine;

  updateLine();
  setStatus("Ready (BUILD-024)");
  /* ---------- DEBUG: تست خام ارتباط با Photopea ---------- */

  var debugBtn = document.createElement("button");
  debugBtn.type = "button";
  debugBtn.textContent = "DEBUG: Test Photopea Link";
  debugBtn.style.width = "100%";
  debugBtn.style.marginTop = "12px";
  debugBtn.style.background = "#333";
  settingsPanel.appendChild(debugBtn);

  debugBtn.onclick = function () {
    setStatus("Sending raw test script...");
    window.parent.postMessage("alert('HELLO FROM TYPERP - LINK WORKS');", "*");

    setTimeout(function () {
      if (statusEl.textContent.indexOf("Sending raw test") === 0) {
        setStatus("Raw test also got NO response — link itself is broken.");
      }
    }, 4000);
  };

})();
