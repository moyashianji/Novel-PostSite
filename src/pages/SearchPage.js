// src/pages/SearchPage.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Grid, Typography } from '@mui/material';
import PostCard from '../components/PostCard';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const SearchPage = () => {
  const query = useQuery().get('query');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/posts/search?query=${query}`);
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    };

    if (query) {
      fetchSearchResults();
    }
  }, [query]);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        "{query}" の検索結果
      </Typography>
      <Grid container spacing={3}>
        {searchResults.length > 0 ? (
          searchResults.map((post) => (
            <Grid item xs={12} sm={6} md={4} key={post._id}>
              <PostCard post={post} />
            </Grid>
          ))
        ) : (
          <Typography variant="body1">検索結果が見つかりませんでした。</Typography>
        )}
      </Grid>
    </Container>
  );
};

export default SearchPage;
