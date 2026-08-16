// TypeR-P - main.js
// نسخه‌ای که:
//  1) بدون Selection: متن را در مرکز تصویر می‌سازد (baseline قبلی که کار می‌کرد)
//  2) با Selection: مختصات را با فرمت واقعی Photopea (UnitValue -> .value) می‌خواند
//     و متن را در مرکز Selection می‌گذارد
//  3) اگر خواندن Selection به هر دلیلی شکست بخورد، لایه متن باز هم ساخته می‌شود
//     (در مرکز تصویر) و هیچ‌وقت ناپدید نمی‌شود

(function () {
  const els = {
    status: document.getElementById("status"),
    text: document.getElementById("text"),
    font: document.getElementById("font"),
    size: document.getElementById("size"),
    color: document.getElementById("color"),
    align: document.getElementById("align"),
    insert: document.getElementById("insert"),
  };

  function setStatus(msg) {
    if (els.status) els.status.textContent = msg;
    console.log("[TypeR-P]", msg);
  }

  function sendToPhotopea(script) {
    window.parent.postMessage(script, "*");
  }

  window.addEventListener("message", function (e) {
    if (typeof e.data !== "string") return;
    if (e.data === "done") return;

    console.log("[TypeR-P] raw message from Photopea:", e.data);

    if (e.data.indexOf("TYPERP_OK|") === 0) {
      const payload = e.data.slice("TYPERP_OK|".length);
      let parsed = null;
      try {
        parsed = JSON.parse(payload);
      } catch (err) {
        setStatus("Inserted, but could not parse result payload");
        return;
      }

      if (parsed.hasSel) {
        setStatus(
          "Inserted inside selection at (" +
            parsed.cx +
            ", " +
            parsed.cy +
            ")"
        );
      } else {
        setStatus(
          "Inserted at image center (" +
            parsed.cx +
            ", " +
            parsed.cy +
            ") — no usable selection found"
        );
      }

      console.log("[TypeR-P] selection diagnostics:", parsed.diag);
      return;
    }

    if (e.data.indexOf("TYPERP_ERROR|") === 0) {
      setStatus("Error: " + e.data.slice("TYPERP_ERROR|".length));
      return;
    }
  });

  function buildScript(opts) {
    const textJs = JSON.stringify(opts.text);
    const fontJs = JSON.stringify(opts.font);
    const colorJs = JSON.stringify(opts.color);
    const sizeJs = JSON.stringify(opts.size);
    const alignJs = opts.align;

    return (
      "(function(){\n" +
      "  function reportError(msg){ app.echoToOE('TYPERP_ERROR|' + msg); }\n" +
      "  try {\n" +
      "    var d = app.activeDocument;\n" +
      "    var hasSel = false;\n" +
      "    var cx = d.width / 2;\n" +
      "    var cy = d.height / 2;\n" +
      "    var diag = {};\n" +
      "\n" +
      "    try {\n" +
      "      var sel = d.selection;\n" +
      "      var b = sel.bounds;\n" +
      "\n" +
      "      diag.typeofBounds = typeof b;\n" +
      "      diag.boundsLength = (b && typeof b.length === 'number') ? b.length : null;\n" +
      "      try { diag.stringBounds = String(b); } catch(e0) { diag.stringBounds = 'ERR:' + String(e0); }\n" +
      "      try { diag.jsonBounds = JSON.stringify(b); } catch(e1) { diag.jsonBounds = 'ERR:' + String(e1); }\n" +
      "\n" +
      "      if (b && b.length === 4) {\n" +
      "        diag.typeofB0 = typeof b[0];\n" +
      "        try { diag.stringB0 = String(b[0]); } catch(e2) { diag.stringB0 = 'ERR:' + String(e2); }\n" +
      "        try { diag.b0HasValue = (typeof b[0].value === 'number'); } catch(e3) { diag.b0HasValue = 'ERR'; }\n" +
      "        try { diag.b0HasAs = (typeof b[0].as === 'function'); } catch(e4) { diag.b0HasAs = 'ERR'; }\n" +
      "        try { diag.b0ValueRaw = b[0].value; } catch(e5) { diag.b0ValueRaw = 'ERR:' + String(e5); }\n" +
      "        try { diag.b0AsPx = b[0].as ? b[0].as('px') : undefined; } catch(e6) { diag.b0AsPx = 'ERR:' + String(e6); }\n" +
      "\n" +
      "        var vals = [];\n" +
      "        for (var i = 0; i < 4; i++) {\n" +
      "          var raw = b[i];\n" +
      "          var num = NaN;\n" +
      "          if (typeof raw === 'number') {\n" +
      "            num = raw;\n" +
      "          } else if (raw && typeof raw.value === 'number') {\n" +
      "            num = raw.value;\n" +
      "          } else if (raw && typeof raw.as === 'function') {\n" +
      "            try { num = raw.as('px'); } catch (eAs) { num = NaN; }\n" +
      "          } else {\n" +
      "            num = Number(raw);\n" +
      "          }\n" +
      "          vals.push(num);\n" +
      "        }\n" +
      "        diag.parsedVals = vals.join(',');\n" +
      "\n" +
      "        var allValid = true;\n" +
      "        for (var k = 0; k < vals.length; k++) {\n" +
      "          if (typeof vals[k] !== 'number' || isNaN(vals[k])) { allValid = false; }\n" +
      "        }\n" +
      "\n" +
      "        if (allValid) {\n" +
      "          var left = vals[0], top = vals[1], right = vals[2], bottom = vals[3];\n" +
      "          if (right > left && bottom > top) {\n" +
      "            cx = (left + right) / 2;\n" +
      "            cy = (top + bottom) / 2;\n" +
      "            hasSel = true;\n" +
      "          }\n" +
      "        }\n" +
      "      }\n" +
      "    } catch (selErr) {\n" +
      "      diag.selectionError = String(selErr);\n" +
      "    }\n" +
      "\n" +
      "    var layer = d.artLayers.add();\n" +
      "    layer.kind = LayerKind.TEXT;\n" +
      "\n" +
      "    var ti = layer.textItem;\n" +
      "    ti.kind = TextType.POINTTEXT;\n" +
      "    ti.contents = " + textJs + ";\n" +
      "    ti.font = " + fontJs + ";\n" +
      "    ti.size = " + sizeJs + ";\n" +
      "    ti.justification = Justification." + alignJs + ";\n" +
      "\n" +
      "    var c = new SolidColor();\n" +
      "    c.rgb.hexValue = " + colorJs + ";\n" +
      "    ti.color = c;\n" +
      "\n" +
      "    ti.position = [cx, cy];\n" +
      "    d.activeLayer = layer;\n" +
      "\n" +
      "    var result = { hasSel: hasSel, cx: Math.round(cx), cy: Math.round(cy), diag: diag };\n" +
      "    app.echoToOE('TYPERP_OK|' + JSON.stringify(result));\n" +
      "  } catch (mainErr) {\n" +
      "    reportError(String(mainErr));\n" +
      "  }\n" +
      "})();"
    );
  }

  function onInsertClick() {
    const text = (els.text.value || "").trim();
    if (!text) {
      setStatus("لطفاً ابتدا متنی وارد کنید");
      return;
    }

    const font = els.font.value || "ArialMT";
    const size = Number(els.size.value) || 48;
    let color = (els.color.value || "FF0000").replace("#", "").trim();
    if (!/^[0-9a-fA-F]{6}$/.test(color)) color = "FF0000";

    const alignRaw = (els.align.value || "CENTER").toUpperCase();
    const align = ["LEFT", "CENTER", "RIGHT"].includes(alignRaw)
      ? alignRaw
      : "CENTER";

    setStatus("Inserting...");

    const script = buildScript({
      text: text,
      font: font,
      size: size,
      color: color,
      align: align,
    });

    sendToPhotopea(script);
  }

  if (els.insert) {
    els.insert.addEventListener("click", onInsertClick);
  }

  setStatus("Ready");
})();
