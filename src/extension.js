// SPDX-License-Identifier: GPL-3.0-or-later

import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import St from 'gi://St';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import {CHARACTER_GROUPS, selectCharacter} from './characters.js';

export default class UmlautPanelExtension extends Extension {
    _indicator = null;
    _signals = [];

    enable() {
        if (this._indicator)
            return;

        const indicator = new PanelMenu.Button(0.0, this.metadata.name, false);
        this._indicator = indicator;

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
                        accessible_name: `Copy ${character.name} (${character.text})`,
                        name: `umlaut-character-${character.text.codePointAt(0).toString(16)}`,
                        style_class: 'button umlaut-character-button',
                        can_focus: true,
                        reactive: true,
                        track_hover: true,
                        x_expand: true,
                    });
                    row.add_child(button);
                    const signalId = button.connect('clicked', () => {
                        try {
                            selectCharacter(
                                character.text,
                                text => St.Clipboard.get_default().set_text(
                                    St.ClipboardType.CLIPBOARD, text),
                                () => indicator.menu.close()
                            );
                        } catch (error) {
                            console.error('Umlaut Panel: clipboard write failed', error);
                            Main.notifyError('Umlaut Panel', 'Could not copy the character. Try again.');
                        }
                    });
                    this._signals.push([button, signalId]);
                }
            }

            indicator.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
            indicator.menu.addMenuItem(new PopupMenu.PopupMenuItem('Select a character to copy', {
                reactive: false,
                can_focus: false,
            }));
            Main.panel.addToStatusArea(this.uuid, indicator);
        } catch (error) {
            this.disable();
            throw error;
        }
    }

    disable() {
        for (const [actor, signalId] of this._signals)
            actor.disconnect(signalId);

        this._signals = [];
        this._indicator?.destroy();
        this._indicator = null;
    }
}
