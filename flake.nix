{
  description = "Umlaut Panel: copy German umlauts and sharp s from the GNOME panel";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-26.05";

  outputs = { self, nixpkgs }:
    let
      systems = [ "x86_64-linux" "aarch64-linux" ];
      forAllSystems = f: nixpkgs.lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});
    in
    {
      packages = forAllSystems (pkgs: rec {
        umlaut-panel = pkgs.callPackage ./nix/package.nix { };
        default = umlaut-panel;
      });
    };
}
