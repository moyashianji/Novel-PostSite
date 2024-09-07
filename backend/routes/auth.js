const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const nodemailer = require('nodemailer');
const upload = require('../middlewares/upload');
const { body, validationResult } = require('express-validator');
const fetch = require('node-fetch');
require('dotenv').config();

const router = express.Router();

// Nodemailerの設定 (メール送信用)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // 587 を使う場合は false
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ReCAPTCHA検証用の関数
const verifyRecaptcha = async (recaptchaToken) => {
  const recaptchaSecret = process.env.RECAPTCHA_SECRET;
  const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${recaptchaSecret}&response=${recaptchaToken}`,
  });
  const data = await response.json();
  return data.success;
};

// Step 1: 仮登録と確認コードの送信
router.post('/register-step1', [
  body('email').isEmail().withMessage('有効なメールアドレスを入力してください'),
  body('password').isLength({ min: 8 }).withMessage('パスワードは8文字以上である必要があります'),
  body('passwordConfirmation').custom((value, { req }) => value === req.body.password)
    .withMessage('パスワード確認が一致しません'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, recaptchaToken } = req.body;

  // ReCAPTCHA検証
  const recaptchaVerified = await verifyRecaptcha(recaptchaToken);
  if (!recaptchaVerified) {
    return res.status(400).json({ message: 'ReCAPTCHA verification failed' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'メールアドレスは既に登録されています' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 確認コード生成
    const verificationCode = Math.floor(100000 + Math.random() * 900000); // 6桁のコード

    // 確認コードをメールで送信
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification Code',
      text: `Your verification code is: ${verificationCode}`,
    });

    // 仮登録情報と確認コードをセッションに保存
    req.session.tempUserData = { email, password: hashedPassword, verificationCode };
   // デバッグ用にセッション内容をコンソールに表示
   console.log('Step 1 - Session ID:', req.sessionID);

   console.log('Session saved:', req.session);
    res.status(200).json({ message: '仮登録が成功しました。メールで送られた確認コードを入力してください。' });
  } catch (error) {
    console.error('Error in register-step1:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// Step 2: 確認コードの検証
router.post('/register-step2', [
  body('verificationCode').isNumeric().withMessage('確認コードを入力してください'),
], (req, res) => {
  // セッション内容とIDを確認
  console.log('Step 2 - Session ID:', req.sessionID);
  console.log('Step 2 - Session data:', req.session.tempUserData);
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

    // セッション内容をデバッグログに出力
    console.log('Session data:', req.session);

    
  const { verificationCode } = req.body;
  const tempUserData = req.session.tempUserData;

  if (!tempUserData) {
    return res.status(400).json({ message: '仮登録情報がありません。もう一度最初から登録してください。' });
  }

  if (parseInt(verificationCode) !== tempUserData.verificationCode) {
    return res.status(400).json({ message: '確認コードが一致しません。' });
  }

  // 確認コードが正しければ次のステップへ進む
  res.status(200).json({ message: '確認コードが一致しました。次のステップへ進んでください。' });
});


// Step 3: 本登録用のエンドポイント
router.post('/register-step3', upload.single('icon'), [
  body('nickname').not().isEmpty().withMessage('ニックネームを入力してください'),
  body('dob').not().isEmpty().withMessage('生年月日を入力してください'),
  body('gender').not().isEmpty().withMessage('性別を選択してください'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

    // セッション内容とIDを確認
    console.log('Step 3 - Session ID:', req.sessionID);
    console.log('Step 3 - Session data:', req.session.tempUserData);

  const { nickname, dob, gender } = req.body;
  const iconPath = req.file ? `/uploads/${req.file.filename}` : '';

  const tempUserData = req.session.tempUserData;

  if (!tempUserData) {
    return res.status(400).json({ message: '仮登録情報がありません。もう一度最初から登録してください。' });
  }

  try {
    const newUser = new User({
      email: tempUserData.email,
      password: tempUserData.password,
      nickname,
      dob,
      gender,
      icon: iconPath,
    });

    await newUser.save();

    // 登録完了後、セッションから仮登録データを削除
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ message: 'サーバーエラーが発生しました' });
      }
      
      // JWTトークンの生成
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1d' });

      // セッション削除後に応答
      res.status(201).json({ message: 'ユーザー登録が完了しました', token });
    });

  } catch (error) {
    console.error('Error in register-step3:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
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
module.exports = router;
