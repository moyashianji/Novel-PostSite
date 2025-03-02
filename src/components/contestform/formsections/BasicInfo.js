import React from 'react';
import { Grid, Typography, TextField, Box } from '@mui/material';

/**
 * タイトルと短い概要を入力するコンポーネント
 */
const BasicInfo = React.memo(({ 
  title, 
  handleTitleChange, 
  shortDescription, 
  handleShortDescriptionChange, 
  characterCountDisplay 
}) => {
  return (
    <>
      {/* タイトル入力 */}
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ mb: 1, color: '#555' }}>
          コンテスト基本情報<Typography component="span" color="error"> ※</Typography>
        </Typography>
        <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
          <Box display="flex" alignItems="center">
            <TextField
              label="コンテストタイトル"
              variant="outlined"
              fullWidth
              value={title}
              onChange={handleTitleChange}
              required
              inputProps={{ maxLength: 50 }}
            />
            <Typography variant="body2" color="error" ml={2}>
              ※
            </Typography>
          </Box>
          {characterCountDisplay(title.length, 50)}
        </Box>
      </Grid>

      {/* 短い概要入力 */}
      <Grid item xs={12}>
        <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
          <Box display="flex" alignItems="center">
            <TextField
              label="短い概要（50字以内）"
              variant="outlined"
              fullWidth
              value={shortDescription}
              onChange={handleShortDescriptionChange}
              required
              inputProps={{ maxLength: 50 }}
            />
            <Typography variant="body2" color="error" ml={2}>
              ※
            </Typography>
          </Box>
          {characterCountDisplay(shortDescription.length, 50)}
        </Box>
      </Grid>
    </>
  );
});

export default BasicInfo;
