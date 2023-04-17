/* eslint no-console: off */

//common modules
import {SourceStore, storeInit} from "common/modules/_util/store";
import {showTOC, showQuotes, showSearch} from "common/modules/_util/url";
import search from "common/modules/_search/search";
import auth from "common/modules/_user/netlify";
import {initStickyMenu, initAnimation} from "common/modules/_page/startup";
import fb from "common/modules/_util/facebook";
import {initQuoteDisplay} from "common/modules/_topics/events";
//import {setLanguage} from "common/modules/_language/lang";

import {bookmarkStart} from "./modules/_bookmark/start";
import {searchInit} from "./modules/_search/search";
import toc from "./modules/_contents/toc";
import about from "./modules/_about/about";
import constants from "./constants";

$(document).ready(() => {
  const store = new SourceStore(constants);
  storeInit(constants);
  initStickyMenu();

  //setLanguage(constants);
  auth.initialize();
  bookmarkStart("page", store);

  // "oe" uses ACIM OE Paragraph numbers in search results
  // "acimoe" uses CMI Paragraph numbers in search results
  search.initialize(searchInit(store));
  fb.initialize();
  toc.initialize("page");
  about.initialize();

  //support for quote display and sharing
  initQuoteDisplay("#show-quote-button", store);
  initAnimation();

  //look for ?tocbook=[acq | text | workbook | manual]
  showTOC();

  //look for ?search=1 on url, if found display search dialog
  showSearch();

  //look for ?quotes=1 on url, if found display quote dialog
  showQuotes();

});

