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
    return Promise.reject(new Error("Open TypeR-P inside Photopea."));
  }

  const id = Math.random().toString(36).slice(2);
  const ok = `__TTP_TEST_${id}_OK__`;
  const fail = `__TTP_TEST_${id}_ERR__`;

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
    const ok = `__TTP_TEST_${id}_OK__`;
    const fail = `__TTP_TEST_${id}_ERR__`;

    if (event.data === ok) {
      state.pending.delete(id);
      request.resolve();
      return;
    }

    if (event.data.startsWith(fail)) {
      state.pending.delete(id);
      request.reject(
        new Error(event.data.slice(fail.length))
      );
      return;
    }
  }
});

async function insertText() {
  const textEl = document.querySelector("#text");
  const sizeEl = document.querySelector("#size");
  const colorEl = document.querySelector("#color");

  const text = textEl ? textEl.value.trim() : "";

  if (!text) {
    setStatus("Enter text first.");
    return;
  }

  const size = sizeEl ? Number(sizeEl.value) || 48 : 48;

  const color = (colorEl ? colorEl.value : "FF0000")
    .replace("#", "")
    .padEnd(6, "0")
    .slice(0, 6);

  /*
    TEST VERSION

    Selection is deliberately NOT read.
    The text is deliberately NOT moved.
    This creates normal Point Text in the
    center of the document.
  */

  const script = `
var d = app.activeDocument;

var layer = d.artLayers.add();
layer.kind = LayerKind.TEXT;
layer.name = "TTP TEST: ${esc(text.slice(0, 30))}";

var ti = layer.textItem;
ti.kind = TextType.POINTTEXT;
ti.contents = "${esc(text)}";
ti.font = "ArialMT";
ti.size = ${size};
ti.justification = Justification.CENTER;

var c = new SolidColor();
c.rgb.hexValue = "${color}";
ti.color = c;

/*
  IMPORTANT:
  No selection.bounds.
  No layer.translate().
  No width/height.
  No transform.
*/

ti.position = [d.width / 2, d.height / 2];

d.activeLayer = layer;
`;

  try {
    setStatus("Creating test text...");
    await runPhotopea(script);
    setStatus("Test text created");
  } catch (e) {
    setStatus(e.message || String(e));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const button = document.querySelector("#insert");

  if (button) {
    button.addEventListener("click", insertText);
  }
});
