const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('./models/User');
const Post = require('./models/Post');
const Good = require('./models/Good');
const Follow = require('./models/Follow'); // Followモデルのインポート

const NodeCache = require('node-cache');
const tagCache = new NodeCache({ stdTTL: 3600 }); // キャッシュの有効期間を1時間に設定

const authenticateToken = require('./middlewares/authenticateToken');
const upload = require('./middlewares/upload');

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',  // フロントエンドが動作しているオリジンを指定
  optionsSuccessStatus: 200
}));app.use(express.json());
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

// ファイル保存先とファイル名の設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // アップロード先のディレクトリ
  },
  filename: (req, file, cb) => {
    // ユーザーIDを使ってファイル名を固定
    const uniqueSuffix = `${req.params.id}${path.extname(file.originalname)}`;
    cb(null, uniqueSuffix);
  },
});
const uploadPost = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MBまでの制限
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.gif') {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});
// server.js
const viewTracking = new Map(); // ユーザーごとに閲覧を追跡
// 全てのPostドキュメントにviewCounterフィールドが無い場合は0に初期化
// サーバー起動前にviewCounterの初期化を実行
(async () => {
  try {
    await Post.updateMany(
      { viewCounter: { $exists: false } },
      { $set: { viewCounter: 0 } }
    );
    console.log('All missing viewCounter fields initialized to 0');
  } catch (error) {
    console.error('Error initializing viewCounter:', error);
  }
})();
// 本棚追加エンドポイント
// 本棚追加/削除エンドポイント
// server.js
// 本棚トグルのエンドポイント
// server.js

// 本棚トグルのエンドポイント
// 本棚に追加するエンドポイント
// 本棚に追加するエンドポイント
// 本棚登録・解除のエンドポイント
app.post('/api/posts/:id/bookshelf', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: '投稿が見つかりません。' });
    }

    const existingBookshelf = await User.findOne({ _id: req.user._id, bookShelf: post._id });
    let updatedBookshelfCounter;

    if (existingBookshelf) {
      // 本棚から削除
      await User.findByIdAndUpdate(req.user._id, { $pull: { bookShelf: post._id } });
      updatedBookshelfCounter = post.bookShelfCounter > 0 ? post.bookShelfCounter - 1 : 0;
      await Post.findByIdAndUpdate(req.params.id, { bookShelfCounter: updatedBookshelfCounter });
    } else {
      // 本棚に追加
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { bookShelf: post._id } });
      updatedBookshelfCounter = post.bookShelfCounter + 1;
      await Post.findByIdAndUpdate(req.params.id, { bookShelfCounter: updatedBookshelfCounter });
    }

    res.json({ bookshelfCounter: updatedBookshelfCounter, isInBookshelf: !existingBookshelf });
  } catch (error) {
    console.error('Error toggling bookshelf:', error);
    res.status(500).json({ message: '本棚登録のトグルに失敗しました。', error });
  }
});

// 本棚登録状態の確認エンドポイント
app.get('/api/posts/:id/isInBookshelf', authenticateToken, async (req, res) => {
  try {
    const existingBookshelf = await User.findOne({ _id: req.user._id, bookShelf: req.params.id });
    res.json({ isInBookshelf: !!existingBookshelf });
  } catch (error) {
    console.error('Error checking bookshelf status:', error);
    res.status(500).json({ message: '本棚登録状態の確認に失敗しました。', error });
  }
});

// Bookmarkを保存または更新するためのエンドポイント
app.post('/api/users/bookmark', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id; // 認証されたユーザーのID
    const { novelId, position } = req.body;

    // ユーザーを取得
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりませんでした。' });
    }

    // 既存のしおりを検索
    const existingBookmark = user.bookmarks.find(bookmark => bookmark.novelId.toString() === novelId);

    if (existingBookmark) {
      // 既存のしおりを更新
      existingBookmark.position = position;
      existingBookmark.date = new Date();
    } else {
      // 新しいしおりを追加
      user.bookmarks.push({
        novelId,
        position,
        date: new Date(),
      });
    }

    // ユーザーを保存
    await user.save();

    res.status(200).json({ message: 'しおりが保存されました。' });
  } catch (error) {
    console.error('しおりの保存中にエラーが発生しました:', error);
    res.status(500).json({ message: 'しおりの保存に失敗しました。' });
  }
});
// フォロー機能の追加
// server.js 例

