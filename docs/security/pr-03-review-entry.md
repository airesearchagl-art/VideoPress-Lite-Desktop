# PR-03 — Initial Review Request

この資料は初回 Fresh Assessment 用の Artifact / Contract / Material Facts です。
依頼の目的は、下記の契約に対して差分と証拠が何を示すか、未確認範囲は何かを独立に判定することです。
実装理由・設計経緯・作者の評価は初回 payload に含めません。

## Stage 1 — Review Target

### 識別子と対象

| 項目 | 値 |
| --- | --- |
| Project / Task | VideoPress Lite Desktop / PR-03 Node・Electron 依存棚卸し |
| Repository | `airesearchagl-art/VideoPress-Lite-Desktop` |
| PR / 引継ぎ入口 | https://github.com/airesearchagl-art/VideoPress-Lite-Desktop/pull/1 |
| Base SHA（B） | `2e8a4e59fc3c93a65ee61a3034144c7573c9727d` |
| 評価対象コード SHA（C） | `520bad025c339fb351ef8a4cae1f9aed851f1b0f` |
| 資料格納 commit（D） | PR 本文の **Handoff / Review entry** にある 40 桁 SHA と commit 固定リンクを参照 |
| 現在の PR HEAD | PR を fresh 取得して D と照合する。C と同一と扱わない |
| 依頼の状態 | レビュー依頼資料の準備。独立 reviewer の受領・検証・判定は未記録 |

自身の格納 SHA をファイルへ埋める循環 commit は行いません。
B→C の変更は manifest / lock と既存の監査文書 2 ファイルです。
C→D は引継ぎ Markdown 2 ファイルのみを格納する資料追加範囲です。受領側は実際の diff で確認してください。
資料追加で code SHA に結びついた証拠を current HEAD の新規試験結果に読み替えないでください。

