import React from 'react';
import { Grid, Typography, Button, Box } from '@mui/material';

/**
 * 画像アップロードコンポーネント
 */
const ImageSection = React.memo(({ iconPreview, headerPreview, handleImageUpload }) => {
  return (
    <Grid item xs={12}>
      <Typography variant="h6" sx={{ mb: 1, color: '#555' }}>
        コンテスト画像設定
      </Typography>
      <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
        <Grid container spacing={2}>
          {/* アイコン画像 */}
          <Grid item xs={12} sm={6}>
            <Button variant="contained" component="label">
              アイコン画像をアップロード
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleImageUpload(e, 'icon')}
              />
            </Button>
            {iconPreview && (
              <Box mt={2}>
                <img
                  src={iconPreview}
                  alt="アイコン画像プレビュー"
                  style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }}
                />
              </Box>
            )}
          </Grid>
          
          {/* ヘッダー画像 */}
          <Grid item xs={12} sm={6}>
            <Button variant="contained" component="label">
              ヘッダー画像をアップロード
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleImageUpload(e, 'header')}
              />
            </Button>
            {headerPreview && (
              <Box mt={2}>
                <img
                  src={headerPreview}
                  alt="ヘッダー画像プレビュー"
                  style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }}
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    </Grid>
  );
});

export default ImageSection;
