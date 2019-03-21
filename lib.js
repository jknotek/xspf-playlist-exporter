
const fs = require('fs');
const url = require('url');
const path = require('path');

const promisify = require('util').promisify;
const copyFilePromised = promisify(fs.copyFile);

/**
 * Normalizes the file URI into a standard file path.
 * 
 * @param {string} srcUri
 * @returns {string}
 * @throws Error
 */
function normalizeFileUri(srcUri) {
  let uri = url.parse(srcUri);
  let protocol = uri.protocol;
  protocol = protocol ? protocol.toString().toLowerCase() : protocol;
  if (!(protocol === null || protocol === 'file:')) {
    throw new Error(`Unsupported protocol "${protocol}". Only files on the local file system can be exported.`);
  }
  if (uri.host) {
    throw new Error(`Unsupported host "${uri.host}". Only files on the local file system can be exported.`);
  }
  return uri.pathname;
}

/**
 * Export (copy) a file from a source URI to a destination path on the file
 * system.
 * 
 * NOTE: Currently, only local file sources are valid.
 * 
 * @param {string} srcUri -- The URI of the source file to copy
 * @param {string} destPath -- The path of the copied file's destination on
 *  the local file system
 */
function exportFileSync(srcUri, destPath) {
  srcUri = normalizeFileUri(srcUri);
  return fs.copyFileSync(srcUri, destPath);
}
module.exports.exportFileSync = exportFileSync;

/**
 * Asynchronous (promised) version of `exportFileSync`.
 * 
 * @see exportFileSync
 */
async function exportFileAsync(srcUri, destPath) {
  // NOTE: making this a synchronous function that returns an un-`await`-ed
  // `copyFilePromised would not have worked properly. Potential errors
  // thrown in `normalizeFileUri` would not have been able to caught as
  // promise errors.
  srcUri = normalizeFileUri(srcUri);
  return await copyFilePromised(srcUri, destPath);
}
module.exports.exportFileAsync = exportFileAsync;

/**
 * Recursively create directories. NOTE: Existing directories will _not_
 * throw an error.
 * 
 * @param {string} path -- The path to create
 */
function mkdir(path) {
  return fs.mkdirSync(path, { recursive: true });
}
module.exports.mkdir = mkdir;

/**
 * Async (promised) version of `mkdir`
 * 
 * @see `mkdir`
 */
function mkdirPromised(path) {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, { recursive: true }, (err) => {
      if (err) {
        return reject(err);
      }
      return resolve(true);
    });
  });
}
module.exports.mkdirPromised = mkdirPromised;

/**
 * Pad a string with leading 0s.
 * 
 * @param {string} string -- The string to be padded
 * @param {number} length -- The number of desired characters in the _whole_
 *  string. If the string length is greater than `num`, it is unchanged.
 * @returns {string}
 */
function zpad(string, length = 2) {
  string = string.toString();
  while (string.length < length) {
    string = '0' + string;
  }
  return string;
}
module.exports.zpad = zpad;

/**
 * Copies tracks from their respective locations to a new location, prefixing
 * each track with its index in the track list.
 * 
 * @param {Array} tracks -- An array of file paths, ordered by their position
 *  in the track list.
 * @param {String} dest -- The destination directory to which to copy the
 *  tracks. NOTE: Existing files of the same name will be overwritten without
 *  warning!
 */
function copyTracksSync(tracks, dest) {
  mkdir(dest);

  let trackPad = Math.max(tracks.length.toString().length, 2);
  for (let i = 0; i < tracks.length; i++) {
    let track = tracks[i];
    let fileName = `${zpad(i + 1, trackPad)}. ` + path.basename(track.location);
    console.log(`Copying file ${fileName}`);
    try {
      exportFileSync(
        track.location,
        path.join(dest, fileName)
      );
    } catch (e) {
      console.error(`Skipping file "${fileName}.`, e.message);
    }
  }
}
module.exports.copyTracksSync = copyTracksSync;

/**
 * Asynchronous (promised) version of `copyTracksSync`.
 * 
 * @see copyTracksSync
 */
async function copyTracksAsync(tracks, dest) {
  await mkdirPromised(dest);

  let trackPad = Math.max(tracks.length.toString().length, 2);
  let promises = tracks.map((track, i) => {
    let fileName = `${zpad(i + 1, trackPad)}. ` + path.basename(track.location)
    console.log(`Copying file ${fileName}`);
    return exportFileAsync(
      track.location,
      path.join(dest, fileName)
    )
    .catch((e) => {
      console.error(`Skipping file "${fileName}".`, e.message);
    })
    ;
  });
  await Promise.all(promises)
}
module.exports.copyTracksAsync = copyTracksAsync;