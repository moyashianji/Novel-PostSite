import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import BookIcon from '@mui/icons-material/Book';
import BookOffIcon from '@mui/icons-material/BookOnline';

const BookshelfButton = ({ postId, initialBookshelfState, onToggle }) => {
  const [isInBookshelf, setIsInBookshelf] = useState(initialBookshelfState);

  useEffect(() => {
    setIsInBookshelf(initialBookshelfState);
  }, [initialBookshelfState]);

  const handleToggleBookshelf = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('ログインが必要です');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/toggle-bookshelf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsInBookshelf(data.isBookshelfAdded);
        onToggle(data.isBookshelfAdded, data.bookshelfCounter);
      } else {
        console.error('Failed to toggle bookshelf status');
      }
    } catch (error) {
      console.error('Error toggling bookshelf status:', error);
    }
  };

  return (
    <Button
      variant={isInBookshelf ? 'contained' : 'outlined'}
      color="primary"
      startIcon={isInBookshelf ? <BookOffIcon /> : <BookIcon />}
      onClick={handleToggleBookshelf}
    >
      {isInBookshelf ? '本棚から除く' : '本棚に追加'}
    </Button>
  );
};

export default BookshelfButton;
