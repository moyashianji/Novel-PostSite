import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, Divider, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';

// スタイリングされたタグアイテム
const StyledListItem = styled(ListItem)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transition: 'background-color 0.3s ease',
  },
  padding: theme.spacing(1),
  display: 'flex',
  justifyContent: 'center',
}));

const TagText = styled(ListItemText)(({ theme }) => ({
  textAlign: 'center',
  '& span': {
    fontWeight: 'bold',
    color: theme.palette.text.primary,
  },
}));

const PopularTags = () => {
  const [tags, setTags] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/tags/popular');
        const data = await response.json();
        setTags(data);
      } catch (error) {
        console.error('Error fetching popular tags:', error);
      }
    };

    fetchTags();
  }, []);

  const handleTagClick = (tag) => {
    navigate(`/search?query=${encodeURIComponent(tag)}`);
  };

  return (
    <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
      <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
        人気タグ
      </Typography>
      {tags.map((tag, index) => (
        <React.Fragment key={index}>
          <StyledListItem button onClick={() => handleTagClick(tag)}>
            <TagText primary={tag} />
          </StyledListItem>
          {index < tags.length - 1 && <Divider />}
        </React.Fragment>
      ))}
      {tags.length === 0 && (
        <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mt: 2 }}>
          タグがありません
        </Typography>
      )}
    </List>
  );
};

export default PopularTags;
