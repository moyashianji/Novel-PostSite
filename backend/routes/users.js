// routes/user.js

const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const User = require('../models/User');
const Post = require('../models/Post');
const Good = require('../models/Good');
const Series = require('../models/Series');
const Follow = require('../models/Follow'); // Followモデルのインポート

const upload = require('../middlewares/upload');

const router = express.Router();

// ユーザー情報を取得するエンドポイント
router.get('/:userId([0-9a-fA-F]{24})', async (req, res) => {
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
router.get('/:userId([0-9a-fA-F]{24})/works', async (req, res) => {
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

const path = require('path');
const fs = require('fs');

router.post('/:id([0-9a-fA-F]{24})/update', authenticateToken, upload.single('icon'), async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`User ID: ${id}`);

    // 既存ユーザー情報を取得
    const user = await User.findById(id);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', user);

    // 更新データの準備
    const updateData = {
      nickname: req.body.nickname,
      description: req.body.description || "",  // デフォルト値を設定
      xLink: req.body.xLink || "",              // デフォルト値を設定
      pixivLink: req.body.pixivLink || "",      // デフォルト値を設定
      otherLink: req.body.otherLink || "",      // デフォルト値を設定
    };

    console.log('Update data:', updateData);

    // アイコンがアップロードされた場合は、iconフィールドを追加
    if (req.file) {
      console.log('Icon file uploaded:', req.file);

      // 古いアイコンを削除
      if (user.icon && user.icon !== `/uploads/default.png`) { // デフォルト画像は削除しない
        const oldIconPath = path.join(__dirname, '..', 'uploads', path.basename(user.icon));  // 修正されたパス
        console.log('Old icon path:', oldIconPath);
        fs.unlink(oldIconPath, (err) => {
          if (err) {
            console.error('Failed to delete old icon:', err);
          } else {
            console.log('Old icon deleted successfully');
          }
        });
      }

      // 新しいアイコンパスを更新データに追加
      updateData.icon = `/uploads/${req.file.filename}`;
    }

    // ユーザー情報の更新
    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true, upsert: true });
    console.log('Updated user:', updatedUser);

    res.json(updatedUser); // 更新されたユーザー情報を返す
  } catch (err) {
    console.error('Error updating profile:', err); // エラーの詳細をログに出力
    res.status(500).json({ message: 'Error updating profile', error: err });
  }
});

// ユーザーの作品一覧を取得するエンドポイント
router.get('/me/works', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Userの作品リストを取得
    const works = await Post.find({ author: userId });

    if (!works) {
      return res.status(404).json({ message: '作品が見つかりませんでした。' });
    }

    res.status(200).json(works);
  } catch (error) {
    console.error('Error fetching user works:', error);
    res.status(500).json({ message: '作品の取得に失敗しました。' });
  }
});

// 特定のシリーズに含まれるすべての作品を取得するエンドポイント
// Series の posts を取得するエンドポイント
router.get('/me/series', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const series = await Series.find({ author: userId }).populate('posts.postId');
    const seriesData = series.map(s => {
      console.log(`Processing series: ${s._id}`);
    
      // posts の存在確認
      if (!s.posts || s.posts.length === 0) {
        console.warn(`No posts found for series: ${s._id}`);
        return { ...s, totalLikes: 0, totalBookshelf: 0, totalViews: 0 };
      }
    
      // posts の内容を出力
      s.posts.forEach((post, index) => {
        console.log(`Post ${index + 1}:`, post);
      });
    
      // 各シリーズの全投稿の合計を計算
      const totalLikes = (s.posts || []).reduce((acc, post) => {
        const likes = post.postId?.goodCounter || 0;
        console.log(`Adding ${likes} likes from post ${post.postId?._id || 'unknown'}`);
        return acc + likes;
      }, 0);
    
      const totalBookshelf = (s.posts || []).reduce((acc, post) => {
        const bookshelfCount = post.postId?.bookShelfCounter || 0;
        console.log(`Adding ${bookshelfCount} bookshelf count from post ${post.postId?._id || 'unknown'}`);
        return acc + bookshelfCount;
      }, 0);
    
      const totalViews = (s.posts || []).reduce((acc, post) => {
        const views = post.postId?.viewCounter || 0;
        console.log(`Adding ${views} views from post ${post.postId?._id || 'unknown'}`);
        return acc + views;
      }, 0);
    
      console.log(`Total likes for series ${s._id}: ${totalLikes}`);
      console.log(`Total bookshelf count for series ${s._id}: ${totalBookshelf}`);
      console.log(`Total views for series ${s._id}: ${totalViews}`);
      return {
        _id: s._id,
        title: s.title,
        description: s.description,
        totalLikes,
        totalBookshelf,
        totalViews,
        totalPoints: totalLikes * 2 + totalBookshelf * 2
      };
    });

    res.status(200).json(seriesData);
  } catch (error) {
    console.error('Error fetching user series:', error);
    res.status(500).json({ message: 'ユーザーのシリーズを取得できませんでした。', error });
  }
});

router.get('/me/novels', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // authenticateToken ミドルウェアで設定されたユーザーID
    const novels = await Post.find({ author: userId });

    res.status(200).json(novels);
  } catch (error) {
    console.error('Error fetching user novels:', error);
    res.status(500).json({ message: '小説の取得に失敗しました。' });
  }
});

// フォロワーリストを取得するエンドポイント
router.get('/followers', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('followers', 'nickname icon description');

    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません。' });
    }

    res.status(200).json(user.followers);
  } catch (error) {
    console.error('フォロワーリストの取得に失敗しました:', error);
    res.status(500).json({ message: 'フォロワーリストの取得に失敗しました。' });
  }
});
// フォローしているユーザーリストを取得するエンドポイント
router.get('/following', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('following', 'nickname icon description');

    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません。' });
    }

    res.status(200).json(user.following);
  } catch (error) {
    console.error('フォローリストの取得に失敗しました:', error);
    res.status(500).json({ message: 'フォローリストの取得に失敗しました。' });
  }
});

// ユーザーのシリーズ一覧を取得するエンドポイント
router.get('/:id([0-9a-fA-F]{24})/series', async (req, res) => {
  try {
    const userId = req.params.id;
    const series = await Series.find({ author: userId });

    if (!series) {
      return res.status(404).json({ message: 'シリーズが見つかりませんでした。' });
    }

    res.status(200).json(series);
  } catch (error) {
    console.error('Error fetching series:', error);
    res.status(500).json({ message: 'シリーズの取得に失敗しました。', error });
  }
});
// ユーザー情報の取得
router.get('/:id([0-9a-fA-F]{24})', async (req, res) => {
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

module.exports = router;