// ユーザーをフォローするエンドポイント
app.post('/api/users/follow/:id', authenticateToken, async (req, res) => {
  try {
    const followerId = req.user._id;
    const followeeId = req.params.id;

    if (followerId.toString() === followeeId) {
      return res.status(400).json({ message: "自分自身をフォローすることはできません。" });
    }

    const followee = await User.findById(followeeId);
    const follower = await User.findById(followerId);

    if (!followee || !follower) {
      return res.status(404).json({ message: "ユーザーが見つかりません。" });
    }

    // フォロワーがすでにフォローしていない場合のみ追加
    if (!followee.followers.includes(followerId)) {
      followee.followers.push(followerId);
      await followee.save();
    }

    // フォローしているユーザーリストに追加
    if (!follower.following.includes(followeeId)) {
      follower.following.push(followeeId);
      await follower.save();
    }

    res.status(200).json({ message: "フォローしました。" });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ message: "フォローに失敗しました。" });
  }
});

// ユーザーのフォローを解除するエンドポイント
app.delete('/api/users/unfollow/:id', authenticateToken, async (req, res) => {
  try {
    const followerId = req.user._id;
    const followeeId = req.params.id;

    const followee = await User.findById(followeeId);
    const follower = await User.findById(followerId);

    if (!followee || !follower) {
      return res.status(404).json({ message: "ユーザーが見つかりません。" });
    }

    // フォロワーリストから削除
    followee.followers = followee.followers.filter(
      (id) => id.toString() !== followerId.toString()
    );
    await followee.save();

    // フォローリストから削除
    follower.following = follower.following.filter(
      (id) => id.toString() !== followeeId.toString()
    );
    await follower.save();

    res.status(200).json({ message: "フォローを解除しました。" });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ message: "フォロー解除に失敗しました。" });
  }
});

// フォローステータスを確認するエンドポイント
app.get('/api/users/:id/is-following', authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.id;

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({ message: 'ユーザーが見つかりません。' });
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    res.status(200).json({ isFollowing });
  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({ message: 'フォローステータスの取得に失敗しました。' });
  }
});





// ユーザーのフォロワー数を取得
// ユーザー情報の取得
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password'); // パスワードを除外して取得
    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません。' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'ユーザー情報の取得に失敗しました。' });
  }
});
// 人気タグの集計とキャッシュ
app.get('/api/tags/popular', async (req, res) => {
  try {
    // キャッシュから取得
    let tags = tagCache.get('popularTags');
    if (!tags) {
      // キャッシュにない場合はデータベースから集計
      const result = await Post.aggregate([
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ]);

      tags = result.map(tag => tag._id);
      tagCache.set('popularTags', tags); // 結果をキャッシュに保存
    }

    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: '人気タグの取得に失敗しました。' });
  }
});

// 作品の検索エンドポイント
// server.js に追加
app.get('/api/posts/search', async (req, res) => {
  try {
    const searchTerm = req.query.query;
    const posts = await Post.find({
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { tags: { $regex: searchTerm, $options: 'i' } }
      ]
    }).populate('author', 'nickname icon'); // author を populate する

    res.json(posts);
  } catch (error) {
    console.error('検索エンドポイントでのエラー:', error);
    res.status(500).json({ message: '検索結果の取得に失敗しました。' });
  }
});


