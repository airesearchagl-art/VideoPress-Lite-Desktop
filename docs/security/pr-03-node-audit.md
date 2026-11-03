# PR-03: Node / Electron dependency audit

Author verification on 2026-11-03 UTC; this is not independent review or release approval.
Base: `2e8a4e59fc3c93a65ee61a3034144c7573c9727d` (`main`).
The initial 2026-10-29 inventory is historical, not the audit result below.

## Versions and scope

| Package | Previous lock | New lock |
| --- | --- | --- |
| electron | 33.4.11 | 45.2.1 |
| electron-builder | 26.8.1 | 26.18.1 |
| electron-updater | 6.8.9 | 6.8.12 |
| builder-util-runtime | 9.5.1 (build); 9.7.0 (updater) | 9.7.1 |
| js-yaml | 4.2.0 | 4.3.2 |
| tar | 7.5.16 | 7.5.22 |
| undici | 6.26.0 | 7.30.1 |

Direct dependencies are pinned to the tested versions. The lockfile was generated with
Node **24.22.1** / npm **11.19.1** using:

```powershell
npm.cmd install --save-dev --save-exact electron@45.2.1 electron-builder@26.18.1
npm.cmd install --save-exact electron-updater@6.8.12
npm.cmd update
```

No overrides or `npm audit fix --force` were used. Application sources, application
version (1.3.0), build/publish configuration and updater behavior were not changed.
The transitive major transitions belong to the selected parent packages; no unrelated
direct dependency or feature was added.

