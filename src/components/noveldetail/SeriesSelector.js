import React, { memo } from 'react';
import { Typography, Box, FormControl, Select, MenuItem, InputLabel } from '@mui/material';

const SeriesSelector = memo(({ seriesTitle, seriesPosts, selectedPostId, handleSeriesChange }) => (
  <Box sx={{ mt: 4 }}>
    <Typography
      variant="h6"
      gutterBottom
      sx={{
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap'
      }}
    >
      {seriesTitle.title}
    </Typography>
    <FormControl fullWidth>
      <InputLabel>シリーズの投稿を選択</InputLabel>
      <Select
        value={selectedPostId}
        onChange={handleSeriesChange}
        label="シリーズの投稿を選択"
      >
        {seriesPosts.map((postItem) => (
          <MenuItem key={postItem._id} value={postItem._id}>
            {`${postItem.episodeNumber}: ${postItem.title}`}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </Box>
));

export default SeriesSelector;
