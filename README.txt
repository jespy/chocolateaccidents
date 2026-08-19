
V3.16.14 — CHOCOLATE NIGHT SHIFT
- Added Chocolate Night Shift to the Shipping Computer arcade as the eighth locally packaged minigame.
- Integrated Night Shift v0.15 gameplay, random floor tiles, dynamic 4×4 ceiling lights, and pause-screen brightness setting.
- Escape pauses and resumes Chocolate Night Shift instead of immediately leaving the arcade.
- Added Exit Game to the Night Shift pause screen; it returns to SELECT A GAME.
- Chocolate Accidents shift time remains frozen while Night Shift is open or paused.

V3.16.12 — ARCADE EXPANSION
- Added Cocoa Quest to the Shipping Department computer arcade.
- Added Temper Tantrum, including its local music and boss/weapon assets.
- Shipping arcade now contains seven locally packaged mini-games.
- Pressing Esc inside Cocoa Quest or Temper Tantrum returns directly to the Shipping Computer game selector.
- Existing Back to Games and Exit Arcade controls remain available.
- Chocolate Accidents shift time remains paused while any arcade game is open.

Chocolate Accidents V3.10.4

V3.16.10 — EXPERT FASTEST-TIME SCOREBOARD
- Added a dedicated Fastest — Level 3 Expert leaderboard panel.
- Expert rankings query only completed shifts saved with difficulty "expert".
- Easy, Hard, and Highest Scores panels remain unchanged.
- The four panels use a readable two-column desktop layout and stack on smaller screens.

V3.16.9 — EXPERT RANDOM ROAMING
- Added Level 3 Expert without changing Easy or Hard behavior.
- The Big Boss and Almeria independently shuffle full-factory destination lists.
- Every patrol cycle still covers every destination before reshuffling.
- Consecutive cycles cannot repeat the same complete route or immediately repeat the last stop.
- Expert radar: The Big Boss 215 px; Almeria 195 px.
- Expert speeds: Big Boss 165 patrol / 220 chase; Almeria 178 patrol / 225 chase.
- Expert scores are supported by the included scoreboard SQL migration.

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


V3.12.10
- Train Tag ESC now works from the Game Over screen as well as during gameplay.
- ESC from Train Tag always returns to the Chocolate Accidents SELECT A GAME screen.


V3.15.5 — REINDEER ROUNDUP
- Adds Reindeer Roundup as the fourth Shipping Computer arcade game.
- Includes the complete North Pole wilderness background, circular stable, elf sprites, deer sprites, and falling-snow animation locally.
- ESC from Reindeer Roundup returns to the SELECT A GAME screen.
- Existing Train Tag, Fredo Skates, and Pigeon Chase games remain unchanged.


V3.15.6 — MAIN THEME MUSIC
- Adds Cocoa Conveyor Caper as the looping Chocolate Accidents main theme.
- Music starts after Clock In to comply with browser autoplay requirements.
- The main theme pauses while a Shipping Computer arcade game is open and resumes after returning to the factory.
- Added a Music On/Off control to the top bar.
- Clock Out stops the theme and resets it to the beginning.


V3.15.7 — BOSS CHASE MUSIC
- Adds Sugar Alarm as the looping chase theme.
- Sugar Alarm starts when either The Big Boss or Almeria spots the player and enters CHASING state.
- Cocoa Conveyor Caper is muted while Sugar Alarm is playing.
- The main theme resumes from its previous position when neither boss is chasing.
- The Music On/Off control affects both tracks.


V3.15.8 — CHASE MUSIC GRACE PERIOD
- Sugar Alarm continues for three seconds after both bosses lose sight of the player.
- Reacquiring the player during that grace period resets the timer without restarting the chase track.
- Cocoa Conveyor Caper resumes only after the full three-second grace period expires.


V3.15.9 — ALMERIA CUTTING-STATION COOLDOWN
- After adding a task, Almeria returns to the cutting station on the left side of Production.
- She stops at the right side of the cutting table and faces left toward it.
- Her position and facing remain locked there for the full 30-second cooldown.
- She resumes her normal patrol after the cooldown expires.

