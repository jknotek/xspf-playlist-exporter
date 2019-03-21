
const XSPFPlaylist = require('./xspf-reader.js');

test(`invalid playlist is not loaded`, () => {
  return new XSPFPlaylist()
    .loadFile('test-files/test-invalid-playlist.xspf')
    .catch((e) => {
      expect(e.message).toContain('Track list is missing');
    });
});