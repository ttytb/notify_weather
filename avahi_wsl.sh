#!/bin/sh
sudo service dbus start
sudo service avahi-daemon start
sudo systemctl enable dbus
sudo systemctl enable avahi-daemon
