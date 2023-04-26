/* eslint no-console: off */

//common modules
import {SourceStore, storeInit} from "common/modules/_util/store";
import {initHomePage} from "common/modules/_page/startup";
import {showTOC, showQuotes, showSearch} from "common/modules/_util/url";
import search from "common/modules/_search/search";
import {initQuoteDisplay} from "common/modules/_topics/events";

import {setEnv} from "./modules/_config/config";
import {pageDriver} from "./modules/_util/driver";
import toc from "./modules/_contents/toc";
import constants from "./constants";

$(document).ready(() => {
  const store = new SourceStore(constants);
  storeInit(constants);

  setEnv(store);

  initHomePage(store, pageDriver);
  toc.initialize("page");
  search.initialize(store);

  //support for quote display and sharing
  initQuoteDisplay("#show-quote-button", store);

  //look for ?tocbook=[acq | text | workbook | manual]
  showTOC();

  //look for ?search=1 on url, if found display search dialog
  showSearch();

  //look for ?quotes=1 on url, if found display quote dialog
  showQuotes();

});

