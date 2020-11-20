'use strict';

/*
██   ██ ███████ ██      ██       ██████       ██████  ██ ████████
██   ██ ██      ██      ██      ██    ██     ██       ██    ██
███████ █████   ██      ██      ██    ██     ██   ███ ██    ██
██   ██ ██      ██      ██      ██    ██     ██    ██ ██    ██
██   ██ ███████ ███████ ███████  ██████       ██████  ██    ██
*/


/*
██ ███    ███ ██████   ██████  ██████  ████████ ███████
██ ████  ████ ██   ██ ██    ██ ██   ██    ██    ██
██ ██ ████ ██ ██████  ██    ██ ██████     ██    ███████
██ ██  ██  ██ ██      ██    ██ ██   ██    ██         ██
██ ██      ██ ██       ██████  ██   ██    ██    ███████
*/

const Main = imports.ui.main;
const GLib = imports.gi.GLib;
const St = imports.gi.St;
const Lang = imports.lang;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Slider = imports.ui.slider;

/*
 ██████  ██       ██████  ██████   █████  ██      ███████
██       ██      ██    ██ ██   ██ ██   ██ ██      ██
██   ███ ██      ██    ██ ██████  ███████ ██      ███████
██    ██ ██      ██    ██ ██   ██ ██   ██ ██           ██
 ██████  ███████  ██████  ██████  ██   ██ ███████ ███████
*/

let CurrentDisplays = [];
let Lightness = 0.6;
let ErrorCode = 0;
let isGameMode = false;
let myPopup;

/*
 ██████  ███████ ████████      █████  ██      ██          ██ ███    ██ ██████  ███████ ██   ██ ███████ ███████
██       ██         ██        ██   ██ ██      ██          ██ ████   ██ ██   ██ ██       ██ ██  ██      ██
██   ███ █████      ██        ███████ ██      ██          ██ ██ ██  ██ ██   ██ █████     ███   █████   ███████
██    ██ ██         ██        ██   ██ ██      ██          ██ ██  ██ ██ ██   ██ ██       ██ ██  ██           ██
 ██████  ███████    ██        ██   ██ ███████ ███████     ██ ██   ████ ██████  ███████ ██   ██ ███████ ███████
*/

function getAllIndexes(array, value) {
  var indexes = [],
    i = -1;
  while ((i = array.indexOf(value, i + 1)) != -1) {
    indexes.push(i);
  }
  return indexes;
}

/*
██    ██ ████████ ███████  █████      ██████      ███████ ████████ ██████  ██ ███    ██  ██████
██    ██    ██    ██      ██   ██          ██     ██         ██    ██   ██ ██ ████   ██ ██
██    ██    ██    █████    █████       █████      ███████    ██    ██████  ██ ██ ██  ██ ██   ███
██    ██    ██    ██      ██   ██     ██               ██    ██    ██   ██ ██ ██  ██ ██ ██    ██
 ██████     ██    ██       █████      ███████     ███████    ██    ██   ██ ██ ██   ████  ██████
*/

function utf8ArrayToStr(array) {
  var out, i, len, c;
  var char2, char3;

  out = "";
  len = array.length;
  i = 0;
  while (i < len) {
    c = array[i++];
    switch (c >> 4) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        // 0xxxxxxx
        out += String.fromCharCode(c);
        break;
      case 12:
      case 13:
        // 110x xxxx   10xx xxxx
        char2 = array[i++];
        out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
        break;
      case 14:
        // 1110 xxxx  10xx xxxx  10xx xxxx
        char2 = array[i++];
        char3 = array[i++];
        out += String.fromCharCode(((c & 0x0F) << 12) |
          ((char2 & 0x3F) << 6) |
          ((char3 & 0x3F) << 0));
        break;
    }
  }
  return out;
}

/*
███████ ███████ ████████     ██      ██  ██████  ██   ██ ████████ ███    ██ ███████ ███████ ███████
██      ██         ██        ██      ██ ██       ██   ██    ██    ████   ██ ██      ██      ██
███████ █████      ██        ██      ██ ██   ███ ███████    ██    ██ ██  ██ █████   ███████ ███████
     ██ ██         ██        ██      ██ ██    ██ ██   ██    ██    ██  ██ ██ ██           ██      ██
███████ ███████    ██        ███████ ██  ██████  ██   ██    ██    ██   ████ ███████ ███████ ███████
*/

function setAllDisplayLightness(Displays, value) {

  Displays.forEach((Display, i) => {
    let [ok, out, err, exit] = GLib.spawn_command_line_sync('xrandr --output ' + Display.name + ' --brightness ' + value);

    if (utf8ArrayToStr(err) != 0) {
      log('"xrandr --output ' + Display.name + '--brightness " Error: ' + utf8ArrayToStr(err));
      ErrorCode = ErrorCode + 1;
    }
  });
}

