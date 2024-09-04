// routes/series.js

const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const User = require('../models/User');
const Post = require('../models/Post');
const Good = require('../models/Good');
const Series = require('../models/Series');
const Follow = require('../models/Follow'); // Followモデルのインポート

const router = express.Router();

router.get('/:id([0-9a-fA-F]{24})/works', async (req, res) => {
  try {
    const seriesId = req.params.id;

    // シリーズを取得し、その中の投稿をpopulateして取得
    const series = await Series.findById(seriesId).populate('posts.postId');

    if (!series) {
      console.log('Series not found:', seriesId);
      return res.status(404).json({ message: 'シリーズが見つかりませんでした。' });
    }

    console.log('Series found:', series);

    // シリーズ内の投稿情報を取得して整理
    const works = series.posts
      .filter(post => {
        const hasPostId = !!post.postId;
        console.log(`Processing post: ${post._id}, hasPostId: ${hasPostId}`);
        return hasPostId;  // postIdが存在するか確認
      })
      .map(post => ({
        _id: post.postId._id,
        title: post.postId.title,
        description: post.postId.description,
        episodeNumber: post.episodeNumber,
      }));

    console.log('Works in series:', works);
    res.status(200).json(works);
  } catch (error) {
    console.error('Error fetching works in series:', error);
    res.status(500).json({ message: '作品一覧の取得に失敗しました。', error });
  }
});
// シリーズの詳細情報を取得するエンドポイント
router.get('/:id([0-9a-fA-F]{24})', authenticateToken, async (req, res) => {
  try {
    const seriesId = req.params.id;
    const userId = req.user._id; // 認証されたユーザーのIDを取得

    // 自分のシリーズのみアクセスを許可
    const series = await Series.findOne({ _id: seriesId, author: userId }).populate('posts.postId');

    if (!series) {
      return res.status(404).json({ message: 'シリーズが見つかりませんでした。' });
    }

    // 各投稿の詳細情報を抽出
    const populatedPosts = series.posts.map((post) => {
      if (post.postId) {
        return {
          _id: post.postId._id,
          title: post.postId.title,
          description: post.postId.description,
          goodCounter: post.postId.goodCounter,
          bookShelfCounter: post.postId.bookShelfCounter,
          viewCounter: post.postId.viewCounter,
          episodeNumber: post.episodeNumber,
        };
      }
      return null;
    }).filter(post => post !== null);

    // 必要に応じて他のフィールドも追加する
    res.status(200).json({
      _id: series._id,
      title: series.title,
      description: series.description,
      tags: series.tags,
      isOriginal: series.isOriginal,
      isAdultContent: series.isAdultContent,
      aiGenerated: series.aiGenerated,
      posts: populatedPosts,
    });
  } catch (error) {
    console.error('Error fetching series details:', error);
    res.status(500).json({ message: 'シリーズの詳細情報を取得できませんでした。', error });
  }
});
router.get('/:id([0-9a-fA-F]{24})/posts', async (req, res) => {
  try {
    const seriesId = req.params.id;
    const series = await Series.findById(seriesId).populate('posts.postId');

    if (!series) {
      return res.status(404).json({ message: 'シリーズが見つかりませんでした。' });
    }

    const postsWithEpisodes = series.posts
      .filter(post => post.postId)
      .map(post => ({
        _id: post.postId._id,
        title: post.postId.title,
        episodeNumber: post.episodeNumber,
      }));

    res.status(200).json(postsWithEpisodes);
  } catch (error) {
    console.error('Error fetching series posts:', error);
    res.status(500).json({ message: 'シリーズの投稿を取得できませんでした。', error });
  }
});
// シリーズに投稿を追加するエンドポイント

