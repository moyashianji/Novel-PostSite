// src/pages/NovelDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, Button } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import CommentSection from '../components/CommentSection';

const NovelDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [goodCount, setGoodCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/posts/${id}`);
        const data = await response.json();
        setPost(data);
        setGoodCount(data.goodCounter);
        setViewCount(data.viewCounter);

        await fetch(`http://localhost:5000/api/posts/${id}/view`, {
          method: 'POST',
        });

        const token = localStorage.getItem('token');
        if (token) {
          const likeResponse = await fetch(`http://localhost:5000/api/posts/${id}/isLiked`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          const likeData = await likeResponse.json();
          setHasLiked(likeData.hasLiked);
        }
      } catch (error) {
        console.error('Failed to fetch post:', error);
      }
    };

    fetchPost();
  }, [id]);

  const handleGoodClick = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('ログインが必要です');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/posts/${id}/good`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGoodCount(data.goodCounter);
        setHasLiked(data.hasLiked);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'いいねに失敗しました。');
      }
    } catch (error) {
      console.error('Error toggling good:', error);
    }
  };

  if (!post) return <div>Loading...</div>;

  return (
    <Container sx={{ marginTop: 4 }}>
      <Typography variant="h4" gutterBottom>
        {post.title}
      </Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom>
        {post.description}
      </Typography>
      <Box display="flex" alignItems="center" mb={2}>
        <Typography variant="caption" sx={{ marginRight: 2 }}>
          閲覧数: {viewCount}
        </Typography>
        <Typography variant="caption">
          いいね数: {goodCount}
        </Typography>
      </Box>
      <Typography variant="body1" paragraph>
        <span dangerouslySetInnerHTML={{ __html: post.content }} />
      </Typography>
      <Button
        variant="contained"
        color={hasLiked ? "secondary" : "primary"}
        startIcon={hasLiked ? <ThumbUpIcon /> : <ThumbUpOffAltIcon />}
        onClick={handleGoodClick}
        sx={{ marginBottom: 4 }}
      >
        {hasLiked ? 'いいねを解除' : 'いいね'}
      </Button>

      {/* コメントセクションを追加 */}
      <CommentSection postId={id} />
    </Container>
  );
};

export default NovelDetail;
