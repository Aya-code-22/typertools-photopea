(function() {
    'use strict';

    const statusEl = document.getElementById('status');
    const textEl = document.getElementById('text');
    const fontEl = document.getElementById('font');
    const sizeEl = document.getElementById('size');
    const colorEl = document.getElementById('color');
    const alignEl = document.getElementById('align');
    const insertBtn = document.getElementById('insert');

    // ------------------- Connection -------------------
    statusEl.textContent = 'Connecting to Photopea...';

    // Wait for Photopea to be ready (listen for messages)
    window.addEventListener('message', function(e) {
        if (e.data && e.data === 'photopea-ready') {
            statusEl.textContent = 'Connected to Photopea ✔️';
        }
    });

    // Tell Photopea we are ready
    window.parent.postMessage('plugin-ready', '*');

    // ------------------- Core Logic -------------------
    function runScript(script) {
        return new Promise((resolve, reject) => {
            const id = 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            
            const handler = function(e) {
                if (e.data && e.data.id === id) {
                    window.removeEventListener('message', handler);
                    if (e.data.error) {
                        reject(new Error(e.data.error));
                    } else {
                        resolve(e.data.result);
                    }
                }
            };
            window.addEventListener('message', handler);
            
            window.parent.postMessage({
                id: id,
                script: script
            }, '*');
        });
    }

    // ------------------- Insert Handler -------------------
    insertBtn.addEventListener('click', async function() {
        try {
            statusEl.textContent = 'Running...';
            insertBtn.disabled = true;

            const text = textEl.value.trim() || 'TypeR-P';
            const font = fontEl.value || 'ArialMT';
            const size = parseInt(sizeEl.value) || 48;
            const color = colorEl.value || 'FF0000';
            const align = alignEl.value || 'CENTER';

            // === The critical diagnostic script ===
            const script = `
                try {
                    var doc = app.activeDocument;
                    var w = doc.width;
                    var h = doc.height;
                    
                    // Default center (fallback)
                    var cx = w / 2;
                    var cy = h / 2;
                    var boundsInfo = 'No selection';
                    
                    // Try to get selection
                    if (doc.selection && doc.selection.bounds) {
                        var b = doc.selection.bounds;
                        // DIAGNOSTIC: Capture raw data
                        boundsInfo = JSON.stringify(b.map(function(u) { 
                            return u ? {value: u.value, type: u.type, unit: u.unit} : 'null'; 
                        }));
                        
                        // Attempt to extract pixels (Photopea uses UnitValue with .value)
                        if (b[0] && typeof b[0].value === 'number') {
                            var left = b[0].value;
                            var top = b[1].value;
                            var right = b[2].value;
                            var bottom = b[3].value;
                            
                            // Only use if valid numbers
                            if (isFinite(left) && isFinite(right)) {
                                cx = (left + right) / 2;
                                cy = (top + bottom) / 2;
                                boundsInfo = 'OK: ' + left + ',' + top + ',' + right + ',' + bottom;
                            }
                        }
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
                    
                    // Return diagnostic info to plugin
                    JSON.stringify({
                        success: true,
                        boundsRaw: boundsInfo,
                        placedAt: [cx, cy]
                    });
                } catch(e) {
                    JSON.stringify({
                        success: false,
                        error: e.toString(),
                        boundsRaw: 'Error during execution'
                    });
                }
            `;

            const result = await runScript(script);
            const data = JSON.parse(result);

            if (data.success) {
                statusEl.textContent = '✅ Text inserted at: ' + data.placedAt.join(', ') + ' | Bounds: ' + data.boundsRaw;
            } else {
                statusEl.textContent = '❌ Error: ' + data.error;
            }

        } catch (err) {
            statusEl.textContent = '❌ Plugin error: ' + err.message;
        } finally {
            insertBtn.disabled = false;
        }
    });

    // Initial status
    statusEl.textContent = 'Ready ✔️ (click INSERT)';

})();
