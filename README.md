# Umlaut Panel

A GNOME Shell extension that puts German characters one click away. Open the **Reichstag dome** button in the top panel and select a character to copy it:

```text
ä   ö   ü
Ä   Ö   Ü
    ß
```

The popup closes after copying. Paste normally into your application. Opening or dismissing the popup leaves the clipboard unchanged. Buttons have accessible names and keyboard focus; use Tab/Shift+Tab to navigate and Enter/Space to select.

## Keyboard

**Super+U** opens or closes the popup. While it is open, type a letter to copy its character directly:

| Key | `a` | `o` | `u` | `Shift+A` | `Shift+O` | `Shift+U` | `s` |
|-----|-----|-----|-----|-----------|-----------|-----------|-----|
| Copies | ä | ö | ü | Ä | Ö | Ü | ß |

Esc closes the popup without copying. The shortcut is stored in the `open-menu` key of `org.gnome.shell.extensions.umlaut-panel`. With Home Manager:

```nix
dconf.settings."org/gnome/shell/extensions/umlaut-panel".open-menu = [ "<Super>u" ];
```

Targets GNOME Shell **50 and 51** on Wayland. Extension UUID: **`umlaut-panel@local`**.

## Install with Nix

The repository is a flake. The package copies `src/` into `share/gnome-shell/extensions/umlaut-panel@local/` and compiles the GSettings schema.

```sh
nix build github:Pand3ru/Umlaut
```

To install it from a NixOS flake, add the repository as an input:

```nix
inputs.umlaut-panel = {
  url = "github:Pand3ru/Umlaut";
  inputs.nixpkgs.follows = "nixpkgs";
};
```

Then add the package to `environment.systemPackages` and enable the extension, for example through Home Manager's dconf settings:

```nix
environment.systemPackages = [
  inputs.umlaut-panel.packages.${pkgs.stdenv.hostPlatform.system}.default
];

dconf.settings."org/gnome/shell".enabled-extensions = [ "umlaut-panel@local" ];
```

Run `nix flake update umlaut-panel` to pick up new commits.

## Source

- `src/extension.js`: panel UI, clipboard adapter, error feedback, and lifecycle cleanup.
- `src/characters.js`: character groups and the copy action.
- `src/metadata.json` and `src/stylesheet.css`: extension identity, supported Shell versions, and styling that inherits Shell colors.
- `src/icons/`: the Reichstag dome SVG used as a symbolic panel icon.
- `src/schemas/`: the GSettings schema holding the keyboard shortcut.

The extension writes only the selected character to the regular clipboard. It does not read clipboard contents, store history, access the network, spawn external utilities, or bind global shortcuts.
