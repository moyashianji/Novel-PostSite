import React, { memo } from 'react';
import { Typography, Box, Chip } from '@mui/material';

const Tags = memo(({ tags, handleTagClick }) => (
  <Box sx={{ marginTop: 2 }}>
    <Box display="flex" flexWrap="wrap" gap={1}>
      {tags && tags.length > 0 ? (
        tags.map((tag, index) => (
          <Chip
            key={index}
            label={tag}
            sx={{ marginRight: 0.5, marginBottom: 0.5 }}
            onClick={() => handleTagClick(tag)}
          />
        ))
      ) : (
        <Typography variant="body2" color="textSecondary">
          タグはありません
        </Typography>
      )}
    </Box>
  </Box>
));

export default Tags;
