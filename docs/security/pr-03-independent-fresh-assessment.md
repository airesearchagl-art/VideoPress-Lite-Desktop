# PR-03 Independent Fresh Assessment — Turn 1

> **公開派生版 — 格納担当による編集注**
> 独立 reviewer thread: `01a1a189-ab5a-7795-b707-7d9662a640f3`。実装・格納担当による自己レビューではない。以下は原本の初回評価を保持した公開派生版であり、新しいレビュー・正式approvalではない。
> 原本の個人path49箇所とホスト名2箇所をID化した。さらに非公開規約のリンク・識別子・固有分類と、端末識別情報へ直接誘導するリンクを省略し、判断の意味を保つ一般表現にした。OS・検証条件・対象SHA・証拠値・照合結果は変更していない。JSONはGit保存用にLFへ正規化した。
> 評価対象コードCとreviewed資料Dは下表に固定。今回の格納commit/current HEADはPR本文で確認し、C/Dの新規実行結果と扱わない。

使用ツール: Codex / GitHub connector（GET）、Web（公式資料）、同一 Windows PC の read-only ファイル読取、独立した Python 静的照合。実装担当とは別の fresh context で実施した。これは独立レビュー報告書であり、GitHub Formal Review / approval / merge 許可ではない。

## 総評

**判定: INCONCLUSIVE（受入れ全体）。今回確認した範囲で、依存更新による Confirmed defect / Confirmed Required Code Fix はない。Ready・merge 可とは判定しない。**

版・依存解決と変更範囲は契約に沿っている。原本の受領と静的な配布物対応は確認できた。開発 harness と build の記録は作者証拠として再利用できるが、packaged 起動、install/uninstall、旧 Electron 33 → 45 の実更新・設定保持・復旧は Not run のままである。Moderate 残リスクの受容、CI / protection 要件、独立 Formal Review と Human Gate も未充足である。これらをアプリ欠陥や成功へ読み替えない。

本報告は限定的な初回独立評価であり、完全なレビューや有効な承認を表明していない。作者 narrative は未読で、必要な安全性の確認も未完了である。通常の昇格経路を開けないことが確定した段階で非必須探索を終了した。以後必要なのは不足証拠・人間判断への focused な対応であり、無条件の full-suite 再実行ではない。

