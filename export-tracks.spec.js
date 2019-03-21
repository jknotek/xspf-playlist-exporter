
const fs = require('fs');
const rimraf = require('rimraf');
const exportTracks = require('./export-tracks.js');

const OUTPUT_DIR = './tmp-tracks';

afterAll(() => {
  rimraf.sync(OUTPUT_DIR);
});

test(`copies valid files and ignores invalid ones`, () => {
  let args = {
    input: 'test-files/test-playlist.xspf',
    output: OUTPUT_DIR,
  };

  return exportTracks(args)
    .catch((e) => {
      // we're expecting some errors here and need to specify a handler so
      // our tests don't fail
    })
    .then(() => {
      let filesExported = fs.readdirSync('tmp-tracks');
      expect(filesExported).toEqual([
        '01. test-1.mp3',
        '03. test-3.mp3',
      ]);
    });
});