const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const authenticateToken = require('../middlewares/authenticateToken');
const upload = require('../middlewares/upload');
const User = require('../models/User');
const Follow = require('../models/Follow');

const router = express.Router();

// ユーザー登録
router.post('/register', upload.single('icon'), async (req, res) => {
    const { email, password, nickname, dob, gender } = req.body;
    const iconPath = req.file ? `/uploads/${req.file.filename}` : '';
  
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
  
      // パスワードのハッシュ化
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ email, password: hashedPassword, nickname, icon: iconPath, dob, gender });
      await newUser.save();
  
      const token = jwt.sign({ id: newUser._id }, 'secret_key', { expiresIn: '1d' });
      res.status(201).json({ message: 'User registered successfully', token });
    } catch (err) {
      console.error('Error registering user:', err);
      res.status(500).json({ message: 'Error registering user', error: err });
    }});

// ログイン
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
      console.log('Login attempt with email:', email);
  
      const user = await User.findOne({ email });
      if (!user) {
        console.log('No user found with this email');
        return res.status(400).json({ message: 'Invalid email or password' });
      }
  
      console.log('User found:', user);
  
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password match result:', isMatch);
  
      if (!isMatch) {
        console.log('Password does not match');
        console.log(password);
        return res.status(400).json({ message: 'Invalid email or password' });
      }
  
      const token = jwt.sign({ id: user._id }, 'secret_key', { expiresIn: '1h' });
      console.log('Login successful, token generated');
      res.json({ token });
    } catch (err) {
      console.error('Error logging in user:', err);
      res.status(500).json({ message: 'Error logging in user', error: err });
    }
});

// ユーザー情報取得
router.get('/me', authenticateToken, (req, res) => {
    res.json(req.user); // 認証されたユーザー情報を返す
});

// プロフィール更新
router.post('/:id/update', authenticateToken, upload.single('icon'), async (req, res) => {
    try {
        const { id } = req.params;
        // 既存ユーザー情報を取得
        const user = await User.findById(id);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
    
        // 更新データの準備
        const updateData = {
          nickname: req.body.nickname,
          description: req.body.description || "",  // デフォルト値を設定
          xLink: req.body.xLink || "",              // デフォルト値を設定
          pixivLink: req.body.pixivLink || "",      // デフォルト値を設定
          otherLink: req.body.otherLink || "",      // デフォルト値を設定
        };
    
        // アイコンがアップロードされた場合は、iconフィールドを追加
        if (req.file) {
          // 古いアイコンを削除
          if (user.icon && user.icon !== `/uploads/default.png`) { // デフォルト画像は削除しない
            const oldIconPath = path.join(__dirname, user.icon);
            fs.unlink(oldIconPath, (err) => {
              if (err) {
                console.error('Failed to delete old icon:', err);
              }
            });
          }
    
          // 新しいアイコンパスを更新データに追加
          updateData.icon = `/uploads/${req.file.filename}`;
        }
        // ユーザー情報の更新
        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true, upsert: true });
    
        res.json(updatedUser); // 更新されたユーザー情報を返す
      } catch (err) {
        res.status(500).json({ message: 'Error updating profile', error: err });
      }}
    );

// フォローする
router.post('/follow/:id', authenticateToken, async (req, res) => {
    try {
        const followerId = req.user._id;
        const followeeId = req.params.id;
    
        if (followerId.toString() === followeeId) {
          return res.status(400).json({ message: "自分自身をフォローすることはできません。" });
        }
    
        const followee = await User.findById(followeeId);
        const follower = await User.findById(followerId);
    
        if (!followee || !follower) {
          return res.status(404).json({ message: "ユーザーが見つかりません。" });
        }
    
        // フォロワーがすでにフォローしていない場合のみ追加
        if (!followee.followers.includes(followerId)) {
          followee.followers.push(followerId);
          await followee.save();
        }
    
        // フォローしているユーザーリストに追加
        if (!follower.following.includes(followeeId)) {
          follower.following.push(followeeId);
          await follower.save();
        }
    
        res.status(200).json({ message: "フォローしました。" });
      } catch (error) {
        console.error('Error following user:', error);
        res.status(500).json({ message: "フォローに失敗しました。" });
      }});

// フォロー解除
router.delete('/unfollow/:id', authenticateToken, async (req, res) => {
    try {
        const followerId = req.user._id;
        const followeeId = req.params.id;
    
        const followee = await User.findById(followeeId);
        const follower = await User.findById(followerId);
    
        if (!followee || !follower) {
          return res.status(404).json({ message: "ユーザーが見つかりません。" });
        }
    
        // フォロワーリストから削除
        followee.followers = followee.followers.filter(
          (id) => id.toString() !== followerId.toString()
        );
        await followee.save();
    
        // フォローリストから削除
        follower.following = follower.following.filter(
          (id) => id.toString() !== followeeId.toString()
        );
        await follower.save();
    
        res.status(200).json({ message: "フォローを解除しました。" });
      } catch (error) {
        console.error('Error unfollowing user:', error);
        res.status(500).json({ message: "フォロー解除に失敗しました。" });
      }});

// フォローステータス確認
router.get('/:id/is-following', authenticateToken, async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const targetUserId = req.params.id;
    
        const currentUser = await User.findById(currentUserId);
        if (!currentUser) {
          return res.status(404).json({ message: 'ユーザーが見つかりません。' });
        }
    
        const isFollowing = currentUser.following.includes(targetUserId);
    
        res.status(200).json({ isFollowing });
      } catch (error) {
        console.error('Error checking follow status:', error);
        res.status(500).json({ message: 'フォローステータスの取得に失敗しました。' });
      }});

// ユーザー情報取得
router.get('/:id', async (req, res) => {
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


// ユーザー情報を取得するエンドポイント
router.get('/:userId', async (req, res) => {
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
  
  // 自分の本棚リストを取得するエンドポイント
  router.get('/me/bookshelf', authenticateToken, async (req, res) => {

  });
  
  // しおりリストを取得するエンドポイント
  router.get('/me/bookmarks', authenticateToken, async (req, res) => {

  });
  
  // フォロワーリストを取得するエンドポイント
  router.get('/me/followers', authenticateToken, async (req, res) => {

  });
  
  // フォローしているユーザーリストを取得するエンドポイント
  router.get('/me/following', authenticateToken, async (req, res) => {

  });
  
  // いいねした作品リストを取得するエンドポイント
  router.get('/me/liked', authenticateToken, async (req, res) => {

  });
module.exports = router;
