(function() {
    'use strict';

    const statusEl = document.getElementById('status');
    const textEl = document.getElementById('text');
    const fontEl = document.getElementById('font');
    const sizeEl = document.getElementById('size');
    const colorEl = document.getElementById('color');
    const alignEl = document.getElementById('align');
    const insertBtn = document.getElementById('insert');

    // === Photopea official plugin method ===
    function runPhotopeaScript(scriptText) {
        return new Promise((resolve, reject) => {
            // Generate unique ID
            const id = 'cmd_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            
            // Response handler
            const handler = function(e) {
                const data = e.data;
                if (data && data.id === id) {
                    window.removeEventListener('message', handler);
                    if (data.error) {
                        reject(new Error(data.error));
                    } else {
                        resolve(data.result);
                    }
                }
            };
            window.addEventListener('message', handler);
            
            // Send script to Photopea (this is the official way)
            window.parent.postMessage({
                id: id,
                script: scriptText
            }, '*');
        });
    }

    // === Insert handler ===
    insertBtn.addEventListener('click', async function() {
        try {
            statusEl.textContent = 'Sending to Photopea...';
            insertBtn.disabled = true;

            const text = textEl.value.trim() || 'TypeR-P';
            const font = fontEl.value || 'ArialMT';
            const size = parseInt(sizeEl.value) || 48;
            const color = colorEl.value || 'FF0000';
            const align = alignEl.value || 'CENTER';

            // === Photopea script (uses app.echoToOE for response) ===
            const script = `
                try {
                    var doc = app.activeDocument;
                    var w = doc.width.value || doc.width;
                    var h = doc.height.value || doc.height;
                    
                    var cx = w / 2;
                    var cy = h / 2;
                    var msg = 'No selection, center used';
                    
                    // Try selection
                    try {
                        if (doc.selection && doc.selection.bounds) {
                            var b = doc.selection.bounds;
                            // Photopea returns UnitValues
                            if (b[0] && b[0].value !== undefined) {
                                var left = b[0].value;
                                var top = b[1].value;
                                var right = b[2].value;
                                var bottom = b[3].value;
                                
                                if (isFinite(left) && isFinite(right)) {
                                    cx = (left + right) / 2;
                                    cy = (top + bottom) / 2;
                                    msg = 'Selection: ' + left + ',' + top + ',' + right + ',' + bottom;
                                }
                            }
                        }
                    } catch(e) {
                        msg = 'Selection error: ' + e.message;
                    }
                    
                    // Create text layer
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
                    
                    ti.position = [cx, cy];
                    doc.activeLayer = layer;
                    
                    // RETURN RESULT TO PLUGIN (OFFICIAL PHOTOPEA METHOD)
                    app.echoToOE(JSON.stringify({
                        success: true,
                        msg: msg,
                        centerX: cx,
                        centerY: cy
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
                statusEl.textContent = '✅ ' + result.msg + ' | Center: (' + Math.round(result.centerX) + ', ' + Math.round(result.centerY) + ')';
            } else {
                statusEl.textContent = '❌ Photopea error: ' + result.error;
            }

        } catch (err) {
            statusEl.textContent = '❌ Plugin error: ' + err.message;
        } finally {
            insertBtn.disabled = false;
        }
    });

    // === Connect status ===
    statusEl.textContent = 'Waiting for Photopea...';
    window.addEventListener('message', function(e) {
        if (e.data && e.data === 'photopea-ready') {
            statusEl.textContent = 'Connected to Photopea ✔️';
        }
    });
    window.parent.postMessage('plugin-ready', '*');

})();