V3.16.0 — ONLINE SCOREBOARD
- Tracks live shift score and elapsed time.
- Easy, medium, and hard tasks award 100, 200, and 300 base points.
- Level 2 applies a 1.5x task-point multiplier.
- Completed shifts earn a 500-point bonus and are uploaded using the active employee PIN.
- Scoreboard includes highest scores plus fastest completed Level 1 and Level 2 shifts.
- Incomplete shifts never qualify. The game remains playable if the scoreboard is offline.
- Before using the online scoreboard, run supabase-setup.sql once in the Supabase SQL Editor.

V3.16.1 — ARCADE INITIALS
- Completed shifts now open a classic three-letter initials entry screen.
- Scores are published under initials such as CJR; no email or account is required.
- Employee PINs are used only to clock into the game and are not uploaded with scores.
- Initials are restricted to exactly three uppercase A–Z characters.
- The included SQL safely upgrades the V3.16.0 table while retaining existing scores.

V3.16.8 — GINGER EMPLOYEE
- Added Ginger as a playable clock-in employee with PIN 1201.
- Integrated Ginger's eight supplied transparent directional walking frames.
- The first forward frame provides Ginger's stationary pose.
- Two-frame side animations repeat cleanly through the existing walk cycle.

V3.16.7 — ELFIE EMPLOYEE
- Added Elfie as a playable clock-in employee with PIN 1225.
- Integrated Elfie's supplied transparent idle and directional walking frames.
- Employee selection now switches the complete player animation set at clock-in.
- Chris remains available with PIN 6767 and his existing graphics are unchanged.

V3.16.6 — THE INHERITANCE MOBILE CONTROLS
- Added touch-only controls without changing desktop keyboard and mouse play.
- Added a left movement joystick and right-side drag camera look.
- Added Interact, Sprint, Evidence, and Pause touch buttons.
- Improved touch modal sizing, safe-area spacing, and portrait orientation guidance.
- Mobile play no longer depends on browser pointer lock.

V3.16.5 — ARCADE TIMER PAUSE
- The shift timer now freezes while the Shipping Computer arcade is open.
- Arcade selection and all five mini-games remain timer-neutral.
- Exiting the arcade resumes the shift clock from its exact previous value.
- Added a visible SHIFT TIMER PAUSED notice to the arcade header.

V3.16.4 — 50% ROOM IMAGE TEST
- Resized all 17 room PNGs to exactly 50% of their previous pixel dimensions.
- Preserved filenames, aspect ratios, artwork, and all existing code references.
- Removed print-only DPI metadata and verified every resized PNG can be fully decoded.

V3.16.3 — FACTORY PAUSE MENU
- Escape now pauses and resumes normal factory gameplay.
- Pause freezes the shift clock, movement, supervisors, detection, tasks, animations, and music.
- Added Resume Shift, Controls, Music, Restart Shift, and confirmed Clock Out actions.
- Added a mobile Pause control and automatic pausing when the browser tab is hidden.
- Escape still respects task, map, arcade, and leaderboard screens first.

V3.16.2 HOTFIX — THE INHERITANCE PAUSE / EXIT
- Escape now pauses and resumes The Inheritance instead of leaving the arcade.
- Added an explicit "Exit Game" button to its pause menu.

V3.16.2 — THE INHERITANCE ARCADE
- Adds The Inheritance as the fifth locally bundled Shipping Computer arcade game.
- The arcade selector uses a maximum of three game cards per row: three on the first row and two on the second.
- The Inheritance retains its complete first-person mystery, evidence progression, and three endings.
- ESC from normal Inheritance gameplay returns to SELECT A GAME; examination and login screens retain their internal ESC behavior.


V3.16.13 - Arcade Pause Update
- Cocoa Quest: ESC pauses/resumes; pause menu now includes Exit Game to return to Shipping Computer arcade selector.
- Temper Tantrum: ESC pauses/resumes; pause menu now includes Exit Game to return to Shipping Computer arcade selector.
