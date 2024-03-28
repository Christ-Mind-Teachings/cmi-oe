/*
  Teaching specific data
*/

const keyInfo = require("common/modules/_config/key");
import {getPageInfo, getConfig} from "common/modules/_config/config";
//import {getReservation, getAudioInfo, getPageInfo} from "./modules/_config/config";

import {format} from "./modules/_extension/toc";
import si from "./modules/_config/si";

keyInfo.initializeKey(si);

const sid = "oe";
const HOME_URI = "/t/acimoe";

export default {
  sid: sid,
  lang: "en",
  env: "integration",
  title: "ACIM Original Edition",
  url_prefix: `${HOME_URI}`,
  configUrl: `${HOME_URI}/public/config`,
  sourceId: 15,
  quoteManagerId: "05399539cca9ac38db6db36f5c770ff1",
  quoteManagerName: "CMI",
  getPageInfo: getPageInfo,
  getConfig: getConfig,
  keyInfo: keyInfo,
  audio: {
    audioBase: `https://s3.amazonaws.com/assets.christmind.info/${sid}/audio`,
    timingBase: `${HOME_URI}/public/timing`,
    //getReservation: getReservation,
    getAudioInfo: getPageInfo
  },
  extension: {
    toc: format
  },
  store: {
    bmList: "bm.list",
    bmCreation: "bm.creation",
    bmTopics: "bm.topics",
    bmModal: "bm.modal",
    srchResults: "srch.results",
    srchtextflat: "srch.text.flat",
    srchworkbookflat: "srch.workbook.flat",
    srchmanualflat: "srch.manual.flat",
    pnDisplay: "pn.display",
    cfgacq: "cfg.acq",
    cfgtext: "cfg.text",
    cfgworkbook: "cfg.workbook",
    cfgmanual: "cfg.manual"
  }
};
