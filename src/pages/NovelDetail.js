import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Avatar, Grid, Paper,Chip } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import CommentSection from '../components/CommentSection';
import AutoScroll from '../components/AutoScroll'; 
import BookmarkButton from '../components/BookmarkButton';
import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck'; // 追加
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'; // 追加
import VisibilityIcon  from '@mui/icons-material/Visibility'; // 追加

import StarIcon from '@mui/icons-material/Star'; // 追加

const NovelDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [goodCount, setGoodCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [bookshelfCount, setBookshelfCount] = useState(0);

  const [hasLiked, setHasLiked] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(50); 
  const [isBookmarkMode, setIsBookmarkMode] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isInBookshelf, setIsInBookshelf] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/posts/${id}`);
        const data = await response.json();
        setPost(data);
        setGoodCount(data.goodCounter);
        setViewCount(data.viewCounter);
        setBookshelfCount(data.bookshelfCounter);  // 本棚登録数を設定

        await fetch(`http://localhost:5000/api/posts/${id}/view`, {
          method: 'POST',
        });

        const token = localStorage.getItem('token');
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
          // フォローステータスを確認
          const followResponse = await fetch(`http://localhost:5000/api/users/${data.author._id}/is-following`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          const followData = await followResponse.json();
          setIsFollowing(followData.isFollowing);

          // 本棚追加ステータスを確認

        }
      } catch (error) {
        console.error('Failed to fetch post:', error);
      }
    };

    fetchPost();
  }, [id]);

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
        setBookshelfCount(data.bookshelfCounter);
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
      const bookmarkPosition = window.scrollY + event.clientY; // ページ全体から見たY座標を取得
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('ログインが必要です');
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/users/bookmark`, {
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

  const totalPoints = (goodCount * 2) + (bookshelfCount * 2);
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
  <Typography variant="h6" sx={{ marginBottom: 1 }}>
  </Typography>
  <Box display="flex" flexWrap="wrap" gap={1}>
    {post.tags && post.tags.length > 0 ? (
      post.tags.map((tag, index) => (
        <Chip 
        key={index}
        label={tag}
        sx={{ marginRight: 0.5, marginBottom: 0.5 }}
          onClick={() => handleTagClick(tag)} // タグをクリックしたら検索ページに遷移

        />

      ))
    ) : (
      <Typography variant="body2" color="textSecondary">
        タグはありません

      </Typography>
    )}
  </Box>
</Box>
<Box sx={{ height: '16px' }} />  {/* 16px の高さで一行分の空白を追加 */}

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
    gap: 2,  // ボタン間のスペースを追加
    flexWrap: 'wrap'  // レスポンシブ対応で折り返し可能にする
  }}
>
  <Button
    variant="contained"
    color={hasLiked ? 'secondary' : 'primary'}
    startIcon={hasLiked ? <ThumbUpIcon /> : <ThumbUpOffAltIcon />}
    onClick={handleGoodClick}
    sx={{ 
      marginBottom: { xs: 2, md: 0 },  // 小さい画面ではボタンの間にスペースを追加
      minWidth: '150px',  // ボタンの最小幅を設定
      flex: '1',  // ボタンの幅を均等にする
      textAlign: 'center' // テキストを中央に揃える
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
      minWidth: '150px',  // ボタンの最小幅を設定
      flex: '1',  // ボタンの幅を均等にする
      textAlign: 'center'  // テキストを中央に揃える
    }}
  >
    {isInBookshelf ? '本棚から削除' : '本棚に追加'}
  </Button>
</Box>


          {/* コメントセクションを追加 */}
          <CommentSection postId={id} />
        </Grid>

        {/* 右サイドバー */}
        <Grid item xs={12} md={3}>
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
        </Grid>

      </Grid>
    </Container>
  );
};
export default NovelDetail;
