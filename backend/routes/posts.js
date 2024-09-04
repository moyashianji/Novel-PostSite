// routes/post.js

const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const User = require('../models/User');
const Post = require('../models/Post');
const Good = require('../models/Good');
const Series = require('../models/Series');
const Follow = require('../models/Follow'); // Followモデルのインポート
const multer = require('multer');
const path = require('path');

const router = express.Router();

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
// ランキングエンドポイントの定義
router.get('/ranking', async (req, res) => {
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
// 投稿の一覧を取得
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('author').exec();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: '投稿の取得に失敗しました。' });
  }
});

// 特定の投稿を取得
router.get('/:id([0-9a-fA-F]{24})', async (req, res) => {
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
// 新規投稿エンドポイント
router.post('/', authenticateToken, async (req, res) => {
  const { title, content, description, tags, original,adultContent,aiGenerated, charCount, author, series } = req.body;

  // バリデーション
  if (!title || !content || !description || !tags || tags.length === 0 || aiGenerated === null || original === null || adultContent === null) {
    return res.status(400).json({ message: 'すべてのフィールドに入力してください。' });
  }

  try {
    // 新しい投稿の作成
    const newPost = new Post({
      title,
      content,
      description,
      tags,
      isOriginal: original,
      isAdultContent: adultContent,
      isAI: aiGenerated,      // フィールド名を isAI に変更
      wordCount: charCount,    // フィールド名を wordCount に変更
      author,
      series, // シリーズIDを追加
    });

    // データベースに保存
    const savedPost = await newPost.save();

    // シリーズが指定されている場合、そのシリーズに投稿を追加
    if (series) {
      await Series.findByIdAndUpdate(series, { $push: { posts: savedPost._id } });
    }

    // 成功レスポンスを返す
    res.status(201).json(savedPost);
  } catch (error) {
    console.error('Error saving post:', error);
    res.status(500).json({ message: '投稿に失敗しました。', error: error.message });
  }
});
// 特定の投稿を更新するエンドポイント
router.post('/:id([0-9a-fA-F]{24})/update', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const { title, content, description, tags, original, adultContent, aiGenerated ,charCount} = req.body;

    // 投稿をデータベースから取得
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: '投稿が見つかりませんでした。' });
    }

    // 投稿の各フィールドを更新
    post.title = title || post.title;
    post.content = content || post.content;
    post.description = description || post.description;
    post.tags = tags || post.tags;
    post.isOriginal = original;
    post.isAdultContent = adultContent;
    post.isAI = aiGenerated;
    post.wordCount = charCount;
    // 更新内容を保存
    await post.save();

    res.status(200).json({ message: '投稿が更新されました。', post });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: '投稿の更新に失敗しました。' });
  }
});
// 特定の投稿の詳細を取得するエンドポイント
router.get('/:id([0-9a-fA-F]{24})/edit', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id; // 認証されたユーザーのIDを取得

    // 投稿を探し、かつその投稿のauthorが現在のユーザーであるかを確認
    const post = await Post.findOne({ _id: postId, author: userId });

    if (!post) {
      return res.status(404).json({ message: '投稿が見つかりませんでした。' });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error('Error fetching post details:', error);
    res.status(500).json({ message: '投稿の取得に失敗しました。', error });
  }
});
router.post('/:id([0-9a-fA-F]{24})/view', async (req, res) => {
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

// 作品の検索エンドポイント
// server.js に追加
router.get('/search', async (req, res) => {
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


// いいねした作品リストを取得するエンドポイント
router.get('/user/liked', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const likedPosts = await Good.find({ user: userId }).populate('post', 'title description author');

    res.status(200).json(likedPosts.map(good => good.post));
  } catch (error) {
    console.error('いいねした作品リストの取得に失敗しました:', error);
    res.status(500).json({ message: 'いいねした作品リストの取得に失敗しました。' });
  }
});

// server.js
router.post('/:id([0-9a-fA-F]{24})/good', authenticateToken, async (req, res) => {
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
router.get('/:id([0-9a-fA-F]{24})/isLiked', authenticateToken, async (req, res) => {
  try {
    const existingGood = await Good.findOne({ user: req.user._id, post: req.params.id });
    res.json({ hasLiked: !!existingGood });
  } catch (error) {
    console.error('Error checking like status:', error);
    res.status(500).json({ message: 'いいね状態の確認に失敗しました。', error });
  }
});

module.exports = router;

