(function() {
    'use strict';

    const statusEl = document.getElementById('status');
    const textEl = document.getElementById('text');
    const fontEl = document.getElementById('font');
    const sizeEl = document.getElementById('size');
    const colorEl = document.getElementById('color');
    const alignEl = document.getElementById('align');
    const insertBtn = document.getElementById('insert');

    // ===== Photopea Plugin API (official) =====
    function photopeaExec(script) {
        return new Promise((resolve, reject) => {
            // Unique ID for this request
            const id = 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
            
            // Listener for response
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
            
            // Send to Photopea via official API
            window.parent.postMessage({
                id: id,
                script: script
            }, '*');
        });
    }

    // ===== Main Click Handler =====
    insertBtn.addEventListener('click', async function() {
        try {
            statusEl.textContent = 'Running script...';
            insertBtn.disabled = true;

            const text = textEl.value.trim() || 'TypeR-P';
            const font = fontEl.value || 'ArialMT';
            const size = parseInt(sizeEl.value) || 48;
            const color = colorEl.value || 'FF0000';
            const align = alignEl.value || 'CENTER';

            // ====== PHOTOPEA SCRIPT (runs inside Photopea) ======
            const script = `
                var doc = app.activeDocument;
                var w = doc.width;
                var h = doc.height;
                
                // Default center
                var cx = w / 2;
                var cy = h / 2;
                var statusMsg = 'No selection, using center';
                
                // Try to get selection bounds
                try {
                    if (doc.selection && doc.selection.bounds) {
                        var b = doc.selection.bounds;
                        // PHOTOPEA returns UnitValue objects - extract .value
                        if (b[0] && typeof b[0].value === 'number') {
                            var left = b[0].value;
                            var top = b[1].value;
                            var right = b[2].value;
                            var bottom = b[3].value;
                            
                            // Verify valid numbers
                            if (isFinite(left) && isFinite(right)) {
                                cx = (left + right) / 2;
                                cy = (top + bottom) / 2;
                                statusMsg = 'Selection found: ' + left + ',' + top + ',' + right + ',' + bottom;
                            } else {
                                statusMsg = 'Selection bounds invalid (NaN)';
                            }
                        } else {
                            statusMsg = 'Selection bounds format unexpected';
                        }
                    }
                } catch(e) {
                    statusMsg = 'Selection error: ' + e.toString();
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
                
                // Return result to plugin
                JSON.stringify({
                    success: true,
                    status: statusMsg,
                    centerX: cx,
                    centerY: cy
                });
            `;

            // Execute and get result
            const resultStr = await photopeaExec(script);
            const result = JSON.parse(resultStr);

            if (result.success) {
                statusEl.textContent = '✅ ' + result.status + ' | Center: (' + Math.round(result.centerX) + ', ' + Math.round(result.centerY) + ')';
            } else {
                statusEl.textContent = '❌ Error: ' + result.error;
            }

        } catch (err) {
            statusEl.textContent = '❌ Plugin error: ' + err.message;
        } finally {
            insertBtn.disabled = false;
        }
    });

    // ===== Connection Status =====
    statusEl.textContent = 'Waiting for Photopea...';
    window.addEventListener('message', function(e) {
        if (e.data && e.data === 'photopea-ready') {
            statusEl.textContent = 'Connected to Photopea ✔️';
        }
    });
    window.parent.postMessage('plugin-ready', '*');

})();
