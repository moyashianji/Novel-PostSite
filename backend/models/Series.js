const mongoose = require('mongoose');
const { getEsClient } = require('../utils/esClient'); // 動的に取得
const sanitizeHtml = require('sanitize-html'); // HTMLタグを削除するライブラリ

const esClient = getEsClient(); // getEsClient() で取得
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
// ドキュメント保存時に Elasticsearch にインデックス
seriesSchema.post('save', async function (doc) {
  try {
    if (!esClient) throw new Error('❌ Elasticsearch client is undefined');

    // Elasticsearch に保存するデータを準備
    const esBody = {
      title: doc.title,
      description: doc.description,
      tags: doc.tags || [],
      author: doc.author.toString(),
      createdAt: doc.createdAt,
    };



    // Elasticsearch に保存
    const response = await esClient.index({
      index: 'series',
      id: doc._id.toString(),
      body: esBody,
    });

    console.log('✅ Series indexed in Elasticsearch:', response);
  } catch (error) {
    console.error('❌ Error indexing series in Elasticsearch:', error);
  }
});

const Series = mongoose.model('Series', seriesSchema);

module.exports = Series;