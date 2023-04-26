/*
  Teaching specific data
*/

const keyInfo = require("./modules/_config/key");
import {getReservation, getAudioInfo, getPageInfo} from "./modules/_config/config";

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
  keyInfo: keyInfo,
  audio: {
    audioBase: `https://s3.amazonaws.com/assets.christmind.info/${sid}/audio`,
    timingBase: `${HOME_URI}/public/timing`,
    getReservation: getReservation,
    getAudioInfo: getAudioInfo
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
