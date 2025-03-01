import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Chip, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const WorksList = ({ works = [] }) => {
  const navigate = useNavigate();

  const handleCardClick = (url) => {
    navigate(url);
  };

  const handleEditClick = (workId, e) => {
    e.stopPropagation();
    navigate(`/mypage/novel/${workId}/edit`);
  };

  const truncateText = (text, maxLength) => {
    return text?.length > maxLength ? `${text.slice(0, maxLength)}...` : text || '';
  };

  return (
    <Grid container spacing={2}>
      {works.length > 0 ? (
        works.map((work) => (
          <Grid item xs={12} sm={6} md={4} key={work._id}>
            <Card
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                cursor: 'pointer',
              }}
              onClick={() => handleCardClick(`/novel/${work._id}`)}
            >
              <CardContent>
                <Typography variant="subtitle1">
                  {truncateText(work.title, 30)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {truncateText(work.description, 200)}
                </Typography>
                <Box mt={2}>
                  {work.tags && work.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      sx={{ marginRight: 0.5, marginBottom: 0.5 }}
                    />
                  ))}
                </Box>
                <Box mt={2}>
                  <Typography variant="caption">閲覧数: {work.viewCounter}</Typography>
                  <Typography variant="caption" sx={{ marginLeft: 1 }}>いいね数: {work.goodCounter}</Typography>
                  <Typography variant="caption" sx={{ marginLeft: 1 }}>本棚登録数: {work.bookShelfCounter}</Typography>
                  <Typography variant="caption" sx={{ marginLeft: 1 }}>総合ポイント: {(work.goodCounter * 2) + (work.bookShelfCounter * 2)}pt</Typography>
                </Box>
              </CardContent>
              <Box sx={{ padding: 2, paddingTop: 0 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={(e) => handleEditClick(work._id, e)}
                >
                  編集
                </Button>
              </Box>
            </Card>
          </Grid>
        ))
      ) : (
        <Box sx={{ padding: 2, width: '100%', textAlign: 'center' }}>
          <Typography>作品がありません</Typography>
        </Box>
      )}
    </Grid>
  );
};

export default WorksList;
