import React from 'react';
import { 
  Paper, 
  Box, 
  Typography, 
  Stack, 
  Card, 
  CardMedia, 
  Chip, 
  Button, 
  Skeleton 
} from '@mui/material';
import { 
  EmojiEvents as EmojiEventsIcon,
  ArrowForward as ArrowForwardIcon 
} from '@mui/icons-material';

const UpcomingContestsCard = ({ contests, handleViewContest, loading, navigate }) => {
  const upcomingContests = contests
    .filter(contest => contest.status === '開催予定')
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);
    
  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 6,
        }
      }}
    >
      <Box 
        sx={{ 
          p: 2, 
          bgcolor: 'primary.dark',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <EmojiEventsIcon sx={{ mr: 1 }} />
        <Typography variant="subtitle1" fontWeight="bold">
          開催予定のコンテスト
        </Typography>
      </Box>
      
      <Box sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ p: 2 }}>
            {[1, 2, 3].map((_, idx) => (
              <Box key={idx} sx={{ mb: 2 }}>
                <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1, mb: 1 }} />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="60%" />
              </Box>
            ))}
          </Box>
        ) : (
          upcomingContests.length > 0 ? (
            <Stack>
              {upcomingContests.map((contest) => (
                <Box
                  key={contest._id}
                  sx={{
                    '&:not(:last-child)': {
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }
                  }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 0,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'rgba(0,0,0,0.03)',
                      }
                    }}
                    onClick={() => handleViewContest(contest._id)}
                  >
                    <Box sx={{ position: 'relative', height: 120 }}>
                      <CardMedia
                        component="img"
                        height="120"
                        image={`${contest.iconImage}`}
                        alt={contest.title}
                        sx={{
                          objectFit: 'cover',
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.7))',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-end',
                          p: 1.5,
                        }}
                      >
                        <Chip
                          label="開催予定"
                          color="info"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            fontWeight: 'bold',
                          }}
                        />
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: 'white',
                            fontWeight: 'bold',
                            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                            mb: 0.5,
                          }}
                        >
                          {contest.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'white',
                            opacity: 0.9,
                            textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                          }}
                        >
                          開始: {new Date(contest.applicationStartDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Box>
              ))}
              <Box 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  justifyContent: 'center',
                  borderTop: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/contests')}
                  sx={{ 
                    borderRadius: 4,
                    fontWeight: 'medium'
                  }}
                >
                  すべて見る
                </Button>
              </Box>
            </Stack>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                現在開催予定のコンテストはありません。
              </Typography>
            </Box>
          )
        )}
      </Box>
    </Paper>
  );
};

export default React.memo(UpcomingContestsCard);