import React from 'react';
import { Grid, Typography, Paper } from '@mui/material';
import CustomEditor from '../../wysiwyg/CustomEditor';

/**
 * 詳細説明（リッチテキストエディタ）コンポーネント
 */
const DetailedDescription = React.memo(({ description, handleDescriptionChange }) => {
  return (
    <Grid item xs={12}>
      <Typography variant="h6" sx={{ mb: 1, color: '#555' }}>
        詳細説明 <Typography component="span" color="error">※</Typography>
      </Typography>
      <Typography variant="body2" sx={{ mb: 1, color: '#555' }}>
        （コンテスト概要、募集ジャンル、賞、賞金等、応募資格、応募方法、スケジュール、選考方法、規約など必要な情報を詳細に記載してください）
      </Typography>
      <Paper variant="outlined" sx={{ padding: 2, backgroundColor: '#fff' }}>
        <CustomEditor value={description} onChange={handleDescriptionChange} />
      </Paper>
    </Grid>
  );
});

export default DetailedDescription;
