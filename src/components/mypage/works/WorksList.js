import React from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  Button, 
  Paper, 
  IconButton,
  Tooltip,
  Divider,
  Avatar,
  Badge
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import StarIcon from '@mui/icons-material/Star';
import EditIcon from '@mui/icons-material/Edit';
import DescriptionIcon from '@mui/icons-material/Description';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import TagIcon from '@mui/icons-material/Tag';
import WarningIcon from '@mui/icons-material/Warning';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import TranslateIcon from '@mui/icons-material/Translate';

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
  
  // Get word count display text
  const getWordCountText = (count) => {
    if (!count) return '短編';
    if (count < 5000) return '短編';
    if (count < 30000) return '中編';
    return '長編';
  };
  
  // Calculate points
  const calculatePoints = (work) => {
    return (work.goodCounter * 2) + (work.bookShelfCounter * 2);
  };
  
  // Format numbers for display
  const formatNumber = (num) => {
    if (!num) return 0;
    return num.toLocaleString();
  };

  if (works.length === 0) {
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
        <DescriptionIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.6 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>作品がありません</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
          あなたの創作小説を投稿して、読者と共有しましょう。
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/new-post')}
          startIcon={<LibraryAddIcon />}
          sx={{ borderRadius: 6, px: 3 }}
        >
          新しい作品を投稿
        </Button>
      </Paper>
    );
  }

  return (
    <Grid container spacing={3}>
      {works.map((work) => (
        <Grid item xs={12} sm={6} md={4} key={work._id}>
          <Card
            elevation={2}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              cursor: 'pointer',
              borderRadius: 2,
              overflow: 'hidden',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              }
            }}
            onClick={() => handleCardClick(`/novel/${work._id}`)}
          >
            {/* Card header with badges */}
            <Box sx={{ position: 'relative' }}>
              {/* Color bar at top */}
              <Box 
                sx={{ 
                  height: 6,
                  width: '100%', 
                  bgcolor: 'primary.main',
                }} 
              />
              
              {/* Badge indicators */}
              <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 1 }}>
                {work.isAdultContent && (
                  <Tooltip title="成人向けコンテンツ">
                    <Chip 
                      icon={<WarningIcon />} 
                      label="R-18" 
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(211, 47, 47, 0.1)', 
                        color: '#d32f2f',
                        border: '1px solid rgba(211, 47, 47, 0.3)',
                        '& .MuiChip-icon': { 
                          color: '#d32f2f',
                          fontSize: 16
                        }
                      }}
                    />
                  </Tooltip>
                )}
                
                {work.isAI && (
                  <Tooltip title="AI活用作品">
                    <Chip 
                      icon={<SmartToyIcon />} 
                      label="AI" 
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(25, 118, 210, 0.1)', 
                        color: 'primary.main',
                        border: '1px solid rgba(25, 118, 210, 0.3)',
                        '& .MuiChip-icon': { 
                          color: 'primary.main',
                          fontSize: 16
                        }
                      }}
                    />
                  </Tooltip>
                )}
                
                {work.isOriginal && (
                  <Tooltip title="オリジナル作品">
                    <Chip 
                      icon={<FormatQuoteIcon />} 
                      label="オリジナル" 
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(46, 125, 50, 0.1)', 
                        color: '#2e7d32',
                        border: '1px solid rgba(46, 125, 50, 0.3)',
                        '& .MuiChip-icon': { 
                          color: '#2e7d32',
                          fontSize: 16
                        }
                      }}
                    />
                  </Tooltip>
                )}
              </Box>
            </Box>
            
            <CardContent sx={{ pt: 2, pb: 0, px: 3, flexGrow: 1 }}>
              {/* Word count indicator */}
              <Box sx={{ mb: 1 }}>
                <Chip 
                  label={getWordCountText(work.wordCount)} 
                  size="small"
                  sx={{ 
                    bgcolor: 'rgba(0,0,0,0.06)', 
                    fontWeight: 'normal',
                    fontSize: '0.75rem'
                  }}
                />
                {work.wordCount && (
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    {work.wordCount.toLocaleString()}文字
                  </Typography>
                )}
              </Box>
              
              {/* Title */}
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold',
                  mb: 1,
                  lineHeight: 1.3,
                  minHeight: 50,
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {truncateText(work.title, 40)}
              </Typography>
              
              {/* Description */}
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  mb: 2,
                  minHeight: 80,
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 4,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.5
                }}
              >
                {truncateText(work.description, 120)}
              </Typography>
              
              {/* Tags */}
              {work.tags && work.tags.length > 0 && (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 0.7,
                    mb: 2,
                    minHeight: 32
                  }}
                >
                  {work.tags.slice(0, 3).map((tag, index) => (
                    <Chip
                      key={index}
                      icon={<TagIcon style={{ fontSize: 16 }} />}
                      label={tag}
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(0,0,0,0.04)', 
                        '& .MuiChip-label': { px: 1 },
                        '& .MuiChip-icon': { ml: 0.5 }
                      }}
                    />
                  ))}
                  {work.tags.length > 3 && (
                    <Chip
                      icon={<TagIcon style={{ fontSize: 16 }} />}
                      label={`+${work.tags.length - 3}`}
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(0,0,0,0.02)', 
                        '& .MuiChip-label': { px: 1 },
                        '& .MuiChip-icon': { ml: 0.5 }
                      }}
                    />
                  )}
                </Box>
              )}
            </CardContent>
            
            <Divider sx={{ mx: 3 }} />
            
            {/* Stats section */}
            <Box sx={{ px: 3, py: 1.5, bgcolor: 'rgba(0,0,0,0.01)' }}>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={3}>
                  <Tooltip title="閲覧数">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <VisibilityIcon sx={{ fontSize: 18, color: '#607d8b', mr: 0.5 }} />
                      <Typography variant="body2" fontWeight="medium">
                        {formatNumber(work.viewCounter)}
                      </Typography>
                    </Box>
                  </Tooltip>
                </Grid>
                
                <Grid item xs={3}>
                  <Tooltip title="いいね数">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FavoriteIcon sx={{ fontSize: 18, color: '#e91e63', mr: 0.5 }} />
                      <Typography variant="body2" fontWeight="medium">
                        {formatNumber(work.goodCounter)}
                      </Typography>
                    </Box>
                  </Tooltip>
                </Grid>
                
                <Grid item xs={3}>
                  <Tooltip title="本棚登録数">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BookmarkIcon sx={{ fontSize: 18, color: '#ff9800', mr: 0.5 }} />
                      <Typography variant="body2" fontWeight="medium">
                        {formatNumber(work.bookShelfCounter)}
                      </Typography>
                    </Box>
                  </Tooltip>
                </Grid>
                
                <Grid item xs={3}>
                  <Tooltip title="総合ポイント">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StarIcon sx={{ fontSize: 18, color: '#ffc107', mr: 0.5 }} />
                      <Typography variant="body2" fontWeight="medium">
                        {formatNumber(calculatePoints(work))}
                      </Typography>
                    </Box>
                  </Tooltip>
                </Grid>
              </Grid>
            </Box>
            
            {/* Edit button */}
            <Box sx={{ p: 2, pt: 0 }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<EditIcon />}
                onClick={(e) => handleEditClick(work._id, e)}
                sx={{ 
                  mt: 2,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'bold'
                }}
              >
                編集
              </Button>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default WorksList;