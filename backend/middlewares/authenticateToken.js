// middlewares/authenticateToken.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;  // クッキー名が "token" であることを前提

  if (!token) {
    return res.status(401).json({ message: 'トークンがありません' }); // トークンがない場合
  }

  // トークンの検証
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: '無効なトークンです' }); // トークンが無効な場合
    }

    try {
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ message: 'ユーザーが見つかりません' }); // ユーザーが見つからない場合
      }

      req.user = user; // ユーザー情報をリクエストに保存
      next(); // 次のミドルウェアへ
    } catch (error) {
      return res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  });
};

module.exports = authenticateToken;
