import React from 'react';
import { Box, Button, Typography, Grid, Card, CardMedia, CardContent, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAPI } from '../../../hooks/useAPI';

const ContestsList = ({ contests = [], user }) => {
  const navigate = useNavigate();
  const { API_URL } = useAPI();

  const handleAddContest = () => {
    navigate('/contests/create');
  };

  const handleViewContest = (id) => {
    navigate(`/contests/${id}`);
  };

  return (
    <Box>
      <Box textAlign="center">
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddContest}
          sx={{ marginTop: 2, marginBottom: 5 }}
        >
          コンテストを追加
        </Button>
        <Divider sx={{ my: 2 }} />
      </Box>

      <Typography variant="h5" gutterBottom>
        自分が主催するコンテスト一覧
      </Typography>

      <Grid container spacing={3}>
        {contests.length > 0 ? (
          contests.map((contest) => (
            <Grid item xs={12} sm={6} md={4} key={contest._id}>
              <Card
                sx={{
                  position: 'relative',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                <CardMedia
                  component="img"
                  height="180"
                  image={`${API_URL}${contest.iconImage}`}
                  alt={contest.title}
                  sx={{
                    filter: 'brightness(0.8)',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleViewContest(contest._id)}
                />
                <CardContent
                  sx={{
                    padding: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                      wordBreak: 'break-word',
                    }}
                  >
                    {contest.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 'bold',
                      color: 'gray',
                    }}
                  >
                    応募期間: {new Date(contest.applicationStartDate).toLocaleDateString()} 〜{' '}
                    {new Date(contest.applicationEndDate).toLocaleDateString()}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: 'gray',
                    }}
                  >
                    {contest.shortDescription}
                  </Typography>
                </CardContent>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: 2,
                    background: 'linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent)',
                    color: 'white',
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => handleViewContest(contest._id)}
                  sx={{
                    borderRadius: 0,
                  }}
                >
                  詳細を見る
                </Button>
              </Card>
              
              {contest.creator === user._id && (
                <Button
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  onClick={() => navigate(`/contest-edit/${contest._id}`)}
                  sx={{
                    borderRadius: 0,
                  }}>
                  編集する
                </Button>
              )}
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="body1">主催しているコンテストはありません。</Typography>
          </Grid>
        )}
      </Grid>
      
      <Divider sx={{ my: 2 }} />
      
      <Box textAlign="center">
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddContest}
          sx={{ marginTop: 2, marginBottom: 5 }}
        >
          コンテストを追加
        </Button>
      </Box>
    </Box>
  );
};

export default ContestsList;
