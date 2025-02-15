import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Grid, Typography, CircularProgress } from '@mui/material';
import PostCard from '../components/PostCard';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const SearchPage = () => {
  const query = useQuery().get('query') || ''; // クエリが null の場合に空文字を設定
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) return; // クエリが空の場合は処理しない

      setLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/posts/search?query=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (response.ok) {
          setSearchResults(data || []); // `undefined` を防ぐためにデフォルトで空配列
        } else {
          setError('検索に失敗しました');
        }
      } catch (error) {
        console.error('❌ Error fetching search results:', error);
        setError('検索に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        "{query}" の検索結果
      </Typography>

      {loading ? (
        <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : searchResults.length > 0 ? (
        <Grid container spacing={3}>
          {searchResults.map((post) => (
            <Grid item xs={12} sm={6} md={4} key={post._id}>
              <PostCard post={post} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1">検索結果が見つかりませんでした。</Typography>
      )}
    </Container>
  );
};

export default SearchPage;