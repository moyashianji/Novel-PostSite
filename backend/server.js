const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

//モデルのインポート
const User = require('./models/User');
const Post = require('./models/Post');
const Good = require('./models/Good');
const Series = require('./models/Series');
const Follow = require('./models/Follow'); // Followモデルのインポート

const NodeCache = require('node-cache');
const tagCache = new NodeCache({ stdTTL: 3600 }); // キャッシュの有効期間を1時間に設定

//ミドルウェアのインポート
const upload = require('./middlewares/upload');

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

app.use(cors({
  origin: 'http://localhost:3000',  // フロントエンドが動作しているオリジンを指定
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

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

// ルートのマウント
app.use('/api', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/series', seriesRoutes);
app.use('/api/users', userRoutes);
app.use('/api', commentRoutes);
app.use('/api', followRoutes);
app.use('/api', bookshelfRoutes);
app.use('/api', tagRoutes);

app.listen(5000, () => {
  console.log(`Server is running on port 5000`);
});
