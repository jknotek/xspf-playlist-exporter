'use strict';

const fs = require('fs');

const he = require('he');
const xmlParser = require('fast-xml-parser');

/**
 * Basic object wrapper for XML Shareable Playlist Format (XSPF) files.
 */
module.exports = class XSPFPlaylist {

  constructor() {
    this.dom = {};
    this.fileName = null;
  }

  /**
   * Loads an XSPF playlist file.
   * 
   * @param {string} fileName -- An XSPF-formatted XML file.
   */
  loadFile(fileName) {
    return new Promise((resolve, reject) => {
      fs.readFile(fileName, (err, content) => {
        if (err) {
          return reject(err);
        }

        this.fileName = fileName;
        this.dom = xmlParser.parse(content.toString(), {
          attrValueProcessor: a => he.decode(a, { isAttributeValue: true }),
          tagValueProcessor: a => he.decode(a),
        });

        try {
          XSPFPlaylist.validate(this.dom)
        } catch (e) {
          return reject(e);
        }

        return resolve(this);
      });
    });
  }

  /**
   * Performs minimal validation for an XSPF document tree.
   * 
   * @param {Object} dom -- An XML document object, representing an XSPF
   *  document
   * @returns true if valid, throws an error otherwise
   * @throws Error
   */
  static validate(dom) {
    if (!dom.playlist) {
      throw Error(`Playlist is not in XSPF format.`);
    }

    if (!dom.playlist.trackList) {
      throw Error(`Track list is missing from playlist.`);
    }

    return true;
  }

  get tracks() {
    return this.dom.playlist.trackList.track;
  }

  get document() {
    return this.dom;
  }

}