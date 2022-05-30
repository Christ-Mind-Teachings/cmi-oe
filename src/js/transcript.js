/* eslint no-console: off */
import {storeInit} from "www/modules/_util/store";

//common modules
import {showParagraph} from "www/modules/_util/url";
import auth from "www/modules/_user/netlify";
import fb from "www/modules/_util/facebook";
import {initTranscriptPage} from "www/modules/_page/startup";

import {loadConfig} from "./modules/_config/config";
import {bookmarkStart} from "./modules/_bookmark/start";
import search from "./modules/_search/search";
import toc, {getBookId} from "./modules/_contents/toc";
import audio from "./modules/_audio/audio";
import about from "./modules/_about/about";

import {setLanguage} from "www/modules/_language/lang";
import constants from "./constants";

$(document).ready(() => {
  storeInit(constants);
  setLanguage(constants);
  initTranscriptPage("pnDisplay");
  auth.initialize();
  fb.initialize();
  about.initialize();


  //load config file and do initializations that depend on a loaded config file
  loadConfig(getBookId()).then(() => {

    // "oe" uses ACIM OE Paragraph numbers in search results
    // "acimoe" uses CMI Paragraph numbers in search results
    search.initialize("oe");

    toc.initialize("transcript");
    audio.initialize();
    showParagraph();
    bookmarkStart("transcript");
  }).catch((error) => {
    console.error(error);
  });
});
