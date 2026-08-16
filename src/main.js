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

function runPhotopea(body, resultPrefix, onResult) {
  const id = Math.random().toString(36).slice(2);
  const ok = `__TTP_OK_${id}__`;
  const fail = `__TTP_ERR_${id}__`;

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

  if (event.data.startsWith("__TTP_SELECTION__")) {
    setStatus(event.data.slice("__TTP_SELECTION__".length));
    return;
  }

  for (const [id, request] of state.pending) {
    const ok = `__TTP_OK_${id}__`;
    const fail = `__TTP_ERR_${id}__`;

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

async function insertText() {
  const text = document.querySelector("#text")?.value.trim();

  if (!text) {
    setStatus("Enter text first.");
    return;
  }

  const size = Number(document.querySelector("#size")?.value) || 48;
  const font = document.querySelector("#font")?.value.trim() || "ArialMT";
  const alignment =
    document.querySelector("#align")?.value || "CENTER";

  const color = (document.querySelector("#color")?.value || "FF0000")
    .replace("#", "")
    .padEnd(6, "0")
    .slice(0, 6);

  const script = `
var d = app.activeDocument;

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

/* Keep the proven working behavior:
   create the text at the document center. */
ti.position = [d.width / 2, d.height / 2];

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

/*
  Diagnostic only.
  This does NOT affect text creation.
  It reads the raw selection values and displays them.
*/
async function readSelection() {
  const script = `
var d = app.activeDocument;
var result = "";

try {
  var b = d.selection.bounds;

  result =
    "RAW: " + String(b) +
    " | JSON: " + JSON.stringify(b) +
    " | 0:" + String(b[0]) +
    " | 1:" + String(b[1]) +
    " | 2:" + String(b[2]) +
    " | 3:" + String(b[3]);

} catch(e) {
  result = "SELECTION ERROR: " + String(e);
}

app.echoToOE("__TTP_SELECTION__" + result);
`;

  try {
    setStatus("Reading selection...");
    await runPhotopea(script);
  } catch (e) {
    setStatus(e.message || String(e));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const insert = document.querySelector("#insert");

  if (insert) {
    insert.textContent = "INSERT TEXT";
    insert.addEventListener("click", insertText);
  }

  /* Add a separate diagnostic button without changing
     the existing text workflow. */
  const actions = document.querySelector(".actions");

  if (actions && !document.querySelector("#readSelection")) {
    const button = document.createElement("button");

    button.id = "readSelection";
    button.type = "button";
    button.textContent = "READ SELECTION";

    button.addEventListener("click", readSelection);

    actions.appendChild(button);
  }

  setStatus("Ready");
});

