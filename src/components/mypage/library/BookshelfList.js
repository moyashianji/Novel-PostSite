import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const BookshelfList = ({ bookshelf = [] }) => {
  const navigate = useNavigate();

  const handleCardClick = (postId) => {
    navigate(`/novel/${postId}`);
  };

  if (bookshelf.length === 0) {
    return (
      <Box sx={{ padding: 2, width: '100%', textAlign: 'center' }}>
        <Typography>本棚に追加した作品はありません</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {bookshelf.map((post) => (
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

export default BookshelfList;
