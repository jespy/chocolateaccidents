# Train Tag V1

Standalone retro arcade prototype designed for later insertion into Chocolate Accidents.

## Gameplay
- Cross seven horizontal train tracks.
- Dodge moving trains with different speeds, lengths, and directions.
- Warning lights flash at the edge when trains approach.
- Reach one of five open graffiti slots on the wall.
- Tag all five slots to advance a level.
- Each new level makes trains faster.
- Three lives.

## Controls
- WASD / Arrow Keys: move one arcade step
- Esc: quit/pause to menu
- Touch directional pad on mobile

## Embed-ready API
- `window.TrainTag.start()`
- `window.TrainTag.quit()`
- `window.TrainTag.getState()`
- `window.TrainTag.setPaused(true/false)`

## Custom events
- `train-tag-exit`
- `train-tag-gameover`
- `train-tag-level`
