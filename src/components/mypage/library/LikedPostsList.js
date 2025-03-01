import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LikedPostsList = ({ likedPosts = [] }) => {
  const navigate = useNavigate();

  const handleCardClick = (postId) => {
    navigate(`/novel/${postId}`);
  };

  if (likedPosts.length === 0) {
    return (
      <Box sx={{ padding: 2, width: '100%', textAlign: 'center' }}>
        <Typography>いいねした作品はありません</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {likedPosts.map((post) => (
        <Card
          key={post._id}
          sx={{ marginBottom: 2, width: '100%', cursor: 'pointer' }}
          onClick={() => handleCardClick(post._id)}
        >
          <CardContent>
            <Typography variant="subtitle1">{post.title}</Typography>
            <Typography variant="body2" color="textSecondary">
              {post.description}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default LikedPostsList;