// ランキングエンドポイントの定義
app.get('/api/posts/ranking', async (req, res) => {
  try {
    // 全てのPostドキュメントにviewCounterフィールドが無い場合は0に初期化
    await Post.updateMany(
      { viewCounter: { $exists: false } },
      { $set: { viewCounter: 0 } }
    );

    // viewCounterが高い順に30件のポストを取得
    const posts = await Post.find().sort({ viewCounter: -1 }).limit(30);
    res.json(posts);
  } catch (error) {
    console.error('Error fetching ranking:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.post('/api/posts/:id/view', async (req, res) => {
  const postId = req.params.id;
  const userId = req.user ? req.user._id.toString() : req.ip; // ログインユーザーかIPアドレスで区別

  const key = `${postId}:${userId}`;
  const lastViewed = viewTracking.get(key);

  const now = new Date();

  // 最後に閲覧してから5分未満の場合は何もしない
  if (lastViewed && (now - lastViewed) < 5 * 60 * 1000) {
    return res.status(200).json({ message: '閲覧数は更新されませんでした。' });
  }

  // 5分以上経過していれば閲覧数を増やす
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: '投稿が見つかりません。' });
    }

    post.viewCounter += 1;
    await post.save();
    viewTracking.set(key, now); // 閲覧時間を更新

    res.status(200).json({ viewCounter: post.viewCounter });
  } catch (error) {
    console.error('Error updating view counter:', error);
    res.status(500).json({ message: '閲覧数の更新に失敗しました。', error });
  }
});
// server.js

// コメント投稿のエンドポイント
app.post('/api/posts/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'コメントを入力してください。' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: '投稿が見つかりません。' });
    }

    const newComment = {
      text,
      author: req.user._id, // コメントの作成者を保存
      createdAt: new Date()
    };

    // `comments`フィールドに新しいコメントを追加
    post.comments.push(newComment);

    // 他のフィールドを影響させないように、直接`post.comments`を更新
    await post.save({ validateBeforeSave: false });

    // 新しく追加されたコメントをポピュレートして返す
    const populatedPost = await Post.findById(req.params.id)
      .populate('comments.author', 'nickname icon');

    res.status(201).json(populatedPost.comments.slice(-5)); // 最新の5件を返す
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'コメントの追加に失敗しました。', error });
  }
});


app.get('/api/posts/:id/comments', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('comments.author', 'nickname icon'); // `author`フィールドをポピュレート

    if (!post) {
      return res.status(404).json({ message: '投稿が見つかりません。' });
    }

    res.json(post.comments.reverse()); // 最新のコメントが上に来るように逆順にして返す
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'コメントの取得に失敗しました。', error });
  }
});


// server.js
// server.js
app.post('/api/posts/:id/good', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: '投稿が見つかりません。' });
    }

    // 既にいいねしているかどうかを確認
    const existingGood = await Good.findOne({ user: req.user._id, post: post._id });
    let updatedGoodCounter;

    if (existingGood) {
      // いいね解除
      await Good.deleteOne({ user: req.user._id, post: post._id });
      updatedGoodCounter = post.goodCounter - 1;
      await Post.findByIdAndUpdate(req.params.id, { goodCounter: updatedGoodCounter });
    } else {
      // いいね追加
      const newGood = new Good({ user: req.user._id, post: post._id });
      await newGood.save();
      updatedGoodCounter = post.goodCounter + 1;
      await Post.findByIdAndUpdate(req.params.id, { goodCounter: updatedGoodCounter });
    }

    res.json({ goodCounter: updatedGoodCounter, hasLiked: !existingGood });
  } catch (error) {
    console.error('Error toggling good:', error);
    res.status(500).json({ message: 'いいねのトグルに失敗しました。', error });
  }
});

// server.js
app.get('/api/posts/:id/isLiked', authenticateToken, async (req, res) => {
  try {
    const existingGood = await Good.findOne({ user: req.user._id, post: req.params.id });
    res.json({ hasLiked: !!existingGood });
  } catch (error) {
    console.error('Error checking like status:', error);
    res.status(500).json({ message: 'いいね状態の確認に失敗しました。', error });
  }
});

// 投稿の一覧を取得
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().populate('author').exec();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: '投稿の取得に失敗しました。' });
  }
});

// 特定の投稿を取得
app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author').exec();
    if (!post) {
      return res.status(404).json({ message: '投稿が見つかりません。' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: '投稿の取得に失敗しました。' });
  }
});




