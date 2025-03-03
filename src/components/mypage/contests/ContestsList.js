import React from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  Divider, 
  Paper, 
  Chip,
  IconButton,
  Tooltip,
  Badge,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAPI } from '../../../hooks/useAPI';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DateRangeIcon from '@mui/icons-material/DateRange';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PersonIcon from '@mui/icons-material/Person';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';

const ContestsList = ({ contests = [], user }) => {
  const navigate = useNavigate();
  const { API_URL } = useAPI();

  const handleAddContest = () => {
    navigate('/contests/create');
  };

  const handleViewContest = (id) => {
    navigate(`/contests/${id}`);
  };
  
  // Format date in a more readable format (YYYY年MM月DD日)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };
  
  // Determine contest status based on dates
  const getContestStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) {
      return { label: "開催予定", color: "info" };
    } else if (now >= start && now <= end) {
      return { label: "応募受付中", color: "success" };
    } else {
      return { label: "終了", color: "default" };
    }
  };
  
  // Calculate days remaining or days passed
  const getDaysText = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) {
      const daysUntilStart = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
      return `開始まであと${daysUntilStart}日`;
    } else if (now >= start && now <= end) {
      const daysRemaining = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
      return `締切まであと${daysRemaining}日`;
    } else {
      const daysPassed = Math.ceil((now - end) / (1000 * 60 * 60 * 24));
      return `${daysPassed}日前に終了`;
    }
  };
  
  // Empty state component
  const EmptyContests = () => (
    <Paper 
      elevation={0} 
      variant="outlined"
      sx={{ 
        padding: 5, 
        textAlign: 'center',
        borderRadius: 2,
        backgroundColor: 'rgba(0,0,0,0.01)',
        borderStyle: 'dashed',
        mb: 4
      }}
    >
      <EmojiEventsIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2, opacity: 0.6 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        主催しているコンテストはありません
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
        あなたのコンテストを開催して、才能ある作家を募集しましょう。
        作品テーマを設定し、素晴らしい創作活動を促進できます。
      </Typography>
      <Button 
        variant="contained" 
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleAddContest}
        sx={{ 
          borderRadius: 8,
          px: 3,
          py: 1.2,
          boxShadow: 2,
          '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
          transition: 'all 0.2s'
        }}
      >
        コンテストを作成する
      </Button>
    </Paper>
  );

  return (
    <Box>
      {/* Header section */}
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold', 
              background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            主催コンテスト
          </Typography>
          <Typography variant="body1" color="text.secondary">
            あなたが開催しているコンテスト一覧です
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddContest}
          sx={{ 
            borderRadius: 8,
            px: 3,
            boxShadow: 2,
            '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
            transition: 'all 0.2s'
          }}
        >
          新規作成
        </Button>
      </Box>

      {/* Contest grid */}
      {contests.length > 0 ? (
        <Grid container spacing={3}>
          {contests.map((contest) => {
            const status = getContestStatus(contest.applicationStartDate, contest.applicationEndDate);
            const daysText = getDaysText(contest.applicationStartDate, contest.applicationEndDate);
            
            return (
              <Grid item xs={12} sm={6} md={4} key={contest._id}>
                <Card
                  elevation={3}
                  sx={{
                    position: 'relative',
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 8,
                    }
                  }}
                >
                  {/* Status badge */}
                  <Chip
                    label={status.label}
                    color={status.color}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      zIndex: 2,
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  />
                  
                  {/* Edit button for contest creator */}
                  {contest.creator === user._id && (
                    <Tooltip title="コンテストを編集する">
                      <IconButton
                        size="small"
                        color="primary"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          zIndex: 2,
                          bgcolor: 'white',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/contest-edit/${contest._id}`);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  {/* Image with overlay */}
                  <Box
                    sx={{
                      position: 'relative',
                      pt: '56.25%', // 16:9 aspect ratio
                      cursor: 'pointer',
                    }}
                    onClick={() => handleViewContest(contest._id)}
                  >
                    <CardMedia
                      component="img"
                      image={`${API_URL}${contest.iconImage}`}
                      alt={contest.title}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        }
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)',
                        padding: 2,
                        pt: 4,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: 'white',
                          fontWeight: 'bold',
                          textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {contest.title}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Content */}
                  <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                    {/* Days counter */}
                    <Chip
                      icon={<DateRangeIcon />}
                      label={daysText}
                      sx={{
                        mb: 2,
                        fontWeight: 'medium',
                        bgcolor: status.color === 'success' ? 'rgba(46, 125, 50, 0.1)' : 
                                 status.color === 'info' ? 'rgba(2, 136, 209, 0.1)' : 
                                 'rgba(0, 0, 0, 0.08)',
                        color: status.color === 'success' ? 'success.dark' : 
                               status.color === 'info' ? 'info.dark' : 
                               'text.secondary',
                      }}
                    />
                    
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        height: 60,
                        color: 'text.secondary'
                      }}
                    >
                      {contest.shortDescription}
                    </Typography>
                    
                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {contest.participants?.length || 0} 応募
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocalLibraryIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {contest.categories?.length || 0} カテゴリ
                        </Typography>
                      </Box>
                    </Stack>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <DateRangeIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                        応募期間
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {formatDate(contest.applicationStartDate)} 〜 {formatDate(contest.applicationEndDate)}
                    </Typography>
                  </CardContent>
                  
                  {/* Action button */}
                  <Button
                    variant="contained"
                    color="primary"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => handleViewContest(contest._id)}
                    sx={{
                      borderRadius: '0 0 12px 12px',
                      py: 1.2,
                      fontWeight: 'bold',
                      textTransform: 'none',
                      boxShadow: 'none',
                      '&:hover': {
                        boxShadow: 'none',
                        background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
                      }
                    }}
                  >
                    詳細を見る
                  </Button>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <EmptyContests />
      )}
      
      {contests.length > 0 && (
        <Box textAlign="center" sx={{ mt: 5, mb: 3 }}>
          <Button 
            variant="outlined" 
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddContest}
            sx={{ 
              borderRadius: 8,
              px: 4,
              py: 1.2,
              '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.08)' },
            }}
          >
            別のコンテストを作成する
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ContestsList;