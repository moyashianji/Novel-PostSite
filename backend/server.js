const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const crypto = require('crypto');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');  // cookie-parser をインポート

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

const app = express();

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
    mongoUrl: 'mongodb://localhost:27017/novel-site',
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
  origin: 'http://localhost:3000',  // フロントエンドのオリジンを許可
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true  // クレデンシャル（Cookieや認証情報）を許可
}));

// Morgan + Winstonミドルウェアを使用
app.use(morganMiddleware); // 追加

// 静的ファイルにCORSヘッダーを追加
app.use('/uploads', cors({
  origin: 'http://localhost:3000',  // 静的ファイル配信に対してもCORSを許可
  credentials: true
}), express.static(path.join(__dirname, 'uploads')));

//ユーザーのアイコンフォルダ生成
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

mongoose.connect('mongodb://localhost:27017/novel-site', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));
// セッションストアのログを確認
MongoStore.create({
  mongoUrl: 'mongodb://localhost:27017/novel-site',
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

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(5000, () => {
  console.log(`Server is running on port 5000`);
});