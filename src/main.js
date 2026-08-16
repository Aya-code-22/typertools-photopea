window.addEventListener("message", function (e) {
  if (typeof e.data === "string" && e.data !== "done") {
    const statusEl = document.getElementById("status");
    if (statusEl) {
      statusEl.textContent = e.data;
    }
  }
});

document.getElementById("insert").addEventListener("click", function () {
  const statusEl = document.getElementById("status");
  if (statusEl) {
    statusEl.textContent = "Processing...";
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
          app.echoToOE("Error: No document open.");
          return;
        }

        // استخراج عدد پیکسلی پیش از ارزیابی صحت عددی
        function toPx(item) {
          if (item === null || item === undefined) return NaN;
          if (typeof item === "number") return item;
          if (typeof item === "object" && "value" in item) return Number(item.value);
          if (typeof item === "object" && typeof item.value !== "undefined") return parseFloat(item.value);
          var p = parseFloat(String(item));
          return isNaN(p) ? NaN : p;
        }

        var docW = toPx(d.width) || 800;
        var docH = toPx(d.height) || 600;

        var posX = docW / 2;
        var posY = docH / 2;
        var inSel = false;
        var info = "";

        try {
          var sel = d.selection;
          if (sel && sel.bounds && sel.bounds.length === 4) {
            var b = sel.bounds;

            var l = toPx(b[0]);
            var t = toPx(b[1]);
            var r = toPx(b[2]);
            var bm = toPx(b[3]);

            if (!isNaN(l) && !isNaN(t) && !isNaN(r) && !isNaN(bm) && (r > l) && (bm > t)) {
              posX = (l + r) / 2;
              posY = (t + bm) / 2;
              inSel = true;
              info = "Selection Center: [" + Math.round(posX) + ", " + Math.round(posY) + "]";
            }
          }
        } catch(selErr) {
          info = "Selection error: " + selErr.message;
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

        var report = (inSel ? "Placed in Selection" : "Placed in Doc Center") + " | " + info;
        app.echoToOE(report);

      } catch(err) {
        app.echoToOE("Error: " + err.message);
      }
    })();
  `;

  window.parent.postMessage(script, "*");
});
