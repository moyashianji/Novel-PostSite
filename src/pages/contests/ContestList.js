import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Chip, 
  Tab, 
  Button, 
  CardMedia, 
  Container,
  Divider,
  Stack,
  useTheme,
  Avatar,
  CircularProgress,
  Paper,
  IconButton,
  Fade
} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { 
  EmojiEvents as TrophyIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon,
  ArrowForward as ArrowForwardIcon,
  AccessTime as TimeIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const ContestList = () => {
  const [contests, setContests] = useState([]);
  const [tabValue, setTabValue] = useState('募集中');
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContests = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/contests');
        const data = await response.json();
        setContests(data);
      } catch (error) {
        console.error('Error fetching contests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleContestClick = (contestId) => {
    navigate(`/contests/${contestId}`);
  };

  const filteredContests = contests.filter(contest => contest.status === tabValue);

  // タブのカラースキーマを取得する関数
  const getTabColorScheme = (status) => {
    switch (status) {
      case '募集中':
        return {
          bgcolor: theme.palette.success.main,
          lightBg: theme.palette.success.light,
          icon: <TrophyIcon />
        };
      case '開催予定':
        return {
          bgcolor: theme.palette.info.main,
          lightBg: theme.palette.info.light,
          icon: <ScheduleIcon />
        };
      case '募集一時停止中':
        return {
          bgcolor: theme.palette.warning.main,
          lightBg: theme.palette.warning.light,
          icon: <InfoIcon />
        };
      case '募集終了':
        return {
          bgcolor: theme.palette.grey[600],
          lightBg: theme.palette.grey[200],
          icon: <TimeIcon />
        };
      default:
        return {
          bgcolor: theme.palette.primary.main,
          lightBg: theme.palette.primary.light,
          icon: <TrophyIcon />
        };
    }
  };

  // ステータスに応じたチップを表示
  const StatusChip = ({ status }) => {
    const colorScheme = {
      '募集中': { color: 'success', icon: <TrophyIcon fontSize="small" /> },
      '開催予定': { color: 'info', icon: <ScheduleIcon fontSize="small" /> },
      '募集一時停止中': { color: 'warning', icon: <InfoIcon fontSize="small" /> },
      '募集終了': { color: 'default', icon: <TimeIcon fontSize="small" /> }
    }[status] || { color: 'primary', icon: null };

    return (
      <Chip
        icon={colorScheme.icon}
        label={status}
        color={colorScheme.color}
        size="small"
        sx={{ 
          fontWeight: 'bold',
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 1,
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      />
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      {/* ヘッダー */}
      <Box
        sx={{
          mb: 5,
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 800,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            pb: 1
          }}
        >
          コンテスト一覧
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}
        >
          あなたの創作作品を披露するチャンス！様々なジャンルのコンテストに参加しよう
        </Typography>
        <Divider sx={{ mb: 4 }} />
      </Box>

      {/* タブ */}
      <TabContext value={tabValue}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <TabList 
            onChange={handleTabChange} 
            variant="fullWidth" 
            aria-label="contest status tabs"
            sx={{ 
              '& .MuiTabs-indicator': { 
                height: 3,
                borderRadius: '3px 3px 0 0' 
              },
              '& .MuiTab-root': { 
                fontWeight: 'bold',
                fontSize: '1rem',
                minHeight: 64
              }
            }}
          >
            {['募集中', '開催予定', '募集一時停止中', '募集終了'].map((status) => {
              const { icon } = getTabColorScheme(status);
              return (
                <Tab 
                  key={status}
                  label={status} 
                  value={status} 
                  icon={icon} 
                  iconPosition="start"
                />
              );
            })}
          </TabList>
        </Box>

        {['募集中', '開催予定', '募集一時停止中', '募集終了'].map((status) => (
          <TabPanel key={status} value={status} sx={{ px: 0 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress size={60} />
              </Box>
            ) : filteredContests.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 5,
                  textAlign: 'center',
                  bgcolor: 'rgba(0,0,0,0.02)',
                  borderRadius: 4,
                  border: '1px dashed',
                  borderColor: 'divider'
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {status}のコンテストはありません
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  また後でチェックしてください。新しいコンテストは随時追加されます。
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {filteredContests.map((contest) => (
                  <Grid item xs={12} sm={6} md={4} key={contest._id}>
                    <Fade in={true} timeout={500}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: 3,
                          overflow: 'hidden',
                          transition: 'transform 0.3s, box-shadow 0.3s',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
                          }
                        }}
                      >
                        <Box sx={{ position: 'relative' }}>
                          <StatusChip status={contest.status} />
                          <CardMedia
                            component="img"
                            height="200"
                            image={`${contest.iconImage}`}
                            alt={contest.title}
                            sx={{ 
                              position: 'relative',
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6))',
                              }
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              width: '100%',
                              p: 2,
                              zIndex: 1
                            }}
                          >
                            <Typography
                              variant="h6"
                              component="h2"
                              sx={{
                                color: 'white',
                                fontWeight: 'bold',
                                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                mb: 0.5
                              }}
                            >
                              {contest.title}
                            </Typography>
                          </Box>
                          <IconButton
                            sx={{
                              position: 'absolute',
                              top: 16,
                              left: 16,
                              bgcolor: 'rgba(255,255,255,0.8)',
                              '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.95)',
                              }
                            }}
                            aria-label="bookmark contest"
                          >
                            <BookmarkBorderIcon />
                          </IconButton>
                        </Box>

                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                          <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <TimeIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {new Date(contest.applicationStartDate).toLocaleDateString()} 〜 {new Date(contest.applicationEndDate).toLocaleDateString()}
                              </Typography>
                            </Box>
                            
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                height: 60
                              }}
                            >
                              {contest.shortDescription}
                            </Typography>
                          </Stack>
                        </CardContent>

                        <Button
                          variant="contained"
                          color={getTabColorScheme(contest.status).color || 'primary'}
                          onClick={() => handleContestClick(contest._id)}
                          endIcon={<ArrowForwardIcon />}
                          fullWidth
                          sx={{
                            py: 1.5,
                            fontWeight: 'bold',
                            borderRadius: '0 0 12px 12px',
                          }}
                        >
                          詳細を見る
                        </Button>
                      </Card>
                    </Fade>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>
        ))}
      </TabContext>
    </Container>
  );
};

export default ContestList;