// SPDX-License-Identifier: GPL-3.0-or-later

export const CHARACTER_GROUPS = Object.freeze([
    Object.freeze([
        Object.freeze({text: 'ä', key: 'a', name: 'lowercase a with umlaut'}),
        Object.freeze({text: 'ö', key: 'o', name: 'lowercase o with umlaut'}),
        Object.freeze({text: 'ü', key: 'u', name: 'lowercase u with umlaut'}),
    ]),
    Object.freeze([
        Object.freeze({text: 'Ä', key: 'A', name: 'uppercase A with umlaut'}),
        Object.freeze({text: 'Ö', key: 'O', name: 'uppercase O with umlaut'}),
        Object.freeze({text: 'Ü', key: 'U', name: 'uppercase U with umlaut'}),
    ]),
    Object.freeze([
        Object.freeze({text: 'ß', key: 's', name: 'sharp s'}),
    ]),
]);

const supportedCharacters = new Set(CHARACTER_GROUPS.flat().map(({text}) => text));
const charactersByKey = new Map(CHARACTER_GROUPS.flat().map(({key, text}) => [key, text]));

// Returns the character assigned to a typed key (case-sensitive), or null.
export function characterForKey(key) {
    return charactersByKey.get(key) ?? null;
}

export function selectCharacter(character, writeClipboard, closeMenu) {
    if (!supportedCharacters.has(character))
        throw new RangeError('Unsupported character');

    // A failed clipboard write leaves the menu open so the user can retry.
    writeClipboard(character);
    closeMenu();
}
