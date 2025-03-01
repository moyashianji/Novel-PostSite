const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Series = require('../models/Series');
const { getEsClient } = require('../utils/esClient');

const esClient = getEsClient();

router.get('/', async (req, res) => {
    try {
        if (!esClient) {
            console.error('[ERROR] Elasticsearch クライアントが初期化されていません');
            return res.status(500).json({ message: 'Elasticsearch クライアントが初期化されていません。' });
        }

        console.log('\n🔍 ================== 検索リクエスト開始 ==================\n');
        console.log(`[INFO] 📩 クエリパラメータ受信:`, req.query);

        // 🔍 検索対象を決定 (`posts` または `series`)
        const type = req.query.type || 'posts'; 
        const index = type === 'series' ? 'series' : 'posts';

        console.log(`[INFO] 📌 検索対象: ${type} (Elasticsearch index: ${index})`);

        // 🌟 ページネーションのパラメータ
        const page = parseInt(req.query.page) || 1;
        const size = parseInt(req.query.size) || 10;
        const from = (page - 1) * size;

        console.log(`[INFO] 📄 ページネーション情報: page=${page}, size=${size}, from=${from}`);

        // 🔍 検索キーワード
        const mustInclude = req.query.mustInclude || '';
        const shouldInclude = req.query.shouldInclude || '';
        const mustNotInclude = req.query.mustNotInclude || '';
        const tagSearchType = req.query.tagSearchType || 'partial';
        const tags = req.query.tags ? req.query.tags.split(',') : [];

        console.log('[INFO] 🔎 検索条件:');
        console.log(`      ✅ mustInclude: ${mustInclude}`);
        console.log(`      ✅ shouldInclude: ${shouldInclude}`);
        console.log(`      ✅ mustNotInclude: ${mustNotInclude}`);
        console.log(`      ✅ tags: ${tags}`);
        console.log(`      ✅ tagSearchType: ${tagSearchType}`);

        // 🔹 fields の取得とデバッグ強化
        let fields = [];
        if (typeof req.query.fields === 'string') {
            fields = req.query.fields.split(',');
        } else {
            fields = type === 'series' ? ['title', 'description', 'tags'] : ['title', 'content', 'tags'];
        }

        console.log(`[INFO] 🎯 検索フィールド: ${fields.join(', ')}`);

        // 🔍 検索キーワードを分割
        const mustIncludeTerms = mustInclude.split(/\s+/).filter(term => term.trim() !== "");
        const shouldIncludeTerms = shouldInclude.split(/\s+/).filter(term => term.trim() !== "");
        const mustNotIncludeTerms = mustNotInclude.split(/\s+/).filter(term => term.trim() !== "");

        console.log('[INFO] 🔍 キーワード分割:');
        console.log(`      ✅ mustIncludeTerms: ${mustIncludeTerms}`);
        console.log(`      ✅ shouldIncludeTerms: ${shouldIncludeTerms}`);
        console.log(`      ✅ mustNotIncludeTerms: ${mustNotIncludeTerms}`);

        // ✅ Elasticsearch のクエリ構築
        let query = { bool: { must: [], should: [], must_not: [], filter: [] } };

        if (mustIncludeTerms.length > 0) {
            query.bool.must.push(...mustIncludeTerms.map(term => ({
                multi_match: {
                    query: term,
                    fields: fields,
                    fuzziness: "AUTO",
                    operator: "and"
                }
            })));
        }

        if (shouldIncludeTerms.length > 0) {
            query.bool.should.push(...shouldIncludeTerms.map(term => ({
                multi_match: {
                    query: term,
                    fields: fields,
                    fuzziness: "AUTO",
                    operator: "or"
                }
            })));
        }

        if (mustNotIncludeTerms.length > 0) {
            query.bool.must_not.push(...mustNotIncludeTerms.map(term => ({
                multi_match: {
                    query: term,
                    fields: fields,
                    fuzziness: "AUTO"
                }
            })));
        }

        if (tags.length > 0) {
            if (tagSearchType === "exact") {
                query.bool.filter.push({ terms: { tags: tags } });
            } else {
                query.bool.must.push(...tags.map(tag => ({
                    match: {
                        tags: {
                            query: tag,
                            operator: "or"
                        }
                    }
                })));
            }
        }

        console.log('[INFO] 🔍 Elasticsearch 検索クエリ:', JSON.stringify(query, null, 2));

        // 🔍 Elasticsearch 検索実行
        const response = await esClient.search({
            index: index,
            body: {
                query,
                from: from,
                size: size,
                sort: [
                    { createdAt: { order: "desc" } } 
                ],
                highlight: {
                    fields: {
                        title: {},
                        description: {}
                    }
                }
            }
        });

        console.log(`[INFO] 📥 Elasticsearch のレスポンス: totalHits=${response.hits.total.value}`);

        const docIds = response.hits.hits.map(hit => hit._id);
        const totalHits = response.hits.total.value;

        if (docIds.length === 0) {
            console.log("[INFO] ❌ 検索結果なし");
            return res.json({ results: [], total: 0, page, size });
        }

        console.log(`[INFO] 📋 Elasticsearch から取得した _id: ${docIds}`);

        // 🔄 MongoDB からデータを取得 (`Post` または `Series`)
        let results;
        if (type === 'posts') {
            results = await Post.find({ _id: { $in: docIds } })
                .populate('author')
                .populate('series')
                .sort({ createdAt: -1 })
                .lean();
        } else {
            results = await Series.find({ _id: { $in: docIds } })
                .populate('author')
                .sort({ createdAt: -1 })
                .lean();
        }

        console.log(`[INFO] ✅ MongoDB から取得したデータ数: ${results.length}`);

        res.json({ results, total: totalHits, page, size });
        console.log('\n🔍 ================== 検索リクエスト完了 ==================\n');

    } catch (error) {
        console.error('❌ 検索エンドポイントでのエラー:', error);
        res.status(500).json({ message: '検索結果の取得に失敗しました。' });
    }
});

module.exports = router;
