# VideoPress Lite Desktop

VideoPress Lite Desktop は、動画ファイルをローカルPC上で圧縮するWindows向けデスクトップアプリです。

Web版では ffmpeg.wasm の制約により、大きな動画や一部環境で圧縮に失敗することがありました。Desktop版ではネイティブFFmpegを同梱し、動画を外部サーバーへ送信せず、ローカルPC内で安定して処理します。

## 主な機能

- 動画をローカルPC上で圧縮
- FFmpeg / ffprobe 同梱
- 動画を外部サーバーへ送信しないローカル処理
- mp4 / mov / m4v / avi / mkv / webm 対応
- 動画情報の自動取得
  - ファイル名
  - 容量
  - 再生時間
  - 解像度
  - コーデック
  - ビットレート
  - フレームレート
- NVIDIA NVENC GPU高速圧縮対応
- RTX 4090 自動検出
- 圧縮後動画のアプリ内プレビュー
- 複数動画の一括圧縮
- 圧縮進捗表示
- 圧縮結果の容量・削減率表示
- 保存先フォルダを開く機能

## 圧縮モード

### 通常プリセット

- 軽量モード
  - 720幅
  - CRF 32
  - veryfast
  - audio 64k

- 標準モード
  - 1280幅
  - CRF 28
  - veryfast
  - audio 96k

- 高画質モード
  - 1920幅
  - CRF 23
  - fast
  - audio 128k

### 目標容量モード

- Outlook添付 20MB
- Teams共有 100MB
- 現場共有 300MB
- カスタム容量指定

目標容量モードでは、動画時間から必要なビットレートを自動計算し、目標容量に近づくように圧縮します。

実際の出力容量は動画内容により多少前後します。

## GPU高速圧縮

起動時にFFmpegのエンコーダを確認し、以下のNVENCに対応します。

- H.264 NVENC
- H.265 NVENC
- AV1 NVENC

NVIDIA GPUが検出された場合、GPU圧縮を選択できます。

RTX 4090環境では、H.264 NVENCを初期選択します。

## 一括圧縮

複数の動画ファイルをまとめて投入できます。

- 複数動画のドラッグ＆ドロップ
- 複数ファイル選択
- ファイル一覧表示
- Queue方式で1件ずつ順番に圧縮
- 現在ファイル進捗
- 全体進捗
- 途中停止
- 失敗ファイル一覧
- 総削減容量
- 総削減率

## 対応動画形式

入力：

- mp4
- mov
- m4v
- avi
- mkv
- webm

出力：

- mp4

## インストール方法

GitHub Releases から以下をダウンロードしてください。

```text
VideoPress Lite Desktop Setup.exe
```

ダウンロード後、インストーラーを実行してください。

FFmpeg / ffprobe は同梱されているため、別途インストールは不要です。

## 開発者向けセットアップ

```bash
npm install
```

PowerShellで npm が実行できない場合：

```bash
npm.cmd install
```

## 開発起動

```bash
npm start
```

PowerShellで npm が実行できない場合：

```bash
npm.cmd start
```

## ビルド

```bash
npm.cmd run dist
```

生成物：

```text
dist/
  VideoPress Lite Desktop Setup.exe
  latest.yml
  VideoPress Lite Desktop Setup.exe.blockmap
  win-unpacked/
```

## リリース手順

1. package.json の version を更新
2. npm.cmd run dist を実行
3. GitHub Releasesで新規Releaseを作成
4. tagを指定
5. 以下を添付
   - VideoPress Lite Desktop Setup.exe
   - latest.yml
   - VideoPress Lite Desktop Setup.exe.blockmap
6. Publish release

## 注意事項

Windows向け初回リリースでは、SmartScreen警告が表示される場合があります。

社内利用の場合は、必要に応じてコード署名や配布ルールを検討してください。

## 今後の改善予定

- 自動アップデート
- 最近使った設定の保存
- 最近使ったフォルダの保存
- 圧縮設定プリセットのカスタム保存
- 動画から静止画抽出
- PowerPoint報告書生成
- 360動画メタデータ維持
