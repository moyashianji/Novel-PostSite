import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Button, 
  Grid, 
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StarIcon from '@mui/icons-material/Star';
import EditIcon from '@mui/icons-material/Edit';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const SeriesList = ({ series = [] }) => {
  const navigate = useNavigate();

  // Handler for clicking the card (navigate to series detail)
  const handleSeriesClick = (seriesId) => {
    navigate(`/series/${seriesId}/works`);
  };

  // Handler for edit button (navigate to edit page)
  const handleEditClick = (e, seriesId) => {
    e.stopPropagation(); // Prevent card click event
    navigate(`/mypage/series/${seriesId}/edit`);
  };

  if (series.length === 0) {
    return (
      <Paper 
        elevation={0} 
        variant="outlined"
        sx={{ 
          padding: 4, 
          width: '100%', 
          textAlign: 'center',
          borderRadius: 2,
          backgroundColor: 'rgba(0,0,0,0.01)',
          borderStyle: 'dashed'
        }}
      >
        <AutoStoriesIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.6 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>シリーズがありません</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
          シリーズを作成して、関連する小説をまとめてみましょう。読者がシリーズを見つけやすくなります。
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/mypage/series/new')}
          startIcon={<AutoStoriesIcon />}
          sx={{ borderRadius: 6, px: 3 }}
        >
          新しいシリーズを作成
        </Button>
      </Paper>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={2}>
        {series.map((seriesItem) => (
          <Grid item xs={12} key={seriesItem._id}>
            <Card 
              elevation={2}
              sx={{ 
                width: '100%', 
                cursor: 'pointer',
                borderRadius: 2,
                overflow: 'hidden',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                  '& .series-arrow': {
                    opacity: 1,
                    transform: 'translateX(0)'
                  }
                }
              }}
              onClick={() => handleSeriesClick(seriesItem._id)}
            >
              <Box sx={{ 
                height: 8, 
                width: '100%', 
                backgroundColor: 'primary.main',
                opacity: 0.7
              }} />
              
              <CardContent sx={{ p: 0 }}>
                <Grid container>
                  {/* Left side: Series info */}
                  <Grid item xs={12} md={8}>
                    <Box sx={{ p: 3 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <AutoStoriesIcon sx={{ mr: 1, color: 'primary.main', opacity: 0.8 }} />
                          {seriesItem.title}
                        </Typography>
                        
                        {/* Edit button */}
                        <Tooltip title="シリーズを編集">
                          <IconButton 
                            color="primary" 
                            size="small"
                            onClick={(e) => handleEditClick(e, seriesItem._id)}
                            sx={{ 
                              ml: 1,
                              bgcolor: 'rgba(25, 118, 210, 0.1)',
                              '&:hover': { 
                                bgcolor: 'rgba(25, 118, 210, 0.2)',
                              }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      
                      {/* Description with fixed height and ellipsis for overflow */}
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          mt: 1.5, 
                          mb: 2,
                          height: 60,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: '20px'
                        }}
                      >
                        {seriesItem.description}
                      </Typography>
                      
                      {/* Series episode count chip */}
                      <Chip 
                        size="small" 
                        label={`${seriesItem.episodes || 0} 話`}
                        sx={{ 
                          fontWeight: 'bold',
                          bgcolor: 'rgba(25, 118, 210, 0.1)',
                          color: 'primary.main'
                        }} 
                      />
                    </Box>
                  </Grid>
                  
                  {/* Right side: Stats */}
                  <Grid item xs={12} md={4}>
                    <Box 
                      sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        bgcolor: 'rgba(0,0,0,0.02)',
                        p: 3,
                        position: 'relative'
                      }}
                    >
                      {/* Arrow indicator for clickable card */}
                      <ArrowForwardIosIcon 
                        className="series-arrow"
                        sx={{ 
                          position: 'absolute',
                          right: 16,
                          top: '50%',
                          transform: 'translateY(-50%) translateX(10px)',
                          opacity: 0,
                          transition: 'all 0.3s ease',
                          color: 'primary.main'
                        }} 
                      />
                      
                      <Grid container spacing={1.5}>
                        {/* Likes */}
                        <Grid item xs={6}>
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center'
                            }}
                          >
                            <FavoriteIcon sx={{ color: '#e91e63', mr: 1, fontSize: 20 }} />
                            <Box>
                              <Typography variant="h6" sx={{ lineHeight: 1, fontWeight: 'bold' }}>
                                {seriesItem.totalLikes?.toLocaleString() || 0}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                いいね
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        
                        {/* Bookmarks */}
                        <Grid item xs={6}>
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center'
                            }}
                          >
                            <BookmarkIcon sx={{ color: '#ff9800', mr: 1, fontSize: 20 }} />
                            <Box>
                              <Typography variant="h6" sx={{ lineHeight: 1, fontWeight: 'bold' }}>
                                {seriesItem.totalBookshelf?.toLocaleString() || 0}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                本棚
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        
                        {/* Views */}
                        <Grid item xs={6}>
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center'
                            }}
                          >
                            <VisibilityIcon sx={{ color: '#3f51b5', mr: 1, fontSize: 20 }} />
                            <Box>
                              <Typography variant="h6" sx={{ lineHeight: 1, fontWeight: 'bold' }}>
                                {seriesItem.totalViews?.toLocaleString() || 0}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                閲覧数
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        
                        {/* Points */}
                        <Grid item xs={6}>
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center'
                            }}
                          >
                            <StarIcon sx={{ color: '#ffc107', mr: 1, fontSize: 20 }} />
                            <Box>
                              <Typography variant="h6" sx={{ lineHeight: 1, fontWeight: 'bold' }}>
                                {seriesItem.totalPoints?.toLocaleString() || 0}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ポイント
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SeriesList;