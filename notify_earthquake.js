#!/usr/bin/node
const fs = require("fs");
const os = require("os");
const ghn = require("google-home-notifier");
const rp = require("request-promise");
cf = require("config");

const STATE_FILE = os.tmpdir() + "/eew_state";
const EEW_URL = "http://svir.jp/eew/data.json";
const LANG = "ja";

const jsonget = function (url) {
  const options = {
    uri: url,
    method: "GET",
    json: true,
  };
  return rp(options);
};

jsonget(EEW_URL)
  .then((json) => {
    let pastID = 0;
    try {
      pastID = fs.readFileSync(STATE_FILE, "utf8");
    } catch (error) {
      try {
        fs.writeFileSync(STATE_FILE, 0);
      } catch (error) {
        console.log(error);
      }
    }
    const eventID = json.Head.EventID;
    if (eventID !== pastID) {
      const status = json.Head.Status;
      const loc = json.Body.Earthquake.Hypocenter.Name;
      const dep = json.Body.Earthquake.Hypocenter.Depth;
      const itn = json.Body.Intensity.MaxInt;
      const cal = json.Body.Intensity.TextInt;
      let mag = json.Body.Earthquake.Magnitude;
      let msg = "";
      if (itn === "1" || itn === "2") {
        // Do nothing.
      } else {
        if (status === "通常") {
          mag = mag.replace(".", "点");
          msg =
            `${loc}で地震です。深さは${dep}キロメートル。${cal}。マグニチュードは${mag}です。`;
        } else if (status === "取消") {
          msg = "地震速報は取り消されました";
        }
        if (msg !== "") {
          ghn.ip(cf.config.ip);
          ghn.accent(LANG);
          ghn.notify(msg, (res) => console.log("said " + msg));
        }
        try {
          fs.writeFileSync(STATE_FILE, eventID);
        } catch (error) {
          console.log(error);
        }
      }
    }
  })
  .catch((err) => {
    console.log(err);
  });
