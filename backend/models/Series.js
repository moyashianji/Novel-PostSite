const mongoose = require('mongoose');

const seriesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 400,
  },
  description: {
    type: String,
    required: true,
    minlength: 20,
    maxlength: 2000,
  },
  tags: {
    type: [String],
    maxlength: 10,
  },
  isOriginal: {
    type: Boolean,
    required: true,
  },
  isAdultContent: {
    type: Boolean,
    required: true,
  },
  aiGenerated: {
    type: Boolean,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  posts: [
    {
      postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
      episodeNumber: { type: Number }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Series = mongoose.model('Series', seriesSchema);

module.exports = Series;