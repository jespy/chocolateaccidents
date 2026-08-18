# The Inheritance

A complete three-room first-person mystery/horror game made with HTML, CSS, JavaScript, and Three.js.

## Run

For the simplest local launch, open `index.html` in a modern browser. Three.js is included locally, so no internet connection is required. If the browser restricts local scripts, start a local server in this folder:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Controls

- WASD: move
- Mouse: look
- E or left mouse click: examine/interact with the item under the crosshair
- Shift: sprint
- I: evidence journal
- Esc: release the mouse/pause

Mobile controls activate only on coarse-pointer touch devices:

- Left joystick: move
- Drag the right side: look around
- Interact: examine or use the centered object
- Hold Sprint: move faster
- Evidence: open or close the evidence journal
- Pause: pause or resume

## Structure

- `index.html` — UI and screen structure
- `css/style.css` — game/HUD styling
- `css/theme.css` — illustrated-noir dossier theme and post-processing overlays
- `js/state.js` — inventory, evidence, and knowledge state
- `js/audio.js` — procedural ambient drone and tension stings
- `js/visuals.js` — procedural textures, low-poly furniture, props, set dressing, and particles
- `js/game.js` — Three.js world, controller, interactions, puzzles, and endings

## Placeholder assets

There are no required image, model, texture, or audio assets. The late-1980s wallpaper, wood, rugs, tile, furniture, clues, body, lighting, and dust are generated locally with Three.js primitives and canvas textures. Sound is synthesized with the Web Audio API. Three.js 0.160.0 is included in `js/vendor/` for completely offline play.

## Solution path

Arthur → silver key → wooden box → cassette → office recorder → code 1987 → computer and safe → kitchen evidence → pantry screwdriver/weapon → back door. Recover all essential evidence and secure it for the best ending.
