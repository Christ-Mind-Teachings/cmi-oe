import notify from "toastr";

import {fetchConfiguration} from "common/modules/_ajax/config";
import {gs} from "common/modules/_language/lang";

import {status} from "./status";
const transcript = require("./key");

let g_sourceInfo;
let config; //the current configuration, initially null, assigned by getConfig()
let cache = {};

/**
 * Get config data for book from config, cache, local storage, or axios.
 *
 * @param {string} bookId
 * @return {object} - config data
 */
async function getBookConfig(bookId) {

  //check if already loaded
  if (config.bid === bookId) {
    return config;
  }

  //check if in cache
  if (cache[bookId]) {
    return cache[bookId];
  }

  try {
    let result = await getConfig(bookId, false);
    return result;
  }
  catch(err) {
    console.error("%o", err);
    notify.error("failed to get config for book: %s", bookId);
  }
}

/**
 * Get the configuration file for 'book'. If it's not found in
 * the local storage then get it from the server and
 * save it in 'config'.
 *
 * @param {string} book - the book identifier
 * @param {boolean} assign - true if the config is to be assigned to global config variable
 * @returns {promise}
 */
export function getConfig(book, assign = true) {
  let lsKey = `cfg${book}`;
  let url = `${g_sourceInfo.configUrl}/${book}.json`;

  return new Promise((resolve, reject) => {
    fetchConfiguration(url, lsKey, status).then((resp) => {
      if (assign) {
        //add to cache before replacing 'config'
        if (config) {
          cache[config.bid] = config;
        }
        config = resp;
      }
      resolve(resp);
    }).catch((err) => {
      console.error(err);
      reject(err);
    });
  });
}

/**
 * Load the configuration file for 'book'. If it's not found in
 * the cache (local storage) then get it from the server and
 * save it in cache.
 *
 * @param {string} book - the book identifier
 * @returns {promise}
 */
export function loadConfig(book) {
  let lsKey = `cfg${book}`;
  let url = `${g_sourceInfo.configUrl}/${book}.json`;

  //"book" is a single page, no configuration
  if (!book) {
    return Promise.resolve(false);
  }

  return new Promise((resolve, reject) => {
    fetchConfiguration(url, lsKey, status)
      .then((resp) => {
        config = resp;
        resolve(true);
      })
      .catch((error) => {
        config = null;
        console.error(error);
        reject(error);
      });
  });
}

/**
 * Get page info from config file. Config
 * file is loaded if not already loaded.
 *
 * @param {string | number} page - location.pathname or pageKey
 * @param {object} data - object to be added to result
 * @return {object} - audio info, {} if invalid
 */
//function getAudioInfo(url) {
export async function getPageInfo(page, data = false) {
  let pageKey = page;

  //page is location.pathname
  if (typeof page === "string" && page.startsWith("/t/")) {
    pageKey = transcript.genPageKey(page);
    if (pageKey === -1) return {};
  }

  let decodedKey = transcript.decodeKey(pageKey);
  if (decodedKey.error) return {};

  try {
    let config = await getBookConfig(decodedKey.bookId);

    let pageInfo = {};

    //no subunits
    //subtract -1 from uid and xid to translate from key to config file
    if (decodedKey.xid === 0) {
      pageInfo = config.contents[decodedKey.uid - 1];
    }
    else {
      //merge unit and subunit, only key: url should be shared, all others must be unique
      let subunit = config.contents[decodedKey.uid - 1].contents[decodedKey.xid - 1];

      pageInfo = config.contents[decodedKey.uid - 1];
      delete pageInfo.contents;

      pageInfo.url = `${pageInfo.url}/${subunit.url}`;

      let keys = Object.keys(subunit);
      keys.forEach(k => {
        if (k !== "url") {
          pageInfo[k] = subunit[k];
        }
      });
    }

    //add these to the result
    pageInfo.audioBase = g_sourceInfo.audioBase;
    pageInfo.source = g_sourceInfo.title;
    pageInfo.bookId = decodedKey.bookId;
    pageInfo.pageKey = pageKey;
    pageInfo.bookTitle = config.title;

    if (data) {
      pageInfo.data = data;
    }

    return pageInfo;
  }
  catch(err) {
    console.error("%o", err);
    notify.error("Failed to get config for %s", decodedKey.bookId);
  }
}

/**
 * Get audio info from config file
 *
 * @param {string} url - location.pathname
 * @return {object} - audio info
function getAudioInfo(url) {
  //check that config has been initialized
  if (!config) {
    throw new Error("Configuration has not been initialized");
  }

  let audioInfo = config.contents.find(p => {
    return url.startsWith(p.url);
  });

  if (!audioInfo) {
    notify.error(gs("error:e4", "Configuration file error, didn't find url in file."));
    return {};
  }

  if (audioInfo.url !== url) {
    audioInfo = audioInfo.contents.find(p => {
      return p.url === url;
    });
  }

  if (!audioInfo) {
    notify.error(gs("error:e4", "Configuration file error, didn't find url in file."));
    return {};
  }

  audioInfo.audioBase = g_sourceInfo.audioBase;
  return audioInfo;
}
 */

/*
 * get timer info for the current page
export function getReservation(url) {
  let audioInfo = getAudioInfo(url);

  if (audioInfo.timer) {
    return audioInfo.timer;
  }

  return null;
}

function pageInfo(decodedKey, contents) {

  let url = transcript.getUrl(decodedKey.key, true);

  let info = contents.find(p => {
    return url.startsWith(p.url);
  });

  if (!info) {
    return {title: "not found", url:""};
  }

  if (info.url !== url) {
    info = info.contents.find(p => {
      return p.url === url;
    });
  }

  if (!info) {
    return {title: "not found", url:""};
  }

  return info;
}
*/

/*
  Given a page key, return data from a config file

  returns: book title, page title, url and optionally subtitle.

  args:
    pageKey: a key uniquely identifying a transcript page
    data: optional, data that will be added to the result, used for convenience
export function getPageInfo(pageKey, data = false) {
  let decodedKey = transcript.decodeKey(pageKey);
  let info = {pageKey: pageKey, source: g_sourceInfo.title, bookId: decodedKey.bookId};

  if (data) {
    info.data = data;
  }

  return new Promise((resolve, reject) => {

    //invalid pageKey
    if (pageKey === -1) {
      info.bookTitle = gs("label:l1", "Book Title Unknown");
      info.title = gs("label:l2", "Title Unknown");
      info.url = "";
      resolve(info);
      return;
    }

    //get configuration data specific to the bookId
    getConfig(decodedKey.bookId, false)
      .then((data) => {
        if (!data) {
          info.bookTitle = gs("label:l1", "Book Title Unknown");
          info.title = gs("label:l2", "Title Unknown");
          info.url = "";
        }
        else {
          let pi = pageInfo(decodedKey, data.contents);

          info.bookTitle = data.title;
          info.title = pi.title;
          info.url = pi.url;

          resolve(info);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}
*/

/*
 * Set environment
 */
export function setEnv(si) {
  g_sourceInfo = si;
}


