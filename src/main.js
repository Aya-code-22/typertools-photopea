(function () {
  "use strict";

  var statusEl = document.getElementById("status");
  var insertBtn = document.getElementById("insert");

  if (!statusEl || !insertBtn) return;

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function real(x) {
    return (
      typeof x === "number" &&
      x === x &&
      x !== Infinity &&
      x !== -Infinity
    );
  }

  function getNumber(u) {
    if (u === null || u === undefined) return NaN;

    if (real(u)) return u;

    try {
      if (u.value !== undefined && u.value !== null) {
        var v = Number(u.value);
        if (real(v)) return v;
      }
    } catch (e) {}

    try {
      if (typeof u.as === "function") {
        var p = Number(u.as("px"));
        if (real(p)) return p;
      }
    } catch (e) {}

    try {
      var n = Number(u);
      if (real(n)) return n;
    } catch (e) {}

    return NaN;
  }

  insertBtn.onclick = function () {
    try {
      var textEl = document.getElementById("text");
      var fontEl = document.getElementById("font");
      var sizeEl = document.getElementById("size");
      var colorEl = document.getElementById("color");
      var alignEl = document.getElementById("align");

      var text = textEl.value;

      if (!text || text.trim() === "") {
        setStatus("Please type some text first.");
        return;
      }

      var font = fontEl.value || "ArialMT";
      var size = Number(sizeEl.value) || 48;

      var color = (colorEl.value || "000000")
        .replace(/[^0-9a-fA-F]/g, "")
        .padEnd(6, "0")
        .slice(0, 6);

      var align = alignEl.value || "CENTER";

      /*
       * Padding فعلاً داخل خود Selection اعمال می‌شود.
       * فعلاً مقدار ثابت است؛ در مرحله بعد کنترل UI برایش اضافه می‌کنیم.
       */
      var padding = 12;

      setStatus("Creating text box...");

      function js(v) {
        return JSON.stringify(String(v));
      }

      var script =
        "(function(){" +
        "try{" +

        "var d=app.activeDocument;" +

        "function real(x){" +
        "return typeof x==='number'&&x===x&&x!==Infinity&&x!==-Infinity;" +
        "}" +

        "function px(u){" +
        "if(u===null||u===undefined)return NaN;" +

        "if(real(u))return u;" +

        "try{" +
        "if(u.value!==undefined&&u.value!==null){" +
        "var v=Number(u.value);" +
        "if(real(v))return v;" +
        "}" +
        "}catch(e){}" +

        "try{" +
        "if(typeof u.as==='function'){" +
        "var p=Number(u.as('px'));" +
        "if(real(p))return p;" +
        "}" +
        "}catch(e){}" +

        "try{" +
        "var n=Number(u);" +
        "if(real(n))return n;" +
        "}catch(e){}" +

        "return NaN;" +
        "}" +

        "var b=d.selection.bounds;" +

        "if(!b||b.length!==4){" +
        "app.echoToOE('TYPERP_ERR:No selection.');" +
        "return;" +
        "}" +

        "var left=px(b[0]);" +
        "var top=px(b[1]);" +
        "var right=px(b[2]);" +
        "var bottom=px(b[3]);" +

        "if(!real(left)||!real(top)||!real(right)||!real(bottom)||right<=left||bottom<=top){" +
        "app.echoToOE('TYPERP_ERR:Could not read selection.');" +
        "return;" +
        "}" +

        "var width=right-left;" +
        "var height=bottom-top;" +

        "var boxLeft=left+" + padding + ";" +
        "var boxTop=top+" + padding + ";" +
        "var boxWidth=Math.max(1,width-" + (padding * 2) + ");" +
        "var boxHeight=Math.max(1,height-" + (padding * 2) + ");" +

        "var layer=d.artLayers.add();" +
        "layer.kind=LayerKind.TEXT;" +
        "layer.name=" + js("TTP: " + text.slice(0,45)) + ";" +

        "var ti=layer.textItem;" +

        /*
         * Paragraph Text = واقعی‌ترین حالت برای Text Box
         */
        "ti.kind=TextType.PARAGRAPHTEXT;" +

        "ti.contents=" + js(text) + ";" +
        "ti.font=" + js(font) + ";" +
        "ti.size=" + size + ";" +
        "ti.justification=Justification." + align + ";" +

        "ti.position=[" +
        "new UnitValue(boxLeft,'px')," +
        "new UnitValue(boxTop,'px')" +
        "];" +

        "ti.width=new UnitValue(boxWidth,'px');" +
        "ti.height=new UnitValue(boxHeight,'px');" +

        "var c=new SolidColor();" +
        "c.rgb.hexValue=" + js(color) + ";" +
        "ti.color=c;" +

        "d.activeLayer=layer;" +

        "app.echoToOE(" +
        "'TYPERP_OK:Text Box | size='+" +
        "Math.round(boxWidth)+'x'+Math.round(boxHeight)" +
        ");" +

        "}catch(e){" +

        "app.echoToOE(" +
        "'TYPERP_ERR:'+" +
        "(e&&e.message?e.message:String(e))" +
        ");" +

        "}" +
        "})();";

      window.parent.postMessage(script, "*");

    } catch (err) {
      setStatus("Error: " + err.message);
    }
  };

  window.addEventListener("message", function (e) {
    if (typeof e.data !== "string") return;

    if (e.data.indexOf("TYPERP_OK:") === 0) {
      setStatus(
        "Text inserted. " +
        e.data.substring("TYPERP_OK:".length)
      );
    }

    if (e.data.indexOf("TYPERP_ERR:") === 0) {
      setStatus(
        "Error: " +
        e.data.substring("TYPERP_ERR:".length)
      );
    }
  });

  setStatus("Ready — Text Box");

})();
