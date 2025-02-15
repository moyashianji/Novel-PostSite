const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');  // cookie-parser をインポート
const { client: redisClient, ensureRedisConnection } = require('./utils/redisClient');
const { getEsClient } = require('./utils/esClient');

//モデルのインポート
const User = require('./models/User');
const Post = require('./models/Post');
const Good = require('./models/Good');
const Series = require('./models/Series');
const Follow = require('./models/Follow'); // Followモデルのインポート

//ミドルウェアのインポート
const upload = require('./middlewares/upload');
const { morganMiddleware } = require('./middlewares/logger'); // 追加

// ルートのインポート
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const seriesRoutes = require('./routes/series');
const userRoutes = require('./routes/users');
const commentRoutes = require('./routes/comments');
const followRoutes = require('./routes/follow');
const bookshelfRoutes = require('./routes/bookshelf');
const tagRoutes = require('./routes/tags');
const viewanalytics = require('./routes/analytics');
const contestRoutes = require('./routes/contests');
const uploadRoutes = require('./routes/uploadRoutes');


const app = express();
app.disable("x-powered-by");

// セキュリティ強化: Helmetによるセキュリティヘッダーの設定
// Helmetの設定をカスタマイズ
app.use(helmet({
  contentSecurityPolicy: true,  // CSP (Content Security Policy)を無効化
  crossOriginEmbedderPolicy: true,  // Cross-Origin Embedder Policy (COEP) を無効化
  crossOriginOpenerPolicy: true,    // Cross-Origin Opener Policy (COOP) を無効化
  crossOriginResourcePolicy: false,  // Cross-Origin Resource Policy (CORP) を無効化
  hsts: true,  // HTTP Strict Transport Security (HSTS)を無効化
  noSniff: true,  // X-Content-Type-Optionsヘッダーを無効化
  xssFilter: true,  // X-XSS-Protectionヘッダーを無効化
}));

// セッション設定 (これをルートより前に設定)
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb://host.docker.internal:27017/novel-site',
    ttl: 24 * 60 * 60,  // セッションの有効期限（24時間）
  }),
  cookie: {
    secure: false,  // HTTPで動作している場合はfalseにする
    maxAge: 24 * 60 * 60 * 1000,  // 24時間
    httpOnly: true,  // クライアント側のJavaScriptからはアクセス不可にする
    sameSite: 'lax'  // 'strict'を'lax'に変更してみる
  }
}));
// cookie-parser をミドルウェアとして追加
app.use(cookieParser());

app.use(express.json());

// CORS設定を適用
app.use(cors({
  origin: ['http://localhost:3000'],  // 複数オリジンの許可
  methods: ['GET', 'POST', 'PUT', 'DELETE','OPTIONS'],
  credentials: true
}));
// Morgan + Winstonミドルウェアを使用
app.use(morganMiddleware); // 追加

// 静的ファイルにCORSヘッダーを追加
app.use('/uploads', cors({
  origin: ['http://localhost:3000'],  // 複数オリジンの許可
  credentials: true
}), express.static(path.join(__dirname, 'uploads')));

//ユーザーのアイコンフォルダ生成
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const esClient = getEsClient();
console.log('🔍 Elasticsearch Client initialized in server.js');

async function checkElasticsearchConnection() {
  try {
    console.log('🔍 Elasticsearch 接続確認中...');
    
    // 接続確認
    const ping = await esClient.ping();
    if (ping) {
      console.log('✅ Elasticsearch is connected!');
    }

    // クラスタ情報を取得
    const info = await esClient.info();
    console.log(`📝 Elasticsearch クラスタ情報:
  - クラスタ名: ${info.cluster_name}
  - バージョン: ${info.version.number}
  - ノード名: ${info.name}
  - ステータス: ${info.tagline}`);

  } catch (error) {
    console.error('❌ Elasticsearch cluster is down!', error);
  }
}

// アプリ起動時に接続チェック
checkElasticsearchConnection();
// MongoDB に接続（既存）
mongoose.connect('mongodb://host.docker.internal:27017/novel-site', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('MongoDB connected');

  // 初回のみ Elasticsearch にデータを送る
 // await migrateDataToElasticsearch();
})
.catch(err => console.error('MongoDB connection error:', err));


//async function migrateDataToElasticsearch() {
//  try {
//    console.log('🔍 Elasticsearch へデータを送信中...');
//
//    // まだ Elasticsearch に送信していないデータを取得
//    const posts = await Post.find({});
//
//    console.log('📝 MongoDB から取得したデータ:', JSON.stringify(posts, null, 2));
//
//    if (!posts || posts.length === 0) {
//      console.log('✅ すでにすべてのデータが Elasticsearch に送信済みです。');
//      return;
//    }
//
//    posts.forEach((post) => {
//      if (!post.title || !post.content) {
//        console.warn(`⚠ スキップ: 投稿 ${post._id} は title または content が不足しています。`);
//      }
//    });
//
//    // Elasticsearch にデータを一括登録 (Bulk API)
//    const body = posts.flatMap((post) => {
//      if (!post.title || !post.content) {
//        return []; // スキップ
//      }
//      return [
//        { index: { _index: 'posts', _id: post._id.toString() } },
//        { title: post.title, content: post.content, author: post.author, createdAt: post.createdAt }
//      ];
//    });
//
//    if (body.length === 0) {
//      console.log('✅ 送信するデータがありません。スキップします。');
//      return;
//    }
//
//    console.log('📤 送信データ:', JSON.stringify(body, null, 2));
//
//    const bulkResponse = await esClient.bulk({ refresh: true, body });
//
//    if (!bulkResponse || !bulkResponse.body) {
//      console.error('❌ Elasticsearch へのデータ送信失敗: `bulkResponse` が不正');
//      return;
//    }
//
//    // エラーのあるデータをチェック
//    const failedItems = bulkResponse.body.items.filter(item => item.index && item.index.error);
//    if (failedItems.length > 0) {
//      console.error('❌ Elasticsearch への一部データ送信に失敗:', JSON.stringify(failedItems, null, 2));
//    }
//
//    // 成功したデータの `_id` を取得
//    const successIds = bulkResponse.body.items
//      .filter(item => item.index && !item.index.error)
//      .map(item => item.index._id);
//
//    if (successIds.length > 0) {
//      console.log(`✅ ${successIds.length} 件のデータを Elasticsearch に送信しました。`);
//      console.log('✅ `.env` の `MIGRATED` を `true` に更新してください。');
//    }
//
//  } catch (error) {
//    console.error('❌ Elasticsearch へのデータ移行エラー:', error);
//  }
//}

// セッションストアのログを確認
MongoStore.create({
  mongoUrl: 'mongodb://host.docker.internal:27017/novel-site',
  ttl: 24 * 60 * 60,
  autoRemove: 'native'
}).on('error', function(error) {
  console.error('Session store error:', error);
});



// ルートのマウント
app.use('/api', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/series', seriesRoutes);
app.use('/api/users', userRoutes);
app.use('/api', commentRoutes);
app.use('/api', followRoutes);
app.use('/api', bookshelfRoutes);
app.use('/api', tagRoutes);
app.use('/api', viewanalytics);
app.use('/api/contests', contestRoutes);
app.use('/api/upload', uploadRoutes); // アップロード API

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(5000, () => {
  console.log(`Server is running on port 5000`);
});

// Elasticsearchクライアントをエクスポート
console.log('🔍 Elasticsearch Client Initialized:', esClient); // 追加

module.exports = { esClient };
