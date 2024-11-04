# ベースイメージとしてNode.jsの最新LTSバージョンを使用
FROM node:20.10.0

# コンテナ内で作業するディレクトリを設定
WORKDIR /usr/src/app

# パッケージファイルをコピーして依存関係をインストール
COPY package.json package-lock.json ./
RUN npm install

# ソースコードをすべてコピー
COPY . .


# コンテナが使用するポート
EXPOSE 5000

# アプリケーションを起動（開発時はnodemonで監視）
CMD [ "node", "server.js" ]
