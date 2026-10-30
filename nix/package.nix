# Installs the extension straight from src/; no npm or ZIP step is needed.
{ lib, stdenvNoCC }:

let
  metadata = lib.importJSON ../src/metadata.json;
  uuid = metadata.uuid;
in
stdenvNoCC.mkDerivation {
  pname = "gnome-shell-extension-umlaut-panel";
  version = metadata."version-name";

  src = ../src;

  dontBuild = true;

  installPhase = ''
    runHook preInstall

    extensionDir="$out/share/gnome-shell/extensions/${uuid}"
    mkdir -p "$extensionDir"
    cp -r ./. "$extensionDir"/

    runHook postInstall
  '';

  doInstallCheck = true;
  installCheckPhase = ''
    runHook preInstallCheck

    extensionDir="$out/share/gnome-shell/extensions/${uuid}"
    test -f "$extensionDir/extension.js"
    test -f "$extensionDir/characters.js"
    test -f "$extensionDir/metadata.json"
    test -f "$extensionDir/stylesheet.css"
    test -f "$extensionDir/icons/reichstag-dome-symbolic.svg"

    runHook postInstallCheck
  '';

  passthru.extensionUuid = uuid;

  meta = {
    description = "Copy German umlauts and sharp s from the GNOME panel";
    license = lib.licenses.gpl3Plus;
    platforms = lib.platforms.linux;
  };
}
