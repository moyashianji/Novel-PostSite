const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const Good = require('../models/Good');
const Series = require('../models/Series');
const Follow = require('../models/Follow'); // Followモデルのインポート
const NodeCache = require('node-cache');
const authenticateToken = require('../middlewares/authenticateToken');

const router = express.Router();
const tagCache = new NodeCache({ stdTTL: 3600 }); // キャッシュの有効期間を1時間に設定


// 人気タグの集計とキャッシュ
router.get('/tags/popular', async (req, res) => {
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

module.exports = router;
