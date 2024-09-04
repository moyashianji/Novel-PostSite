import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { Container, Typography, Box, Button, Avatar, Grid, Paper, Chip, Card, CardContent, FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import CommentSection from '../components/CommentSection';
import AutoScroll from '../components/AutoScroll'; 
import BookmarkButton from '../components/BookmarkButton';
import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck'; 
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'; 
import VisibilityIcon  from '@mui/icons-material/Visibility'; 
import StarIcon from '@mui/icons-material/Star'; 

const NovelDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [goodCount, setGoodCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [bookshelfCount, setBookshelfCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(50); 
  const [isBookmarkMode, setIsBookmarkMode] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isInBookshelf, setIsInBookshelf] = useState(false);
  const [seriesPosts, setSeriesPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(id);
  const [seriesTitle, setSeriesTitle] = useState([]);
    useEffect(() => {
      const fetchPost = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/posts/${id}`);
          
          const data = await response.json();
          setPost(data);
          setGoodCount(data.goodCounter);
          setViewCount(data.viewCounter);
          setBookshelfCount(data.bookShelfCounter); 

        // シリーズの投稿を取得

        // シリーズの投稿を取得
        if (data.series) {
          console.log('Series ID:', data.series);  // Series IDのデバッグメッセージ
        
          const seriesResponse = await fetch(`http://localhost:5000/api/series/${data.series}/posts`);
          const seriestitleResponse = await fetch(`http://localhost:5000/api/series/${data.series}/title`);

          console.log('Series API response status:', seriesResponse.status);  // レスポンスステータスのデバッグメッセージ
        
          if (seriesResponse.ok || seriestitleResponse.ok) {
            const seriesData = await seriesResponse.json();
            const seriesTitleData = await seriestitleResponse.json();
            setSeriesPosts(seriesData);
            setSeriesTitle(seriesTitleData);
            console.log('Series posts title:', seriesData);  // 取得したデータのデバッグメッセージ

          } else {
            const errorText = await seriesResponse.text();
            console.error('Failed to fetch series posts:', errorText);  // エラーメッセージのデバッグ
          }
        } else {
          console.log('No series found for this post');  // シリーズが見つからなかった場合のデバッグメッセージ
        }
        const token = localStorage.getItem('token');
    
          await fetch(`http://localhost:5000/api/posts/${id}/view`, {
            method: 'POST',
          });
    
          if (token) {
            const likeResponse = await fetch(`http://localhost:5000/api/posts/${id}/isLiked`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            const likeData = await likeResponse.json();
            setHasLiked(likeData.hasLiked);
    
            const bookshelfResponse = await fetch(`http://localhost:5000/api/posts/${id}/isInBookshelf`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            const bookshelfData = await bookshelfResponse.json();
            setIsInBookshelf(bookshelfData.isInBookshelf);
    
            const followResponse = await fetch(`http://localhost:5000/api/users/${data.author._id}/is-following`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            const followData = await followResponse.json();
            setIsFollowing(followData.isFollowing);
          }
        } catch (error) {
          console.error('Failed to fetch post:', error);
        }
      };
    
      fetchPost();
    }, [id]);

  useEffect(() => {
    if (location.state?.scrollTo) {
      setTimeout(() => {
        window.scrollTo(0, location.state.scrollTo);
      }, 100);
    }
  }, [location]);

  const handleGoodClick = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('ログインが必要です');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/posts/${id}/good`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGoodCount(data.goodCounter);
        setHasLiked(data.hasLiked);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'いいねに失敗しました。');
      }
    } catch (error) {
      console.error('Error toggling good:', error);
    }
  };

  const handleBookshelfClick = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('ログインが必要です');
        return;
      }
  
      const response = await fetch(`http://localhost:5000/api/posts/${id}/bookshelf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        setBookshelfCount(data.bookShelfCounter);
        setIsInBookshelf(data.isInBookshelf);
      } else {
        const errorData = await response.json();
        alert(errorData.message || '本棚登録に失敗しました。');
      }
    } catch (error) {
      console.error('Error toggling bookshelf status:', error);
    }
  };

  const handleBookmarkClick = () => {
    setIsBookmarkMode(!isBookmarkMode);
  };

  const handleTextClick = async (event) => {
    if (isBookmarkMode) {
      const bookmarkPosition = window.scrollY + event.clientY; 
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('ログインが必要です');
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/me/bookmark`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            novelId: id,
            position: bookmarkPosition,
          }),
        });

        if (response.ok) {
          alert('しおりを設定しました。');
        } else {
          alert('しおりの設定に失敗しました。');
        }
      } catch (error) {
        console.error('しおりの設定に失敗しました:', error);
        alert('しおりの設定に失敗しました。');
      } finally {
        setIsBookmarkMode(false);
      }
    }
  };

  const handleFollowToggle = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const url = isFollowing
        ? `http://localhost:5000/api/users/unfollow/${post.author._id}`
        : `http://localhost:5000/api/users/follow/${post.author._id}`;
      const method = isFollowing ? 'DELETE' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
      } else {
        console.error('Error toggling follow status:', await response.json());
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
    }
  };
  const handleSeriesChange = (event) => {
    const newPostId = event.target.value;
    setSelectedPostId(newPostId);
    navigate(`/novel/${newPostId}`);
  };


  const handleTagClick = (tag) => {
    navigate(`/search?query=${encodeURIComponent(tag)}`);
  };

  if (!post) return <div>Loading...</div>;

  return (
    <Container sx={{ marginTop: 4, position: 'relative' }}>
      <Grid container spacing={4}>
        
        {/* 作品内容 */}
        <Grid item xs={12} md={9}>
          <Typography variant="h4" gutterBottom>
            {post.title}
          </Typography>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            {post.description}
          </Typography>
          <Box display="flex" alignItems="center" mb={2} flexWrap="wrap">
            <Box display="flex" alignItems="center" sx={{ marginRight: 2, marginBottom: 1 }}>
              <Typography variant="caption" sx={{ marginRight: 0.5 }}>
                <VisibilityIcon fontSize="small" />
              </Typography>
              <Typography variant="caption">
                {viewCount} 閲覧
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" sx={{ marginRight: 2, marginBottom: 1 }}>
              <ThumbUpIcon fontSize="small" sx={{ marginRight: 0.5 }} />
              <Typography variant="caption">
                {goodCount || 0} いいね
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" sx={{ marginRight: 2, marginBottom: 1 }}>
              <LibraryBooksIcon fontSize="small" sx={{ marginRight: 0.5 }} />
              <Typography variant="caption">
                {bookshelfCount || 0} 本棚
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" sx={{ marginBottom: 1 }}>
              <StarIcon fontSize="small" sx={{ marginRight: 0.5 }} />
              <Typography variant="caption">
                総合ポイント: {((goodCount || 0) * 2) + ((bookshelfCount || 0) * 2)}pt
              </Typography>
            </Box>
          </Box>

          {/* 作品のタグを表示 */}
          <Box sx={{ marginTop: 2 }}>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {post.tags && post.tags.length > 0 ? (
                post.tags.map((tag, index) => (
                  <Chip 
                    key={index}
                    label={tag}
                    sx={{ marginRight: 0.5, marginBottom: 0.5 }}
                    onClick={() => handleTagClick(tag)} 
                  />
                ))
              ) : (
                <Typography variant="body2" color="textSecondary">
                  タグはありません
                </Typography>
              )}
            </Box>
          </Box>
          <Box sx={{ height: '16px' }} />  

          {/* 自動スクロール機能 */}
          <AutoScroll scrollSpeed={scrollSpeed} setScrollSpeed={setScrollSpeed} />

          <Box
            onClick={handleTextClick}
            sx={{
              position: 'relative',
              backgroundColor: isBookmarkMode ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
              padding: 2,
              cursor: isBookmarkMode ? 'pointer' : 'default',
            }}
          >
            <Typography variant="body1" paragraph>
              <span dangerouslySetInnerHTML={{ __html: post.content }} />
            </Typography>
          </Box>

          <Box
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 70,
              display: 'flex',
              alignItems: 'center',
              zIndex: 1000,
            }}
          >
            <BookmarkButton onClick={handleBookmarkClick} />
            {isBookmarkMode && (
              <Typography
                variant="body2"
                sx={{
                  marginLeft: 2,
                  backgroundColor: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
                }}
              >
                次読み始めたい文をクリックしてください
              </Typography>
            )}
          </Box>
          <Box 
            display="flex" 
            alignItems="center" 
            sx={{ 
              marginBottom: 4, 
              gap: 2, 
              flexWrap: 'wrap'  
            }}
          >
            <Button
              variant="contained"
              color={hasLiked ? 'secondary' : 'primary'}
              startIcon={hasLiked ? <ThumbUpIcon /> : <ThumbUpOffAltIcon />}
              onClick={handleGoodClick}
              sx={{ 
                marginBottom: { xs: 2, md: 0 },  
                minWidth: '150px',  
                flex: '1',  
                textAlign: 'center' 
              }}
            >
              {hasLiked ? 'いいねを解除' : 'いいね'}
            </Button>

            <Button
              variant="contained"
              color={isInBookshelf ? 'secondary' : 'primary'}
              startIcon={isInBookshelf ? <LibraryAddCheckIcon /> : <LibraryBooksIcon />}
              onClick={handleBookshelfClick}
              sx={{ 
                minWidth: '150px',  
                flex: '1',  
                textAlign: 'center'  
              }}
            >
              {isInBookshelf ? '本棚から削除' : '本棚に追加'}
            </Button>
          </Box>

          <CommentSection postId={id} />
        </Grid>

        <Grid item xs={12} md={3}>
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
    <Paper 
      elevation={3} 
      sx={{ 
        padding: 2, 
        textAlign: 'center', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <RouterLink to={`/user/${post.author._id}`}>
        <Avatar 
          src={`http://localhost:5000${post.author.icon}`} 
          alt={post.author.nickname} 
          sx={{ width: 100, height: 100, marginBottom: 2 }}
        />
      </RouterLink>
      <Typography variant="h6">{post.author.nickname}</Typography>
      <Button
        variant={isFollowing ? 'contained' : 'outlined'}
        color="primary"
        onClick={handleFollowToggle}
        sx={{ mt: 2 }}
      >
        {isFollowing ? 'フォロー解除' : 'フォロー'}
      </Button>
    </Paper>
  </Box>
  
  {post.series && seriesPosts && seriesPosts.length > 0 && (
            <Box sx={{ mt: 4 }}>
<Typography 
  variant="h6" 
  gutterBottom 
  sx={{ 
    wordBreak: 'break-word', 
    whiteSpace: 'pre-wrap' 
  }}
>
 {seriesTitle.title}
</Typography>
              <FormControl fullWidth>
                <InputLabel>シリーズの投稿を選択</InputLabel>
                <Select
                  value={selectedPostId}
                  onChange={handleSeriesChange}
                  label="シリーズの投稿を選択"
                >
                  {seriesPosts.map((postItem) => (
                    <MenuItem key={postItem._id} value={postItem._id}>
                      {`${postItem.episodeNumber}: ${postItem.title}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

</Grid>
      </Grid>
    </Container>
  );
};

export default NovelDetail;
