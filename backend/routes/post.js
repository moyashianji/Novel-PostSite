const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const Post = require('../models/Post');
const Good = require('../models/Good');

const router = express.Router();

// 新規投稿
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

// 投稿取得
router.get('/:id', async (req, res) => {
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

// 投稿一覧取得
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().populate('author').exec();
        res.json(posts);
      } catch (error) {
        res.status(500).json({ message: '投稿の取得に失敗しました。' });
      }
    });

// コメント投稿
router.post('/:id/comments', authenticateToken, async (req, res) => {
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

// コメント取得
router.get('/:id/comments', async (req, res) => {
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

// いいね
router.post('/:id/good', authenticateToken, async (req, res) => {
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

// いいね状態確認
router.get('/:id/isLiked', authenticateToken, async (req, res) => {
    try {
        const existingGood = await Good.findOne({ user: req.user._id, post: req.params.id });
        res.json({ hasLiked: !!existingGood });
      } catch (error) {
        console.error('Error checking like status:', error);
        res.status(500).json({ message: 'いいね状態の確認に失敗しました。', error });
      }
    });

// 閲覧数更新
router.post('/:id/view', async (req, res) => {
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

// 投稿検索
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

// ランキング取得
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


// 特定の投稿を更新するエンドポイント
router.post('/:id/update', authenticateToken, async (req, res) => {
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
  
  // 本棚登録・解除のエンドポイント
  router.post('/:id/bookshelf', authenticateToken, async (req, res) => {
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
  router.get('/:id/isInBookshelf', authenticateToken, async (req, res) => {
    try {
        const existingBookshelf = await User.findOne({ _id: req.user._id, bookShelf: req.params.id });
        res.json({ isInBookshelf: !!existingBookshelf });
      } catch (error) {
        console.error('Error checking bookshelf status:', error);
        res.status(500).json({ message: '本棚登録状態の確認に失敗しました。', error });
      }
  });
  
module.exports = router;
