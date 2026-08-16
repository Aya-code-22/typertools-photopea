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
    statusEl.textContent = "Analyzing Selection...";
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

        var docW = 800, docH = 600;
        try {
          docW = typeof d.width === "object" ? d.width.value : Number(d.width);
          docH = typeof d.height === "object" ? d.height.value : Number(d.height);
        } catch(e) {}

        var posX = docW / 2;
        var posY = docH / 2;
        var successSel = false;
        var diagMsg = "";

        try {
          var sel = d.selection;
          if (!sel) {
            diagMsg = "d.selection is undefined";
          } else {
            var b = sel.bounds;
            if (!b) {
              diagMsg = "sel.bounds is undefined";
            } else if (b.length !== 4) {
              diagMsg = "bounds length is " + b.length;
            } else {
              var b0 = b[0];
              var b0Type = typeof b0;
              var b0Str = String(b0);
              var b0Val = (b0 && typeof b0 === "object" && "value" in b0) ? b0.value : "no-value-key";

              diagMsg = "b[0] Type:" + b0Type + " | Str:'" + b0Str + "' | .val:" + b0Val;

              function parseVal(v) {
                if (v === null || v === undefined) return NaN;
                if (typeof v === "number") return v;
                if (typeof v === "object") {
                  if ("value" in v && typeof v.value === "number") return v.value;
                  if ("_value" in v && typeof v._value === "number") return v._value;
                  if (typeof v.as === "function") return v.as("px");
                }
                var p = parseFloat(String(v));
                return isNaN(p) ? NaN : p;
              }

              var l = parseVal(b[0]);
              var t = parseVal(b[1]);
              var r = parseVal(b[2]);
              var bm = parseVal(b[3]);

              if (!isNaN(l) && !isNaN(t) && !isNaN(r) && !isNaN(bm) && (r > l) && (bm > t)) {
                posX = (l + r) / 2;
                posY = (t + bm) / 2;
                successSel = true;
                diagMsg = "SUCCESS! Sel Center: [" + Math.round(posX) + "," + Math.round(posY) + "] | Bounds: [" + Math.round(l) + "," + Math.round(t) + "," + Math.round(r) + "," + Math.round(bm) + "]";
              } else {
                diagMsg += " -> Parsed NaN [" + l + "," + t + "," + r + "," + bm + "]";
              }
            }
          }
        } catch(selError) {
          diagMsg = "Sel Exception: " + selError.message;
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

        var finalStatus = (successSel ? "Placed in Selection" : "Placed in Center (Fallback)") + " | " + diagMsg;
        app.echoToOE(finalStatus);

      } catch(err) {
        app.echoToOE("Critical Script Error: " + err.message);
      }
    })();
  `;

  window.parent.postMessage(script, "*");
});
