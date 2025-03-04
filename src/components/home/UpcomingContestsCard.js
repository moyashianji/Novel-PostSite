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
  Skeleton,
  alpha,
  useTheme
} from '@mui/material';
import { 
  EmojiEvents as EmojiEventsIcon,
  ArrowForward as ArrowForwardIcon 
} from '@mui/icons-material';

const UpcomingContestsCard = ({ contests, handleViewContest, loading, navigate }) => {
  const theme = useTheme();
  const upcomingContests = contests
    .filter(contest => contest.status === '開催予定')
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);
    
  // 日付をフォーマットする安全な関数
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "日付未定";
      }
      return date.toLocaleDateString();
    } catch (error) {
      return "日付未定";
    }
  };
    
  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-2px)'
        },
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
      }}
    >
      <Box 
        sx={{ 
          p: 2.5, 
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* 装飾用の背景要素 */}
        <Box 
          sx={{ 
            position: 'absolute',
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: alpha('#fff', 0.1),
            zIndex: 0
          }}
        />
        
        <Box sx={{ display: 'flex', alignItems: 'center', zIndex: 1 }}>
          <EmojiEventsIcon 
            sx={{ 
              mr: 1.5, 
              fontSize: 28,
              filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))'
            }} 
          />
          <Typography variant="h6" fontWeight="bold">
            開催予定のコンテスト
          </Typography>
        </Box>
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
                      borderColor: alpha(theme.palette.divider, 0.7),
                    }
                  }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 0,
                      cursor: 'pointer',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.light, 0.05),
                        '& .contest-image': {
                          transform: 'scale(1.05)'
                        }
                      }
                    }}
                    onClick={() => handleViewContest(contest._id)}
                  >
                    <Box sx={{ position: 'relative', height: 130 }}>
                      <CardMedia
                        component="img"
                        height="130"
                        image={`${contest.iconImage}`}
                        alt={contest.title}
                        sx={{
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease',
                        }}
                        className="contest-image"
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.75))',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-end',
                          p: 2,
                        }}
                      >
                        <Chip
                          label="開催予定"
                          color="info"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            fontWeight: 'bold',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            backdropFilter: 'blur(4px)',
                            backgroundColor: alpha(theme.palette.info.main, 0.9),
                          }}
                        />
                        <Typography
                          variant="subtitle1"
                          sx={{
                            color: 'white',
                            fontWeight: 'bold',
                            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                            mb: 0.5,
                            fontSize: '1.1rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
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
                            fontWeight: 500,
                            fontSize: '0.8rem'
                          }}
                        >
                          開始: {formatDate(contest.applicationStartDate)}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Box>
              ))}
              <Box 
                sx={{ 
                  p: 3, 
                  display: 'flex', 
                  justifyContent: 'center',
                  borderTop: '1px solid',
                  borderColor: alpha(theme.palette.divider, 0.7),
                  background: alpha(theme.palette.background.default, 0.5)
                }}
              >
                <Button
                  variant="outlined"
                  color="primary"
                  size="medium"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/contests')}
                  sx={{ 
                    borderRadius: 6,
                    fontWeight: 'bold',
                    px: 3,
                    py: 1,
                    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
                    '&:hover': {
                      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    }
                  }}
                >
                  すべて見る
                </Button>
              </Box>
            </Stack>
          ) : (
            <Box sx={{ 
              p: 4, 
              textAlign: 'center',
              background: alpha(theme.palette.background.default, 0.5),
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.7)}`
            }}>
              <Typography variant="body1" color="textSecondary" sx={{ fontWeight: 500 }}>
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