| 識別子 | 確認値 |
| --- | --- |
| Repository / PR | [airesearchagl-art/VideoPress-Lite-Desktop #1](https://github.com/airesearchagl-art/VideoPress-Lite-Desktop/pull/1) |
| Base B | `2e8a4e59fc3c93a65ee61a3034144c7573c9727d` |
| **評価対象コード C** | **`520bad025c339fb351ef8a4cae1f9aed851f1b0f`** |
| 入口・Evidence 索引の資料 commit D | `4b8243d0768d031ff58df2cbb89e018f7efce2ea` |
| 最終 fresh PR HEAD | `4b8243d0768d031ff58df2cbb89e018f7efce2ea`（D と一致、C とは別） |
| 最終 PR 読取時刻 | 2026-11-03T13:17:16.621Z |
| PR 状態 | OPEN / Draft、base=`main`、mergeable=true、mergeable_state=clean |


B→C は package.json / package-lock.json と作者資料 2 件。アプリソース変更はない。C→D は 引継ぎ Markdown 2件（113 行・147 行）の追加のみ。親 commit 列は B → C → D。したがって C に結びつく証拠を有効範囲で再利用できるが、D の新規実行結果ではない。

### C1–C6 の独立判定

| 契約 | 判定と根拠 | 残る限界 |
| --- | --- | --- |
| C1 版と依存解決 | manifest と lock は Electron 45.2.1、builder 26.18.1、updater 6.8.12、js-yaml 4.3.2、builder-util-runtime 9.7.1 で一致。公式 Electron release は Node 24.22.1 を掲載し、Node 公式は同版を security release と明記。保存 dev 結果も Electron 45.2.1 / Node 24.22.1 | 版要件は充足。packaged runtime の実行確認・互換性全体は別判定 |
| C2 更新手段と範囲 | 直接依存の変更は上記 3 件のみ、明示版固定。lock root と一致、overrides なし。全 resolved URL は npm registry。その他の変更は間接依存。アプリ・updater 機構・build 設定・fixer は不変 | install / update ログは受領したが、全実行 command line・終了値の独立記録がない。明示 install / npm update の履歴や `audit fix --force` 不使用を stdout だけで完全証明できない。ログ中の推奨コマンド表示を実行と誤認しない |
| C3 Runtime 互換性 | 公式 34–45 Breaking Changes と利用 API を照合。sandbox preload は `electron` のみ require、invoke / on / removeListener を使用。削除された shims は使わない。FFmpeg は ASAR 外。x64 設定と生成 PE の AMD64 ヘッダを確認 | dev の記録に限定した支持。native dialog、実 OS drag/drop、folder-open、packaged UI、更新・復旧は未確認。初回ダイアログの開始場所には既知の挙動差がある |
| C4 配布副作用・metadata | installer 177,624,800 bytes、metadata の files/path/size/SHA512 を現物から照合。fixer 前後と冪等性をメモリ上で照合。ASAR の主要ソースと依存版、外部 FFmpeg、blockmap v2 の構造・総サイズが対応 | `--publish never` は依頼資料の作者報告。build 原ログは成果物生成を支持するが起動 command line は含まない。updater parser 成功は作者 harness 証拠を再利用。各 block checksum と差分更新の実動作は未確認。実配布なしの完全な監査証明は行っていない |
| C5 検証範囲 | before/after npm ci / check、audit 原本を受領。check は 3 JS の構文検査。lint/test script は存在しない。保存 audit は B: Critical 1 / High 14 / Moderate 11 → C: Critical 0 / High 0 / Moderate 15、omit-dev は High 1 → 0 | Node 24.22.1 / npm 11.19.1 の host 情報は作者集約記録。audit 全体 exit 1 / omit-dev exit 0 も作者報告であり終了値原本なし。fresh D に CI 実行はない。残リスクは未受容 |
| C6 境界・次段階 | reviewer は取得・静的照合・この作業フォルダへの報告作成のみ。PR・branch・アプリ・参照資料 を変更していない。packaged 起動・installer・feed 接続をしていない | Human Gate は別途必要。この報告を Ready、正式 approval、merge、Release、配布の承認へ転用しない |

C1 の一次資料: [Electron 45.2.1](https://releases.electronjs.org/release/v45.2.1)、[Node.js 24.22.1 security release](https://nodejs.org/en/blog/release/v24.22.1)。C3 の一次資料: [Electron v45.2.1 固定版 Breaking Changes](https://github.com/electron/electron/blob/v45.2.1/docs/breaking-changes.md)。最新版というラベルではなく、版の包含と利用 API を照合した。

## 良い点

- [C の package.json](https://github.com/airesearchagl-art/VideoPress-Lite-Desktop/blob/520bad025c339fb351ef8a4cae1f9aed851f1b0f/package.json#L67) の変更は承認対象の依存版に限定され、アプリ版は 1.3.0 のまま。無関係な直接依存 major、機能追加、refactor はない。
- 原本と対象コードの対応が追跡できる。Git LF とホスト CRLF は別 hash として正しく区別され、今回 reviewer 自身が正規化同一性を再確認した。
- dev harness は専用 userData を指定し、isPackaged=false を assert、updater のネットワーク・install 関連メソッドを失敗する stub にしている。保存結果の updaterCalls は空。これは dev 経路の証拠として有効であり、packaged 成功を主張していない。
- 残 Moderate、失敗した初回試験、欠落原本、実環境不足が初回資料から開示されている。評価に作者の総合結論を取り込む必要はなかった。

### 受領原本と独立検証

取得経路は reviewed 資料 D の受領索引で記録された。公開版では端末識別情報へ直接誘導するリンクを省略する。同じ承認済み PC `review-host-01` で読み取った。以下の「受領」は bytes を実際に読み、索引の size / SHA256 と一致したことを意味し、全ファイルの意味内容・動作を保証しない。

| 原本群 | 受領・照合結果 | 内容を検証した範囲 |
| --- | --- | --- |
| 索引 A の Git 原本・集約 JSON | 11/11 一致。GitHub から取得した UTF-8 bytes の SHA256 と Git blob SHA1 を照合 | B/C manifest・lock、C main/preload/renderer/index/style/fixer。集約 JSON は必要な環境・結果欄のみ使用 |
| 索引 B/C のホスト原本 | 49/49 一致、アクセス拒否・不一致なし | audit 4 種、npm/check/install/update/tree のログ、初回/最終 harness 結果、最終 harness、NSIS build、metadata/ASAR 検査コードと結果を読取 |
| CRLF working-copy 8 件 | 元 bytes の各 hash 一致、CRLF→LF 後は C の対応 Git blob と全件一致 | package / lock、main / preload / renderer / index / style / fixer |
| installer / blockmap / latest.yml / app.asar / app-update.yml | 索引の全 5 原本を size / SHA256 照合 | 実行なし。installer の SHA512 を独立計算し、YAML の 2 箇所と size / files / path に一致 |
| ASAR 内部 | main / preload / renderer / index / style はホスト bytes と一致、LF 正規化で C と一致 | packaged manifest 1.3.0、updater 6.8.12、js-yaml 4.3.2、builder-util-runtime 9.7.1。minimatch path なし |
| ASAR 外 FFmpeg 追加照合 | source と win-unpacked の ffmpeg / ffprobe が一致 | C の Git LFS pointer を別途 GitHub 取得し、サイズ・SHA256 が両方一致。実行なし |
| blockmap | gzip 展開可、version=2、1 file、offset=0、8,463 sizes / checksums、サイズ合計 177,624,800 | 構造と範囲の確認まで。各ブロックの digest や旧 blockmap との整合・差分 download は検証していない |
| 画像・synthetic media | 索引の size / SHA256 一致 | 今回は画像の視覚 QA・動画 decode を実施していない。以前の probe/preview 結果は作者記録として分離 |

代表照合値:

| 対象 | SHA256 |
| --- | --- |
| C package-lock.json（Git LF） | `c99388fe7255ab0dbddaa382c1c6231947cfb22fe5ea1e85b3f582948069951b` |
| C package-lock.json（ホスト CRLF） | `d6426b5cc99469d8155cf86b5eb8baed18a81f36b5a5d17dc1ab89d3359fe317` |
| audit-after-full.json | `bd06f1fa1e63e4660e16df6f191bfe1022bbafbb7436657f36cd42eac4d48d32` |
| 最終 dev harness | `ffb55460504c2ed3c9fbe0ae34fb9e2396b47beeb17d2918b6f29f59403ec10d` |
| 最終 dev 結果 | `cdecd2e4915fa8eff4635cdd61ad17fe51e24dbad40a2f9f870d51047bd67eb1` |
| installer | `4bf158d7832ae1c02094b1ee9f090bdacb7a2c141ba82cfe517338ab26b5656e` |
| app.asar | `ccbe3cf011eadb8c99707bf1826b3b5661764302081a638603c7e45ff9f4d7b7` |
| FFmpeg / FFprobe | `228d7a8556258de907fdb55f36850078ebc7680b84ec30d84ea02e99bec1d1eb` / `0fde260f5abd35c9cafd96f594cc76365a780c1b73a90e35b6a3409ea1db1bf0` |

全 60 件の照合台帳は同梱 [receipt-verification.json](receipt-verification.json)、独立静的検査は [artifact-readonly-verification.json](artifact-readonly-verification.json)。検証コードは `verify_receipt.py` と `verify_artifacts_readonly.py`。元ホスト原本は移動・変更・外部 upload していない。

### 作者証拠の再利用と未取得・未生成の区別

再利用したのは、C に対応する保存 npm ci/check/audit/build 出力、最終 dev harness の実行結果、offline parser 検査結果である。reviewer は npm ci、audit、アプリ、FFmpeg、build、作者 harness を再実行していない。作者 verifier は fixer を実行して metadata を書くため、そのまま追試せず、別の読み取り専用検査で必要な対応を確認した。

初回 dev 結果は pass=false、`722 !== 720`。初回と最終結果の出力は encoded width=720 / height=406、表示 width=722 を記録している。最終 harness は表示幅を入力アスペクト比から計算する異なる assertion を持つ。元の失敗時 harness 全文がないため、「同じ試験が成功した」「アプリ欠陥が修正された」「初回は単なる誤検知だった」のいずれも確定しない。

- **索引にある取得可能な 60 原本の未受領: なし。** 原本 bytes と対象コードの主要部分は照合済み。ただし build 実行来歴全体・署名された provenance を証明したわけではない。
- **未保管で取得できない原本:** 初回失敗 harness 全文、初回 ASAR 失敗 console 全文、初回 CI API response / CLI 終了値の独立記録。今回の fresh API 読取は初回記録の復元ではない。
- **未生成 / Not run:** packaged 起動、install/uninstall、隔離 feed による旧33→45更新、設定保持と復旧の実行証拠。
- **意図的未取得:** `docs/security/pr-03-node-audit.md` の作者 narrative。Turn 1 の分離を維持。checkout の `.agents/skills` と root AGENTS.md は存在せず、追加 skill は適用していない。

## 修正必須

**Confirmed Required Code Fix は今回なし。** 必要な原本の欠落、実環境の不足、CI 不在をそのまま実装欠陥に分類しない。

ただし、次節の G1–G3 が未解決のため通常の Ready / merge 前提は充足していない。修正コードを推測で指示する代わりに、Human Decision Owner が残リスク・受入条件・検証環境を確定する必要がある。この報告には Formal Review の固定 marker を付けず、擬似 Attestation として使用しない。

## 修正推奨

1. 次の実行から command line、Node/npm 版、開始・終了時刻、exit code、harness の版または hash を一組で保存する。既存ログを補う目的だけの全再実行は不要。npm の案内表示と実際の実行履歴を区別できるようにする。
2. 失敗した harness の版を上書きせず保存する。今回欠けている初回全文は、最終版で代用せず欠落として残す。
3. C4 の表現を「metadata / ASAR の静的対応」「parser 読取」「blockmap 構造」「実更新」に分ける。現証拠で実更新完了、全 block checksum 検証済みとは記載しない。

いずれも現時点のコード欠陥を示す修正命令ではない。

## 後回しでよい改善

CI の具体設計、広い codec / 長時間入力 matrix、UI 全面改修、依存更新以外の refactor は、この Fresh Assessment のために拡張しない。CI 要件の決定と承認済み実機 gate を先に整理する。H.265 / AV1、long input、batch stop は未実施一覧に残し、必要な受入範囲を人間が決める。

## リスク・注意点

### G1 — packaged 更新・復旧の安全性が未確認

- Claim: 開発 harness と offline metadata 成功だけでは、packaged 起動・新規 install/uninstall・旧33→45更新・設定保持・復旧の安全性を判定できない。
- Precondition: この candidate を packaged 起動または旧版へ更新する段階へ進める場合。
- Minimal sequence: 別承認の隔離 Windows VM と専用 feed を用意し、旧版・設定を準備 → candidate へ更新 → 起動・設定・中断復旧・uninstall を観測する。
- Observable failure: 実際の失敗は未観測。現在観測できるのは実行証拠の不存在。起動不可・設定欠損等は検証仮説に留める。
- Verifier: 対象 SHA / 旧版 / candidate 版 / VM snapshot / feed / 各結果と復旧ログを固定した targeted 実機試験。
- Severity: High（検証不足のまま進めた場合の影響）、Confidence: High（不足の存在）。
- Missing context: 隔離環境、承認、旧配布版と版番号設計、update / rollback の受入条件。
- Classification: Spec gap（受入証拠・判定条件の不足。Confirmed defect ではない）。
- Evidence status: Not run。`main.js` の起動時 update 呼出、autoDownload=true、autoInstallOnAppQuit=true、quitAndInstall は静的に確認。
- Promotion target: Test / Decision。Human Decision: 追加検証と環境確保が必要、未決。

根拠: [C main.js L135](https://github.com/airesearchagl-art/VideoPress-Lite-Desktop/blob/520bad025c339fb351ef8a4cae1f9aed851f1b0f/main.js#L135)、[dev skip L210](https://github.com/airesearchagl-art/VideoPress-Lite-Desktop/blob/520bad025c339fb351ef8a4cae1f9aed851f1b0f/main.js#L210)、受領した harness / result / Evidence 索引。app 版 1.3.0 は検証用成果物として記録する。旧配布版も 1.3.0 の場合に同版を更新候補として使えるとは推定せず、配布 candidate の版は別 gate で決める。

### G2 — build-time Moderate 残リスクの扱いが未決

- Claim: audit-after-full は Moderate 15 affected packages を報告し、リスク受容は未了。15 個の独立した advisory を意味しない。
- Precondition: 影響する minimatch 経路に攻撃者制御の pattern が届き、該当処理条件が成立する場合。
- Minimal sequence: 依存経路と pattern の出所・option を特定し、必要なら隔離された bounded な検証で advisory の条件を確認する。
- Observable failure: DoS は今回再現していない。確認済みなのは audit の残存と lock 上の dev-only 経路。
- Verifier: 親依存の許容版、呼出 option、入力信頼境界、upstream 対応、risk acceptance の記録。
- Severity: Medium、Confidence: High（残存）、到達性は Inconclusive。
- Missing context: Human の許容判断、正確な build 入力の信頼境界と対応計画。
- Classification: Spec gap（残リスクの扱い）。実害確認済みの defect として昇格しない。
- Evidence status: 残存は Confirmed、悪用可能性は Inconclusive。
- Promotion target: Issue / Decision。Human Decision: 未決。

残存の nodes は全て lock 上 dev=true。親範囲は ^3 / ^5 / ^9 / ^10 で、修正版 11.0.1 は既存範囲外。[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) は attacker-controlled pattern と optimizationLevel>=2 の条件を説明する。ASAR に minimatch がないことは runtime と build-time の区別を支持するが、build-time リスク受容を代行しない。`overrides` や `audit fix --force` による無断解消は指示しない。

### G3 — 通常の Formal merge gate を満たす証拠がない

- Claim: current D は Draft、check-runs=0、statuses=0、Actions runs=0。required checks success は確認できず、通常の merge可 Attestation は成立しない。
- Precondition: このレビューを Ready / approval / merge 完了の根拠として扱う場合。
- Minimal sequence: exact D の PR / check-runs / combined status / Actions / Reviews を GET し、確認対象の前提条件と照合する。
- Observable failure: 通常 gate 条件の未充足。combined state=pending を「試験実行中」や「成功」と解釈できない。
- Verifier: Owner による protection / required checks 要件の確認と、承認済み経路での不足条件解決。その後 exact HEAD と verified base に対する必要な審査。
- Severity: High（誤昇格時）、Confidence: High。
- Missing context: protection 要件、必要なら適用可能な正規の CI 例外判断、Formal Review と Human 判断。
- Classification: Enforcement gap / governance evidence gap。CI 未実装自体をアプリ欠陥とは判定しない。
- Evidence status: current API の空結果・Draft は Confirmed、保護要件は Missing context。
- Promotion target: Decision / Hook・CI（採用は別判断）。Human Decision: 未決。

Formal Reviews / inline comments / Conversation comments は fresh REST で各 0 件。mergeable=true / clean は取得したが、未解決 gate の代わりにはならない。GraphQL thread-state の独立検証を行ったとは主張しない。既存 branch-protection HTTP 403 の経路は再試行も迂回もしていない。

### C3 の互換性メモ

34 の Windows fullscreen メニュー、43 の defaultPath 未指定時 Downloads、42 の Electron binary download 時点変更は利用方法との関連がある。現在の file/folder dialog は保存先が未設定・消失時に defaultPath=undefined となるため、初回の開始場所の差を人間の UI 確認に含める。44 の ia32 廃止は x64 設定に一致。45 の preload shim 削除・native EventEmitter と ASAR fd の変更に対し、現コードは削除 shim や ASAR fd の外部プロセス渡しを使用していない。他の掲載変更は platform または利用 API が該当しない範囲を区別した。これらの静的照合を OS 実操作・packaged 全互換性の保証とはしない。

## 次に実装担当へ渡す指示

1. Controller が許可済み格納担当へ本報告の原文を渡し、Application の PR 入口から辿れる Markdown として保存する。格納担当と独立 reviewer を区別する。格納 SHA は本報告の評価コード C と別記する。
2. 依存コードの推測修正は行わない。G1 の隔離環境・検証範囲、G2 の残リスク判断、G3 の CI / protection / Formal Review の扱いを Human に整理する。現在は Draft を維持する。
3. 初回 harness の矛盾・失敗の解消判断が必要な場合だけ、Controller が Turn 2 として作者監査記録の必要部分を提示する。narrative の説明だけで欠落原本や未実施結果を埋めない。説明を受けた場合は、初回判断から何がどの追加証拠で変わったかを明記する。
4. 次の検証は不足項目に限定し、C と同じ blob の npm ci / dev harness / installer build を資料追加だけの理由で繰り返さない。コード・依存・環境・契約が変われば関連証拠の失効を評価する。
5. この報告の保存で HEAD が動いたら C / D / 新 HEAD の差分を照合する。資料だけなら有効証拠を再利用し、Formal Attestation が必要な段階では exact current HEAD を新しく binding する。

## 記録すべき判断

- 初回依頼は中立な Artifact / Contract / Material Facts から開始し、作者監査 narrative は未読。Turn 1 Fresh Assessment として記録する。
- C1 の版・C2 の静的範囲は支持。C3/C4 の実環境は未判定。C5 の原本受領と CI 不在、C6 の操作境界を分離する。
- Confirmed Required Code Fix はなし。未確認を PASS にしない。G1–G3 の採否・残リスク受容は Human Decision Owner が行う。
- 本文は限定レビューであり、完全なレビュー / Formal approval / merge 許可ではない。GitHub review/comment 投稿、Ready、merge、Release、配布、Production、credential/permission 変更は一切実施していない。
- 原本読取に denied / pending / uncertain な操作はない。packaged 実行・installer・feed 接続は承認と隔離環境がなく **未試行 / Not run**。branch-protection 403 は過去の制約を尊重し **未再試行**。

適用した非公開規約の名称・取得先・識別子・固有分類は公開版から省略した。原文は承認済みローカル原本に保持する。レビューの受入れ判断、指摘、未実施範囲および Human Gate は変更していない。


## 公開格納記録（独立評価本文とは別）

原本は格納担当が実際に読み、次のサイズ/SHA256を照合した。原本・path/host対応表・削除差分は承認済みローカル保管のみ。原本bytesや対応表を本PRへ公開していない。

| 原本 | bytes | SHA256 |
| --- | ---: | --- |
| pr-03-independent-fresh-assessment.md | 23687 | `105c75e24c24f6d936402e38af076a8891e860cea1922c98734a044672efc082` |
| receipt-verification.json | 28941 | `dda51e0db7cd7a83cc18aef5e7c599da06940a9b1a4783c5977f6017354fed19` |
| artifact-readonly-verification.json | 2884 | `5347e94116fc916a3d4ee5e800ef256bbc3b1d55d60cc59e21a0a1633570516f` |

公開対象はこのMarkdown、[匿名化した受領台帳](receipt-verification.json)、[静的照合結果](artifact-readonly-verification.json)の3件のみ。

`review-host-01` と `artifact:pr-03:NNN` は対応関係を保つ非識別IDであり、公開された取得URLではない。公開payload内に個人path・具体的ホスト名・非公開規約の参照先はない。既存履歴全体の匿名化は行っておらず、リポジトリ内の全情報が匿名化されたとは主張しない。今回の資料追加でアプリ試験を再実行していない。
