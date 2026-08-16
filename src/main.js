window.addEventListener("message", function (e) {
  if (typeof e.data === "string") {
    const statusEl = document.getElementById("status");
    if (statusEl) {
      statusEl.textContent = e.data;
    }
  }
});

document.getElementById("insert").addEventListener("click", function () {
  const statusEl = document.getElementById("status");
  if (statusEl) {
    statusEl.textContent = "Sending to Photopea...";
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

        // تابع تبدیل امن انواع داده‌ها به عدد پیکسلی
        function toPx(val) {
          if (val === undefined || val === null) return NaN;
          if (typeof val === "number") return val;
          if (typeof val.value === "number") return val.value;
          return parseFloat(val);
        }

        var docW = toPx(d.width);
        var docH = toPx(d.height);

        var posX = docW / 2;
        var posY = docH / 2;
        var hasSel = false;
        var debugInfo = "";

        // بررسی Selection
        try {
          var sel = d.selection;
          if (sel) {
            var b = sel.bounds;
            if (b && b.length === 4) {
              var l = toPx(b[0]);
              var t = toPx(b[1]);
              var r = toPx(b[2]);
              var bm = toPx(b[3]);

              debugInfo = "Bounds: [" + b[0] + "," + b[1] + "," + b[2] + "," + b[3] + "] -> Parsed: [" + l + "," + t + "," + r + "," + bm + "]";

              if (!isNaN(l) && !isNaN(t) && !isNaN(r) && !isNaN(bm) && (r - l) > 0 && (bm - t) > 0) {
                posX = l + (r - l) / 2;
                posY = t + (bm - t) / 2;
                hasSel = true;
              }
            }
          }
        } catch (selErr) {
          debugInfo = "No Selection (" + selErr.message + ")";
        }

        // ساخت Text Layer
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

        var report = (hasSel ? "Placed in Selection" : "Placed in Center") +
                     " [" + Math.round(posX) + ", " + Math.round(posY) + "]" +
                     (debugInfo ? " | " + debugInfo : "");

        app.echoToOE(report);
      } catch (mainErr) {
        app.echoToOE("Script Error: " + mainErr.message);
      }
    })();
  `;

  window.parent.postMessage(script, "*");
});