function setDisplayLightness(Display, value) {
  let [ok, out, err, exit] = GLib.spawn_command_line_sync('xrandr --output ' + Display + ' --brightness ' + value);
  if (utf8ArrayToStr(err) != 0) {
    log('"xrandr --output ' + Display + '--brightness " Error: ' + utf8ArrayToStr(err));
    ErrorCode = ErrorCode + 2;
  }
}


/*
 ██████  ███████ ████████      ██████ ██    ██ ██████  ██████  ███████ ███    ██ ████████     ██████  ██ ███████ ██████  ██       █████  ██    ██     ███████ ███████ ████████ ██    ██ ██████
██       ██         ██        ██      ██    ██ ██   ██ ██   ██ ██      ████   ██    ██        ██   ██ ██ ██      ██   ██ ██      ██   ██  ██  ██      ██      ██         ██    ██    ██ ██   ██
██   ███ █████      ██        ██      ██    ██ ██████  ██████  █████   ██ ██  ██    ██        ██   ██ ██ ███████ ██████  ██      ███████   ████       ███████ █████      ██    ██    ██ ██████
██    ██ ██         ██        ██      ██    ██ ██   ██ ██   ██ ██      ██  ██ ██    ██        ██   ██ ██      ██ ██      ██      ██   ██    ██             ██ ██         ██    ██    ██ ██
 ██████  ███████    ██         ██████  ██████  ██   ██ ██   ██ ███████ ██   ████    ██        ██████  ██ ███████ ██      ███████ ██   ██    ██        ███████ ███████    ██     ██████  ██
*/

function getConnectedDisplays() {

  class Display {
    constructor(name, primary) {
      this.primary = primary;
      this.name = name;
    }
  }

  let Displays = new Array;
  let [ok, out, err, exit] = GLib.spawn_command_line_sync('xrandr --current');
  if (utf8ArrayToStr(err) != 0) {
    log('"xrandr --current" Error: ' + utf8ArrayToStr(err));
    ErrorCode = ErrorCode + 4;
  }

  let connectedDisplays = utf8ArrayToStr(out).replace(/\n/g, " ").split(" ");
  let indexesConnected = getAllIndexes(connectedDisplays, "connected");
  let indexPrime = getAllIndexes(connectedDisplays, "primary");

  if (indexPrime.length > 1) {
    log("Error: Detect NO Primary Display: ");
    ErrorCode = ErrorCode + 8;
  }

  indexesConnected.forEach((index, i) => {
    if (index - 1 == indexPrime - 2) {
      Displays.push(new Display(connectedDisplays[index - 1], true));
    } else {
      Displays.push(new Display(connectedDisplays[index - 1], false));
    }

  });

  return Displays;
}

/*
███████ ███████ ████████      ██████   █████  ███    ███ ███████ ███    ███  ██████  ██████  ███████
██      ██         ██        ██       ██   ██ ████  ████ ██      ████  ████ ██    ██ ██   ██ ██
███████ █████      ██        ██   ███ ███████ ██ ████ ██ █████   ██ ████ ██ ██    ██ ██   ██ █████
     ██ ██         ██        ██    ██ ██   ██ ██  ██  ██ ██      ██  ██  ██ ██    ██ ██   ██ ██
███████ ███████    ██         ██████  ██   ██ ██      ██ ███████ ██      ██  ██████  ██████  ███████
*/

function setGameMode(bool) {
  if (bool) {
    CurrentDisplays.forEach((screen, i) => {
      if (!screen.primary) {
        setDisplayLightness(screen.name, 0);
      }
    });
  } else {
    setAllDisplayLightness(CurrentDisplays, Lightness);
  }
}

/*
███    ███ ██    ██     ██████   ██████  ██████  ██    ██ ██████
████  ████  ██  ██      ██   ██ ██    ██ ██   ██ ██    ██ ██   ██
██ ████ ██   ████       ██████  ██    ██ ██████  ██    ██ ██████
██  ██  ██    ██        ██      ██    ██ ██      ██    ██ ██
██      ██    ██        ██       ██████  ██       ██████  ██
*/

