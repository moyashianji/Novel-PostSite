const express = require('express');
const NodeCache = require('node-cache');
const Post = require('../models/Post');

const router = express.Router();
const tagCache = new NodeCache({ stdTTL: 3600 });

// 人気タグ取得
router.get('/popular', async (req, res) => {
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
