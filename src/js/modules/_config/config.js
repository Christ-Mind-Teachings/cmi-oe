//import {fetchConfiguration} from "www/modules/_util/cmi";
import {fetchConfiguration} from "common/modules/_ajax/config";

import {status} from "./status";
import { getIndexFromLesson } from "./wbkey";
const transcript = require("./key");

let g_sourceInfo;
let config; //the current configuration, initially null, assigned by getConfig()

/**
 * Get the configuration file for 'book'. If it's not found in
 * the cache (local storage) then get it from the server and 
 * save it in cache.
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
        config = resp;
      }
      resolve(resp);
    }).catch((err) => {
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

/*
  get audio info from config file
*/
function _getAudioInfo(cIdx, sIdx) {
  let audioInfo;

  audioInfo = config.contents[cIdx].sections[sIdx];

  return audioInfo ? audioInfo: {};
}

export function getAudioInfo(url) {
  //check that config has been initialized
  if (!config) {
    throw new Error("Configuration has not been initialized");
  }

  //remove leading and trailing "/"
  url = url.substr(1);
  url = url.substr(0, url.length - 1);

  let idx = url.split("/");

  //check the correct configuration file is loaded
  if (config.bid !== idx[2]) {
    throw new Error(`Unexpected config file loaded; expecting ${idx[2]} but ${config.bid} is loaded.`);
  }

  let audioInfo = {};
  let cIdx;
  let sIdx;

  switch(idx[2]) {
    //no audio
    case "manual":
      audioInfo = config.contents.find((item) => {
        return item.url === `/${idx[3]}/`;
      });

      if (!audioInfo) {
        audioInfo = {};
      }

      break;
    case "acq":
      break;
    case "workbook":
      // eslint-disable-next-line no-case-declarations
      let index = getIndexFromLesson(idx[3]);

      audioInfo = config.contents[index.part].section[index.section].page[index.page];
      break;
    case "text":
      //get indexes into config object from page name: ie: chap0406
      // eslint-disable-next-line no-case-declarations
      let [,,, chapter, unit] = idx;

      if (chapter === "front") {
        cIdx = 0;
        sIdx = unit === "forward"? 0: 1;
      }
      else {
        cIdx = parseInt(unit.substring(4,6),10);
        sIdx = parseInt(unit.substring(6),10) - 1; //
      }
      audioInfo = _getAudioInfo(cIdx, sIdx);
      break;
  }

  audioInfo.audioBase = g_sourceInfo.audioBase;
  return audioInfo;
}

/*
 * get timer info for the current page
 */
export function getReservation(url) {
  let audioInfo = getAudioInfo(url);

  if (audioInfo.timer) {
    return audioInfo.timer;
  }

  return null;
}

/*
  Needed for workbook.json and text.json since they have multiple levels
  workbook: content > section > page
  text: contents > sections

  Flatten config file so we can use key.uid to lookup title and url for a given key
  This is necessary for config files that contain more than one level.
*/
function flatten(data) {
  let flat = [];
  if (data.bid === "workbook") {
    for (let content of data.contents) {
      for (let section of content.section) {
        for (let page of section.page) {
          flat.push(page);
        }
      }
    }
  }
  else if (data.bid === "text") {
    for (let content of data.contents) {
      for (let section of content.sections) {
        flat.push(section);
      }
    }
  }
  return flat;
}

/*
  Given a page key, return data from a config file
  returns: book title, page title, url.

  args:
    pageKey: a key uniuely identifying a transcript page
    data: optional, data that will be added to the result, used for convenience

      data is passed when building a list of bookmarks for the bookmark modal
*/
export function getPageInfo(page, data = false) {

  let pageKey;
  let decodedKey;

  /*
   * Convert arg: page to pageKey if it is passed in as a url
   */
  if (typeof page === "string" && page.startsWith("/t/")) {
    pageKey = transcript.genPageKey(page);
  }
  else {
    pageKey = page;
  }

  decodedKey = transcript.decodeKey(pageKey);
  let info = {pageKey: pageKey, source: g_sourceInfo.title, bookId: decodedKey.bookId};

  if (data) {
    info.data = data;
  }

  return new Promise((resolve, reject) => {

    //get configuration data specific to the bookId
    getConfig(decodedKey.bookId, false)
      .then((data) => {
        info.bookTitle = data.title;

        /*
          This is called to get title and url when bookmarks are loaded, we get this from
          the annotation.
        */
        if (info.data) {
          for (let prop in info.data) {
            if (info.data.hasOwnProperty(prop)) {
              //console.log("info.data prop: %s", prop);
              //console.log(info.data[prop][0].selectedText);
              if (info.data[prop].length > 0) {
                //not all bookmarks have selectedText
                if (info.data[prop][0].selectedText) {
                  info.title = info.data[prop][0].selectedText.title;
                  info.url = info.data[prop][0].selectedText.url;
                }
                else {
                  if (info.data[prop][0].bookTitle) {
                    info.title = info.data[prop][0].bookTitle;
                  }
                  else {
                    info.title = "Don't know the title, sorry!";
                  }
                  info.url = transcript.getUrl(info.pageKey);
                }
                break;
              }
            }
          }
          resolve(info);
          return;
        }
        else {
          /*
            This is called to get title and url for search results
          */
          let flat = [];
          let unit;
          let chapter;
          let flat_store_id = `srch${decodedKey.bookId}flat`;

          switch(decodedKey.bookId) {
            case "manual":
              info.title = data.contents[decodedKey.uid - 1].title;
              info.url = `/t/acimoe/${decodedKey.bookId}${data.contents[decodedKey.uid - 1].url}`;

              //Rick added Feb 23, 2025
              info.audio = data.contents[decodedKey.uid - 1].audio;
              info.timing = data.contents[decodedKey.uid - 1].timing;
              info.audioBase = g_sourceInfo.audioBase;

              break;
            case "workbook":
              flat = g_sourceInfo.getValue(flat_store_id);
              if (!flat) {
                flat = flatten(data);
                g_sourceInfo.setValue(flat_store_id, flat);
              }
              unit = flat[decodedKey.uid - 1];

              info.title = `${unit.lesson?unit.lesson + ". ":""}${unit.title}`;
              info.url = `/t/acimoe/${decodedKey.bookId}/${unit.url}`;

              //Rick added Feb 23, 2025
              info.audio = unit.audio;
              info.timing = unit.timing;
              info.audioBase = g_sourceInfo.audioBase;

              break;
            case "text":
              flat = g_sourceInfo.getValue(flat_store_id);
              if (!flat) {
                flat = flatten(data);
                g_sourceInfo.setValue(flat_store_id, flat);
              }
              unit = flat[decodedKey.uid - 1];
              chapter = unit.url.substr(4,2);

              //Rick added Feb 23, 2025
              info.audio = unit.audio;
              info.timing = unit.timing;
              info.audioBase = g_sourceInfo.audioBase;

              info.title = `${unit.title}`;
              info.url = `/t/acimoe/${decodedKey.bookId}/${chapter}/${unit.url}`;
              break;
            case "acq":
              info.title = data.contents[decodedKey.uid-1].title;
              info.url = `/t/acimoe/${decodedKey.bookId}${data.contents[decodedKey.uid-1].url}`;
              break;
            default:
              throw new Error(`getPageInfo(): unknown bookId ${decodedKey.bookId}`);
          }

          resolve(info);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });

}

/*
 * Set environment to standalone or integrated
 */
export function setEnv(si) {
  g_sourceInfo = si;
}

