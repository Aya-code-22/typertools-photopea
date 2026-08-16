// دریافت پاسخ‌های ارسالی از Photopea (توسط app.echoToOE)
window.addEventListener("message", function (e) {
  if (typeof e.data === "string") {
    const statusEl = document.getElementById("status");
    if (statusEl) {
      statusEl.textContent = e.data;
    }
  }
});

document.getElementById("insert").addEventListener("click", function () {
  const textVal = document.getElementById("text").value || "Text";
  const fontVal = document.getElementById("font").value || "ArialMT";
  const sizeVal = parseFloat(document.getElementById("size").value) || 48;
  const colorVal = document.getElementById("color").value || "FF0000";
  const alignVal = document.getElementById("align").value || "CENTER";

  // آماده‌سازی متن برای ارسال به اسکریپت Photopea
  const escapedText = textVal
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");

  const escapedFont = fontVal.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const escapedColor = colorVal.replace(/[^0-9A-Fa-f]/g, "");

  // اسکریپتی که داخل Photopea اجرا می‌شود
  const script = `
    (function() {
      var d = app.activeDocument;
      if (!d) {
        app.echoToOE("Error: No document open in Photopea.");
        return;
      }

      // ۱. ذخیره unit فعلی و تغییر آن به PIXELS جهت محاسبات دقیق
      var oldUnits = app.preferences.rulerUnits;
      app.preferences.rulerUnits = Units.PIXELS;

      // مرکز کل تصویر (Fallback)
      var docW = (typeof d.width === "object" && "value" in d.width) ? d.width.value : Number(d.width);
      var docH = (typeof d.height === "object" && "value" in d.height) ? d.height.value : Number(d.height);
      
      var posX = docW / 2;
      var posY = docH / 2;

      var usedSelection = false;
      var debugMsg = "";

      // تابع تبدیل امن انواع داده‌های Photopea به عدد پیکسلی
      function parseCoord(val) {
        if (val === null || val === undefined) return NaN;
        if (typeof val === "number") return val;
        if (typeof val === "string") return parseFloat(val);
        if (typeof val === "object") {
          if ("value" in val && typeof val.value === "number") return val.value;
          if (typeof val.as === "function") return val.as("px");
          if ("value" in val) return parseFloat(String(val.value));
        }
        return parseFloat(String(val));
      }

      // ۲. استخراج ابعاد Selection با try-catch برای جلوگیری از کرش اسکریپت
      try {
        var sel = d.selection;
        if (sel) {
          var b = sel.bounds; // در صورت نبود Selection خطای ExtendScript می‌دهد
          if (b && b.length === 4) {
            var left   = parseCoord(b[0]);
            var top    = parseCoord(b[1]);
            var right  = parseCoord(b[2]);
            var bottom = parseCoord(b[3]);

            debugMsg = "Raw: [" + b[0] + "," + b[1] + "," + b[2] + "," + b[3] + "]";

            if (!isNaN(left) && !isNaN(top) && !isNaN(right) && !isNaN(bottom)) {
              var w = right - left;
              var h = bottom - top;
              if (w > 0 && h > 0) {
                posX = left + (w / 2);
                posY = top + (h / 2);
                usedSelection = true;
              }
            }
          }
        }
      } catch (err) {
        debugMsg = "No Selection (" + err.message + ")";
      }

      // بازگرداندن تنظیمات unit کاربر
      app.preferences.rulerUnits = oldUnits;

      // ۳. ساخت لایه متن در هر شرایطی (تضمینی)
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

      // تنظیم مختصات مرکز انتخاب یا مرکز تصویر
      ti.position = [posX, posY];
      d.activeLayer = layer;

      // ۴. ارسال وضعیت به پنل Plugin
      var report = (usedSelection ? "Placed in Selection" : "Placed in Doc Center") +
                   " (" + Math.round(posX) + ", " + Math.round(posY) + ")" +
                   (debugMsg ? " | " + debugMsg : "");

      app.echoToOE(report);
    })();
  `;

  window.parent.postMessage(script, "*");
});
