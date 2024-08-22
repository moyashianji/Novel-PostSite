const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: { type: String, required: true },
  icon: { type: String}, // アイコン画像のURLを保存
  dob: { type: Date, required: true },
  gender: { type: String, required: true },
  description: { type: String, default: '' },
  xLink: { type: String, default: '' },
  pixivLink: { type: String, default: '' },
  otherLink: { type: String, default: '' },

  likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }], // 追加: いいねした投稿のIDを保存
  
  followerCount: { type: Number, default: 0 },

  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // フォロワーのリスト
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // フォローしているユーザーのリスト

  bookmarks: [
    {
      novelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
      position: Number,
      date: { type: Date, default: Date.now },
    },
  ],
  bookShelf: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }], // 本棚に追加されたポスト

}, { timestamps: true });



const User = mongoose.model('User', userSchema);

module.exports = User;
