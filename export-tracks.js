#!/usr/bin/env node
'use strict';

const path = require('path');

const ArgumentParser = require('argparse').ArgumentParser;

const XSPFPlaylist = require(path.join(__dirname, 'xspf-reader.js'));
const lib = require(path.join(__dirname, 'lib.js'));

function getArgs() {
  let argParser = new ArgumentParser({
    addHelp: true,
  });
  argParser.addArgument(
    ['-i', '--input'],
    {
      help: `input playlist file`,
      required: true,
    }
  );
  argParser.addArgument(
    ['-d', '--dir'],
    {
      help: `output directory`,
      required: true,
      dest: `output`,
    }
  );
  argParser.addArgument(
    ['--async'],
    {
      choices: ['true', 'false', ''],
      required: false,
      help: `copy files asynchronously; may improve performance in some cases`,
      dest: `async`,
      defaultValue: false,
    }
  );

  let args = argParser.parseArgs();
  args.async = (args.async === 'true');

  return args;
}

async function exportTracks(args) {
  let playlist = await new XSPFPlaylist().loadFile(args.input);
  let tracks = playlist.tracks;
  let dest = path.join(args.output);

  let startTime = Date.now();

  if (args.async) {
    await lib.copyTracksAsync(tracks, dest);
  } else {
    lib.copyTracksSync(tracks, dest);
  }

  let elapsed = (Date.now() - startTime) / 1000;
  console.log(`\nCompleted! Time elapsed: ${elapsed}s`);
}
module.exports = exportTracks;

if (require.main === module) {
  let args = getArgs();
  exportTracks(args)
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}