// ユーザー情報を取得するエンドポイント
app.get('/api/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりませんでした。' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'ユーザー情報の取得に失敗しました。' });
  }
});

// ユーザーの作品を取得するエンドポイント
app.get('/api/users/:userId/works', async (req, res) => {
  try {
    const works = await Post.find({ author: req.params.userId });
    if (!works) {
      return res.status(404).json({ message: '作品が見つかりませんでした。' });
    }
    res.json(works);
  } catch (error) {
    console.error('Error fetching user works:', error);
    res.status(500).json({ message: '作品の取得に失敗しました。' });
  }
});
// 新規投稿エンドポイント
app.post('/api/posts', authenticateToken, async (req, res) => {
  const { title, content, description, tags, aiGenerated, charCount, author } = req.body;

  // バリデーション
  if (!title || !content || !description || !tags || tags.length === 0 || aiGenerated === null) {
    return res.status(400).json({ message: 'すべてのフィールドに入力してください。' });
  }

  try {
    // 新しい投稿の作成
    const newPost = new Post({
      title,
      content,
      description,
      tags,
      isAI: aiGenerated,      // フィールド名を isAI に変更
      wordCount: charCount,    // フィールド名を wordCount に変更
      author,
    });

    // データベースに保存
    const savedPost = await newPost.save();

    // 成功レスポンスを返す
    res.status(201).json(savedPost);
  } catch (error) {
    console.error('Error saving post:', error);
    res.status(500).json({ message: '投稿に失敗しました。', error: error.message });
  }
});



// ユーザー登録エンドポイント
app.post('/api/register', upload.single('icon'), async (req, res) => {
  const { email, password, nickname, dob, gender } = req.body;
  const iconPath = req.file ? `/uploads/${req.file.filename}` : '';

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, nickname, icon: iconPath, dob, gender });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, 'secret_key', { expiresIn: '1h' });
    res.status(201).json({ message: 'User registered successfully', token });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ message: 'Error registering user', error: err });
  }
});
// メールアドレス重複チェックエンドポイント
app.post('/api/check-email', async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    res.json({ exists: !!existingUser });
  } catch (err) {
    console.error('Error checking email:', err);
    res.status(500).json({ message: 'Error checking email', error: err });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('Login attempt with email:', email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log('No user found with this email');
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    console.log('User found:', user);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('Password does not match');
      console.log(password);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, 'secret_key', { expiresIn: '1h' });
    console.log('Login successful, token generated');
    res.json({ token });
  } catch (err) {
    console.error('Error logging in user:', err);
    res.status(500).json({ message: 'Error logging in user', error: err });
  }
});
// ミドルウェアを使用するルートの例
app.get('/api/user/me', authenticateToken, (req, res) => {
  res.json(req.user); // 認証されたユーザー情報を返す
});
app.post('/api/user/:id/update', authenticateToken, upload.single('icon'), async (req, res) => {
  try {
    const { id } = req.params;
    // 既存ユーザー情報を取得
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 更新データの準備
    const updateData = {
      nickname: req.body.nickname,
      description: req.body.description || "",  // デフォルト値を設定
      xLink: req.body.xLink || "",              // デフォルト値を設定
      pixivLink: req.body.pixivLink || "",      // デフォルト値を設定
      otherLink: req.body.otherLink || "",      // デフォルト値を設定
    };

    // アイコンがアップロードされた場合は、iconフィールドを追加
    if (req.file) {
      // 古いアイコンを削除
      if (user.icon && user.icon !== `/uploads/default.png`) { // デフォルト画像は削除しない
        const oldIconPath = path.join(__dirname, user.icon);
        fs.unlink(oldIconPath, (err) => {
          if (err) {
            console.error('Failed to delete old icon:', err);
          }
        });
      }

      // 新しいアイコンパスを更新データに追加
      updateData.icon = `/uploads/${req.file.filename}`;
    }
    // ユーザー情報の更新
    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true, upsert: true });

    res.json(updatedUser); // 更新されたユーザー情報を返す
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile', error: err });
  }
});


app.listen(5000, () => {
  console.log(`Server is running on port 5000`);
});
