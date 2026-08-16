(function () {
  "use strict";

  var statusEl = document.getElementById("status");
  var insertBtn = document.getElementById("insert");

  if (!statusEl || !insertBtn) {
    return;
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function isRealNumber(x) {
    return (
      typeof x === "number" &&
      x === x &&
      x !== Infinity &&
      x !== -Infinity
    );
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

      setStatus("Reading selection...");

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

        "if(u.value!==undefined&&u.value!==null){" +
        "var v1=Number(u.value);" +
        "if(real(v1))return v1;" +
        "}" +

        "if(typeof u.as==='function'){" +
        "try{" +
        "var v2=Number(u.as('px'));" +
        "if(real(v2))return v2;" +
        "}catch(e){}" +
        "}" +

        "var v3=Number(u);" +
        "if(real(v3))return v3;" +

        "var s=String(u);" +
        "var m=s.match(/-?\\d+(\\.\\d+)?/);" +

        "if(m)return parseFloat(m[0]);" +

        "return NaN;" +
        "}" +

        "var b=d.selection.bounds;" +

        "if(!b||b.length!==4){" +
        "app.echoToOE('TYPERP_ERR:Selection bounds unavailable.');" +
        "return;" +
        "}" +

        "var left=px(b[0]);" +
        "var top=px(b[1]);" +
        "var right=px(b[2]);" +
        "var bottom=px(b[3]);" +

        "if(!real(left)||!real(top)||!real(right)||!real(bottom)){" +
        "app.echoToOE(" +
        "'TYPERP_ERR:Invalid selection bounds: '+" +
        "String(left)+','+String(top)+','+" +
        "String(right)+','+String(bottom)" +
        ");" +
        "return;" +
        "}" +

        "if(right<=left||bottom<=top){" +
        "app.echoToOE(" +
        "'TYPERP_ERR:Invalid selection dimensions: '+" +
        "String(left)+','+String(top)+','+" +
        "String(right)+','+String(bottom)" +
        ");" +
        "return;" +
        "}" +

        "var cx=(left+right)/2;" +
        "var cy=(top+bottom)/2;" +

        "var layer=d.artLayers.add();" +
        "layer.kind=LayerKind.TEXT;" +

        "var ti=layer.textItem;" +
        "ti.kind=TextType.POINTTEXT;" +

        "ti.contents=" +
        JSON.stringify(text) +
        ";" +

        "ti.font=" +
        JSON.stringify(font) +
        ";" +

        "ti.size=" +
        size +
        ";" +

        "ti.justification=Justification." +
        align +
        ";" +

        "var c=new SolidColor();" +
        "c.rgb.hexValue=" +
        JSON.stringify(color) +
        ";" +

        "ti.color=c;" +

        "ti.position=[cx,cy];" +

        "d.activeLayer=layer;" +

        "app.echoToOE(" +
        "'TYPERP_OK:selection='+" +
        "Math.round(left)+','+" +
        "Math.round(top)+','+" +
        "Math.round(right)+','+" +
        "Math.round(bottom)+" +
        "' | center='+" +
        "Math.round(cx)+','+" +
        "Math.round(cy)" +
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

    if (typeof e.data !== "string") {
      return;
    }

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

  setStatus("Ready — Selection Text");

})();
