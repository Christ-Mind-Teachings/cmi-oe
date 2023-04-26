/* eslint no-console: off */

import {SourceStore, storeInit} from "common/modules/_util/store";
import search from "common/modules/_search/search";
import {showParagraph} from "common/modules/_util/url";
import {initTranscriptPage} from "common/modules/_page/startup";
import audio from "common/modules/_audio/audio";

import {setEnv, loadConfig} from "./modules/_config/config";
import toc, {getBookId} from "./modules/_contents/toc";

import constants from "./constants";

$(document).ready(() => {
  const store = new SourceStore(constants);
  storeInit(constants);

  setEnv(store);

  //load config file and do initializations that depend on a loaded config file
  loadConfig(getBookId()).then(() => {
    initTranscriptPage(store);

    // "oe" uses ACIM OE Paragraph numbers in search results
    // "acimoe" uses CMI Paragraph numbers in search results
    //search.initialize("oe");
    search.initialize(store);

    toc.initialize("transcript");
    audio.initialize(store);
    showParagraph();
  }).catch((error) => {
    console.error(error);
  });
});
