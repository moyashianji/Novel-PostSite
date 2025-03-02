import React from 'react';
import { Grid, Box, Button, CircularProgress } from '@mui/material';

/**
 * フォームのプレビューと送信ボタン
 */
const FormActions = React.memo(({ handlePreview, handleSubmit, loading }) => {
  return (
    <>
      {/* プレビューボタン */}
      <Grid item xs={12}>
        <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={handlePreview}
            sx={{ mt: 2 }}
          >
            プレビュー
          </Button>
        </Box>
      </Grid>

      {/* 送信ボタン */}
      <Grid item xs={12}>
        <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : 'コンテスト作成'}
          </Button>
        </Box>
      </Grid>
    </>
  );
});

export default FormActions;
