// models/Post.js
const mongoose = require('mongoose');


  
const commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // コメントの作者を参照

    createdAt: { type: Date, default: Date.now }
  });
const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  description: { type: String, required: true, maxlength: 3000 },
  tags: [{ type: String, maxlength: 50 }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  images: [{ type: String }],
  wordCount: { type: Number, required: true },
  isAI: { type: Boolean, required: true },

  viewCounter: { type: Number, default: 0 }, // 閲覧数
  goodCounter: { type: Number, default: 0 }, // いいね数
 
  comments: [commentSchema],  // コメントを含む

  createdAt: { type: Date, default: Date.now },
  bookShelfCounter: { type: Number, default: 0 }, // 本棚追加数
  series: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Series',  // シリーズ情報を保持するフィールドを追加
  },
});

module.exports = mongoose.model('Post', postSchema);
