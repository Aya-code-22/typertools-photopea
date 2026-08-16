window.addEventListener("message", function (e) {
  const statusEl = document.getElementById("status");
  if (!statusEl) return;

  if (typeof e.data === "string") {
    statusEl.textContent = e.data;
  } else if (e.data) {
    try {
      statusEl.textContent = typeof e.data === "object" ? JSON.stringify(e.data) : String(e.data);
    } catch (err) {
      statusEl.textContent = "Response received from Photopea";
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
      function send(msg) {
        if (typeof app !== "undefined" && typeof app.echoToOE === "function") {
          app.echoToOE(msg);
        }
      }

      try {
        var d = app.activeDocument;
        if (!d) {
          send("Error: No document open in Photopea.");
          return;
        }

        // تبدیل تضمینی UnitValue / Number / String به عدد خالص
        function toNum(val) {
          if (val === null || val === undefined) return NaN;
          if (typeof val === "number") return val;
          if (typeof val.value === "number") return val.value;
          var n = val * 1;
          if (!isNaN(n)) return n;
          n = parseFloat(String(val));
          return isNaN(n) ? NaN : n;
        }

        // ابعاد سند
        var docW = toNum(d.width);
        var docH = toNum(d.height);
        
        var posX = (!isNaN(docW) && docW > 0) ? docW / 2 : 400;
        var posY = (!isNaN(docH) && docH > 0) ? docH / 2 : 300;

        var hasSel = false;
        var selLog = "";

        // استخراج Selection
        try {
          var sel = d.selection;
          if (sel) {
            var b = sel.bounds;
            if (b && b.length === 4) {
              var l = toNum(b[0]);
              var t = toNum(b[1]);
              var r = toNum(b[2]);
              var bm = toNum(b[3]);

              selLog = "Bounds: [" + l + "," + t + "," + r + "," + bm + "]";

              if (!isNaN(l) && !isNaN(t) && !isNaN(r) && !isNaN(bm) && (r > l) && (bm > t)) {
                posX = (l + r) / 2;
                posY = (t + bm) / 2;
                hasSel = true;
              }
            }
          }
        } catch (selErr) {
          selLog = "No active selection";
        }

        // جلوگیری از ارسال NaN به موتور متن جهت منع کرش اسکریپت
        if (isNaN(posX) || !isFinite(posX)) posX = docW / 2 || 400;
        if (isNaN(posY) || !isFinite(posY)) posY = docH / 2 || 300;

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

        var resultText = (hasSel ? "Placed in Selection" : "Placed in Center") +
                          " [" + Math.round(posX) + ", " + Math.round(posY) + "]" +
                          (selLog ? " | " + selLog : "");

        send(resultText);

      } catch (err) {
        send("Script Error: " + err.message);
      }
    })();
  `;

  window.parent.postMessage(script, "*");

  // تایمر خروج از وضعیت معلق در صورت عدم پاسخ از فوتوپیا
  setTimeout(function() {
    if (statusEl && statusEl.textContent === "Sending to Photopea...") {
      statusEl.textContent = "Command sent (Check Canvas)";
    }
  }, 1500);
});
