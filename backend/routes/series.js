const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const Series = require('../models/Series');
const Post = require('../models/Post');

const router = express.Router();

// シリーズ作成
router.post('/', authenticateToken, async (req, res) => {
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
      }});

// シリーズ更新
router.post('/:id/update', authenticateToken, async (req, res) => {
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
      }});

// シリーズ取得
router.get('/:id', authenticateToken, async (req, res) => {
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
      }});

// シリーズ一覧取得
router.get('/', authenticateToken, async (req, res) => {
    try {
        const series = await Series.find({ author: req.user._id });
        res.json(series);
      } catch (error) {
        console.error('Error fetching series:', error);
        res.status(500).json({ message: 'シリーズ取得に失敗しました。' });
      }
    });

// シリーズに投稿を追加
router.post('/:id/addPost', authenticateToken, async (req, res) => {
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
      }});

// シリーズから投稿を削除
router.post('/:id/removePost', authenticateToken, async (req, res) => {
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
      }});

// シリーズ内の投稿を更新
router.post('/:id/updatePosts', authenticateToken, async (req, res) => {
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
      }});

// シリーズに含まれる投稿を取得
router.get('/:id/posts', async (req, res) => {
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
      }});

// シリーズタイトル取得
router.get('/:id/title', async (req, res) => {
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
      }});

module.exports = router;
