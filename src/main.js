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

        // تبدیل مطمئن UnitValue و رشته‌های واحددار (مثل "200 px") به عدد خالص
        function getPx(v) {
          if (v === null || v === undefined) return NaN;
          if (typeof v === "number") return v;
          if (typeof v === "object" && "value" in v && typeof v.value === "number") {
            return v.value;
          }
          var str = String(v);
          var parsed = parseFloat(str);
          return isNaN(parsed) ? NaN : parsed;
        }

        var docW = getPx(d.width);
        var docH = getPx(d.height);
        if (isNaN(docW) || docW <= 0) docW = 800;
        if (isNaN(docH) || docH <= 0) docH = 600;

        var posX = docW / 2;
        var posY = docH / 2;
        var inSel = false;
        var diag = "";

        try {
          var sel = d.selection;
          if (sel) {
            var b = sel.bounds;
            if (b && b.length === 4) {
              diag = "Type:" + (typeof b[0]) + " | Str:" + String(b[0]);

              var l = getPx(b[0]);
              var t = getPx(b[1]);
              var r = getPx(b[2]);
              var bm = getPx(b[3]);

              if (!isNaN(l) && !isNaN(t) && !isNaN(r) && !isNaN(bm) && (r > l) && (bm > t)) {
                posX = (l + r) / 2;
                posY = (t + bm) / 2;
                inSel = true;
              }
            }
          }
        } catch (selErr) {
          diag = "No selection active";
        }

        // جلوگیری از ارسال NaN به ti.position برای منع کرش موتور متن فوتوپیا
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

        var statusReport = (inSel ? "Placed in Selection" : "Placed in Center") +
                            " [" + Math.round(posX) + ", " + Math.round(posY) + "]" +
                            (diag ? " | " + diag : "");

        app.echoToOE(statusReport);

      } catch (err) {
        app.echoToOE("Script Error: " + err.message);
      }
    })();
  `;

  window.parent.postMessage(script, "*");
});
