# Install NULLFRONT for Mac

The current preview is **0.8.0**. It runs on **Apple Silicon Macs (M1 or newer) with macOS 14 or later**. Windows and Intel Macs are not supported by this download. Check **Apple menu → About This Mac** before downloading.

## Download and open

1. [Download the Mac game ZIP](https://github.com/Slimetoad/nullfront/releases/download/v0.8.0/NULLFRONT-0.8.0-macOS-arm64.zip). Wait for the download to finish; it is approximately 920 MiB.
2. Double-click the ZIP. Open the extracted **NULLFRONT-0.8.0-macOS-arm64** folder.
3. Drag **NULLFRONT.app** into **Applications**, then open it there. Allow at least **3 GB of free space** for the download, extraction, and installation.
4. Press **F6** for Campaign, or choose a faction and press **Enter** for a skirmish. Some keyboards require **Fn + F6**.

On GitHub, choose **NULLFRONT-0.8.0-macOS-arm64.zip** under Assets. The automatically generated **Source code** downloads contain the website and documentation, not the playable game.

## If macOS blocks the first launch

This preview has an **ad-hoc signature and is not notarized by Apple**. It does not pass the normal Gatekeeper assessment for downloaded apps. A matching checksum checks file integrity; it does not establish Apple approval or guarantee safety.

For an unidentified-developer or cannot-verify warning, only if you trust this release: try opening it once, then go to **System Settings → Privacy & Security → Open Anyway** and confirm **Open**. Follow [Apple’s official instructions](https://support.apple.com/en-us/102445). A managed work or school Mac may not allow this option.

If the alert says the app **will damage your computer**, do not override it. If it says **damaged**, do not assume it is just the same developer warning: check the download below, extract a fresh copy, and share the exact alert if it persists.

## Find the problem

| What happens | What to check |
| --- | --- |
| “Not supported on this Mac” or an incompatible-app symbol | About This Mac must show an Apple M-series chip and macOS 14 or newer. An Intel Mac cannot run this build. |
| ZIP will not expand, or the download stops | Make sure the download completed and there is enough free space. Download the named ZIP again from the official link above. |
| Extracted folder contains only website files | You downloaded GitHub’s Source code archive. Use the named Mac game ZIP instead. |
| Developer cannot be verified | Read the first-launch instructions above. The current preview is not notarized. |
| Game closes or never reaches its title screen | Share the exact message, chip model, macOS version, and whether the title screen appeared. This requires separate diagnosis from the download checks. |

## Verify the download

Expected filename: **NULLFRONT-0.8.0-macOS-arm64.zip**  
Exact size: **964,963,199 bytes**  
SHA-256:

```text
bfcb43052669f021857cfafd9aefefeea4cca5dde6efa9994837e72130b6b3ce
```

Optional check in Terminal, if the file is in Downloads:

```sh
shasum -a 256 ~/Downloads/NULLFRONT-0.8.0-macOS-arm64.zip
```

If the result differs, do not launch that copy. Download again using the official link. If it matches and installation still fails, send the exact error and Mac details to the person who shared the game, or [report an issue](https://github.com/Slimetoad/nullfront/issues).
