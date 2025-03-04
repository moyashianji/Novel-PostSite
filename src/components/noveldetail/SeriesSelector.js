
// SeriesSelector.js
import React, { memo } from 'react';
import { Typography, Box, FormControl, Select, MenuItem, InputLabel, Paper, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import BookmarksIcon from '@mui/icons-material/Bookmarks';

const SeriesContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: 16,
  boxShadow: theme.shadows[1],
  border: '1px solid',
  borderColor: theme.palette.divider,
  background: 'linear-gradient(to right, #f8f9fa, #ffffff)',
}));

const SeriesTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.text.primary,
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  marginTop: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const SeriesSelector = memo(({ seriesTitle, seriesPosts, selectedPostId, handleSeriesChange }) => (
  <SeriesContainer elevation={0}>
    <SeriesTitle variant="h6">
      <BookmarksIcon sx={{ mr: 1, color: 'primary.main' }} />
      {seriesTitle.title}
      <Chip 
        label={`全 ${seriesPosts.length} 話`} 
        size="small" 
        color="primary" 
        variant="outlined"
        sx={{ ml: 2, fontWeight: 500 }}
      />
    </SeriesTitle>
    
    <StyledFormControl fullWidth>
      <InputLabel id="series-select-label">シリーズの投稿を選択</InputLabel>
      <Select
        labelId="series-select-label"
        id="series-select"
        value={selectedPostId}
        onChange={handleSeriesChange}
        label="シリーズの投稿を選択"
      >
        {seriesPosts.map((postItem) => (
          <MenuItem key={postItem._id} value={postItem._id}>
            {`${postItem.episodeNumber || '番外編'}: ${postItem.title}`}
          </MenuItem>
        ))}
      </Select>
    </StyledFormControl>
  </SeriesContainer>
));

export default SeriesSelector;