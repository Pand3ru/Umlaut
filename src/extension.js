// SPDX-License-Identifier: GPL-3.0-or-later

import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import {CHARACTER_GROUPS, characterForKey, selectCharacter} from './characters.js';

const OPEN_MENU_KEY = 'open-menu';

export default class UmlautPanelExtension extends Extension {
    _indicator = null;
    _settings = null;
    _signals = [];

    enable() {
        if (this._indicator)
            return;

        const indicator = new PanelMenu.Button(0.0, this.metadata.name, false);
        this._indicator = indicator;

        const copyCharacter = text => {
            try {
                selectCharacter(
                    text,
                    value => St.Clipboard.get_default().set_text(
                        St.ClipboardType.CLIPBOARD, value),
                    () => indicator.menu.close()
                );
            } catch (error) {
                console.error('Umlaut Panel: clipboard write failed', error);
                Main.notifyError('Umlaut Panel', 'Could not copy the character. Try again.');
            }
        };

        try {
            indicator.name = 'umlaut-panel-indicator';
            indicator.accessible_name = 'German characters — copy to clipboard';
            indicator.add_child(new St.Icon({
                gicon: new Gio.FileIcon({
                    file: this.dir.get_child('icons').get_child('reichstag-dome-symbolic.svg'),
                }),
                y_align: Clutter.ActorAlign.CENTER,
                style_class: 'system-status-icon',
            }));

            const heading = new PopupMenu.PopupMenuItem('German characters', {
                reactive: false,
                can_focus: false,
            });
            indicator.menu.addMenuItem(heading);

            const item = new PopupMenu.PopupBaseMenuItem({
                reactive: false,
                can_focus: false,
            });
            indicator.menu.addMenuItem(item);
            const grid = new St.BoxLayout({
                orientation: Clutter.Orientation.VERTICAL,
                style_class: 'umlaut-character-grid',
                x_expand: true,
            });
            item.add_child(grid);

            for (const group of CHARACTER_GROUPS) {
                const row = new St.BoxLayout({
                    orientation: Clutter.Orientation.HORIZONTAL,
                    style_class: 'umlaut-character-row',
                    x_expand: true,
                });
                grid.add_child(row);

                for (const character of group) {
                    const button = new St.Button({
                        label: character.text,
                        accessible_name: `Copy ${character.name} (${character.text}), key ${character.key}`,
                        name: `umlaut-character-${character.text.codePointAt(0).toString(16)}`,
                        style_class: 'button umlaut-character-button',
                        can_focus: true,
                        reactive: true,
                        track_hover: true,
                        x_expand: true,
                    });
                    row.add_child(button);
                    const signalId = button.connect('clicked', () => copyCharacter(character.text));
                    this._signals.push([button, signalId]);
                }
            }

            indicator.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
            indicator.menu.addMenuItem(new PopupMenu.PopupMenuItem('Press a, o, u or s · Shift for capitals', {
                reactive: false,
                can_focus: false,
            }));

            // Typing a mapped letter while the popup is open copies its character.
            const keyPressId = indicator.menu.actor.connect('key-press-event', (_actor, event) => {
                const modifiers = Clutter.ModifierType.CONTROL_MASK | Clutter.ModifierType.MOD1_MASK;
                if (event.get_state() & modifiers)
                    return Clutter.EVENT_PROPAGATE;

                const codePoint = Clutter.keysym_to_unicode(event.get_key_symbol());
                const text = codePoint ? characterForKey(String.fromCodePoint(codePoint)) : null;
                if (!text)
                    return Clutter.EVENT_PROPAGATE;

                copyCharacter(text);
                return Clutter.EVENT_STOP;
            });
            this._signals.push([indicator.menu.actor, keyPressId]);

            Main.panel.addToStatusArea(this.uuid, indicator);

            this._settings = this.getSettings();
            Main.wm.addKeybinding(
                OPEN_MENU_KEY,
                this._settings,
                Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
                Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
                () => this._toggleMenuFromKeyboard()
            );
        } catch (error) {
            this.disable();
            throw error;
        }
    }

    _toggleMenuFromKeyboard() {
        const menu = this._indicator?.menu;
        if (!menu)
            return;

        menu.toggle();
        if (menu.isOpen)
            menu.actor.navigate_focus(null, St.DirectionType.TAB_FORWARD, false);
    }

    disable() {
        if (this._settings) {
            Main.wm.removeKeybinding(OPEN_MENU_KEY);
            this._settings = null;
        }

        for (const [actor, signalId] of this._signals)
            actor.disconnect(signalId);

        this._signals = [];
        this._indicator?.destroy();
        this._indicator = null;
    }
}
