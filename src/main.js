window.addEventListener("message", function (e) {
  if (typeof e.data === "string") {
    // نادیده گرفتن پیام سیستمی done از طرف Photopea
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
    statusEl.textContent = "Inserting Text...";
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

        // استخراج عدد پیکسلی خالص از ویژگی .value
        function getPx(item) {
          if (!item) return NaN;
          if (typeof item === "number") return item;
          if (typeof item.value === "number") return item.value;
          if (typeof item.value !== "undefined") return parseFloat(item.value);
          return parseFloat(String(item));
        }

        var docW = getPx(d.width) || 800;
        var docH = getPx(d.height) || 600;

        var posX = docW / 2;
        var posY = docH / 2;
        var placedInSel = false;
        var debugMsg = "";

        try {
          var sel = d.selection;
          if (sel && sel.bounds && sel.bounds.length === 4) {
            var b = sel.bounds;

            var l = getPx(b[0]);
            var t = getPx(b[1]);
            var r = getPx(b[2]);
            var bm = getPx(b[3]);

            if (!isNaN(l) && !isNaN(t) && !isNaN(r) && !isNaN(bm) && (r > l) && (bm > t)) {
              posX = (l + r) / 2;
              posY = (t + bm) / 2;
              placedInSel = true;
              debugMsg = "Selection Center: [" + Math.round(posX) + ", " + Math.round(posY) + "]";
            }
          }
        } catch(selErr) {
          debugMsg = "Selection error: " + selErr.message;
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

        var resultMsg = (placedInSel ? "Placed in Selection" : "Placed in Doc Center") +
                        " | " + debugMsg;

        app.echoToOE(resultMsg);

      } catch(err) {
        app.echoToOE("Error: " + err.message);
      }
    })();
  `;

  window.parent.postMessage(script, "*");
});
