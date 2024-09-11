# LINEJS NEZUBOT

このコードは、[@evex/linejs](https://github.com/evex-dev/linejs) ライブラリを使用してLINE Self Botを実装したものです。
このBOTはコマンドに応答し、login中に関係なく動的にコマンドを追加・変更することができます。

[English](README-EN.md)

## 機能

- LINE Botの基本機能(メッセージの送受信、認証など)
- ライブラリの自動更新チェックと更新(オプション)
- 必要なパッケージの自動インストール(オプション)
- スクエアメッセージのサポート
- 動的なコマンドの読み込み
- プログラムを停止せずにコマンドの追加・変更


## 要件

- Node.js (12以上推奨)
- npm (Node.jsに付属)

## セットアップ

1. リポジトリをクローンします：
   ```
   git clone https://github.com/nezumi0627/linejs-nezubot.git
   cd linejs-nezubot
   ```

2. 依存関係をインストールします：
   ```
   npm install
   ```

3. `.env`ファイルを作成し、必要な環境変数を設定します：
   ```
   LINE_EMAIL=your_line_email@example.com # LINEのメールアドレス
   LINE_PASSWORD=your_line_password # LINEのパスワード
   LINE_DEVICE=your_device_name # ログインするデバイス名(IOSIPADを推奨)
   OWNER_MID=your_line_mid # オーナーのmid
   AUTO_INSTALL=true # 必要なパッケージを自動的にインストールするかどうか
   AUTO_UPDATE_LINEJS=true # @evex/linejsライブラリを自動的に最新版に更新するかどうか
   ```

4. コンソールに表示される指示に従って、必要に応じてPINコードを入力します。

5. ボットが正常に起動すると、コンソールにログインメッセージが表示されます。

## Example コマンド

- `!ping`: ボットが "pong!" と応答します。

## 設定オプション

- `AUTO_INSTALL`: trueに設定すると、必要なパッケージを自動的にインストールします。
- `AUTO_UPDATE_LINEJS`: trueに設定すると、@evex/linejsライブラリを自動的に最新版に更新します。

## エラー処理

ABUSE_BLOCKエラーが検出された場合、プログラムを停止するかどうかをユーザーに確認します。

## コマンドの追加・変更

`commands.js`ファイルを編集することで、ボットを再起動せずにlogin中でもコマンドを追加・変更できます。
新しいコマンドを追加するには、以下のような形式で`registerCommand`関数を使用します：

```
registerCommand('!command_name', async (message, client) => {
    // コマンドの処理を記述
    await sendMessageWithAntiSpamMeasures(message, "コマンドの応答");
});
```
## ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 注意事項

このプロジェクトは教育目的で作成されています。LINEの利用規約に違反しないよう、適切に使用してください。

## ライブラリ

- [@evex/linejs](https://github.com/evex-dev/linejs)