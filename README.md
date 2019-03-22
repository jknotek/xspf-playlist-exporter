
A simple XSPF playlist "exporter" tool, which copies local files from a
playlist and packages them up in their own directory, prefixed by their track
number so file browsers order them correctly.

## Example
Given the following playlist:
```
+---+-------------------+
| # | title             |
+---+-------------------+
| 1 | track one         |
| 2 | another track     |
| 3 | yet another track |
| 4 | final track       |
+---+-------------------+
```

It will procure a directory like so:
```
playlist/
  01. track one.mp3
  02. another track.mp3
  03. yet another track.mp3
  04. final track.mp3
```

Then you're ready to zip it up and send it off!

## Installation
- clone the git repo
- `npm install`

**Note:** This software has only been tested with Node 11.8.0. It will probably
work with other versions of Node with little or no modification, but
currently I can't say for sure.

### Testing
Testing uses `jest`. Just run `npm test` after installing the development
dependencies.

## Usage
It can be invoked from the command line:

`node export-tracks.js -i YOUR_PLAYLIST.xspf -d YOUR_OUTPUT_DIRECTORY`

...Or imported into another module for direct access to its API:

```js
const exportTracks = require('./export-tracks.js');

(async function() {
  let args = {
    input: 'YOUR_PLAYLIST.xspf',
    output: 'YOUR_OUTPUT_DIRECTORY',
  };
  return await exportTracks(args)
})();
```

For more details, run `node export-tracks.js --help`, or see the (admittedly
underwhelming) test file `export-tracks.spec.js`.

## Limitations
- only works with XSPF documents
- does not handle files specified on another machine (e.g. files references
  in the playlist by an HTTP URI)

## License
ISC (See `LICENSE` file)