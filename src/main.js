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
          app.echoToOE("Error: No document open in Photopea.");
          return;
        }

        // تابع جامع تبدیل انواع اشیاء Photopea به عدد پیکسلی خالص
        function forceNumber(v) {
          if (v === null || v === undefined) return NaN;
          if (typeof v === "number") return v;
          try { if (typeof v.value === "number") return v.value; } catch(e){}
          try { var val1 = parseFloat(v.value); if (!isNaN(val1)) return val1; } catch(e){}
          try { if (typeof v.as === "function") return v.as("px"); } catch(e){}
          try { var str = String(v); var val2 = parseFloat(str); if (!isNaN(val2)) return val2; } catch(e){}
          try { var n = v * 1; if (!isNaN(n)) return n; } catch(e){}
          return NaN;
        }

        var docW = forceNumber(d.width) || 800;
        var docH = forceNumber(d.height) || 600;

        var posX = docW / 2;
        var posY = docH / 2;
        var hasSel = false;
        var diagInfo = "";

        var l = NaN, t = NaN, r = NaN, bm = NaN;
        var selSource = "";

        // روش اول: بررسی DOM standard selection.bounds
        try {
          var sel = d.selection;
          if (sel && sel.bounds) {
            var b = sel.bounds;
            l = forceNumber(b[0]);
            t = forceNumber(b[1]);
            r = forceNumber(b[2]);
            bm = forceNumber(b[3]);
            selSource = "DOM";
          }
        } catch(e1) {
          diagInfo += "DOM fail; ";
        }

        // روش دوم: پشتیبان نیتیو Photopea (ActionDescriptor) در صورت ناموفق بودن روش اول
        if (isNaN(l) || isNaN(t) || isNaN(r) || isNaN(bm)) {
          try {
            var ref = new ActionReference();
            ref.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("selection"));
            ref.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
            var desc = executeActionGet(ref);
            if (desc && desc.hasKey(stringIDToTypeID("selection"))) {
              var selObj = desc.getObjectValue(stringIDToTypeID("selection"));
              l = selObj.getUnitDoubleValue(stringIDToTypeID("left"));
              t = selObj.getUnitDoubleValue(stringIDToTypeID("top"));
              r = selObj.getUnitDoubleValue(stringIDToTypeID("right"));
              bm = selObj.getUnitDoubleValue(stringIDToTypeID("bottom"));
              selSource = "ActionDesc";
            }
          } catch(e2) {
            diagInfo += "ActionDesc fail; ";
          }
        }

        // محاسبه مرکز Selection
        if (!isNaN(l) && !isNaN(t) && !isNaN(r) && !isNaN(bm)) {
          var w = r - l;
          var h = bm - t;
          if (w > 0 && h > 0) {
            posX = l + (w / 2);
            posY = t + (h / 2);
            hasSel = true;
            diagInfo = "Src:" + selSource + " [" + Math.round(l) + "," + Math.round(t) + "," + Math.round(r) + "," + Math.round(bm) + "]";
          }
        }

        // ایمنی در برابر NaN
        if (isNaN(posX) || !isFinite(posX)) posX = docW / 2;
        if (isNaN(posY) || !isFinite(posY)) posY = docH / 2;

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
                     " (" + Math.round(posX) + ", " + Math.round(posY) + ")" +
                     (diagInfo ? " | " + diagInfo : "");

        app.echoToOE(report);

      } catch (err) {
        app.echoToOE("Script Error: " + err.message);
      }
    })();
  `;

  window.parent.postMessage(script, "*");
});
