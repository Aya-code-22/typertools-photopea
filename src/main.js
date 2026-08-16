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

function runPhotopea(scriptBody) {
  const id = Math.random().toString(36).slice(2);
  const ok = "__RAW_OK_" + id + "__";
  const fail = "__RAW_ERR_" + id + "__";

  const script = `try {
${scriptBody}
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
    }, 10000);
  });
}

window.addEventListener("message", event => {
  if (event.data === "done") {
    setStatus("Connected");
    return;
  }

  if (typeof event.data !== "string") return;

  if (event.data.startsWith("__RAW_RESULT__")) {
    setStatus(event.data.slice("__RAW_RESULT__".length));
    return;
  }

  for (const [id, request] of state.pending) {
    const ok = "__RAW_OK_" + id + "__";
    const fail = "__RAW_ERR_" + id + "__";

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

async function readRawSelection() {
  const script = `
var d = app.activeDocument;
var result = "";

try {
  var b = d.selection.bounds;

  result = "RAW TYPE=" + typeof b +
           " | RAW=" + String(b);

  try {
    result += " | JSON=" + JSON.stringify(b);
  } catch(e2) {
    result += " | JSON_ERROR=" + String(e2);
  }

  try {
    result += " | 0=" + String(b[0]);
    result += " | 1=" + String(b[1]);
    result += " | 2=" + String(b[2]);
    result += " | 3=" + String(b[3]);
  } catch(e3) {
    result += " | INDEX_ERROR=" + String(e3);
  }

} catch(e) {
  result = "SELECTION_ERROR=" + String(e);
}

app.echoToOE("__RAW_RESULT__" + result);
`;

  try {
    setStatus("Reading raw selection...");
    await runPhotopea(script);
  } catch (e) {
    setStatus(e.message || String(e));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const button = document.querySelector("#insert");

  if (button) {
    button.textContent = "READ RAW SELECTION";
    button.addEventListener("click", readRawSelection);
  }

  setStatus("Ready");
});
