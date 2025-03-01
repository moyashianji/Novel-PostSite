const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const { getEsClient } = require('./utils/esClient');
const { migrateSeriesToElasticsearch } = require('./utils/migrateSeriesToElasticsearch');

// モデルのインポート
const User = require('./models/User');
const Post = require('./models/Post');
const Series = require('./models/Series');

// ミドルウェアのインポート
const { morganMiddleware } = require('./middlewares/logger');

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
const searchRoutes = require('./routes/search');

const app = express();
app.disable("x-powered-by");

// ✅ セキュリティ設定（最適化）
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
  hsts: true,
  noSniff: true,
  xssFilter: true,
}));

// ✅ セッション設定
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb://host.docker.internal:27017/novel-site',
    ttl: 24 * 60 * 60, // 24時間
  }),
  cookie: {
    secure: false, 
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax'
  }
}));

app.use(cookieParser());
app.use(express.json());

// ✅ CORS 設定（最適化）
app.use(cors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// ✅ ロガーミドルウェア
app.use(morganMiddleware);

// ✅ 静的ファイルサーバー（画像など）
app.use('/uploads', cors({
  origin: ['http://localhost:3000'],
  credentials: true
}), express.static('uploads'));

// ✅ Elasticsearch クライアントの取得
const esClient = getEsClient();
console.log('🔍 Elasticsearch Client initialized');

// ✅ Elasticsearch の接続確認
async function checkElasticsearchConnection() {
  try {
    console.log('🔍 Elasticsearch 接続確認中...');
    await esClient.ping();
    console.log('✅ Elasticsearch is connected!');

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
checkElasticsearchConnection();

// ✅ MongoDB に接続
mongoose.connect('mongodb://host.docker.internal:27017/novel-site')
  .then(async () => {
    console.log('✅ MongoDB connected');
    //await migrateSeriesToElasticsearch();
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ セッションストアのエラーハンドリング
MongoStore.create({
  mongoUrl: 'mongodb://host.docker.internal:27017/novel-site',
  ttl: 24 * 60 * 60,
  autoRemove: 'native'
}).on('error', (error) => {
  console.error('❌ Session store error:', error);
});

// ✅ API ルートのマウント
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
app.use('/api/upload', uploadRoutes);
app.use('/api/search', searchRoutes);


// ✅ エラーハンドリング（統一）
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).send('Something broke!');
});

// ✅ サーバー起動
app.listen(5000, () => {
  console.log('🚀 Server is running on port 5000');
});
