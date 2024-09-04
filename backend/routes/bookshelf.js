const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const Good = require('../models/Good');
const Series = require('../models/Series');
const Follow = require('../models/Follow'); // Followモデルのインポート
const authenticateToken = require('../middlewares/authenticateToken');
const router = express.Router();

// 本棚登録・解除のエンドポイント
router.post('/posts/:id([0-9a-fA-F]{24})/bookshelf', authenticateToken, async (req, res) => {
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

    res.json({ bookShelfCounter: updatedBookshelfCounter, isInBookshelf: !existingBookshelf });
  } catch (error) {
    console.error('Error toggling bookshelf:', error);
    res.status(500).json({ message: '本棚登録のトグルに失敗しました。', error });
  }
});

// 本棚登録状態の確認エンドポイント
router.get('/posts/:id([0-9a-fA-F]{24})/isInBookshelf', authenticateToken, async (req, res) => {
  try {
    const existingBookshelf = await User.findOne({ _id: req.user._id, bookShelf: req.params.id });
    res.json({ isInBookshelf: !!existingBookshelf });
  } catch (error) {
    console.error('Error checking bookshelf status:', error);
    res.status(500).json({ message: '本棚登録状態の確認に失敗しました。', error });
  }
});
// 自分の本棚リストを取得するエンドポイント
router.get('/me/bookshelf', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('bookShelf', 'title description author');

    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません。' });
    }

    res.status(200).json(user.bookShelf);
  } catch (error) {
    console.error('本棚リストの取得に失敗しました:', error);
    res.status(500).json({ message: '本棚リストの取得に失敗しました。' });
  }
});
// しおりリストを取得するエンドポイント
router.get('/me/bookmarks', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('bookmarks.novelId', 'title author');

    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません。' });
    }

    res.status(200).json(user.bookmarks);
  } catch (error) {
    console.error('しおりリストの取得に失敗しました:', error);
    res.status(500).json({ message: 'しおりリストの取得に失敗しました。' });
  }
});

// Bookmarkを保存または更新するためのエンドポイント
router.post('/me/bookmark', authenticateToken, async (req, res) => {
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

module.exports = router;
