const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const Good = require('../models/Good');
const Series = require('../models/Series');
const Follow = require('../models/Follow'); // Followモデルのインポート
const authenticateToken = require('../middlewares/authenticateToken');
const router = express.Router();

// コメント投稿のエンドポイント
router.post('/posts/:id([0-9a-fA-F]{24})/comments', authenticateToken, async (req, res) => {
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


router.get('/posts/:id([0-9a-fA-F]{24})/comments', async (req, res) => {
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


module.exports = router;

