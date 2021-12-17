#!/usr/bin/node

const ghp = require("google-home-player");
const {
  isNull
} = require("util");
cf = require("config");

const LANG = "ja";

let msg = "こんにちは";
if (!isNull(msg)) {
  let gh;
  gh = new ghp(cf.config.ip, LANG);
  gh.say(msg);
}
