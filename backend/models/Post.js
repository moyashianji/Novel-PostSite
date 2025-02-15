// models/Post.js
const mongoose = require('mongoose');
const { getEsClient } = require('../utils/esClient'); // 動的に取得

const esClient = getEsClient(); // getEsClient() で取得
console.log('🔍 Elasticsearch Client:', esClient);

const replySchema = new mongoose.Schema({
  text: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // コメントの作者を参照
  createdAt: { type: Date, default: Date.now },
});

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // コメントの作者を参照
  replies: [replySchema],
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
  isOriginal: {
    type: Boolean,
    required: false,
  },
  isAdultContent: {
    type: Boolean,
    required: false,
  },
  isAI: { type: Boolean, required: false },
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


// ドキュメント保存時に Elasticsearch にインデックス
postSchema.post('save', async function (doc) {
  try {
    if (!esClient) throw new Error('❌ Elasticsearch client is undefined');

    const response = await esClient.index({
      index: 'posts',
      id: doc._id.toString(),
      body: {
        title: doc.title,
        content: doc.content,
        author: doc.author.toString(),
        createdAt: doc.createdAt,
      },
    });
    console.log('✅ Document indexed in Elasticsearch:', response);
  } catch (error) {
    console.error('❌ Error indexing document in Elasticsearch:', error);
  }
});

postSchema.post('findOneAndDelete', async function (doc) {
  if (!doc) {
    console.warn('⚠️ Document not found for deletion in Elasticsearch');
    return;
  }

  try {
    const response = await esClient.delete({
      index: 'posts',
      id: doc._id.toString(),
    });

    console.log('✅ Document removed from Elasticsearch:', response);
  } catch (error) {
    if (error.meta && error.meta.statusCode === 404) {
      console.warn('⚠️ Document not found in Elasticsearch, skipping:', doc._id.toString());
    } else {
      console.error('❌ Error removing document from Elasticsearch:', error.meta ? error.meta.body : error);
    }
  }
});

module.exports = mongoose.model('Post', postSchema);
