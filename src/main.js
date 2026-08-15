const DEFAULT_STYLES = {
  Normal: { font: "ArialMT", size: 24, color: "000000", alignment: "CENTER", tracking: 0, leading: 0 },
  Shout: { font: "Arial-BoldMT", size: 28, color: "000000", alignment: "CENTER", tracking: 0, leading: 0 },
  Narration: { font: "ArialMT", size: 22, color: "000000", alignment: "LEFT", tracking: 0, leading: 0 }
};

const state = {
  styles: loadJSON("ttp.styles", DEFAULT_STYLES),
  currentStyle: localStorage.getItem("ttp.currentStyle") || "Normal",
  script: [],
  currentIndex: 0,
  pending: new Map()
};

function loadJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

function saveStyles() {
  localStorage.setItem("ttp.styles", JSON.stringify(state.styles));
  localStorage.setItem("ttp.currentStyle", state.currentStyle);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function escapeScriptString(s) {
  return String(s).replaceAll("\\", "\\\\").replaceAll('"', '\\"')
    .replaceAll("\n", "\\n").replaceAll("\r", "\\r");
}

function setStatus(text) {
  const el = document.querySelector("#status");
  if (el) el.textContent = text;
}

function sendScript(body) {
  if (!window.parent || window.parent === window) {
    setStatus("Open this plugin inside Photopea");
    return Promise.reject(new Error("This plugin must run inside Photopea."));
  }

  const id = crypto.randomUUID();
  const ok = `__TTP__${id}__OK__`;
  const err = `__TTP__${id}__ERR__`;

  const script = `try {
${body}
app.echoToOE("${escapeScriptString(ok)}" + JSON.stringify({ok:true}));
} catch(e) {
app.echoToOE("${escapeScriptString(err)}" + JSON.stringify({ok:false,error:String(e)}));
}`;

  return new Promise((resolve, reject) => {
    state.pending.set(id, { resolve, reject });
    window.parent.postMessage(script, "*");

    setTimeout(() => {
      if (!state.pending.has(id)) return;
      state.pending.delete(id);
      reject(new Error("Photopea did not respond."));
      setStatus("Photopea timeout");
    }, 15000);
  });
}

window.addEventListener("message", event => {
  if (event.data === "done") {
    setStatus("Connected");
    return;
  }

  if (typeof event.data !== "string" || !event.data.startsWith("__TTP__")) return;

  const match = event.data.match(/^__TTP__(.+?)__(OK|ERR)__(.*)$/s);
  if (!match) return;

  const [, id, type, payload] = match;
  const request = state.pending.get(id);
  if (!request) return;

  state.pending.delete(id);

  try {
    const data = JSON.parse(payload);
    type === "OK" ? request.resolve(data) : request.reject(new Error(data.error || "Photopea script failed."));
  } catch (error) {
    request.reject(error);
  }
});

function render() {
  const names = Object.keys(state.styles);

  document.querySelector("#app").innerHTML = `
    <header><strong>TypeR-P</strong><span id="status">Waiting for Photopeaâ€¦</span></header>

    <section class="panel">
      <label>Script</label>
      <textarea id="script" placeholder="One dialogue per line..."></textarea>
      <div class="row">
        <button id="loadScript">Load</button>
        <button id="prev">â€¹</button>
        <span id="counter">0 / 0</span>
        <button id="next">â€º</button>
      </div>
    </section>

    <section class="panel">
      <label>Current text</label>
      <textarea id="currentText" placeholder="Select a script line or type here..."></textarea>
    </section>

    <section class="panel">
      <label>Style</label>
      <select id="style">${names.map(n => `<option value="${escapeHtml(n)}" ${n === state.currentStyle ? "selected" : ""}>${escapeHtml(n)}</option>`).join("")}</select>
      <div class="row">
        <input id="font" placeholder="Font PostScript name">
        <input id="size" type="number" min="1" step="1">
      </div>
      <div class="row">
        <input id="color" placeholder="000000" maxlength="6">
        <select id="align">
          <option value="LEFT">Left</option>
          <option value="CENTER">Center</option>
          <option value="RIGHT">Right</option>
        </select>
      </div>
    </section>

    <section class="actions">
      <button id="insert" class="primary">INSERT TEXT</button>
      <button id="center">AUTO-CENTER</button>
      <button id="fit">FIT TEXT</button>
      <button id="readSelection">READ SELECTION</button>
    </section>

    <section class="panel small">
      <button id="saveStyle">Save current style</button>
      <button id="newStyle">New style</button>
      <button id="deleteStyle">Delete style</button>
    </section>`;

  bind();
  applyStyleToUI();
  updateCounter();
}

function applyStyleToUI() {
  const s = state.styles[state.currentStyle] || DEFAULT_STYLES.Normal;
  document.querySelector("#font").value = s.font;
  document.querySelector("#size").value = s.size;
  document.querySelector("#color").value = s.color;
  document.querySelector("#align").value = s.alignment;
}

function readStyleFromUI() {
  return {
    ...(state.styles[state.currentStyle] || {}),
    font: document.querySelector("#font").value.trim() || "ArialMT",
    size: Number(document.querySelector("#size").value) || 24,
    color: document.querySelector("#color").value.replace("#", "") || "000000",
    alignment: document.querySelector("#align").value
  };
}

function updateCounter() {
  const c = document.querySelector("#counter");
  if (c) c.textContent = state.script.length ? `${state.currentIndex + 1} / ${state.script.length}` : "0 / 0";
}

function setCurrentText() {
  const el = document.querySelector("#currentText");
  if (el) el.value = state.script[state.currentIndex] || "";
}

function bind() {
  document.querySelector("#style").onchange = e => {
    state.currentStyle = e.target.value;
    saveStyles();
    applyStyleToUI();
  };

  document.querySelector("#loadScript").onclick = () => {
    state.script = document.querySelector("#script").value.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
    state.currentIndex = 0;
    setCurrentText();
    updateCounter();
  };

  document.querySelector("#prev").onclick = () => {
    if (!state.script.length) return;
    state.currentIndex = Math.max(0, state.currentIndex - 1);
    setCurrentText();
    updateCounter();
  };

  document.querySelector("#next").onclick = () => {
    if (!state.script.length) return;
    state.currentIndex = Math.min(state.script.length - 1, state.currentIndex + 1);
    setCurrentText();
    updateCounter();
  };

  document.querySelector("#insert").onclick = async () => {
    const text = document.querySelector("#currentText").value.trim();
    if (!text) return;
    try {
      setStatus("Insertingâ€¦");
      await insertText(text, readStyleFromUI());
      setStatus("Inserted");
    } catch (e) { setStatus(e.message); }
  };

  document.querySelector("#center").onclick = async () => {
    try { setStatus("Centeringâ€¦"); await autoCenter(); setStatus("Centered"); }
    catch (e) { setStatus(e.message); }
  };

  document.querySelector("#fit").onclick = async () => {
    try { setStatus("Fittingâ€¦"); await fitText(); setStatus("Fitted"); }
    catch (e) { setStatus(e.message); }
  };

  document.querySelector("#readSelection").onclick = async () => {
    try {
      await sendScript(`var d=app.activeDocument;var b=d.selection.bounds;app.echoToOE("__TTPSEL__"+JSON.stringify({left:Number(b[0]),top:Number(b[1]),right:Number(b[2]),bottom:Number(b[3])}));`);
      setStatus("Selection requested");
    } catch (e) { setStatus(e.message); }
  };

  document.querySelector("#saveStyle").onclick = () => {
    state.styles[state.currentStyle] = readStyleFromUI();
    saveStyles();
    setStatus("Style saved");
  };

  document.querySelector("#newStyle").onclick = () => {
    const n = prompt("Style name:", "New Style");
    if (!n || state.styles[n]) return;
    state.styles[n] = { ...DEFAULT_STYLES.Normal };
    state.currentStyle = n;
    saveStyles();
    render();
  };

  document.querySelector("#deleteStyle").onclick = () => {
    if (Object.keys(state.styles).length <= 1) return;
    if (!confirm(`Delete "${state.currentStyle}"?`)) return;
    delete state.styles[state.currentStyle];
    state.currentStyle = Object.keys(state.styles)[0];
    saveStyles();
    render();
  };
}

async function insertText(text, style) {
  const textValue = JSON.stringify(text);
  const fontValue = JSON.stringify(style.font);
  const colorValue = JSON.stringify(style.color.replace("#", "").padEnd(6, "0").slice(0, 6));

  await sendScript(`
var d=app.activeDocument;
var savedRulerUnits=app.preferences.rulerUnits;
var savedTypeUnits=app.preferences.typeUnits;
app.preferences.rulerUnits=Units.PIXELS;
app.preferences.typeUnits=TypeUnits.PIXELS;
var layer=d.artLayers.add();
layer.kind=LayerKind.TEXT;
layer.name="TTP: ${escapeScriptString(text.slice(0,32))}";
var t=layer.textItem;
t.kind=TextType.PARAGRAPHTEXT;
var box=[100,100,Math.max(300,d.width-200),Math.max(200,d.height-200)];
try { var b=d.selection.bounds; box=[Number(b[0]),Number(b[1]),Number(b[2]),Number(b[3])]; } catch(e) {}
t.position=[box[0],box[1]];
t.width=Math.max(10,box[2]-box[0]);
t.height=Math.max(10,box[3]-box[1]);
t.contents=${textValue};
t.font=${fontValue};
t.size=${Number(style.size)};
t.justification=Justification.${style.alignment};
var c=new SolidColor();c.rgb.hexValue=${colorValue};t.color=c;
try{t.tracking=${Number(style.tracking)||0};}catch(e){}
try{if(${Number(style.leading)||0}>0)t.leading=${Number(style.leading)};}catch(e){}
d.activeLayer=layer;
app.preferences.rulerUnits=savedRulerUnits;
app.preferences.typeUnits=savedTypeUnits;
`);
}

async function autoCenter() {
  await sendScript(`
var d=app.activeDocument,l=d.activeLayer;
var savedRulerUnits=app.preferences.rulerUnits;
app.preferences.rulerUnits=Units.PIXELS;
if(!l||l.kind!==LayerKind.TEXT)throw new Error("Select a text layer first.");
var s=d.selection.bounds,b=l.bounds;
var sx=(Number(s[0])+Number(s[2]))/2,sy=(Number(s[1])+Number(s[3]))/2;
var lx=(Number(b[0])+Number(b[2]))/2,ly=(Number(b[1])+Number(b[3]))/2;
l.translate(sx-lx,sy-ly);
app.preferences.rulerUnits=savedRulerUnits;
`);
}

async function fitText() {
  await sendScript(`
var d=app.activeDocument,l=d.activeLayer;
var savedRulerUnits=app.preferences.rulerUnits;
var savedTypeUnits=app.preferences.typeUnits;
app.preferences.rulerUnits=Units.PIXELS;
app.preferences.typeUnits=TypeUnits.PIXELS;
if(!l||l.kind!==LayerKind.TEXT)throw new Error("Select a text layer first.");
var s=d.selection.bounds,maxW=Number(s[2])-Number(s[0]),maxH=Number(s[3])-Number(s[1]),t=l.textItem;
for(var i=0;i<40;i++){
  var b=l.bounds,w=Number(b[2])-Number(b[0]),h=Number(b[3])-Number(b[1]);
  if(w<=maxW&&h<=maxH)break;
  var cur=Number(t.size),next=Math.max(6,cur*.92);
  if(next===cur)break;
  t.size=next;
}
var f=l.bounds;
var sx=(Number(s[0])+Number(s[2]))/2,sy=(Number(s[1])+Number(s[3]))/2;
var lx=(Number(f[0])+Number(f[2]))/2,ly=(Number(f[1])+Number(f[3]))/2;
l.translate(sx-lx,sy-ly);
app.preferences.rulerUnits=savedRulerUnits;
app.preferences.typeUnits=savedTypeUnits;
`);
}

render();
