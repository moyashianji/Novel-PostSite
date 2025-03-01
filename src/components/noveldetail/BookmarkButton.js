// src/components/BookmarkButton.js
import React from 'react';
import { Fab } from '@mui/material';
import BookmarkIcon from '@mui/icons-material/Bookmark';

const BookmarkButton = ({ onClick }) => {
  return (
    <Fab
      color="primary"
      aria-label="bookmark"
      sx={{ position: 'fixed', bottom: 16, right: 16 }}
      onClick={onClick}
    >
      <BookmarkIcon />
    </Fab>
  );
};

export default BookmarkButton;
