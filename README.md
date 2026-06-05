# VideoPress Lite Desktop

VideoPress Lite Desktop は、動画ファイルをローカルPC上で安定して圧縮するWindows向けデスクトップアプリです。

Web版の `ffmpeg.wasm` はブラウザのメモリ制限やWASM実行環境の影響を受け、軽量な動画でも失敗するケースがあります。Desktop版ではElectronからネイティブFFmpeg / ffprobeを呼び出し、動画を外部サーバーへ送信せずにPC内で処理します。

## 主な機能

- ドラッグ＆ドロップによる動画投入
- ファイル選択ボタンによる動画投入
- ffprobeによる動画情報取得
- ファイル名、容量、再生時間、解像度、コーデック、ビットレート、フレームレート表示
- 軽量モード、標準モード、高画質モード、カスタム設定
- 容量予測
- FFmpegログからの進捗表示
- 経過時間、進捗率、処理速度表示
- 圧縮結果表示
- 保存先フォルダを開く

## 対応動画形式

- mp4
- mov
- m4v
- avi
- mkv
- webm

出力形式はMVP段階ではMP4です。

## ローカル処理

動画は外部サーバーへ送信しません。読み込み、解析、圧縮、出力はすべてローカルPC上で実行されます。

## FFmpeg同梱

標準構成では、Windows用の `ffmpeg.exe` / `ffprobe.exe` を同梱します。

```text
resources/
  ffmpeg/
    win/
      ffmpeg.exe
      ffprobe.exe
```

アプリ起動時は `resources/ffmpeg/win/` を最優先で参照します。PATH上の `ffmpeg` / `ffprobe` はフォールバック扱いです。

利用者がFFmpegを別途インストールする必要はありません。

起動時に以下相当の確認を行います。

```bash
resources/ffmpeg/win/ffmpeg.exe -version
resources/ffmpeg/win/ffprobe.exe -version
```

同梱ファイルが見つからない場合のみ、PATH上のFFmpegへフォールバックします。

## セットアップ方法

```bash
npm install
```

PowerShellの実行ポリシーで `npm` が止まる場合は、Windows環境では以下を使用してください。

```bash
npm.cmd install
```

## 起動方法

```bash
npm start
```

PowerShellで `npm` が止まる場合:

```bash
npm.cmd start
```

## 今後の改善予定

- NVIDIA NVENC対応
- H.265対応
- AV1対応
- 複数動画の一括圧縮
- Outlook添付用20MB以下モード
- Teams共有用100MB以下モード
- 360動画メタデータ維持
- 動画から静止画抽出
- 圧縮後の自動プレビュー
