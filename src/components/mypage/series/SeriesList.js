import React from 'react';
import { Card, CardContent, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const SeriesList = ({ series = [] }) => {
  const navigate = useNavigate();

  if (series.length === 0) {
    return (
      <Box sx={{ padding: 2, width: '100%', textAlign: 'center' }}>
        <Typography>シリーズがありません</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {series.map((seriesItem) => (
        <Card key={seriesItem._id} sx={{ marginBottom: 2, width: '100%', cursor: 'pointer' }}>
          <CardContent>
            <Typography variant="h6">{seriesItem.title}</Typography>
            <Typography variant="body2" color="textSecondary">
              {seriesItem.description}
            </Typography>
            <Box display="flex" justifyContent="space-between" sx={{ marginTop: 1 }}>
              <Typography variant="caption">いいね数: {seriesItem.totalLikes}</Typography>
              <Typography variant="caption">本棚登録数: {seriesItem.totalBookshelf}</Typography>
              <Typography variant="caption">閲覧数: {seriesItem.totalViews}</Typography>
              <Typography variant="caption">総合ポイント: {seriesItem.totalPoints}pt</Typography>
            </Box>
            <Box sx={{ marginTop: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(`/mypage/series/${seriesItem._id}/edit`)}
              >
                シリーズを編集
              </Button>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default SeriesList;
