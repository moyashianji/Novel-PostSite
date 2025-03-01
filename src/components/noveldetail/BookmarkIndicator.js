import React, { memo } from 'react';
import { Typography, Box } from '@mui/material';
import BookmarkButton from './BookmarkButton';

const BookmarkIndicator = memo(({ isBookmarkMode, handleBookmarkClick }) => (
  <Box
    sx={{
      position: 'fixed',
      bottom: 20,
      right: 70,
      display: 'flex',
      alignItems: 'center',
      zIndex: 1000,
    }}
  >
    <BookmarkButton onClick={handleBookmarkClick} />
    {isBookmarkMode && (
      <Typography
        variant="body2"
        sx={{
          marginLeft: 2,
          backgroundColor: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
        }}
      >
        次読み始めたい文をクリックしてください
      </Typography>
    )}
  </Box>
));

export default BookmarkIndicator;
