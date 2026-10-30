# Umlaut Panel

A GNOME Shell extension that puts German characters one click away. Open the **Reichstag dome** button in the top panel and select a character to copy it:

```text
ä   ö   ü
Ä   Ö   Ü
    ß
```

The popup closes after copying. Paste normally into your application. Opening or dismissing the popup leaves the clipboard unchanged. Buttons have accessible names and keyboard focus; use Tab/Shift+Tab to navigate and Enter/Space to select.

Targets GNOME Shell **50 and 51** on Wayland. Extension UUID: **`umlaut-panel@local`**.

## Install with Nix

The repository is a flake. The package copies `src/` into `share/gnome-shell/extensions/umlaut-panel@local/`; there is no build step.

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

The extension writes only the selected character to the regular clipboard. It does not read clipboard contents, store history, access the network, spawn external utilities, or bind global shortcuts.
