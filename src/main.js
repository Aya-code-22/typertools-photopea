(function() {
    'use strict';

    const statusEl = document.getElementById('status');
    const textEl = document.getElementById('text');
    const fontEl = document.getElementById('font');
    const sizeEl = document.getElementById('size');
    const colorEl = document.getElementById('color');
    const alignEl = document.getElementById('align');
    const insertBtn = document.getElementById('insert');

    function runPhotopeaScript(scriptText) {
        return new Promise((resolve, reject) => {
            const id = 'cmd_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            const handler = function(e) {
                const data = e.data;
                if (data && data.id === id) {
                    window.removeEventListener('message', handler);
                    if (data.error) reject(new Error(data.error));
                    else resolve(data.result);
                }
            };
            window.addEventListener('message', handler);
            window.parent.postMessage({ id: id, script: scriptText }, '*');
        });
    }

    insertBtn.addEventListener('click', async function() {
        try {
            statusEl.textContent = 'Inserting...';
            insertBtn.disabled = true;

            const text = textEl.value.trim() || 'TypeR-P';
            const font = fontEl.value || 'ArialMT';
            const size = parseInt(sizeEl.value) || 48;
            const color = colorEl.value || 'FF0000';
            const align = alignEl.value || 'CENTER';

            // === SCRIPT که با ترجمه (Translate) کار می‌کند ===
            const script = `
                try {
                    var doc = app.activeDocument;
                    var w = doc.width.value || doc.width;
                    var h = doc.height.value || doc.height;
                    
                    // 1. Create the text layer at the center of the document first (safe fallback)
                    var layer = doc.artLayers.add();
                    layer.kind = LayerKind.TEXT;
                    var ti = layer.textItem;
                    ti.kind = TextType.POINTTEXT;
                    ti.contents = \`${text}\`;
                    ti.font = \`${font}\`;
                    ti.size = ${size};
                    ti.justification = Justification.${align};
                    
                    var c = new SolidColor();
                    c.rgb.hexValue = '${color}';
                    ti.color = c;
                    
                    ti.position = [w/2, h/2];
                    
                    // 2. Try to move it to selection center using TRANSLATE
                    var moved = false;
                    var statusMsg = "Placed at document center (no valid selection)";
                    
                    try {
                        if (doc.selection && doc.selection.bounds) {
                            var b = doc.selection.bounds;
                            
                            // Directly use .value (as your debug showed they are numbers)
                            // BUT we must convert them to pixels using the document's resolution!
                            if (b[0] && typeof b[0].value === 'number') {
                                var left = b[0].value;
                                var top = b[1].value;
                                var right = b[2].value;
                                var bottom = b[3].value;
                                
                                // Photopea returns values in POINTS (pt) by default.
                                // 1 inch = 72 points. We need to convert to pixels.
                                // Pixels = Points * (DPI / 72)
                                var dpi = doc.resolution.value || 72; // Get DPI
                                var factor = dpi / 72;
                                
                                var selCX = (left + right) / 2 * factor;
                                var selCY = (top + bottom) / 2 * factor;
                                var docCX = w / 2;
                                var docCY = h / 2;
                                
                                // Translate the layer from document center to selection center
                                layer.translate(selCX - docCX, selCY - docCY);
                                
                                moved = true;
                                statusMsg = "Moved to selection center (Converted Points to Pixels)";
                            }
                        }
                    } catch(e) {
                        statusMsg = "Selection error: " + e.message + " (fallback to center)";
                    }
                    
                    doc.activeLayer = layer;
                    
                    app.echoToOE(JSON.stringify({
                        success: true,
                        msg: statusMsg,
                        moved: moved
                    }));
                } catch(e) {
                    app.echoToOE(JSON.stringify({
                        success: false,
                        error: e.toString()
                    }));
                }
            `;

            const resultStr = await runPhotopeaScript(script);
            const result = JSON.parse(resultStr);

            if (result.success) {
                statusEl.textContent = '✅ ' + result.msg;
            } else {
                statusEl.textContent = '❌ ' + result.error;
            }

        } catch (err) {
            statusEl.textContent = '❌ Plugin Error: ' + err.message;
        } finally {
            insertBtn.disabled = false;
        }
    });

    statusEl.textContent = 'Connecting...';
    window.addEventListener('message', function(e) {
        if (e.data && e.data === 'photopea-ready') {
            statusEl.textContent = 'Connected ✔️';
        }
    });
    window.parent.postMessage('plugin-ready', '*');

})();
