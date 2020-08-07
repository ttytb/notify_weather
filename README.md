# notify_weather

- alert_rain.js

  雨が降りそうなときにGoogle Homeに通知します。

- notify_earthquake.js

  地震が発生したときにGoogle Homeに通知します。

## セットアップ

~~~ bash
 # mdnsのmakeに必要なライブラリのインストール
 $ sudo apt-get install libnss-mdns libavahi-compat-libdnssd-dev
 # モジュールインストール
 $ yarn install
 # google-home-notifierの下のgoogle-tts-apiを変更
 $ cd node_modules/google-home-notifier
 $ yarn install google-tts-api@0.0.4
~~~

セットアップ後、[google-home-notifier](https://github.com/noelportugal/google-home-notifier)のページに書かれている通り、node_modules/mdns/lib/browser.jsを修正します。

## コンフィグファイル

config/default.yaml

~~~ yaml
config:
  location: "135.000000,35.000000"
  appid: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz012-"
  ip: "192.168.0.1"
  filter: "^(東京都|神奈川県|千葉県|埼玉県|群馬県|栃木県|茨城県).*$"
~~~

|ID|設定値|
|---|---|
|location|降雨のチェックをしたい場所|
|appid|Yahooで取得したAPPID|
|device|Google-Homeのデバイス名|
|ip|Google-HomeのIPアドレス|
|filter|地震の通知をしたい場所(正規表現)|

## 実行方法

~~~ bash
 # 実行方法
 $ node notify_rain.js
 $ node notify_earthquake.js
~~~

cron等に登録してください。

~~~ cron
 */5 6-23 * * *       /usr/bin/node /home/pi/notify_weather/notify_rain.js
 */5 6-23 * * *       /usr/bin/node /home/pi/notify_weather/notify_earthquake.js
~~~

## WSLで試す場合

WSLで試す場合は、事前にdbusとavahi-daemonを動かす必要があります。

~~~ bash
 # dbus, avahi-daemonの起動
 $ ./avahi_wsl.sh
~~~
