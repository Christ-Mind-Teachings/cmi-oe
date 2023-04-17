/* eslint no-console: off */

//common modules
import {SourceStore, storeInit} from "common/modules/_util/store";
import search from "common/modules/_search/search";
import {showParagraph} from "common/modules/_util/url";
import auth from "common/modules/_user/netlify";
import fb from "common/modules/_util/facebook";
import {initTranscriptPage} from "common/modules/_page/startup";
import audio from "common/modules/_audio/audio";
//import {setLanguage} from "common/modules/_language/lang";

import {searchInit} from "./modules/_search/search";
import {loadConfig} from "./modules/_config/config";
import {bookmarkStart} from "./modules/_bookmark/start";

import toc, {getBookId} from "./modules/_contents/toc";
import about from "./modules/_about/about";
import constants from "./constants";

$(document).ready(() => {
  const store = new SourceStore(constants);
  storeInit(constants);
  auth.initialize();

  //setLanguage(lang);
  initTranscriptPage("pnDisplay");
  fb.initialize();
  about.initialize();

  //load config file and do initializations that depend on a loaded config file
  loadConfig(getBookId()).then(() => {

    // "oe" uses ACIM OE Paragraph numbers in search results
    // "acimoe" uses CMI Paragraph numbers in search results
    //search.initialize("oe");
    search.initialize(searchInit(store));

    toc.initialize("transcript");
    audio.initialize(store);
    showParagraph();
    bookmarkStart("transcript", store);
  }).catch((error) => {
    console.error(error);
  });
});
