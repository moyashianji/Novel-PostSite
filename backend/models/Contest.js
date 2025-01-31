// models/Contest.js
const mongoose = require('mongoose');

const judgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String},
  sns: { type: String },
});

const entrySchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  submissionDate: { type: Date, default: Date.now },
});

const contestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  shortDescription: { type: String, required: true },
  description: { type: String, required: true },
  iconImage: { type: String },
  headerImage: { type: String },
  applicationStartDate: { type: Date, required: true },
  applicationEndDate: { type: Date, required: true },
  reviewStartDate: { type: Date },
  reviewEndDate: { type: Date },
  resultAnnouncementDate: { type: Date },
  enableJudges: { type: Boolean, default: false },
  judges: [judgeSchema],
  allowFinishedWorks: { type: Boolean, default: false },
  allowPreStartDate: { type: Boolean, default: false },
  restrictAI: { type: Boolean, default: false },
  aiTags: [{ type: String }],
  allowR18: { type: Boolean, default: false },
  restrictGenres: { type: Boolean, default: false },
  genres: [{ type: String }],
  restrictWordCount: { type: Boolean, default: false },
  minWordCount: { type: Number, default: 0 },
  maxWordCount: { type: Number, default: 0 },
  allowSeries: { type: Boolean, default: false },
  minEntries: { type: Number, default: 0 },
  maxEntries: { type: Number, default: Infinity },
  status: { type: String, default: 'draft', enum: ['draft', 'published', 'closed', 'review', 'results'] },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  entries: [entrySchema],
}, { timestamps: true });

module.exports = mongoose.model('Contest', contestSchema);