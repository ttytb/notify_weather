#!/usr/bin/node

const fs = require("fs");
const os = require("os");
const readline = require("readline");
const ghn = require("google-home-notifier");
const rp = require("request-promise");
const moment = require("moment");
const {
  isNull
} = require("util");
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

    let pastRain = 0.0;
    let pastSaid = false;
    try {
      let lines = fs.readFileSync(STATE_FILE, "utf8").split('\n');
      pastRain = parseFloat(lines[0]);
      pastSaid = Boolean(lines[1]);
    } catch (error) {
      try {
        fs.writeFileSync(STATE_FILE, "0.0\n0");
      } catch (error) {
        console.log(error);
      }
    }
    let msg = null;
    if (maxRain >= THRESHOLD && pastRain < THRESHOLD) {
      msg = `もうすぐ、強い雨が降り出します。雨量は、最大${maxRain}ミリです。`;
    } else if (maxRain >= 1.5 && !pastSaid) {
      msg = `もうすぐ、雨が降り出します。雨量は、最大${maxRain}ミリです。`;
    } else if (maxRain == 0.0) {
      pastSaid = false;
    }
    if (!isNull(msg)) {
      ghn.device(cf.config.device, LANG);
      ghn.ip(cf.config.ip);
      ghn.accent(LANG);
      ghn.notify(msg, (res) => console.log(`said ${msg}`));
      pastSaid = true;
    }
    fs.writeFileSync(STATE_FILE, `${maxRain}
${Number(pastSaid)}`);
  })
  .catch(function (err) {
    console.log(err);
  });