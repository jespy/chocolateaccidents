Chocolate Accidents V3.10.4

Doorway test:
- Moved the functional passage between Reception and Break Room 50 game-world pixels to the right.
- Door definition changed from x:180 to x:230.
- Break Room and Reception now use the updated long red-tile artwork.
- All gameplay remains unchanged.


V3.12.1 — LET'S PLAY IT COOL
- Replaced the universal hiding presentation with contextual Play It Cool stations.
- Chris stays visible while using a station.
- Renee cannot detect Chris while he is successfully Playing It Cool.
- Existing safe station coordinates and camera-stability behavior are preserved.
- Break Room: ACT NATURAL
- Freezer: CHECK INVENTORY
- Art: FAKE A DEADLINE
- Production: QUALITY CONTROL
- Warehouse: CHECK THE SHELF
- Space toggles Play It Cool on/off.


V3.12.2 — PLAY IT COOL MARKER + ACTION POPUP
- Restores the green HIDE HERE visual language for Play It Cool stations.
- Each marker now says its contextual action instead of HIDE HERE.
- ACT NATURAL, CHECK INVENTORY, FAKE A DEADLINE, QUALITY CONTROL, CHECK THE SHELF.
- The active popup replaces HIDING with the contextual action title and a description of what Chris is doing.
- Chris remains visible and protected from The Big Boss while Playing It Cool.


V3.12.3 — HIDE HERE BOARD MARKERS
- All Play It Cool stations once again use the full original HIDE HERE + arrow image on the game board.
- Contextual actions such as ACT NATURAL and CHECK INVENTORY no longer appear on the floor.
- Contextual action name and description still appear after activating the station.
- Break Room HIDE HERE marker keeps its existing +20 X / -40 Y visual offset.


V3.12.5 — SHIPPING DEPARTMENT + TRAIN TAG
- Built directly from the uploaded fully working V3.12.3 package.
- Preserves all existing room graphics and character assets.
- Adds the supplied Shipping Department artwork.
- Adds invisible Shipping furniture collision zones.
- Shipping Computer can be used with E / Interact.
- Chocolate Accidents pauses while the Shipping Computer is in use.
- Train Tag opens inside the game and starts automatically.
- Press Esc inside Train Tag or use Exit Arcade to return to Chocolate Accidents.


V3.12.6
- ESC inside Train Tag now immediately closes the embedded arcade and returns to Chocolate Accidents.
- Number-row and numpad keys now type the 4-digit employee PIN on the clock-in screen.
- Backspace removes the last PIN digit.
- Enter / Numpad Enter clocks in once a valid PIN is accepted.
- Restart button renamed to Clock Out.
- Clock Out ends the shift and returns to the employee clock-in screen.


V3.12.7 — SHIPPING COMPUTER ARCADE HUB
- Fixes keyboard focus after leaving the arcade; Chris can move immediately without clicking.
- Shipping Computer now opens a game-selection screen.
- Options: Train Tag, Fredo Skates, Pigeon Chase.
- Train Tag is packaged locally.
- Fredo Skates and Pigeon Chase are selectable through their game pages when online.
- Back to Games returns to the selector.
- Exit Arcade returns to Chocolate Accidents.
- ESC in Train Tag exits to Chocolate Accidents and restores keyboard focus.


V3.12.8 — UNIVERSAL ARCADE ESCAPE
- ESC from Train Tag now returns to SELECT A GAME.
- ESC from Fredo Skates now returns to SELECT A GAME.
- ESC from Pigeon Chase now returns to SELECT A GAME.
- Fredo Skates and Pigeon Chase GitHub Pages were given embedded-only Escape hooks.
- ESC while already on SELECT A GAME exits the arcade and returns to Chocolate Accidents.
- Keyboard focus is restored to the game selector after leaving any mini-game.


V3.12.9 — LOCAL MINI-GAME BUNDLE + ESC FIX
- Fredo Skates is now bundled directly inside Chocolate Accidents.
- Pigeon Chase is now bundled directly inside Chocolate Accidents.
- Both games have a capture-phase embedded Escape handler.
- ESC from Train Tag, Fredo Skates, or Pigeon Chase returns to SELECT A GAME.
- ESC on SELECT A GAME exits the arcade and returns to Chocolate Accidents.
- No internet/GitHub page is required for the three arcade games.
