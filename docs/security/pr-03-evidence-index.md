# PR-03 Evidence 索引

取得入口: [PR #1](https://github.com/airesearchagl-art/VideoPress-Lite-Desktop/pull/1)。初回依頼は [Review entry](pr-03-review-entry.md)。
索引作成時刻: 2026-11-03T13:03:19.590Z。
この索引は既存原本の所在・byte数・SHA256を記録するもので、独立 review 判定や配布許可ではありません。

## 対象SHAと状態語

- **B** = base `2e8a4e59fc3c93a65ee61a3034144c7573c9727d`
- **C** = 評価対象コード `520bad025c339fb351ef8a4cae1f9aed851f1b0f`
- **B→C** = 依存更新過程のログ。最終C単独の試験と扱わない。
- 資料格納commit **D** と current HEAD は PR 本文で確認する。本索引自身のSHAを循環埋め込みしない。
- 下表のサイズとhashは **作成担当が今回読めた原本bytesから算出**。受領側 reviewer の取得・照合は全項目 **未記録**。
- Gitにある要約、原ログ、harness、画像、installerは別資料。要約の閲覧を原本受領・ZIP内部照合へ読み替えない。

## A. Gitから取得できる固定ソース / 集約データ

取得先は各行のcommit固定URL。RawまたはContents/Git Blob APIで原本bytesを取得し、下記size/SHA256と照合する。
hashはLFの **Git blob bytes** に対する値であり、HTMLページ、表示用JSON、CRLF checkoutのhashではない。
アクセス条件: 対象repositoryを読めるGitHub接続。作成担当はlocal Git objectから読取・照合済み、受領側の接続可否は未確認。
保存期限: 固定日時なし。repository/commitの削除・アクセス変更・到達不能化で取得不可になり得る。期限付き署名URLは使用していない。

| 原本 / 固定取得先 | bytes | SHA256 | 対象 | 種別 |
| --- | ---: | --- | --- | --- |
| [B: package.json](https://github.com/airesearchagl-art/VideoPress-Lite-Desktop/blob/2e8a4e59fc3c93a65ee61a3034144c7573c9727d/package.json) | 1812 | `d6da8eb62855632e1634ff412aa8c385b3df145d926a5345af07848f1f5ac256` | B | Git blob 原本 |
| [B: package-lock.json](https://github.com/airesearchagl-art/VideoPress-Lite-Desktop/blob/2e8a4e59fc3c93a65ee61a3034144c7573c9727d/package-lock.json) | 146184 | `89d62390903c906223b583d86659c01d89c7f0a5ad592c6f2a72d40f31c0bf19` | B | Git blob 原本 |
| [C: package.json](https://github.com/airesearchagl-art/VideoPress-Lite-Desktop/blob/520bad025c339fb351ef8a4cae1f9aed851f1b0f/package.json) | 1810 | `6cfd2b3a7b3cfd7afc4a73955804bec74d34afe35a62c684f480ae46b53a3ee4` | C | Git blob 原本 |
| [C: package-lock.json](https://github.com/airesearchagl-art/VideoPress-Lite-Desktop/blob/520bad025c339fb351ef8a4cae1f9aed851f1b0f/package-lock.json) | 129027 | `c99388fe7255ab0dbddaa382c1c6231947cfb22fe5ea1e85b3f582948069951b` | C | Git blob 原本 |
| [C: main.js](https://github.com/airesearchagl-art/VideoPress-Lite-Desktop/blob/520bad025c339fb351ef8a4cae1f9aed851f1b0f/main.js) | 26259 | `39502c19e14d64fa6a8f1479f5a9a17e443e9f9494348fa1d9769f2deb942b66` | C | Git blob 原本 |
| [C: preload.js](https://github.com/airesearchagl-art/VideoPress-Lite-Desktop/blob/520bad025c339fb351ef8a4cae1f9aed851f1b0f/preload.js) | 1349 | `9e40762f52c9963578bcbe29f8237e9a782926df3dc354c66389a7e1ba812925` | C | Git blob 原本 |
| [C: renderer.js](https://github.com/airesearchagl-art/VideoPress-Lite-Desktop/blob/520bad025c339fb351ef8a4cae1f9aed851f1b0f/renderer.js) | 36287 | `e7ce28795c454e9da2c434ee5d4c815b46f4652b4499671ffdba1b97a19f8b0a` | C | Git blob 原本 |
| [C: index.html](https://github.com/airesearchagl-art/VideoPress-Lite-Desktop/blob/520bad025c339fb351ef8a4cae1f9aed851f1b0f/index.html) | 12095 | `7b0664856ebb872d63218ac5eb6d9e43636f46f489d0df18c371e79927d3cd41` | C | Git blob 原本 |
| [C: style.css](https://github.com/airesearchagl-art/VideoPress-Lite-Desktop/blob/520bad025c339fb351ef8a4cae1f9aed851f1b0f/style.css) | 6853 | `dc44b68f6e09c9710db8a03bbe9659bef5e47e69a4682ab43719a4b906a14bf6` | C | Git blob 原本 |
| [C: scripts/fix-latest-yml.js](https://github.com/airesearchagl-art/VideoPress-Lite-Desktop/blob/520bad025c339fb351ef8a4cae1f9aed851f1b0f/scripts/fix-latest-yml.js) | 473 | `cf150ec04818d89231baacc5b70de391443bd82a6a801834e3b5aaa72ee92e5d` | C | Git blob 原本 |
| [C: docs/security/pr-03-evidence.json](https://github.com/airesearchagl-art/VideoPress-Lite-Desktop/blob/520bad025c339fb351ef8a4cae1f9aed851f1b0f/docs/security/pr-03-evidence.json) | 34439 | `885f5d684a325ec3bf7db8fa4d7502d3e415da633e8212b89d626253a2e4c7a7` | C | 作者生成の集約JSON（原ログではない） |

集約JSONには `pass` 等の作者生成フィールドがあるが、受領側の判定や原本照合状態を表していない。
ここから追加の実装narrativeへ自動展開せず、必要な結果項目と対応原本を選んで読む。

## B. ホスト保管原本（Gitへ未アップロード）

原本保管ホスト: **S-K-DeskTop**。
安定locatorは `%USERPROFILE%\Documents\Codex\2026-11-03\task-5` を **T** として解決する。
**E** = `T\pr-03-evidence`、**R** = `T\pr-03-videopress`。
各行の取得先はホスト名 + E/R + relative path の組合せ。ローカルパスはHTTP配信URLではない。

アクセス条件: このホストへconnected / authorizedな正式ツールで、該当ファイルのread権限が必要。
作成担当は存在・サイズ・hashを今回確認した。**クラウド/別ホスト reviewer への配送・受領・照合は未実施、取得可能性も未保証**。
GitHub connectorだけでこの原本を取得できるとは記録しない。既存のホスト接続で取得できなければControllerへ必要な最小原本を通知し、その範囲の判断を保留する。
ユーザーに手動再添付を求める方式を標準にしない。新規storage、外部送信、Release asset、権限変更の許可を本索引から導かない。

保存期限 / 失効条件: 保証された保存期間・自動backupなし。task cleanup、ホスト停止、ファイル上書き/削除により失効する。
移設時は同一原本bytesとSHA256を維持し、承認済みの取得先・旧所在・理由を追記する。
Actions run ID / artifact ID: **該当なし**（Actions artifactは未作成）。Release asset / ZIP bundle: **未作成**。
大容量installer、画像、動画、privateなログ本文は今回Gitへ追加していない。

### 既存 audit / 実行ログ / harness / synthetic media

全行の状態: 作成担当による現地read/hash照合済み、Git uploadなし、reviewer受領・照合未記録。
終了値を含まないログもあるため、テキストにエラーがないだけで終了値0を推定しない。作者集約と原本の観測範囲を分ける。

| 原本取得先 | bytes | SHA256 | 対象 | 内容 / 制約 |
| --- | ---: | --- | --- | --- |
| E / `audit-before-full.json` | 69025 | `d8fef708604a95d54751f3cb993f52d3fc598d459d7485a781c0b3a8d944186f` | B | base snapshot / package-lock-only audit 全体 |
| E / `audit-before-prod.json` | 2390 | `b912d7bfddb86b2df6f07acdfb0054a5c2d878a6549b6ea9c96930c03e62b634` | B | base snapshot / package-lock-only audit omit-dev |
| E / `audit-after-full.json` | 8470 | `bd06f1fa1e63e4660e16df6f191bfe1022bbafbb7436657f36cd42eac4d48d32` | C | 最終 lock / package-lock-only audit 全体 |
| E / `audit-after-prod.json` | 387 | `834d958f06d6cc390aa661c50cafaa6671610c4b819e84f3f408d16f2b132641` | C | 最終 lock / package-lock-only audit omit-dev |
| E / `audit-before-full-initial.json` | 69025 | `d8fef708604a95d54751f3cb993f52d3fc598d459d7485a781c0b3a8d944186f` | B | 初回 audit 全体（前記 snapshot と区別） |
| E / `audit-before-prod-initial.json` | 2390 | `b912d7bfddb86b2df6f07acdfb0054a5c2d878a6549b6ea9c96930c03e62b634` | B | 初回 audit omit-dev（前記 snapshot と区別） |
| E / `baseline/package.json` | 1812 | `d6da8eb62855632e1634ff412aa8c385b3df145d926a5345af07848f1f5ac256` | B | before audit に用いた base Git blob コピー |
| E / `baseline/package-lock.json` | 146184 | `89d62390903c906223b583d86659c01d89c7f0a5ad592c6f2a72d40f31c0bf19` | B | before audit に用いた base Git blob コピー |
| E / `npm-ci-before.log` | 1636 | `9a4858542f4675b30c09eea6b003a0a1ddeea0481bdcf7c0d1e4caf561831b8a` | B | before npm ci stdout/stderr |
| E / `npm-ci-after.log` | 1467 | `ccc73d59d96740f566e099b6f1fdb78aea9193e7b0a65972def87234e00b57f5` | C | after npm ci stdout/stderr |
| E / `check-before.log` | 122 | `73effb763cee7189493e5e35c1d7010e494fc5498415e15306232a7884e5f094` | B | before npm run check 出力 |
| E / `check-after.log` | 122 | `73effb763cee7189493e5e35c1d7010e494fc5498415e15306232a7884e5f094` | C | after npm run check 出力 |
| E / `install-dev.log` | 726 | `f732c2a14baa1f404766093db38e9a074293ce3bf87575053568dea2e4ce998d` | B→C | 直接dev依存 install 出力 |
| E / `install-updater.log` | 706 | `1ccb1d0321823731c0e2417953f760f320d6ecc34c66cddce50cc8e1c7d00ebd` | B→C | updater install 出力 |
| E / `update-transitives.log` | 607 | `90d67c505c581fbabc9d596e6f5a6e43e0fae18c173b0293359166250cd6d3c3` | B→C | npm update 出力 |
| E / `dependency-tree.log` | 1737 | `5c95177dc115d44de503ce91c24ce988ae2afdf512660d1fd164308aa46a1436` | C | 依存一覧出力 |
| E / `install-electron.log` | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | C | binary install 出力（空ファイル） |
| E / `dev-harness/package.json` | 74 | `5486343be4e103fbea10ca29e3b77988fa5e2d3763910821fb28a4f0a2e1a106` | C | 開発 harness manifest |
| E / `dev-harness/smoke.cjs` | 7815 | `ffb55460504c2ed3c9fbe0ae34fb9e2396b47beeb17d2918b6f29f59403ec10d` | C | 最終版開発 harness 原本 |
| E / `dev-smoke-first-attempt.json` | 6568 | `6c443e6dfa5938986e048e85a645ee0abd71fb354ffb4bb998fa3005f00ba003` | C | 初回失敗結果。初回 harness 全文は未保管 |
| E / `dev-smoke-result.json` | 8544 | `cdecd2e4915fa8eff4635cdd61ad17fe51e24dbad40a2f9f870d51047bd67eb1` | C | 最終版 harness 結果原本 |
| E / `dev-smoke.stdout.log` | 8547 | `aa196087bd7ddc70c3985aac716f1c0369a97f16f7dc25ca29b2decc60ac47ae` | C | 最終版 harness stdout |
| E / `dev-smoke.stderr.log` | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | C | 最終版 harness stderr（空ファイル） |
| E / `dev-window.png` | 109892 | `098104ef79d6a61847d51296d4b50b31acc5802c735be9b3fd1ffb390e1ce5f4` | C | 開発ウィンドウ画像原本 |
| E / `nsis-build.log` | 2143 | `af008b81e4a3304f5155dd56f2634495f8ca4b648e1b173b5d887f3bc63feb14` | C | publish-never NSIS build 出力 |
| E / `latest-before-fix.yml` | 363 | `fe29e06b315e3fd7a8c5da14445143a94424135954a87c3fa4022477b8bceead` | C | fixer 実行前の builder metadata 原本 |
| E / `verify-artifacts.cjs` | 3198 | `1673c49a6dcc2c43008265838f633d72b215780d1b8b30d47b765882c6e6fd75` | C | 最終版 offline metadata/ASAR検査 harness |
| E / `artifact-verification.json` | 457 | `cdbf58085d710a74e4d56c0b804e062a2856303d30f886a9ea522a769fee70cf` | C | 最終版 offline 検査結果原本 |
| E / `synthetic-input.mp4` | 115151 | `3cbd57908926b54de5abd9c1f927bcc2ef1fb6590f994c9b1b68860468e6c04b` | C | lavfi 入力原本 |
| E / `synthetic-input-two.mp4` | 115151 | `3cbd57908926b54de5abd9c1f927bcc2ef1fb6590f994c9b1b68860468e6c04b` | C | batch 用入力コピー |
| E / `synthetic-input-compressed.mp4` | 133805 | `5f3394bd3ddff5620571dc46db0521fbf9683e289732ab57f7ac15fc8d8c48ac` | C | 初回CPU出力 |
| E / `synthetic-input-compressed-2.mp4` | 133805 | `5f3394bd3ddff5620571dc46db0521fbf9683e289732ab57f7ac15fc8d8c48ac` | C | 最終 harness CPU出力 |
| E / `synthetic-input-compressed-3.mp4` | 133805 | `5f3394bd3ddff5620571dc46db0521fbf9683e289732ab57f7ac15fc8d8c48ac` | C | 最終 batch 出力1 |
| E / `synthetic-input-two-compressed.mp4` | 133805 | `5f3394bd3ddff5620571dc46db0521fbf9683e289732ab57f7ac15fc8d8c48ac` | C | 最終 batch 出力2 |
| E / `synthetic-input_vp.mp4` | 562018 | `06212b462c4dded30c90ae73325abdfb369199ee3609a1f68e009b96a43dc442` | C | target-size CPU 出力 |
| E / `synthetic-input_vp-2.mp4` | 199257 | `445afbd76d26376b9e842d6f48ca73ed1e0abba2c699c0074944e102d4ed5e23` | C | H.264 NVENC 出力 |

### 生成物原本（実行・配布禁止の境界を維持）

全行の状態・アクセス・期限は上と同じ。installerは署名なし検証用、app versionは1.3.0。
ダウンロード/保管できたことと、実行・配布の承認は別。packaged起動、install/uninstall、旧33→45更新の証拠は存在しない。

| 原本取得先 | bytes | SHA256 | 対象 |
| --- | ---: | --- | --- |
| R / `dist/VideoPress Lite Desktop Setup.exe` | 177624800 | `4bf158d7832ae1c02094b1ee9f090bdacb7a2c141ba82cfe517338ab26b5656e` | C |
| R / `dist/VideoPress Lite Desktop Setup.exe.blockmap` | 185393 | `5e5033e39f2d405e017604f28c4db43fbbfdcfa7a55803d2f8050b9b4481d134` | C |
| R / `dist/latest.yml` | 363 | `08e06fcc76cad3f5b56df678300529ca106958633c0d60b6258ad69c075a7e67` | C |
| R / `dist/win-unpacked/resources/app.asar` | 2413142 | `ccbe3cf011eadb8c99707bf1826b3b5661764302081a638603c7e45ff9f4d7b7` | C |
| R / `dist/win-unpacked/resources/app-update.yml` | 125 | `0ce52575e1bf75af9d1643f91b5422e108954abb06ebcf8fe11cd36fd55befa7` | C |

## C. CRLF working-copy bytesとGit blobの区別

既存 `pr-03-evidence.json` の `lockSHA256` は下表のWindows working-copy lock bytesを指す。
AのGit blob lock hashと異なる。今回、下記全ファイルをCRLF→LFに正規化した内容がCのGit blobと同じことをread-onlyで確認した。
これはhash検証時のbyte形式の説明であり、差異のある原本を同一hashと表示するものではない。
検証に用いたworking-copy原本を取得する場合はR、Git原本を取得する場合はAのhashで照合する。

| 原本取得先 | bytes | SHA256 | 対象 | 今回の照合範囲 |
| --- | ---: | --- | --- | --- |
| R / `package.json` | 1884 | `e58863a535bc319390b06a6743043ae30907b108813de843255486ad52fb65df` | C | LF正規化後のGit blob一致を今回照合 |
| R / `package-lock.json` | 132653 | `d6426b5cc99469d8155cf86b5eb8baed18a81f36b5a5d17dc1ab89d3359fe317` | C | LF正規化後のGit blob一致を今回照合 |
| R / `main.js` | 27057 | `0ea45080f2b2b434815d042da5fb86b656acd3eaf8b10216936e60f58f693ee3` | C | LF正規化後のGit blob一致を今回照合 |
| R / `preload.js` | 1375 | `8cf6dcb38265a33f65efc0bac51b5f353bf7f2f3a6fa4465cd718cb62ff45bc4` | C | LF正規化後のGit blob一致を今回照合 |
| R / `renderer.js` | 37253 | `4fefb9659847e16c98c208e94806a9905e7084ea239ea4752fee3de37fafa3b5` | C | LF正規化後のGit blob一致を今回照合 |
| R / `index.html` | 12350 | `5e8b00c3042185459bbea34ea88e0f65740841ff993c4700c5598ec074473080` | C | LF正規化後のGit blob一致を今回照合 |
| R / `style.css` | 7312 | `1b218c0a569dc408a6248ee61b7753d4986ddd002115f89a823ab8b94eb8f313` | C | LF正規化後のGit blob一致を今回照合 |
| R / `scripts/fix-latest-yml.js` | 488 | `c3a9e8f739aca722aecb7c66a697bf7a23f9abc23316c0f58ebf417257abdfc1` | C | LF正規化後のGit blob一致を今回照合 |

## D. 未保管・未生成・未受領を明示する項目

- 初回失敗時のharness全文: **未保管**。初回result JSONはB節にあるが、最終版harnessだけで初回を再現したとしない。
- ASAR検査初回の失敗console全文: **独立原本ファイルなし**。既存作者記録に観測記載がある。原本受領済みではない。
- 初回CI APIレスポンス / CLIの終了値記録: **独立原本ファイルなし**。既存PR/作者会話の観測記載と、今後のfresh取得は別観測として扱う。
- packaged起動、NSIS install/uninstall、隔離feedでの旧33→45更新: **未実施 / Not run**。原本のsize/hash/取得先はN/A。実施済みと推定しない。
- independent review report / formal approval: **未作成・未受領**。本索引は作者資料である。

## E. Turn 2専用の所在（初回payloadから内容を分離）

作者の自己評価・設計経緯・互換性判断は、既存の `docs/security/pr-03-node-audit.md`（C）に保持する。
Fresh Assessment後、finding解消やintent確認が必要な場合だけControllerが別turnで提示する。
取得先: [commit固定の作者監査記録](https://github.com/airesearchagl-art/VideoPress-Lite-Desktop/blob/520bad025c339fb351ef8a4cae1f9aed851f1b0f/docs/security/pr-03-node-audit.md)。
Git blob size: 12077 bytes。
SHA256: `07fd1433c4f853fc6cbaa97745520491a4f7cba77170b8913cfff568be198df4`。
対象C、アクセス/期限はAと同じ。本文をこの索引や初回依頼へ転載しない。
