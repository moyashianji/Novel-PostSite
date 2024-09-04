// routes/auth.js

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Post = require('../models/Post');
const Good = require('../models/Good');
const Series = require('../models/Series');
const Follow = require('../models/Follow'); // Followモデルのインポート
const upload = require('../middlewares/upload');
const authenticateToken = require('../middlewares/authenticateToken');

const router = express.Router();


// ユーザー登録エンドポイント
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
  }
});
// メールアドレス重複チェックエンドポイント
router.post('/check-email', async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    res.json({ exists: !!existingUser });
  } catch (err) {
    console.error('Error checking email:', err);
    res.status(500).json({ message: 'Error checking email', error: err });
  }
});
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
// ミドルウェアを使用するルートの例
router.get('/user/me', authenticateToken, (req, res) => {
  res.json(req.user); // 認証されたユーザー情報を返す
});

module.exports = router;
