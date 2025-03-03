import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Card, CardContent, Container, Skeleton, 
  Divider, Chip, LinearProgress, Alert, Paper, Grid, 
  Avatar, Button, IconButton, Breadcrumbs
} from '@mui/material';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';
import BookIcon from '@mui/icons-material/Book';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import WarningIcon from '@mui/icons-material/Warning';

// スタイル付きコンポーネント
const EpisodeCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: 8,
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[3]
  },
  position: 'relative',
  overflow: 'visible'
}));

const EpisodeNumber = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: -16,
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  width: 32,
  height: 32,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  zIndex: 1
}));

const SeriesInfoCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  borderRadius: 12,
  boxShadow: theme.shadows[2],
  backgroundImage: 'linear-gradient(to right, rgba(245,247,250,1) 0%, rgba(230,235,245,1) 100%)'
}));

const WorksInSeries = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [works, setWorks] = useState([]);
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching data for series ID: ${id}`);
        const response = await fetch(`${API_URL}/api/series/${id}/works`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        // APIからの応答が新しい形式（series, worksオブジェクト）か従来の形式（配列）かを確認
        if (data.series && Array.isArray(data.works)) {
          // 新しい形式
          setSeries(data.series);
          setWorks(data.works);
        } else if (Array.isArray(data)) {
          // 従来の形式（配列）
          setWorks(data);
          // シリーズ情報を別途取得
          try {
            const seriesResponse = await fetch(`${API_URL}/api/series/${id}`);
            if (seriesResponse.ok) {
              const seriesData = await seriesResponse.json();
              setSeries(seriesData);
            }
          } catch (seriesError) {
            console.error('Error fetching series info:', seriesError);
          }
        } else {
          throw new Error('Unexpected API response format');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, API_URL]);

  // 進行状況バーの計算
  const calculateProgress = () => {
    if (!works || works.length === 0) return 0;
    
    const totalEpisodes = works.length > 0 
      ? Math.max(...works.map(work => work.episodeNumber || 0)) 
      : 0;
      
    return totalEpisodes > 0 ? (works.length / totalEpisodes) * 100 : 100;
  };

  // 作品を公開日時で並べ替え（新しい順）
  const sortedWorks = works && works.length 
    ? [...works].sort((a, b) => a.episodeNumber - b.episodeNumber) 
    : [];

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 4, borderRadius: 2 }} />
        <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
        {[1, 2, 3].map(i => (
          <Skeleton key={i} variant="rectangular" height={120} sx={{ mb: 2, borderRadius: 1 }} />
        ))}
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          エラーが発生しました: {error}
        </Alert>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          戻る
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* パンくずリスト */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          ホーム
        </Link>
        <Link to="/search?type=series" style={{ display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}>
          <BookIcon sx={{ mr: 0.5 }} fontSize="small" />
          シリーズ一覧
        </Link>
        <Typography color="text.primary">
          {series?.title || 'シリーズ詳細'}
        </Typography>
      </Breadcrumbs>

      {/* シリーズ情報 */}
      {series && (
        <SeriesInfoCard>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mr: 2 }}>
                  {series.title}
                </Typography>
                {series.isAdultContent && (
                  <Chip 
                    icon={<WarningIcon />} 
                    label="R18" 
                    color="error" 
                    size="small" 
                  />
                )}
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {series.author && (
                  <>
                    <PersonIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                    <Link to={`/user/${series.author._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {series.author.nickname || '不明な作者'}
                      </Typography>
                    </Link>
                  </>
                )}
                
                {series.createdAt && (
                  <>
                    <Box sx={{ mx: 2, color: 'text.secondary' }}>|</Box>
                    <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(series.createdAt).toLocaleDateString('ja-JP')}に投稿
                    </Typography>
                  </>
                )}
              </Box>
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                {series.description}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 1 }}>
                {series.tags?.map((tag, i) => (
                  <Chip 
                    key={i}
                    label={tag}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                    color="primary"
                    variant="outlined"
                    onClick={() => navigate(`/search?mustInclude=${encodeURIComponent(tag)}&type=series`)}
                  />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  <BookIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  作品情報
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" sx={{ mb: 1 }}>
                  全{works.length}話
                </Typography>
                

              </Box>
            </Grid>
          </Grid>
        </SeriesInfoCard>
      )}

      {/* 作品一覧 */}
      <Box sx={{ position: 'relative', ml: 2 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <BookIcon sx={{ mr: 1 }} />
          作品一覧（{works.length}話）
        </Typography>
        
        {works.length > 0 ? (
          sortedWorks.map((work) => (
            <EpisodeCard key={work._id} elevation={1}>
              <EpisodeNumber>
                {work.episodeNumber || '?'}
              </EpisodeNumber>
              
              <CardContent sx={{ pl: 3 }}>
                <Link to={`/novel/${work._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={10}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {work.title}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {work.description}
                      </Typography>
                      
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        {work.createdAt && new Date(work.createdAt).toLocaleDateString('ja-JP')} • {work.wordCount ? `${work.wordCount.toLocaleString()} 文字` : ''}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={2} sx={{ textAlign: 'right' }}>
                      <IconButton color="primary" size="small">
                        <ArrowForwardIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Link>
              </CardContent>
            </EpisodeCard>
          ))
        ) : (
          <Alert severity="info">
            このシリーズにはまだ作品がありません。
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default WorksInSeries;