import React, { memo } from 'react';
import { Typography, Box } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import StarIcon from '@mui/icons-material/Star';

const Statistics = memo(({ viewCount, goodCount, bookshelfCount, postDate }) => (
  <Box display="flex" alignItems="center" mb={2} flexWrap="wrap">
    <Box display="flex" alignItems="center" sx={{ marginRight: 2, marginBottom: 1 }}>
      <Typography variant="caption" sx={{ marginRight: 0.5 }}>
        <VisibilityIcon fontSize="small" />
      </Typography>
      <Typography variant="caption">
        {viewCount} 閲覧
      </Typography>
    </Box>
    <Box display="flex" alignItems="center" sx={{ marginRight: 2, marginBottom: 1 }}>
      <ThumbUpIcon fontSize="small" sx={{ marginRight: 0.5 }} />
      <Typography variant="caption">
        {goodCount || 0} いいね
      </Typography>
    </Box>
    <Box display="flex" alignItems="center" sx={{ marginRight: 2, marginBottom: 1 }}>
      <LibraryBooksIcon fontSize="small" sx={{ marginRight: 0.5 }} />
      <Typography variant="caption">
        {bookshelfCount || 0} 本棚
      </Typography>
    </Box>
    <Box display="flex" alignItems="center" sx={{ marginRight: 2, marginBottom: 1 }}>
      <StarIcon fontSize="small" sx={{ marginRight: 0.5 }} />
      <Typography variant="caption">
        総合ポイント: {((goodCount || 0) * 2) + ((bookshelfCount || 0) * 2)}pt
      </Typography>
    </Box>
    <Box display="flex" alignItems="center" sx={{ marginBottom: 1 }}>
      <Typography variant="caption" sx={{ marginRight: 0.5 }}>
        投稿日:
      </Typography>
      <Typography variant="caption">
        {postDate}
      </Typography>
    </Box>
  </Box>
));

export default Statistics;
