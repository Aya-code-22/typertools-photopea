window.addEventListener("message", function (e) {
  if (typeof e.data === "string") {
    // جلوگیری از اوررایت شدن پیام status توسط پیام سیستمی Photopea
    if (e.data === "done") return;

    const statusEl = document.getElementById("status");
    if (statusEl) {
      statusEl.textContent = e.data;
    }
  }
});

document.getElementById("insert").addEventListener("click", function () {
  const statusEl = document.getElementById("status");
  if (statusEl) {
    statusEl.textContent = "Processing in Photopea...";
  }

  const textVal = document.getElementById("text").value || "Text";
  const fontVal = document.getElementById("font").value || "ArialMT";
  const sizeVal = parseFloat(document.getElementById("size").value) || 48;
  const colorVal = document.getElementById("color").value || "FF0000";
  const alignVal = document.getElementById("align").value || "CENTER";

  const escapedText = textVal
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");

  const escapedFont = fontVal.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const escapedColor = colorVal.replace(/[^0-9A-Fa-f]/g, "");

  const script = `
    (function() {
      try {
        var d = app.activeDocument;
        if (!d) {
          app.echoToOE("Error: No document open in Photopea.");
          return;
        }

        // تبدیل انواع خروجی‌های bounds (رشته واحددار، UnitValue، عدد) به عدد پیکسلی
        function parsePx(v) {
          if (v === null || v === undefined) return NaN;
          if (typeof v === "number") return v;
          if (typeof v === "object") {
            if ("value" in v && typeof v.value === "number") return v.value;
            if (typeof v.as === "function") return v.as("px");
          }
          var p = parseFloat(String(v));
          return isNaN(p) ? NaN : p;
        }

        var docW = parsePx(d.width) || 800;
        var docH = parsePx(d.height) || 600;

        var posX = docW / 2;
        var posY = docH / 2;
        var hasSelection = false;
        var diag = "";

        try {
          var sel = d.selection;
          if (sel) {
            var b = sel.bounds;
            if (b && b.length === 4) {
              var l = parsePx(b[0]);
              var t = parsePx(b[1]);
              var r = parsePx(b[2]);
              var bm = parsePx(b[3]);

              diag = "Raw: [" + b[0] + "," + b[1] + "," + b[2] + "," + b[3] + "] -> Parsed: [" + l + "," + t + "," + r + "," + bm + "]";

              if (!isNaN(l) && !isNaN(t) && !isNaN(r) && !isNaN(bm) && (r > l) && (bm > t)) {
                posX = (l + r) / 2;
                posY = (t + bm) / 2;
                hasSelection = true;
              }
            } else {
              diag = "Bounds empty or invalid";
            }
          } else {
            diag = "No active selection";
          }
        } catch(selErr) {
          diag = "Selection error: " + selErr.message;
        }

        if (isNaN(posX) || !isFinite(posX)) posX = docW / 2;
        if (isNaN(posY) || !isFinite(posY)) posY = docH / 2;

        var layer = d.artLayers.add();
        layer.kind = LayerKind.TEXT;

        var ti = layer.textItem;
        ti.kind = TextType.POINTTEXT;
        ti.contents = "${escapedText}";
        ti.font = "${escapedFont}";
        ti.size = ${sizeVal};
        ti.justification = Justification.${alignVal};

        var c = new SolidColor();
        c.rgb.hexValue = "${escapedColor}";
        ti.color = c;

        ti.position = [posX, posY];
        d.activeLayer = layer;

        var resultMsg = (hasSelection ? "Placed in Selection" : "Placed in Center (Fallback)") +
                        " (" + Math.round(posX) + ", " + Math.round(posY) + ")" +
                        (diag ? " | " + diag : "");

        app.echoToOE(resultMsg);

      } catch(err) {
        app.echoToOE("Fatal Script Error: " + err.message);
      }
    })();
  `;

  window.parent.postMessage(script, "*");
});
