import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const BookmarksList = ({ bookmarks = [] }) => {
  const navigate = useNavigate();

  const handleBookmarkClick = (novelId, position) => {
    if (novelId) {
      navigate(`/novel/${novelId}`, { state: { scrollTo: position } });
    }
  };

  if (bookmarks.length === 0) {
    return (
      <Box sx={{ padding: 2, width: '100%', textAlign: 'center' }}>
        <Typography>しおりはありません</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {bookmarks.map((bookmark, index) => (
        <Card
          key={index}
          sx={{ marginBottom: 2, width: '100%', cursor: 'pointer' }}
          onClick={() => bookmark.novelId && handleBookmarkClick(bookmark.novelId._id, bookmark.position)}
        >
          <CardContent>
            <Typography variant="subtitle1">{bookmark.novelId?.title || 'Unknown Title'}</Typography>
            <Typography variant="body2" color="textSecondary">
              位置: {bookmark.position} | 日時: {new Date(bookmark.date).toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default BookmarksList;
