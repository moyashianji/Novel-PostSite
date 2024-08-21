// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import PVRanking from '../components/PVRanking.js';  // 正しいパスでインポート
import { Box, Typography, Grid } from '@mui/material';
import PopularTags from '../components/PopularTags'; // 人気タグのコンポーネントをインポート

const Home = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/posts');
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };
    
    fetchPosts();
  }, []);
  return (
    <Grid container spacing={1} sx={{ maxWidth: '1400px', margin: '0 auto', paddingTop: 4 }}>
      {/* 左サイドバー: 人気タグ一覧 */}
      <Grid item xs={12} md={2.5} sx={{ paddingLeft: 1 }}>
        <Box sx={{ paddingRight: 1 }}>
          <PopularTags />
        </Box>
      </Grid>

      {/* 中央: 新着作品 */}
      <Grid item xs={12} md={7} sx={{ paddingLeft: 2, paddingRight: 2 }}>
        <Typography variant="h4" gutterBottom>
          新着作品
        </Typography>
        {posts.length > 0 ? (
          <Grid container spacing={2}>
            {posts.map(post => (
              <Grid item xs={12} sm={6} key={post._id}>
                <PostCard post={post} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body1">まだ投稿がありません。</Typography>
        )}
      </Grid>

      {/* 右サイドバー: PVランキング */}
      <Grid item xs={12} md={2.5} sx={{ paddingRight: 1 }}>
        <Box sx={{ paddingLeft: 1 }}>
          <PVRanking />
        </Box>
      </Grid>
    </Grid>
  );
};
export default Home;