router.post('/:id([0-9a-fA-F]{24})/addPost', authenticateToken, async (req, res) => {
  try {
    const seriesId = req.params.id;
    const { postId } = req.body;

    if (!postId) {
      return res.status(400).json({ message: 'postIdが提供されていません。' });
    }

    // シリーズを検索
    const series = await Series.findById(seriesId);
    if (!series) {
      return res.status(404).json({ message: 'シリーズが見つかりませんでした。' });
    }

    // 既存の最大エピソード番号を取得
    const maxEpisodeNumber = series.posts.reduce(
      (max, post) => Math.max(max, post.episodeNumber || 0),
      0
    );

    // 新しいエピソード番号を決定
    const episodeNumber = maxEpisodeNumber + 1;

    // シリーズに作品が既に存在しない場合のみ追加
    if (!series.posts.some(post => post.postId?.toString() === postId.toString())) {
      series.posts.push({ postId: postId.toString(), episodeNumber }); // postIdとepisodeNumberを設定
      await series.save();
    }

    // Post モデルの series フィールドにシリーズIDを追加
    // Post モデルの series フィールドを更新
    const post = await Post.findById(postId);
    if (post) {
      post.series = seriesId;
      await post.save();
    } else {
      return res.status(404).json({ message: '作品が見つかりませんでした。' });
    }
    res.status(200).json({ message: '作品がシリーズに追加されました。' });
  } catch (error) {
    console.error('Error adding post to series:', error);
    res.status(500).json({ message: 'シリーズに作品を追加できませんでした。', error });
  }
});
// シリーズから特定の投稿を削除するエンドポイント
router.post('/:id([0-9a-fA-F]{24})/update', authenticateToken, async (req, res) => {
  try {
    const seriesId = req.params.id;
    const { title, description, tags, isOriginal, isAdultContent, aiGenerated } = req.body;

    const series = await Series.findById(seriesId);
    if (!series) {
      return res.status(404).json({ message: 'シリーズが見つかりませんでした。' });
    }

    // シリーズ情報を更新
    series.title = title;
    series.description = description;
    series.tags = tags;
    series.isOriginal = isOriginal;
    series.isAdultContent = isAdultContent;
    series.aiGenerated = aiGenerated;

    await series.save();

    res.status(200).json(series);
  } catch (error) {
    console.error('Error updating series information:', error);
    res.status(500).json({ message: 'シリーズ情報を更新できませんでした。', error });
  }
});
router.post('/:id([0-9a-fA-F]{24})/updatePosts', authenticateToken, async (req, res) => {
  try {
    const seriesId = req.params.id;
    const { posts } = req.body;

    console.log(`Received request to update series with ID: ${seriesId}`);
    console.log(`Received posts data: ${JSON.stringify(posts)}`);

    const series = await Series.findById(seriesId);
    if (!series) {
      console.log('Series not found');
      return res.status(404).json({ message: 'シリーズが見つかりませんでした。' });
    }

    // デバッグメッセージ
    console.log(`Current series data before update: ${JSON.stringify(series.posts, null, 2)}`);

    // posts配列を使ってseries.posts内の各エピソードのエピソード番号を更新

    series.posts.forEach(existingPost => {
      const updatedPost = posts.find(post => post.postId === existingPost.postId?.toString());
      if (updatedPost) {
        console.log(`Updating postId ${existingPost.postId}: setting episodeNumber to ${updatedPost.episodeNumber}`);
        existingPost.episodeNumber = updatedPost.episodeNumber;
      } else {
        console.log(`No update needed for post with postId: ${existingPost.postId}`);
      }
    });

    await series.save();

    // デバッグメッセージ
    console.log(`Updated series data after save: ${JSON.stringify(series.posts, null, 2)}`);

    res.status(200).json({ message: 'エピソードの順序が更新されました。' });
  } catch (error) {
    console.error('Error updating posts order:', error);
    res.status(500).json({ message: 'エピソードの順序を更新できませんでした。', error: error.message });
  }
});
// Series のタイトルを取得するエンドポイント
router.get('/:id([0-9a-fA-F]{24})/title', async (req, res) => {
  try {
    const seriesId = req.params.id;
    const series = await Series.findById(seriesId);

    if (!series) {
      return res.status(404).json({ message: 'シリーズが見つかりませんでした。' });
    }

    res.status(200).json({ title: series.title });
  } catch (error) {
    console.error('Error fetching series title:', error);
    res.status(500).json({ message: 'シリーズのタイトルを取得できませんでした。', error });
  }
});

// シリーズ作成エンドポイント
router.post('', authenticateToken, async (req, res) => {
  try {
    const { title, description, tags, isOriginal, isAdultContent, aiGenerated } = req.body;

    const newSeries = new Series({
      title,
      description,
      tags,
      isOriginal,
      isAdultContent,
      aiGenerated,
      author: req.user._id,
    });

    const savedSeries = await newSeries.save();
    res.status(201).json(savedSeries);
  } catch (error) {
    console.error('Error creating series:', error);
    res.status(500).json({ message: 'シリーズ作成に失敗しました。' });
  }
});

// シリーズ一覧取得エンドポイント
router.get('', authenticateToken, async (req, res) => {
  try {
    const series = await Series.find({ author: req.user._id });
    res.json(series);
  } catch (error) {
    console.error('Error fetching series:', error);
    res.status(500).json({ message: 'シリーズ取得に失敗しました。' });
  }
});

router.post('/:id([0-9a-fA-F]{24})/removePost', authenticateToken, async (req, res) => {
  try {
    const seriesId = req.params.id;
    const { postId } = req.body;

    if (!postId) {
      return res.status(400).json({ message: 'postIdが提供されていません。' });
    }

    // シリーズを検索
    const series = await Series.findById(seriesId);
    if (!series) {
      return res.status(404).json({ message: 'シリーズが見つかりませんでした。' });
    }

    // シリーズから該当の投稿を削除
    series.posts = series.posts.filter(post => post.postId?.toString() !== postId.toString());
    await series.save();

    // Post モデルの series フィールドからシリーズIDを削除
    await Post.findByIdAndUpdate(postId, { $pull: { series: seriesId } }, { new: true, runValidators: false });

    res.status(200).json({ message: '作品がシリーズから削除されました。' });
  } catch (error) {
    console.error('Error removing post from series:', error);
    res.status(500).json({ message: 'シリーズから作品を削除できませんでした。', error });
  }
});

module.exports = router;

