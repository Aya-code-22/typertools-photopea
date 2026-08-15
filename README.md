# TypeR-P — TypeR-style Photopea typesetting plugin

This is the first MVP of a Photopea typesetting plugin.

## Current features

- Script lines
- Style presets stored in browser Local Storage
- Paragraph text creation
- Uses the current Photopea selection as the text box
- Font / size / color / alignment
- Auto-center selected text layer inside the current selection
- Basic auto-fit by reducing font size
- No Photoshop CEP dependencies

## Important

Photopea plugins are web pages. Photopea loads the URL from the plugin JSON and communicates with the page through Live Messaging.

For development, run:

```bash
npm install
npm run dev
```

Then deploy the `dist/` directory to a static HTTPS host such as GitHub Pages.

After deployment, edit `plugin.json` and replace the placeholder URL.

In Photopea:

Window -> Plugins -> Add Plugin

Load the JSON file.

## First test

1. Open a PSD/page in Photopea.
2. Make a rectangular selection around a speech bubble.
3. Open TypeR-P.
4. Enter a line of dialogue.
5. Choose a style.
6. Press INSERT TEXT.
7. Select the resulting text layer if necessary.
8. Press AUTO-CENTER.

## Architecture

UI -> core operations -> Photopea Live Messaging -> Photopea scripting API.

The project intentionally avoids Photoshop CEP/CSInterface/JSX host code.
