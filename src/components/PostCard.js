// src/components/PostCard.js
import React from 'react';
import { Card, Typography, Avatar, Box, Chip } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const PostCard = ({ post }) => {
  const { _id, title, author, description, content, wordCount, tags } = post;
  const navigate = useNavigate();

  const handleTagClick = (tag) => {
    navigate(`/search?query=${encodeURIComponent(tag)}`);
  };

  return (
    <Card sx={{ marginBottom: 2, padding: 2 }}>
      <Link to={`/novel/${_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
      </Link>
      <Box display="flex" alignItems="center" mb={2}>
        <Link to={`/user/${author._id}`}>
          <Avatar 
            src={`http://localhost:5000${author.icon}`} 
            alt={author.nickname} 
            sx={{ width: 32, height: 32 }}  // アイコンサイズを小さく
          />
        </Link>
        <Link to={`/user/${author._id}`} style={{ textDecoration: 'none', color: 'inherit', marginLeft: '8px' }}>
          <Typography variant="subtitle1">{author.nickname}</Typography>
        </Link>
      </Box>
      <Typography variant="body1" color="textSecondary" gutterBottom>
        {description}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        <span dangerouslySetInnerHTML={{ __html: content.slice(0, 100) + '...' }} />
      </Typography>
      <Typography variant="caption" display="block" gutterBottom>
        文字数: {wordCount}
      </Typography>
      <Box mt={1} display="flex" flexWrap="wrap">
        {tags.map((tag, index) => (
          <Chip
            key={index}
            label={tag}
            sx={{ marginRight: 0.5, marginBottom: 0.5 }}
            onClick={() => handleTagClick(tag)} // タグをクリックしたら検索ページに遷移
          />
        ))}
      </Box>
    </Card>
  );
};

export default PostCard;
