import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Divider, 
  CircularProgress,
  Slide,
  Fade,
  useMediaQuery,
  useTheme,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import NovelContent from '../components/noveldetail/NovelContent';
import CommentSection from '../components/comment/CommentSection';
import AuthorInfo from '../components/noveldetail/AuthorInfo';
import SeriesSelector from '../components/noveldetail/SeriesSelector';
import { formatDate } from '../utils/dateUtils';

const NovelDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const contentRef = useRef(null);

  // 状態管理
  const [post, setPost] = useState(null);
  const [goodCount, setGoodCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [bookshelfCount, setBookshelfCount] = useState(0);
  const [postDate, setPostDate] = useState('');
  const [hasLiked, setHasLiked] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(50);
  const [isBookmarkMode, setIsBookmarkMode] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isInBookshelf, setIsInBookshelf] = useState(false);
  const [seriesPosts, setSeriesPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(id);
  const [seriesTitle, setSeriesTitle] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // スナックバーを閉じる
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // スナックバーを表示する関数
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${id}`);
        
        if (!response.ok) {
          throw new Error(`小説の取得に失敗しました。ステータス: ${response.status}`);
        }
        
        const data = await response.json();

        if (isMounted) {
          setPost(data);
          setGoodCount(data.goodCounter);
          setViewCount(data.viewCounter);
          setBookshelfCount(data.bookShelfCounter);
          setPostDate(formatDate(data.createdAt));

          // シリーズ情報の取得
          if (data.series) {
            try {
              const [seriesResponse, seriestitleResponse] = await Promise.all([
                fetch(`/api/series/${data.series}/posts`),
                fetch(`/api/series/${data.series}/title`)
              ]);

              if (seriesResponse.ok && seriestitleResponse.ok) {
                const seriesData = await seriesResponse.json();
                const seriesTitleData = await seriestitleResponse.json();
                setSeriesPosts(seriesData);
                setSeriesTitle(seriesTitleData);
              } else {
                console.error('シリーズ情報の取得に失敗しました');
              }
            } catch (seriesError) {
              console.error('シリーズデータ取得中にエラーが発生しました:', seriesError);
            }
          }

          // ビューカウントの更新
          await fetch(`/api/posts/${id}/view`, { method: 'POST' });

          // ユーザー認証状態の確認
          try {
            const [likeResponse, bookshelfResponse, followResponse] = await Promise.all([
              fetch(`/api/posts/${id}/isLiked`, { credentials: 'include' }),
              fetch(`/api/posts/${id}/isInBookshelf`, { credentials: 'include' }),
              fetch(`/api/users/${data.author._id}/is-following`, { credentials: 'include' })
            ]);

            const likeData = await likeResponse.json();
            const bookshelfData = await bookshelfResponse.json();
            const followData = await followResponse.json();

            setHasLiked(likeData.hasLiked);
            setIsInBookshelf(bookshelfData.isInBookshelf);
            setIsFollowing(followData.isFollowing);
          } catch (authError) {
            console.error('認証状態の取得に失敗しました:', authError);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('小説の取得に失敗しました:', error);
          setError(error.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPost();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (location.state?.scrollTo) {
      setTimeout(() => {
        window.scrollTo({
          top: location.state.scrollTo,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [location]);

  const handleGoodClick = useCallback(async () => {
    try {
      const response = await fetch(`/api/posts/${id}/good`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setGoodCount(data.goodCounter);
        setHasLiked(data.hasLiked);
        showSnackbar(data.hasLiked ? 'いいねしました！' : 'いいねを取り消しました');
      } else {
        const errorData = await response.json();
        showSnackbar(errorData.message || 'いいねに失敗しました。', 'error');
      }
    } catch (error) {
      console.error('いいね機能でエラーが発生しました:', error);
      showSnackbar('いいねに失敗しました。', 'error');
    }
  }, [id, hasLiked]);

  const handleBookshelfClick = useCallback(async () => {
    try {
      const response = await fetch(`/api/posts/${id}/bookshelf`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setBookshelfCount(data.bookShelfCounter);
        setIsInBookshelf(data.isInBookshelf);
        showSnackbar(data.isInBookshelf ? '本棚に追加しました！' : '本棚から削除しました');
      } else {
        const errorData = await response.json();
        showSnackbar(errorData.message || '本棚登録に失敗しました。', 'error');
      }
    } catch (error) {
      console.error('本棚登録でエラーが発生しました:', error);
      showSnackbar('本棚登録に失敗しました。', 'error');
    }
  }, [id, isInBookshelf]);

  const handleBookmarkClick = useCallback(() => {
    setIsBookmarkMode(!isBookmarkMode);
    if (!isBookmarkMode) {
      showSnackbar('しおりを設定するには、本文内の任意の場所をクリックしてください', 'info');
    }
  }, [isBookmarkMode]);

  const handleTextClick = useCallback(async (event) => {
    if (isBookmarkMode) {
      const bookmarkPosition = window.scrollY + event.clientY;
      
      try {
        const response = await fetch(`/api/me/bookmark`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            novelId: id,
            position: bookmarkPosition
          }),
        });

        if (response.ok) {
          showSnackbar('しおりを設定しました！');
        } else {
          showSnackbar('しおりの設定に失敗しました。', 'error');
        }
      } catch (error) {
        console.error('しおりの設定に失敗しました:', error);
        showSnackbar('しおりの設定に失敗しました。', 'error');
      } finally {
        setIsBookmarkMode(false);
      }
    }
  }, [id, isBookmarkMode]);

  const handleFollowToggle = useCallback(async () => {
    try {
      const url = isFollowing
        ? `/api/users/unfollow/${post.author._id}`
        : `/api/users/follow/${post.author._id}`;
      const method = isFollowing ? 'DELETE' : 'POST';

      const response = await fetch(url, {
        method,
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          showSnackbar('ログインが必要です', 'warning');
          navigate('/login');
          return;
        }
        throw new Error('フォロー状態の更新に失敗しました');
      }

      setIsFollowing(!isFollowing);
      showSnackbar(isFollowing ? 'フォローを解除しました' : '作者をフォローしました！');
    } catch (error) {
      console.error('フォロー処理中にエラーが発生しました:', error);
      showSnackbar('フォロー状態の更新に失敗しました', 'error');
    }
  }, [post, isFollowing, navigate]);

  const handleSeriesChange = useCallback((event) => {
    const newPostId = event.target.value;
    setSelectedPostId(newPostId);
    navigate(`/novel/${newPostId}`);
  }, [navigate]);

  const handleTagClick = useCallback((tag) => {
    navigate(`/search?mustInclude=${encodeURIComponent(tag)}&type=posts`);
  }, [navigate]);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh'
      }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          小説を読み込んでいます...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh',
        textAlign: 'center',
        p: 3
      }}>
        <Typography variant="h5" color="error" gutterBottom>
          エラーが発生しました
        </Typography>
        <Typography variant="body1" paragraph>
          {error}
        </Typography>
        <Typography variant="body2">
          ページを更新するか、しばらく経ってからもう一度お試しください。
        </Typography>
      </Box>
    );
  }

  if (!post) return null;

  return (
    <Fade in={!loading} timeout={500}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8, position: 'relative' }}>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity} 
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
        
        <Grid container spacing={4}>
          {/* メインコンテンツ（小説と章節選択） */}
          <Grid item xs={12} md={9}>
            <Slide direction="up" in={!loading} timeout={300}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: { xs: 2, sm: 3 }, 
                  borderRadius: 2,
                  background: theme.palette.background.paper,
                  mb: 4
                }}
                ref={contentRef}
              >
                <NovelContent
                  post={post}
                  viewCount={viewCount}
                  goodCount={goodCount}
                  bookshelfCount={bookshelfCount}
                  hasLiked={hasLiked}
                  isBookmarkMode={isBookmarkMode}
                  scrollSpeed={scrollSpeed}
                  setScrollSpeed={setScrollSpeed}
                  handleGoodClick={handleGoodClick}
                  handleBookshelfClick={handleBookshelfClick}
                  handleBookmarkClick={handleBookmarkClick}
                  handleTextClick={handleTextClick}
                  handleTagClick={handleTagClick}
                  isInBookshelf={isInBookshelf}
                  postDate={postDate} 
                />
              </Paper>
            </Slide>
            
            <Slide direction="up" in={!loading} timeout={400}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: { xs: 2, sm: 3 }, 
                  borderRadius: 2,
                  background: theme.palette.background.paper
                }}
              >
                <CommentSection postId={id} />
              </Paper>
            </Slide>
          </Grid>
          
          {/* サイドバー（作者情報とシリーズ） */}
          <Grid item xs={12} md={3}>
            <Box sx={{  top: 20 }}>
              <Slide direction="left" in={!loading} timeout={500}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: 2,
                    background: theme.palette.background.paper
                  }}
                >
                  <AuthorInfo
                    author={post.author}
                    isFollowing={isFollowing}
                    handleFollowToggle={handleFollowToggle}
                  />
                </Paper>
              </Slide>
              
              {post.series && seriesPosts.length > 0 && (
                <Slide direction="left" in={!loading} timeout={600}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      background: theme.palette.background.paper,
                      mb: { xs: 3, md: 0 }
                    }}
                  >
                    <SeriesSelector
                      seriesTitle={seriesTitle}
                      seriesPosts={seriesPosts}
                      selectedPostId={selectedPostId}
                      handleSeriesChange={handleSeriesChange}
                    />
                  </Paper>
                </Slide>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Fade>
  );
};

export default NovelDetail;