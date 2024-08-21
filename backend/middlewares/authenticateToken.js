// middlewares/authenticateToken.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401); // トークンがない場合は認証エラー

  jwt.verify(token, 'secret_key', async (err, decoded) => {
    if (err) return res.sendStatus(403); // トークンが無効な場合はアクセス拒否

    try {
      const user = await User.findById(decoded.id);
      if (!user) return res.sendStatus(404); // ユーザーが見つからない場合
      req.user = user; // ユーザー情報をリクエストオブジェクトに保存
      next(); // 次のミドルウェアに進む
    } catch (error) {
      res.sendStatus(500);
    }
  });
};

module.exports = authenticateToken;
