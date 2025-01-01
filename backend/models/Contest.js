// models/Contest.js
const mongoose = require('mongoose');

const judgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  photo: { type: String },
});

const entrySchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  submissionDate: { type: Date, default: Date.now },
});

const contestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  theme: { type: String, required: true },
  description: { type: String, required: true },
  headerImage: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  applicationStartDate: { type: Date, required: true },
  applicationEndDate: { type: Date, required: true },
  reviewStartDate: { type: Date },
  reviewEndDate: { type: Date },
  rules: { type: String },
  prizes: [{ type: String }],
  judges: [judgeSchema],
  maxEntries: { type: Number, default: Infinity },
  status: { type: String, default: 'draft', enum: ['draft', 'published', 'closed', 'review', 'results'] },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  entries: [entrySchema],
}, { timestamps: true });

module.exports = mongoose.model('Contest', contestSchema);