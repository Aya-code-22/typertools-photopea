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
  const ok = `__TTP_FINAL_OK_${id}__`;
  const fail = `__TTP_FINAL_ERR_${id}__`;

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
    const ok = `__TTP_FINAL_OK_${id}__`;
    const fail = `__TTP_FINAL_ERR_${id}__`;

    if (event.data === ok) {
      state.pending.delete(id);
      request.resolve();
      return;
    }

    if (event.data.startsWith(fail)) {
      state.pending.delete(id);
      request.reject(new Error(event.data.slice(fail.length)));
      return;
    }
  }
});

function getValueExpression(unitValue) {
  /*
    Photopea/Photoshop-style coordinates can be UnitValue objects.
    .value gives the numeric value. If it is already numeric,
    use it directly.
  */
  return `(typeof ${unitValue} === "number" ? ${unitValue} : Number(${unitValue}.value))`;
}

async function insertText() {
  const text = document.querySelector("#text")?.value.trim();

  if (!text) {
    setStatus("Enter text first.");
    return;
  }

  const size = Number(document.querySelector("#size")?.value) || 48;
  const font = document.querySelector("#font")?.value.trim() || "ArialMT";
  const alignment = document.querySelector("#align")?.value || "CENTER";

  const color = (document.querySelector("#color")?.value || "FF0000")
    .replace("#", "")
    .padEnd(6, "0")
    .slice(0, 6);

  const script = `
var d = app.activeDocument;

/* ---------------------------------------------------------
   1. Read the selection FIRST, using UnitValue.value.
   --------------------------------------------------------- */

var hasSelection = false;

var sx = d.width / 2;
var sy = d.height / 2;

try {
  var b = d.selection.bounds;

  var left   = (typeof b[0] === "number") ? b[0] : Number(b[0].value);
  var top    = (typeof b[1] === "number") ? b[1] : Number(b[1].value);
  var right  = (typeof b[2] === "number") ? b[2] : Number(b[2].value);
  var bottom = (typeof b[3] === "number") ? b[3] : Number(b[3].value);

  if (
    isFinite(left) &&
    isFinite(top) &&
    isFinite(right) &&
    isFinite(bottom) &&
    right > left &&
    bottom > top
  ) {
    sx = (left + right) / 2;
    sy = (top + bottom) / 2;
    hasSelection = true;
  }
} catch (selectionError) {
  hasSelection = false;
}

/* ---------------------------------------------------------
   2. Create the text exactly as the known-working version.
   --------------------------------------------------------- */

var layer = d.artLayers.add();

layer.kind = LayerKind.TEXT;
layer.name = "TTP: ${esc(text.slice(0, 40))}";

var ti = layer.textItem;

ti.kind = TextType.POINTTEXT;
ti.contents = "${esc(text)}";
ti.font = "${esc(font)}";
ti.size = ${size};
ti.justification = Justification.${alignment};

var c = new SolidColor();
c.rgb.hexValue = "${color}";
ti.color = c;

/*
   Create it at the document center first.
   This guarantees the text is created visibly.
*/
ti.position = [
  d.width / 2,
  d.height / 2
];

d.activeLayer = layer;

/* ---------------------------------------------------------
   3. If there is a selection, center the rendered text
      inside that selection.
   --------------------------------------------------------- */

if (hasSelection) {
  try {
    var tb = layer.bounds;

    var textLeft =
      (typeof tb[0] === "number") ? tb[0] : Number(tb[0].value);

    var textTop =
      (typeof tb[1] === "number") ? tb[1] : Number(tb[1].value);

    var textRight =
      (typeof tb[2] === "number") ? tb[2] : Number(tb[2].value);

    var textBottom =
      (typeof tb[3] === "number") ? tb[3] : Number(tb[3].value);

    var tx = (textLeft + textRight) / 2;
    var ty = (textTop + textBottom) / 2;

    layer.translate(
      sx - tx,
      sy - ty
    );

  } catch (moveError) {
    /*
      If bounds of the text layer cannot be read,
      leave the already-visible text at the center
      rather than deleting/failing the layer.
    */
  }
}

d.activeLayer = layer;
`;

  try {
    setStatus("Creating text...");
    await runPhotopea(script);
    setStatus("Text created");
  } catch (e) {
    setStatus(e.message || String(e));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const button = document.querySelector("#insert");

  if (button) {
    button.textContent = "INSERT TEXT";
    button.addEventListener("click", insertText);
  }

  setStatus("Ready");
});