正本（Vault commit `1183d2c005c9086824d45e243d9675cb9f278b5f`）：
[PR Based Handoff and Evidence Route](https://github.com/airesearchagl-art/obsidian-vault/blob/1183d2c005c9086824d45e243d9675cb9f278b5f/00_Index/PR_Based_Handoff_and_Evidence_Route.md)、
[AI Review Request Prompt](https://github.com/airesearchagl-art/obsidian-vault/blob/1183d2c005c9086824d45e243d9675cb9f278b5f/02_Prompts/AI_Review/AI_Review_Request_Prompt.md)。
これらの参照は新しい投稿権限・merge 承認を付与しません。

### Artifact

初回は、以下の固定コードと [Evidence 索引](pr-03-evidence-index.md) を使用してください。
索引の相対リンクは、この入口を取得した D の同一 commit で解決します。

| 対象 | Base | 評価対象 C |
| --- | --- | --- |
| package.json | [B](https://github.com/airesearchagl-art/VideoPress-Lite-Desktop/blob/2e8a4e59fc3c93a65ee61a3034144c7573c9727d/package.json) | [C](https://github.com/airesearchagl-art/VideoPress-Lite-Desktop/blob/520bad025c339fb351ef8a4cae1f9aed851f1b0f/package.json) |
| package-lock.json | [B](https://github.com/airesearchagl-art/VideoPress-Lite-Desktop/blob/2e8a4e59fc3c93a65ee61a3034144c7573c9727d/package-lock.json) | [C](https://github.com/airesearchagl-art/VideoPress-Lite-Desktop/blob/520bad025c339fb351ef8a4cae1f9aed851f1b0f/package-lock.json) |

互換性確認用の未変更ソース：
[main.js](https://github.com/airesearchagl-art/VideoPress-Lite-Desktop/blob/520bad025c339fb351ef8a4cae1f9aed851f1b0f/main.js)、
[preload.js](https://github.com/airesearchagl-art/VideoPress-Lite-Desktop/blob/520bad025c339fb351ef8a4cae1f9aed851f1b0f/preload.js)、
[renderer.js](https://github.com/airesearchagl-art/VideoPress-Lite-Desktop/blob/520bad025c339fb351ef8a4cae1f9aed851f1b0f/renderer.js)、
[index.html](https://github.com/airesearchagl-art/VideoPress-Lite-Desktop/blob/520bad025c339fb351ef8a4cae1f9aed851f1b0f/index.html)、
[YAML fixer](https://github.com/airesearchagl-art/VideoPress-Lite-Desktop/blob/520bad025c339fb351ef8a4cae1f9aed851f1b0f/scripts/fix-latest-yml.js)。

Git の取得が許可されている場合の読み取り例（各 SHA は上表の実値に置換）：

```text
git diff --name-status B C
git diff B C -- package.json package-lock.json
git diff --name-status C D
git diff --exit-code C D -- . ":(exclude)docs/security/**"
```

初回コード差分の取得を manifest / lock に限定するのは、同じ commit にある作者説明を混入させないためです。
ファイル一覧でそれ以外のコード変更を検出した場合は対象範囲を再確認してください。
既存 JSON は作者生成の集約データであり、ログや installer 原本の代替でも、独立 reviewer による照合記録でもありません。

### Contract

中立な質問：この差分は以下の C1–C6 を満たすか。どの点が原本・実行環境の不足で判定不能か。

1. **C1 — 版と依存解決**：Electron の許可された修正版系列（45、適合しなければ44/43）で Node 24.22.1 以上の必要な修正を含むこと。builder は26.18.0以降の26系、updater は6.8.11以降の6系、js-yaml は4.3.2以上。最新版というラベルだけで互換性・修正包含を推定しない。
2. **C2 — 更新手段と範囲**：package と lock の整合、明示版 install、親依存または npm update による間接依存解決。overrides、audit fix --force、無関係な直接依存 major、機能追加、refactor、自動更新機構の変更を含めない。
3. **C3 — Runtime 互換性**：Electron 34–45 Breaking Changes を main / preload / renderer の利用 API と照合する。特に sandbox preload、IPC、ファイル操作、ASAR 外の FFmpeg、Windows x64、初回ダイアログの挙動差を検討する。
4. **C4 — 配布副作用と metadata**：installer 検証は `--publish never`。既存 YAML fixer、installer 名、files/path、サイズ・hash、updater parser と blockmap の対応を評価する。metadata の読取成功と実際の旧版更新は分ける。
5. **C5 — 検証範囲**：Node 22.23.4以上または24.22.1以上、npm ci、既存 check/lint/test/build の有無と実施範囲、audit 全体/omit-dev の前後、残 Critical/High の説明を確認する。公開 CI 不在と local author evidence を混同しない。
6. **C6 — 境界と次段階**：配布、Production、credentials、権限・設定変更、Release、常用環境の packaged 起動を含めない。実機更新・配布・独立レビュー・Ready/approval/merge は各 Human Gate と分離する。

レビュー方式は通常レビューを基本とし、互換性・更新 metadata・復旧・副作用の実害を反証する観点を含めます。
既存 Risk Tier / Formal Review / Human Gate の判断をこの資料で変更しません。
読み取り専用 reviewer に commit、PR 投稿、branch 操作は求めません。

### Material Facts

- C の manifest は Electron **45.2.1**、builder **26.18.1**、updater **6.8.12**。lock の js-yaml は **4.3.2**。アプリ版は **1.3.0 のまま**です。
- 2026-11-03 の保存済み audit 集計（affected package 数）：B 全体 Critical 1 / High 14 / Moderate 11、C 全体 Critical 0 / High 0 / Moderate **15**。omit-dev は B High 1（js-yaml）、C 0。全体 audit の終了値は **1**。原本の所在・hash・受領制約は索引にあります。
- 残存は [GHSA-g3hv-75wg-m249 / CVE-2026-118764](https://github.com/advisories/GHSA-g3hv-75wg-m249) と依存経路。build-time の minimatch <11.0.1 で、親の許容範囲と upstream 修正状況の判断が必要です。risk acceptance 済みとは扱わないでください。
- C に tracked CI workflow はなく、作成時の exact C で check-runs / statuses / Actions runs は各0でした。combined status の `pending` は CI 成功でも実行中の証拠でもありません。current HEAD の状態は別に fresh 取得してください。
- 保存済み作者記録の環境は Windows x64、検証 Node 24.22.1 / npm 11.19.1、dev process は Electron 45.2.1 / Node 24.22.1。結果の帰属は C です。署名なし NSIS の生成と、専用 userData での開発 harness 実行の記録があります。独立 reviewer の追試ではありません。
- **隔離 VM / isolated update feed 未確保。packaged 起動、installer install/uninstall、旧33→45の実更新は未実施 / STOP**。autoDownload=true、autoInstallOnAppQuit=true、quitAndInstall が存在します。開発時は `!app.isPackaged` の skip 経路であり、packaged 更新成功を意味しません。
- native file chooser / OS drag-drop / folder open、H.265/AV1、long input、batch stop は未実施。使用媒体は synthetic 3秒動画のみです。実データ・建築資料・Google Drive・Plaud は対象外です。
- 初回 dev harness の幅 assertion は失敗した記録があります。後続は異なる harness 版の結果です。ASAR 静的検査の初回にも Windows path lookup の失敗があり、元の失敗 console 全文は独立ファイルとして保存されていません。最終ログだけで全試行成功と扱わないでください。説明・解消判断は初回 assessment 後に必要な場合のみ分離した作者記録から取得します。
- 元の失敗時 harness 全文は保存されず、索引の harness は最終版です。初回結果 JSON と最終版を同じ試験版として扱わないでください。
- ログ・スクリーンショット・installer / blockmap 等の原本はホスト内保管です。Git上の索引・集約JSONを読めても原本受領済みにはなりません。外部 reviewer からの取得可能性・保存期限は未保証です。
- 既存 evidence JSON の lockSHA256 は CRLF の Windows working-copy bytes を指します。Git blob は LF で別 hash です。今回の読取照合で正規化後同一を確認した対象は索引に記載します。
- branch-protection API は以前 integration **HTTP 403**。再試行・迂回はしておらず要件は未確認。owner の確認が必要です。
- **独立レビュー未実施、Human Gate 未充足、Draft 維持**。Ready、正式 approval、merge、Release、配布の権限をこの依頼で追加しません。

## Stage 2 — Fresh Assessment

Artifact と Contract から独立に判断し、必要な根拠を特定してください。
作者の総合判断やモデル間合意を根拠にしないでください。
取得した資料、未取得原本、確認できたコード SHA、current HEAD と資料差分を区別してください。
必要原本がない範囲は `Inconclusive` / `Missing context` / `Not run` とし、実装欠陥や成功を推定しないでください。

結果は「総評／良い点／修正必須／修正推奨／後回しでよい改善／リスク・注意点／次に実装担当へ渡す指示／記録すべき判断」で返してください。
重要 finding には Claim、Precondition、Minimal sequence、Observable failure、Verifier、Severity、Confidence、Missing context、Classification、Evidence status を付け、Confirmed defect と未解決仮説を分けてください。
回答は Controller へ返し、権限のある格納担当が PR から辿れる Markdown として保存します。

### 次の操作と STOP 条件

1. PR の状態・B/C/D/current HEAD と入口を fresh 取得し、固定リンクと対象ファイルを照合する。
2. 索引から取得可能な原本を選び、実際の size/SHA256 を照合してから受領済みと記録する。ホスト原本のアクセスがなければ Controller の既存正式経路へ照会する。ユーザーの手動再添付を既定経路にしない。
3. C→D の資料のみ差分を確認できれば、C の既存証拠を有効範囲で再利用する。資料追加だけを理由に full-suite、圧縮、installer build を繰り返さない。追加検証は具体的な仮説と不足根拠に限定する。
4. SHA/hash 不一致、対象の移動、原本未取得で結論に必要な根拠が欠ける場合は、その範囲の判定を保留する。Confirmed blocker があれば非必須探索を停止して修正事項を返す。
5. packaged 起動・update feed 接続・公開・credentials・権限変更が必要になる操作は停止し、個別 Human Gate に戻す。branch-protection の既存403を再試行・迂回しない。

Fresh Assessment 後、finding の解消・矛盾確認・intent確認が必要な場合のみ、Controller が既存の作者監査記録を Turn 2 として別途提示します。
この入口と PR 本文にその narrative は転載しません。新しい reviewer の起動・依頼送信はこの資料作成作業には含まれません。
