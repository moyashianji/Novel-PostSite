const mongoose = require('mongoose');

const ViewAnalyticsSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    unique: true, // 各作品ごとに1つのドキュメント
  },
  views: [
    {
      timestamp: { type: Date, required: true },
      count: { type: Number, required: true },
    },
  ],
});

module.exports = mongoose.model('viewcounts', ViewAnalyticsSchema);