const MyPopup = GObject.registerClass(
  class MyPopup extends PanelMenu.Button {

    /*
    ███████ ██    ██ ███    ██  ██████ ████████ ██  ██████  ███    ██                 ██ ███    ██ ██ ████████
    ██      ██    ██ ████   ██ ██         ██    ██ ██    ██ ████   ██                 ██ ████   ██ ██    ██
    █████   ██    ██ ██ ██  ██ ██         ██    ██ ██    ██ ██ ██  ██                 ██ ██ ██  ██ ██    ██
    ██      ██    ██ ██  ██ ██ ██         ██    ██ ██    ██ ██  ██ ██                 ██ ██  ██ ██ ██    ██
    ██       ██████  ██   ████  ██████    ██    ██  ██████  ██   ████         ███████ ██ ██   ████ ██    ██
    */

    _init() {

      super._init(0);

      /*
      ██████   █████  ███    ██ ███████ ██          ██  ██████  ██████  ███    ██
      ██   ██ ██   ██ ████   ██ ██      ██          ██ ██      ██    ██ ████   ██
      ██████  ███████ ██ ██  ██ █████   ██          ██ ██      ██    ██ ██ ██  ██
      ██      ██   ██ ██  ██ ██ ██      ██          ██ ██      ██    ██ ██  ██ ██
      ██      ██   ██ ██   ████ ███████ ███████     ██  ██████  ██████  ██   ████
      */

      this.mainIcon = new St.Icon({
        gicon: Gio.icon_new_for_string(Me.dir.get_path() + '/DisplayLogo.svg'),
        style_class: 'system-status-icon',
      });
      this.add_child(this.mainIcon);

      /*  let pmItem = new PopupMenu.PopupMenuItem('Game Mode');
        this.menu.addMenuItem(pmItem);
        pmItem.connect('activate', () => {
          Main.notify('// DEBUG: Message', "Gamemode Aktiviert");
        });*/

      /*
      ███████ ██      ██ ██████  ███████ ██████
      ██      ██      ██ ██   ██ ██      ██   ██
      ███████ ██      ██ ██   ██ █████   ██████
           ██ ██      ██ ██   ██ ██      ██   ██
      ███████ ███████ ██ ██████  ███████ ██   ██
      */

      this.item0 = new PopupMenu.PopupBaseMenuItem({
        activate: false
      });
      this.menu.addMenuItem(this.item0);

      this.slider = new Slider.Slider(0.6);

      this.sliderIcon = new St.Icon({
        iconName: 'night-light-symbolic',
        styleClass: 'popup-menu-icon'
      });

      this.item0.add(this.sliderIcon);
      this.item0.add_child(this.slider);

      this.slider.connect('notify::value', Lang.bind(this, this._valueChanged));

      /*
      ███████ ██     ██ ██ ████████  ██████ ██   ██
      ██      ██     ██ ██    ██    ██      ██   ██
      ███████ ██  █  ██ ██    ██    ██      ███████
           ██ ██ ███ ██ ██    ██    ██      ██   ██
      ███████  ███ ███  ██    ██     ██████ ██   ██
      */

      this.item1 = new PopupMenu.PopupBaseMenuItem({
        activate: false
      });
      this.menu.addMenuItem(this.item1);
      this.switchItem = new PopupMenu.PopupSwitchMenuItem(_("Game Mode"), false, {
        style_class: 'popup-subtitle-menu-item'
      });
      this.switchItem.connect('toggled', Lang.bind(this, this._onToggled));
      this.menu.addMenuItem(this.switchItem);

      /*
       ██████ ██████  ███████ ██████  ██ ████████ ███████
      ██      ██   ██ ██      ██   ██ ██    ██    ██
      ██      ██████  █████   ██   ██ ██    ██    ███████
      ██      ██   ██ ██      ██   ██ ██    ██         ██
       ██████ ██   ██ ███████ ██████  ██    ██    ███████
      */

      this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
      this.menu.addMenuItem(
        new PopupMenu.PopupMenuItem(
          "brought to you by xi72yow.de", {
            reactive: false
          },
        )
      );
    }

    /*
    ███████ ██    ██ ███    ██  ██████ ████████ ██  ██████  ███    ██            ██    ██  █████  ██      ██    ██ ███████  ██████ ██   ██  █████  ███    ██  ██████  ███████ ██████
    ██      ██    ██ ████   ██ ██         ██    ██ ██    ██ ████   ██            ██    ██ ██   ██ ██      ██    ██ ██      ██      ██   ██ ██   ██ ████   ██ ██       ██      ██   ██
    █████   ██    ██ ██ ██  ██ ██         ██    ██ ██    ██ ██ ██  ██            ██    ██ ███████ ██      ██    ██ █████   ██      ███████ ███████ ██ ██  ██ ██   ███ █████   ██   ██
    ██      ██    ██ ██  ██ ██ ██         ██    ██ ██    ██ ██  ██ ██             ██  ██  ██   ██ ██      ██    ██ ██      ██      ██   ██ ██   ██ ██  ██ ██ ██    ██ ██      ██   ██
    ██       ██████  ██   ████  ██████    ██    ██  ██████  ██   ████     ███████  ████   ██   ██ ███████  ██████  ███████  ██████ ██   ██ ██   ██ ██   ████  ██████  ███████ ██████
    */

    _valueChanged(item) {
      if (ErrorCode == 0) {
        let lightnessValue = item._getCurrentValue();
        Lightness = lightnessValue;
        if (isGameMode) {
          if (!(lightnessValue < 0.1 || lightnessValue > 0.98)) {
            CurrentDisplays.forEach((screen, i) => {
              if (screen.primary) {
                setDisplayLightness(screen.name, Lightness);
              }
            });
          } else {
            return;
          }
        } else {
          if (!(lightnessValue < 0.1 || lightnessValue > 0.98)) {
            setAllDisplayLightness(CurrentDisplays, lightnessValue);
          } else {
            return;
          }
        }
      } else {
        Main.notify('Lightness Error', "Sorry for that, please send me your current Gnome-Shell log. My Mail: **@xi72yow.de");
        item.disconnect('notify::value');
      }
      return;
    }

    /*
    ███████ ██    ██ ███    ██  ██████ ████████ ██  ██████  ███    ██              ██████  ███    ██ ████████  ██████   ██████   ██████  ██      ███████ ██████
    ██      ██    ██ ████   ██ ██         ██    ██ ██    ██ ████   ██             ██    ██ ████   ██    ██    ██    ██ ██       ██       ██      ██      ██   ██
    █████   ██    ██ ██ ██  ██ ██         ██    ██ ██    ██ ██ ██  ██             ██    ██ ██ ██  ██    ██    ██    ██ ██   ███ ██   ███ ██      █████   ██   ██
    ██      ██    ██ ██  ██ ██ ██         ██    ██ ██    ██ ██  ██ ██             ██    ██ ██  ██ ██    ██    ██    ██ ██    ██ ██    ██ ██      ██      ██   ██
    ██       ██████  ██   ████  ██████    ██    ██  ██████  ██   ████     ███████  ██████  ██   ████    ██     ██████   ██████   ██████  ███████ ███████ ██████
    */

    _onToggled(item) {
      if (ErrorCode == 0) {
        isGameMode = item.state;
        setGameMode(item.state);
      } else {
        Main.notify('Game Mode Error', "Sorry for that, please send me your current Gnome-Shell log. My Mail: **@xi72yow.de");
      }
      return;
    }

    /*
    ███████ ██    ██ ███    ██  ██████ ████████ ██  ██████  ███    ██                      ██████  ███    ██ ██████  ███████ ███████ ████████ ██████   ██████  ██    ██
    ██      ██    ██ ████   ██ ██         ██    ██ ██    ██ ████   ██                     ██    ██ ████   ██ ██   ██ ██      ██         ██    ██   ██ ██    ██  ██  ██
    █████   ██    ██ ██ ██  ██ ██         ██    ██ ██    ██ ██ ██  ██                     ██    ██ ██ ██  ██ ██   ██ █████   ███████    ██    ██████  ██    ██   ████
    ██      ██    ██ ██  ██ ██ ██         ██    ██ ██    ██ ██  ██ ██                     ██    ██ ██  ██ ██ ██   ██ ██           ██    ██    ██   ██ ██    ██    ██
    ██       ██████  ██   ████  ██████    ██    ██  ██████  ██   ████             ███████  ██████  ██   ████ ██████  ███████ ███████    ██    ██   ██  ██████     ██
    */

    _onDestroy() {

      this.item0.destroy();
      this.item1.destroy();

      this.slider = null;
      this.slider_icon = null;
      this.item0 = null;
      this.item1 = null;

      super._onDestroy();
    }
  });

/*
 ██████  ███    ██  ██████  ███    ███ ███████     ███████ ██    ██ ███    ██  ██████ ████████ ██  ██████  ███    ██ ███████
██       ████   ██ ██    ██ ████  ████ ██          ██      ██    ██ ████   ██ ██         ██    ██ ██    ██ ████   ██ ██
██   ███ ██ ██  ██ ██    ██ ██ ████ ██ █████       █████   ██    ██ ██ ██  ██ ██         ██    ██ ██    ██ ██ ██  ██ ███████
██    ██ ██  ██ ██ ██    ██ ██  ██  ██ ██          ██      ██    ██ ██  ██ ██ ██         ██    ██ ██    ██ ██  ██ ██      ██
 ██████  ██   ████  ██████  ██      ██ ███████     ██       ██████  ██   ████  ██████    ██    ██  ██████  ██   ████ ███████
*/

function init() {
  CurrentDisplays = getConnectedDisplays();
  setAllDisplayLightness(CurrentDisplays, Lightness);
}

function enable() {
  myPopup = new MyPopup();
  Main.panel.addToStatusArea('myPopup', myPopup, 1);
}

function disable() {
  myPopup.destroy();
}
