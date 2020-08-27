# notify_weather

- alert_rain.js

  雨が降りそうなときにGoogle Homeに通知します。

- notify_eew.js

  地震が発生したときにGoogle Homeに通知します。

## セットアップ

~~~ bash
 # mdnsのmakeに必要なライブラリのインストール
 $ sudo apt-get install -y libnss-mdns libavahi-compat-libdnssd-dev
 # モジュールインストール
 $ yarn install
 # google-home-notifierの下のgoogle-tts-apiを変更
 $ cd node_modules/google-home-notifier
 $ yarn add google-tts-api@0.0.4
~~~

Raspberry-Pi等で動かす場合は、セットアップ後、[google-home-notifier](https://github.com/noelportugal/google-home-notifier)のページに書かれている通り、node_modules/mdns/lib/browser.jsを修正します。

~~~ bach
 # パッチ
 $ patch -u node_modules/mdns/lib/browser.js < patch/browser.js.patch
 $ patch -u node_modules/google-home-notifier/node_modules/mdns/lib/browser.js < patch/browser.js.patch
~~~

## コンフィグファイル

config/default.yaml

~~~ yaml
config:
  location: "135.000000,35.000000"
  appid: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz012-"
  device: "Google-Home-xxxx"
  ip: "192.168.0.1"
  filter1: "^(東京都|神奈川県|千葉県).*$"
  filter2: "^(東京都|神奈川県|千葉県|埼玉県|群馬県|栃木県|茨城県|長野県|山梨県|静岡県|東京湾|相模湾|伊豆|房総半島).*$"
  tmpdir: "/tmp"
~~~

|ID|設定値|
|---|---|
|location|降雨のチェックをしたい場所の緯度経度 [Yahoo! 地図](https://map.yahoo.co.jp/)で調べてください|
|appid|Yahoo!で取得したAPPID 詳細は[Yahoo! ID連携](https://developer.yahoo.co.jp/yconnect/)を参照|
|device|Google-Homeのデバイス名 確認方法は下記参照|
|ip|Google-HomeのIPアドレス|
|filter1|震度1～3の地震を通知したい場所(正規表現) 名称は[気象庁](http://www.data.jma.go.jp/svd/eqev/data/joho/region/index.html)のページから選択|
|filter2|震度4～5の地震を通知したい場所(正規表現)|
|tmpdir|Tempディレクトリのパス|

### Google Home デバイス名の確認方法

Google Homeのデバイス名は、avahi-browseを使って確認してください。

~~~ bash
 # インストール
 $ sudo apt install -y avahi-utils
 # 検索
 $ avahi-browse -at
~~~

## 実行方法

~~~ bash
 # 実行方法
 $ node notify_rain.js
 $ node notify_earthquake.js
~~~

cron等に登録してください。

~~~ cron
 */5 6-23 * * * cd /home/pi/notify_weather;/usr/bin/node ./notify_rain.js
 */5 6-23 * * * cd /home/pi/notify_weather;/usr/bin/node ./notify_eew.js
~~~

### WSLで試す場合

WSLで試す場合は、事前にdbusとavahi-daemonを動かす必要があります。

~~~ bash
 # dbus, avahi-daemonの起動
 $ ./avahi_wsl.sh
~~~
