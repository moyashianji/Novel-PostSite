const { Client } = require('@elastic/elasticsearch');

let esClient;

function getEsClient() {
  if (!esClient) {
    esClient = new Client({
      node: process.env.ELASTICSEARCH_URL || 'http://elasticsearch:9200',
    });

    esClient.ping()
      .then(() => console.log('✅ Elasticsearch is connected!'))
      .catch((error) => console.error('❌ Elasticsearch connection failed:', error));
  }
  return esClient;
}

module.exports = { getEsClient };