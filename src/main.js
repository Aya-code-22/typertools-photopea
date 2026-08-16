const state = { pending: new Map() };

function setStatus(text) {
  const el = document.querySelector("#status");
  if (el) el.textContent = text;
}

function runPhotopea(body) {
  const id = Math.random().toString(36).slice(2);
  const ok = "__SEL_OK_" + id + "__";
  const fail = "__SEL_ERR_" + id + "__";

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
    }, 10000);
  });
}

window.addEventListener("message", event => {
  if (typeof event.data !== "string") return;

  for (const [id, request] of state.pending) {
    const ok = "__SEL_OK_" + id + "__";
    const fail = "__SEL_ERR_" + id + "__";

    if (event.data === ok) {
      state.pending.delete(id);
      request.resolve();
      return;
    }

    if (event.data.startsWith(fail)) {
      state.pending.delete(id);
      request.reject(
        new Error(event.data.substring(fail.length))
      );
      return;
    }
  }

  if (event.data.startsWith("__SELECTION_RESULT__")) {
    setStatus(
      event.data.substring("__SELECTION_RESULT__".length)
    );
  }
});

async function readSelection() {

  const script = `
var d = app.activeDocument;
var result = "";

try {

  var b = d.selection.bounds;

  var left = Number(b[0]);
  var top = Number(b[1]);
  var right = Number(b[2]);
  var bottom = Number(b[3]);

  result =
    "Selection: " +
    Math.round(left) + ", " +
    Math.round(top) +
    " → " +
    Math.round(right) + ", " +
    Math.round(bottom);

} catch(e) {

  result = "NO SELECTION / ERROR: " + String(e);

}

app.echoToOE(
  "__SELECTION_RESULT__" + result
);
`;

  try {
    setStatus("Reading selection...");
    await runPhotopea(script);
  } catch (e) {
    setStatus(e.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {

  const button = document.querySelector("#insert");

  if (button) {
    button.textContent = "READ SELECTION";
    button.addEventListener("click", readSelection);
  }

});
