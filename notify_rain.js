#!/usr/bin/node
const fs = require("fs");
const os = require("os");
const ghn = require("google-home-notifier");
const rp = require("request-promise");
const moment = require("moment");
const { isNull } = require("util");
cf = require("config");

const COUNT = 5;
const THRESHOLD = 20;
const STATE_FILE = `${cf.config.tmpdir}/rain_state`;
const YAHOO_URL = "https://map.yahooapis.jp/weather/V1/place";
const LANG = "ja";

const jsonget = function (url) {
  const options = {
    uri: url,
    method: "GET",
    qs: {
      coordinates: cf.config.location,
      appid: cf.config.appid,
      output: "json",
      interval: "5",
    },
    json: true,
  };
  return rp(options);
};

jsonget(YAHOO_URL)
  .then((json) => {
    const data = json["Feature"][0]["Property"]["WeatherList"]["Weather"];
    let maxRain = 0;
    for (let index = 0; index < COUNT; index++) {
      const element = data[index];
      const rain = element["Rainfall"];
      const dt = moment(element["Date"], "YYYYMMDDHHmmss");
      console.log(`${dt.format("HH:mm")} ${rain}mm`);
      if (rain > maxRain) {
        maxRain = rain;
      }
    }
    let pastRain = 0;
    try {
      pastRain = fs.readFileSync(STATE_FILE, "utf8");
    } catch (error) {
      try {
        fs.writeFileSync(STATE_FILE, 0);
      } catch (error) {
        console.log(error);
      }
    }
    let msg = null;
    if (maxRain >= THRESHOLD && pastRain < THRESHOLD) {
      msg = `もうすぐ、強い雨が降り出します。雨量は、最大${maxRain}ミリです。`;
    } else if (maxRain > 1 && pastRain <= 1) {
      msg = `もうすぐ、雨が降り出します。雨量は、最大${maxRain}ミリです。`;
    }
    if (!isNull(msg)) {
      ghn.device(cf.config.device, LANG);
      ghn.ip(cf.config.ip);
      ghn.accent(LANG);
      ghn.notify(msg, (res) => console.log(`said ${msg}`));
    }
    fs.writeFileSync(STATE_FILE, maxRain);
  })
  .catch(function (err) {
    console.log(err);
  });
