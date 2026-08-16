const state = { pending: new Map() };

function setStatus(text) {
  const el = document.querySelector("#status");
  if (el) el.textContent = text;
}

function esc(s) {
  return String(s)
    .replaceAll("\\", "\\\\")
    .replaceAll('"', '\\"')
    .replaceAll("\n", "\\n")
    .replaceAll("\r", "\\r");
}

function runPhotopea(body) {
  if (!window.parent || window.parent === window) {
    return Promise.reject(
      new Error("Open TypeR-P inside Photopea.")
    );
  }

  const id = Math.random().toString(36).slice(2);
  const ok = `__TTP5_${id}_OK__`;
  const fail = `__TTP5_${id}_ERR__`;

  const script = `try {
${body}
app.echoToOE("${ok}");
} catch(e) {
app.echoToOE("${fail}" + String(e));
}`;

  return new Promise((resolve, reject) => {
    state.pending.set(id, { resolve, reject });

    window.parent.postMessage(script, "*");

    setTimeout(() => {
      if (!state.pending.has(id)) return;

      state.pending.delete(id);
      reject(new Error("Photopea timed out."));
    }, 12000);
  });
}

window.addEventListener("message", event => {
  if (event.data === "done") {
    setStatus("Connected");
    return;
  }

  if (typeof event.data !== "string") return;

  for (const [id, request] of state.pending) {
    const ok = `__TTP5_${id}_OK__`;
    const fail = `__TTP5_${id}_ERR__`;

    if (event.data === ok) {
      state.pending.delete(id);
      request.resolve();
      return;
    }

    if (event.data.startsWith(fail)) {
      state.pending.delete(id);

      request.reject(
        new Error(
          event.data.slice(fail.length)
        )
      );

      return;
    }
  }
});

async function insertText() {

  const textEl = document.querySelector("#text");
  const sizeEl = document.querySelector("#size");
  const colorEl = document.querySelector("#color");
  const fontEl = document.querySelector("#font");
  const alignEl = document.querySelector("#align");

  const text = textEl ? textEl.value.trim() : "";

  if (!text) {
    setStatus("Enter text first.");
    return;
  }

  const size =
    sizeEl ? Number(sizeEl.value) || 48 : 48;

  const font =
    fontEl ? fontEl.value.trim() || "ArialMT" : "ArialMT";

  const alignment =
    alignEl ? alignEl.value || "CENTER" : "CENTER";

  const color =
    (colorEl ? colorEl.value : "FF0000")
      .replace("#", "")
      .padEnd(6, "0")
      .slice(0, 6);

  const script = `
var d = app.activeDocument;

/*
  STEP 1
  Create the text exactly like the working version.
*/

var layer = d.artLayers.add();

layer.kind = LayerKind.TEXT;

layer.name =
  "TTP: ${esc(text.slice(0, 40))}";

var ti = layer.textItem;

ti.kind = TextType.POINTTEXT;

ti.contents =
  "${esc(text)}";

ti.font =
  "${esc(font)}";

ti.size =
  ${size};

ti.justification =
  Justification.${alignment};

var c = new SolidColor();

c.rgb.hexValue =
  "${color}";

ti.color = c;

/*
  STEP 2
  Put it at the center of the document first.
*/

ti.position = [
  d.width / 2,
  d.height / 2
];

d.activeLayer = layer;

/*
  STEP 3
  NOW read the selection.
*/

try {

  var b = d.selection.bounds;

  var left =
    Number(b[0]);

  var top =
    Number(b[1]);

  var right =
    Number(b[2]);

  var bottom =
    Number(b[3]);

  /*
    Make sure the selection
    actually has a usable size.
  */

  if (
    isFinite(left) &&
    isFinite(top) &&
    isFinite(right) &&
    isFinite(bottom) &&
    right > left &&
    bottom > top
  ) {

    /*
      Center of the selection.
    */

    var selectionCenterX =
      (left + right) / 2;

    var selectionCenterY =
      (top + bottom) / 2;

    /*
      Get the REAL bounds
      of the text layer after
      Photopea rendered it.
    */

    var tb =
      layer.bounds;

    var textCenterX =
      (Number(tb[0]) + Number(tb[2])) / 2;

    var textCenterY =
      (Number(tb[1]) + Number(tb[3])) / 2;

    /*
      Move the text so its
      center matches the
      selection center.
    */

    layer.translate(
      selectionCenterX - textCenterX,
      selectionCenterY - textCenterY
    );
  }

} catch (e) {

  /*
    If there is no selection,
    leave the text in the center.
  */

}

d.activeLayer = layer;
`;

  try {

    setStatus("Creating text...");

    await runPhotopea(script);

    setStatus("Text created");

  } catch (e) {

    setStatus(
      e.message || String(e)
    );
  }
}

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const button =
      document.querySelector("#insert");

    if (button) {
      button.addEventListener(
        "click",
        insertText
      );
    }

  }
);
