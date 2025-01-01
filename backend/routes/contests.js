// routes/contests.js
const express = require('express');
const multer = require('multer');
const Contest = require('../models/Contest');
const Post = require('../models/Post');

const authenticateToken = require('../middlewares/authenticateToken');
const router = express.Router();
const path = require('path');
const mongoosed = require('mongoose');


// Multerで画像アップロードの設定
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/contests'); // 保存先ディレクトリ
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  const upload = multer({ storage });

router.post('/create', authenticateToken, upload.single('headerImage'), async (req, res) => {
  try {
    const {
      title,
      theme,
      description,
      startDate,
      endDate,
      applicationStartDate,
      applicationEndDate,
      reviewStartDate,
      reviewEndDate,
      rules,
      prizes,
      judges,
      maxEntries,
    } = req.body;
    console.log("test")
    const headerImage = req.file ? `/uploads/contests/${req.file.filename}` : ''; // ヘッダー画像パス

    // 新しいコンテストを作成
    const newContest = new Contest({
      title: title,
      theme: theme,
      description: description,
      headerImage: headerImage,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      applicationStartDate: new Date(applicationStartDate),
      applicationEndDate: new Date(applicationEndDate),
      reviewStartDate: new Date(reviewStartDate),
      reviewEndDate: new Date(reviewEndDate),
      rules: rules,
      prizes: prizes ? JSON.parse(prizes) : [],
      judges: judges ? JSON.parse(judges) : [],
      maxEntries: maxEntries ? parseInt(maxEntries, 10) : 100,
      creator: req.user._id, // 認証されたユーザーを主催者として設定
      status: 'draft',
    });
    console.log("testtt")

    // 保存
    await newContest.save();

    res.status(201).json({ message: 'コンテストが作成されました。', contest: newContest });
  } catch (error) {
    console.error('Error creating contest:', error);
    res.status(500).json({ message: 'コンテストの作成に失敗しました。', error });
  }
});

router.post('/:id/enter', authenticateToken, async (req, res) => {
    try {
      const { id: contestId } = req.params;
      const { postId } = req.body;
      const userId = req.user._id;
  
      const contest = await Contest.findById(contestId);
      if (!contest) return res.status(404).json({ message: 'コンテストが見つかりませんでした。' });
  
      const alreadyEntered = contest.entries.some(entry => entry.userId.toString() === userId.toString());
      if (alreadyEntered) return res.status(400).json({ message: '既に応募済みです。' });
  
      if (contest.entries.length >= contest.maxEntries) {
        return res.status(400).json({ message: '応募数が上限に達しました。' });
      }
  
      contest.entries.push({ postId, userId });
      await contest.save();
  
      res.status(200).json({ message: '応募が完了しました。' });
    } catch (error) {
      console.error('Error entering contest:', error);
      res.status(500).json({ message: '応募に失敗しました。', error });
    }
  });

// コンテスト応募削除エンドポイント
router.delete('/:id([0-9a-fA-F]{24})/entry/:entryId([0-9a-fA-F]{24})', authenticateToken, async (req, res) => {
    try {
      const contestId = req.params.id; // URLからコンテストIDを取得
      const entryId = req.params.entryId; // URLからエントリーIDを取得
      const userId = req.user._id; // 認証されたユーザーID
  
      console.log(`Contest ID: ${contestId}`);
      console.log(`Entry ID: ${entryId}`);
      console.log(`User ID: ${userId}`);
  
      // コンテストを取得
      const contest = await Contest.findById(contestId);
      if (!contest) {
        return res.status(404).json({ message: 'コンテストが見つかりませんでした。' });
      }
  
      // エントリーを見つけて削除
      const entryIndex = contest.entries.findIndex(entry => 
        entry.postId.toString() === entryId && entry.userId.toString() === userId.toString()
      );
  
      if (entryIndex === -1) {
        return res.status(404).json({ message: 'エントリーが見つかりませんでした。' });
      }
  
      contest.entries.splice(entryIndex, 1); // エントリーを削除
      await contest.save();
  
      res.status(200).json({ message: 'エントリーが削除されました。' });
    } catch (error) {
      console.error('Error deleting contest entry:', error);
      res.status(500).json({ message: 'コンテストエントリーの削除に失敗しました。', error: error.message });
    }
  });
// コンテスト応募エンドポイント
router.post('/:id/apply', authenticateToken, async (req, res) => {
  try {
    const contestId = req.params.id; // URLからコンテストIDを取得
    const {selectedPostId} = req.body; // リクエストボディからpostIdを取得
    const userId = req.user._id; // 認証されたユーザーID

    // postId の形式を検証
    if (!selectedPostId || !mongoosed.isValidObjectId(selectedPostId)) {
      return res.status(400).json({ message: '無効な作品IDが提供されました。' });
    }

    // コンテストを取得
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ message: 'コンテストが見つかりませんでした。' });
    }

    // 作品を取得
    const post = await Post.findById(selectedPostId);
    if (!post) {
      return res.status(404).json({ message: '作品が見つかりませんでした。' });
    }

    console.log("Post ID from DB:", post._id);

    // 既に応募されている場合はエラーを返す
    const alreadyApplied = contest.entries.some(entry =>
      entry.postId.toString() === selectedPostId // 文字列形式で比較
    );

    if (alreadyApplied) {
      return res.status(400).json({ message: 'この作品は既に応募されています。' });
    }

    // 応募エントリを作成
    const entry = {
        postId: selectedPostId, // postId を ObjectId にキャスト
        userId: userId, // userId を ObjectId にキャスト
      };
    // entries フィールドに応募を追加
    contest.entries.push(entry);

    // コンテストを保存
    await contest.save();

    res.status(200).json({ message: '応募が完了しました。', contest });
  } catch (error) {
    console.error('Error applying to contest:', error);
    res.status(500).json({ message: 'コンテスト応募に失敗しました。', error: error.message });
  }
});
  router.get('/:id', async (req, res) => {
    try {
      const contest = await Contest.findById(req.params.id).populate('entries.userId entries.postId judges');
      if (!contest) {
        return res.status(404).json({ message: 'コンテストが見つかりませんでした。' });
      }
      res.status(200).json(contest);
    } catch (error) {
      console.error('Error fetching contest details:', error);
      res.status(500).json({ message: 'コンテスト詳細の取得に失敗しました。', error });
    }
  });

  router.get('/', async (req, res) => {
    try {
      const contests = await Contest.find().sort({ createdAt: -1 });
      res.status(200).json(contests);
    } catch (error) {
      console.error('Error fetching contests:', error);
      res.status(500).json({ message: 'コンテスト一覧の取得に失敗しました。', error });
    }
  });

  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await Contest.findByIdAndDelete(id);
      res.status(200).json({ message: 'コンテストが削除されました。' });
    } catch (error) {
      console.error('Error deleting contest:', error);
      res.status(500).json({ message: 'コンテストの削除に失敗しました。', error });
    }
  });
  


  module.exports = router;
