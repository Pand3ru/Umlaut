// SPDX-License-Identifier: GPL-3.0-or-later

export const CHARACTER_GROUPS = Object.freeze([
    Object.freeze([
        Object.freeze({text: 'ä', name: 'lowercase a with umlaut'}),
        Object.freeze({text: 'ö', name: 'lowercase o with umlaut'}),
        Object.freeze({text: 'ü', name: 'lowercase u with umlaut'}),
    ]),
    Object.freeze([
        Object.freeze({text: 'Ä', name: 'uppercase A with umlaut'}),
        Object.freeze({text: 'Ö', name: 'uppercase O with umlaut'}),
        Object.freeze({text: 'Ü', name: 'uppercase U with umlaut'}),
    ]),
    Object.freeze([
        Object.freeze({text: 'ß', name: 'sharp s'}),
    ]),
]);

const supportedCharacters = new Set(CHARACTER_GROUPS.flat().map(({text}) => text));

export function selectCharacter(character, writeClipboard, closeMenu) {
    if (!supportedCharacters.has(character))
        throw new RangeError('Unsupported character');

    // A failed clipboard write leaves the menu open so the user can retry.
    writeClipboard(character);
    closeMenu();
}
