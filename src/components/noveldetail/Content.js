import React, { memo } from 'react';
import { Typography, Box } from '@mui/material';

const Content = memo(({ content, isBookmarkMode, handleTextClick }) => (
  <Box
    onClick={handleTextClick}
    sx={{
      position: 'relative',
      backgroundColor: isBookmarkMode ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
      padding: 2,
      cursor: isBookmarkMode ? 'pointer' : 'default',
    }}
  >
    <Typography variant="body1" paragraph>
      <span dangerouslySetInnerHTML={{ __html: content }} />
    </Typography>
  </Box>
));

export default Content;