[Electron stable releases](https://releases.electronjs.org/releases/stable) and npm
registry metadata both identified 45.2.1 as current stable, with Node 24.22.1.
44.10.1 and 43.8.6 also contain that Node version, but the checks below found no need
to fall back. Registry `latest` was builder 26.18.0 / updater 6.8.11; the newer stable
`v26` patches were explicitly selected:
[builder 26.18.1](https://github.com/electron-userland/electron-builder/releases/tag/electron-builder%4026.18.1)
and [updater 6.8.12](https://github.com/electron-userland/electron-builder/releases/tag/electron-updater%406.8.12).
These include runtime 9.7.1 and additional redirect/differential-download fixes.
No builder 27 or updater 7 prerelease was selected.

## Security evidence

Counts are npm's affected-package counts, including dependency propagation, not
unique CVE counts. Audit JSON summaries, all observed advisory IDs, dependency nodes,
versions and artifact hashes are in [pr-03-evidence.json](pr-03-evidence.json).

| Audit | Critical | High | Moderate | Low | Total | Exit |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Before, full | 1 | 14 | 11 | 0 | 26 | 1 |
| Before, omit dev | 0 | 1 | 0 | 0 | 1 | 1 |
| After, full | 0 | 0 | 15 | 0 | 15 | 1 |
| After, omit dev | 0 | 0 | 0 | 0 | 0 | 0 |

Commands: `npm.cmd audit --json` and `npm.cmd audit --omit=dev --json`, before and
after the update. Both were also confirmed with `--package-lock-only`, using an
independent copy of the unchanged base manifests for the before snapshot. The full
audit intentionally remains nonzero; it is not a clean audit.

Key advisories addressed include:

- [GHSA-p2f4-r6v6-j797 / CVE-2026-54673](https://github.com/advisories/GHSA-p2f4-r6v6-j797): builder-util-runtime cross-origin credential-header forwarding; patched at 9.7.0, resolved to 9.7.1 in the updated tree.
- js-yaml [GHSA-52cp-r559-cp3m](https://github.com/advisories/GHSA-52cp-r559-cp3m), [GHSA-5p4m-2wfm-xmqj](https://github.com/advisories/GHSA-5p4m-2wfm-xmqj), and [GHSA-2883-xcg3-v3hh](https://github.com/advisories/GHSA-2883-xcg3-v3hh): resolved to 4.3.2 through parent ranges. js-yaml was the sole production affected package.
- tar findings in the previous Critical package: GHSA-23hp-3jrh-7fpw, GHSA-8x88-c5mf-7j5w, GHSA-gvwx-54wh-qm9j, GHSA-r292-9mhp-454m, GHSA-w8wr-v893-vjvp. The complete Electron, undici, XML and archive advisory lists are retained in the evidence JSON.
- [Node 24.22.1 security release](https://nodejs.org/en/blog/release/v24.22.1): CVE-2026-105482, CVE-2026-105483, CVE-2026-106069, CVE-2026-111497, CVE-2026-105481, CVE-2026-106072, CVE-2026-106074 and CVE-2026-106073. Bundled Node/Chromium security is assessed separately from npm audit.

**Residual Critical/High: none reported.** All 15 residual Moderate package findings
trace to [GHSA-g3hv-75wg-m249 / CVE-2026-118764](https://github.com/advisories/GHSA-g3hv-75wg-m249)
in minimatch (<11.0.1). The current builder uses `^10.2.5`, asar 3.4.1, universal
2.0.3 and other older-major consumers. `npm update` cannot cross their ranges to
11.0.1. Overrides and forced major replacements are outside this task. This is a
build-time glob-pattern resource-exhaustion risk, not a claim of no exploitability.
Use only reviewed build configuration and inputs; track an upstream parent update.
The production audit is zero and the built ASAR was checked to exclude minimatch.

## Electron 34–45 compatibility

Reviewed the official [Breaking Changes](https://www.electronjs.org/docs/latest/breaking-changes)
sections for each major against `main.js`, `preload.js`, `renderer.js`, `index.html`
and the Windows x64 build configuration. The following are source-based inferences,
supplemented by the development smoke checks below, not packaged compatibility proof.

| Major | Application assessment |
| --- | --- |
| 34 | Windows fullscreen menu visibility can change; no fullscreen mode is configured. |
| 35 | Uses Windows dialogs and a BrowserWindow preload path; no session preload, webRequest, service-worker or console-message consumers. |
| 36 | No app.commandLine, printer, quota, extension, nativeImage bitmap or AeroGlass calls. Windows target avoids GTK changes. |
| 37 | FFmpeg uses Node child_process, not utilityProcess. No USB/serial, protocol-session or all-workspaces APIs. |
| 38 | No plugin-crashed or webFrame routing API. No Linux environment or macOS target. |
| 39 | No window.open, capture, host-rules or offscreen rendering. |
| 40 | No renderer clipboard or macOS debug-symbol processing. |
| 41 | No PDF, cookies or showHiddenFiles handling. |
| 42 | Explicit Electron binary installation was verified after npm ci. No offscreen, quota or notification API use. |
| 43 | First-use dialogs now start in Downloads when no saved directory exists. Existing code already passes valid saved defaultPath. No bitmap, extension or Linux window decoration use. |
| 44 | Target is x64; no renderer clipboard, client-certificate handler, custom ANGLE, net.request headers or login-item APIs. GPU preview remains a manual release check. |
| 45 | Preload imports only electron and uses retained ipcRenderer instance methods. No removed shims/globals, worker integration, capture, tracing, storage-access, safeStorage or window.open use. |

In 45, ASAR descriptor behavior changes do not affect the application's calls:
FFmpeg/ffprobe are external `extraResources` executables; input videos, output and
settings are external files. No ASAR file descriptor is passed to a native addon,
child-process stdio or socket. The actual ASAR was inspected without launching it.

`contextBridge.exposeInMainWorld`, `ipcRenderer.invoke/on/removeListener`,
`webUtils.getPathForFile`, `BrowserWindow.loadFile`, `webContents.send`, dialogs,
Menu, app lifecycle and `shell.openPath` remain the application's API surface.
The development smoke measured sandbox=true, contextIsolation=true and
nodeIntegration=false. Native OS chooser/drag-and-drop and shell folder opening
remain manual checks; a synthetic File only verifies webUtils is callable.

## Verification performed

- Before and after: `npm.cmd ci` and `npm.cmd run check` passed. The post-update ci
  left the lockfile hash unchanged. `node --check scripts/fix-latest-yml.js` and
  `git diff --check` passed. No lint or test scripts exist in package.json.
- Windows 11 build 26200, x64, validation Node 24.22.1 / npm 11.19.1. The validation
  Node zip was obtained from nodejs.org and matched its published SHA256. The
  preinstalled host Node 24.15.0 was not used for these install/build checks.
- Electron 42+ no longer downloads its binary in postinstall. Ran
  `node node_modules/electron/install.js` explicitly after ci and confirmed the
  development process actually reported Electron 45.2.1, Node 24.22.1 and
  Chromium 156.0.8078.75.
- A temporary harness outside the repository loaded the unmodified main/preload
  and renderer with a dedicated userData/session directory. Startup and manual
  update checks returned the development skip path. Guards on updater check,
  download and install methods recorded zero calls. No packaged executable ran.
- With 3-second lavfi-generated video/audio only: bundled FFmpeg/ffprobe discovery,
  probe, CPU preset compression, target-size CPU compression, H.264 NVENC on
  RTX 4090, renderer two-file batch (2/2), progress, isolated settings
  save/load/reset and local video decoding passed. A captured window was visually
  checked. H.265/AV1, long videos, cancel/stop, native dialogs and actual OS drop
  were not tested.
- An initial harness assertion wrongly equated coded width with HTML display
  width: ffprobe showed 720x406, SAR 406:405, DAR 16:9, so HTML width 722 is correct.
  The assertion was corrected to account for aspect ratio and the smoke passed.
  No application code was changed to make the test pass.
- Safe equivalent of the existing build/dist pipeline:

  ```powershell
  $env:CSC_IDENTITY_AUTO_DISCOVERY = 'false'
  .\node_modules\.bin\electron-builder.cmd --win nsis --publish never
  node scripts/fix-latest-yml.js
  ```

  The NSIS build passed; all signing steps were skipped. The ordinary `build` /
  `dist` scripts were not invoked because their builder command lacks an explicit
  publish guard. No release, distribution or production action was performed.
- `latest.yml` before normalization used hyphenated filenames; the existing fixer
  produced the actual spaced installer name in both path and files[].url and was
  idempotent. Updater 6.8.12's own parser/resolver accepted it offline. Size and
  SHA512 matched the installer. The gzipped blockmap parsed as version 2. This is
  metadata compatibility evidence, not a successful installed update.
- ASAR source files matched the unchanged main/preload/renderer, bundled updater
  was 6.8.12 and js-yaml 4.3.2. Both external FFmpeg binaries matched the source
  LFS content. The static-inspection harness needed Windows-native path separators;
  after correcting that harness lookup it passed.

The local installer is 177,624,800 bytes; SHA256:
`4bf158d7832ae1c02094b1ee9f090bdacb7a2c141ba82cfe517338ab26b5656e`.
It is an unsigned verification artifact, not an approved distribution.

## Remaining Human Gates

1. Independent review of the exact PR HEAD, residual Moderate findings, compatibility
   analysis and author evidence. No review approval, Ready transition or merge was performed.
2. **STOP / not executed:** packaged launch, NSIS install/uninstall and installed
   Electron 33 to 45 update. An isolated disposable Windows VM and isolated update
   feed were not available. `autoDownload=true`, `autoInstallOnAppQuit=true` and
   `quitAndInstall()` make a normal-desktop packaged smoke unsafe for this task.
3. The release owner must authorize a separate release candidate with a version
   greater than the installed version (this PR retains 1.3.0). In a snapshotted VM
   with no production credentials and an approved test feed, test fresh install,
   older 33-based install -> new candidate update, restart/deferred quit update,
   settings retention, rollback/recovery and installer/metadata/hash consistency.
   Keep production distribution unreachable. Do not infer update success from the
   development skip test or blockmap format alone.
4. On that VM, verify OS file dialogs and drop, output folder opening, menu/about,
   CPU and available GPU codecs, presets/target sizes, batch/stop, preview, Unicode
   paths and larger synthetic files. Review signing/SmartScreen and release artifacts
   before any separately authorized distribution.

The repository has no tracked CI workflow or repo-local agent instructions. The
earlier branch-protection API request was denied with integration HTTP 403 and was
not retried or bypassed. Branch-protection requirements remain unverified; the
repository owner must check them at the Human Gate.
