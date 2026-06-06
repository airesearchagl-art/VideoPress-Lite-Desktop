# VideoPress Lite Desktop v1.0.0

VideoPress Lite Desktop は、動画ファイルをローカルPC上で圧縮するWindows向けデスクトップアプリです。

Web版では ffmpeg.wasm の制約により、大きな動画や一部環境で圧縮に失敗することがありました。Desktop版ではネイティブFFmpegを同梱し、動画を外部サーバーへ送信せず、ローカルPC内で安定して処理します。

## 主な機能

- FFmpeg / ffprobe 同梱
- ローカルPC内で動画圧縮
- 外部サーバーへ動画を送信しない
- NVIDIA NVENC GPU高速圧縮対応
- RTX 4090 自動検出
- Outlook添付 20MBモード
- Teams共有 100MBモード
- 現場共有 300MBモード
- カスタム容量指定
- 複数動画の一括圧縮
- 圧縮後動画のアプリ内プレビュー
- Windowsインストーラー対応

## 対応形式

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

以下のファイルをダウンロードして実行してください。

```text
VideoPress Lite Desktop Setup.exe
```

FFmpeg / ffprobe は同梱されています。

## 添付ファイル

- VideoPress Lite Desktop Setup.exe
- latest.yml
- VideoPress Lite Desktop Setup.exe.blockmap

## 注意事項

Windows向け初回リリースです。

SmartScreen警告が表示される場合があります。

社内配布する場合は、必要に応じてコード署名を検討してください。
