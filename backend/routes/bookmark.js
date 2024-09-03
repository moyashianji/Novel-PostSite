// routes/bookmark.js

const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const User = require('../models/User');

const router = express.Router();

// Bookmarkを保存または更新するためのエンドポイント
router.post('/users/bookmark', authenticateToken, async (req, res) => {
    try {
        const userId = req.user._id; // 認証されたユーザーのID
        const { novelId, position } = req.body;
    
        // ユーザーを取得
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ message: 'ユーザーが見つかりませんでした。' });
        }
    
        // 既存のしおりを検索s
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
