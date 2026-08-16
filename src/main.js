// TypeR-P
// BUILD: TYPERP-BUILD-009
// Selection -> Paragraph Text Box

(function () {
  "use strict";

  var statusEl = document.getElementById("status");
  var textEl = document.getElementById("text");
  var fontEl = document.getElementById("font");
  var sizeEl = document.getElementById("size");
  var colorEl = document.getElementById("color");
  var alignEl = document.getElementById("align");
  var insertBtn = document.getElementById("insert");

  if (!statusEl || !textEl || !fontEl || !sizeEl ||
      !colorEl || !alignEl || !insertBtn) {
    alert("TypeR-P: Required HTML elements are missing.");
    return;
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function js(value) {
    return JSON.stringify(value);
  }

  insertBtn.onclick = function () {
    try {
      var text = textEl.value;

      if (!text || !text.trim()) {
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

      /*
       * This code runs inside Photopea.
       * The important part is that Photoshop/Photopea
       * UnitValue objects are converted with .as("px").
       */

      var script =
        "(function () {" +
        "try {" +

        "var d = app.activeDocument;" +

        "var b = null;" +
        "var left, top, right, bottom;" +

        /*
         * Get selection bounds
         */
        "try {" +
          "b = d.selection.bounds;" +
        "} catch (e) {" +
          "b = null;" +
        "}" +

        "if (!b || b.length !== 4) {" +
          "app.echoToOE('TYPERP_ERR:No active selection.');" +
          "return;" +
        "}" +

        /*
         * Convert UnitValue / number to pixels.
         */
        "function px(v) {" +

          "if (typeof v === 'number') {" +
            "return v;" +
          "}" +

          "try {" +
            "return Number(v.as('px'));" +
          "} catch (e) {}" +

          "try {" +
            "return Number(v.value);" +
          "} catch (e) {}" +

          "return NaN;" +
        "}" +

        "left = px(b[0]);" +
        "top = px(b[1]);" +
        "right = px(b[2]);" +
        "bottom = px(b[3]);" +

        /*
         * Validate bounds.
         */
        "if (" +
          "!isFinite(left) || " +
          "!isFinite(top) || " +
          "!isFinite(right) || " +
          "!isFinite(bottom) || " +
          "right <= left || " +
          "bottom <= top" +
        ") {" +

          "app.echoToOE(" +
            "'TYPERP_ERR:Invalid selection bounds: ' +" +
            "left + ',' + top + ',' + right + ',' + bottom" +
          ");" +

          "return;" +
        "}" +

        /*
         * Selection dimensions.
         */
        "var width = right - left;" +
        "var height = bottom - top;" +

        /*
         * Create text layer.
         */
        "var layer = d.artLayers.add();" +
        "layer.kind = LayerKind.TEXT;" +
        "layer.name = " + js("TTP: " + text.slice(0, 40)) + ";" +

        "var ti = layer.textItem;" +

        /*
         * IMPORTANT:
         * Paragraph text uses position + width/height.
         */
        "ti.kind = TextType.PARAGRAPHTEXT;" +

        "ti.position = [" +
          "new UnitValue(left, 'px')," +
          "new UnitValue(top, 'px')" +
        "];" +

        "ti.width = new UnitValue(width, 'px');" +
        "ti.height = new UnitValue(height, 'px');" +

        "ti.contents = " + js(text) + ";" +
        "ti.font = " + js(font) + ";" +
        "ti.size = " + size + ";" +

        "ti.justification = Justification." + align + ";" +

        /*
         * Text color.
         */
        "var c = new SolidColor();" +
        "c.rgb.hexValue = " + js(color) + ";" +
        "ti.color = c;" +

        "d.activeLayer = layer;" +

        /*
         * Report exact selection.
         */
        "app.echoToOE(" +
          "'TYPERP_OK:' +" +
          "'selection=' +" +
          "Math.round(left) + ',' +" +
          "Math.round(top) + ',' +" +
          "Math.round(right) + ',' +" +
          "Math.round(bottom) +" +
          "' | size=' +" +
          "Math.round(width) + 'x' +" +
          "Math.round(height)" +
        ");" +

        "} catch (e) {" +

          "app.echoToOE(" +
            "'TYPERP_ERR:' +" +
            "(e && e.message ? e.message : String(e))" +
          ");" +

        "}" +
        "})();";

      /*
       * Send script to Photopea.
       */
      window.parent.postMessage(script, "*");

    } catch (e) {
      setStatus("Error: " + e.message);
      alert("TypeR-P error: " + e.message);
    }
  };

  /*
   * Receive Photopea response.
   */
  window.addEventListener("message", function (event) {

    try {

      if (typeof event.data !== "string") {
        return;
      }

      if (event.data.indexOf("TYPERP_OK:") === 0) {

        setStatus(
          "Text inserted. " +
          event.data.substring("TYPERP_OK:".length)
        );

      } else if (event.data.indexOf("TYPERP_ERR:") === 0) {

        setStatus(
          "Error: " +
          event.data.substring("TYPERP_ERR:".length)
        );

      }

    } catch (e) {
      setStatus("Response error: " + e.message);
    }

  });

  setStatus("Ready (build-009)");

})();
