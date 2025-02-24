import React, { useState, useEffect, memo, useCallback } from 'react';
import { useParams, Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { Container, Typography, Box, Button, Avatar, Grid, Paper, Chip, Card, CardContent, FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import CommentSection from '../components/CommentSection';
import AutoScroll from '../components/AutoScroll';
import BookmarkButton from '../components/BookmarkButton';
import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StarIcon from '@mui/icons-material/Star';

const NovelDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

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


  useEffect(() => {
    let isMounted = true; // コンポーネントがマウントされているかどうかを追跡

    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${id}`);
        const data = await response.json();

        if (isMounted) {
            setPost(data);
            setGoodCount(data.goodCounter);
            setViewCount(data.viewCounter);
            setBookshelfCount(data.bookShelfCounter);
            setPostDate(formatDate(data.createdAt));

          // シリーズの投稿を取得
          if (data.series) {
            console.log('Series ID:', data.series);

            const seriesResponse = await fetch(`/api/series/${data.series}/posts`);
            const seriestitleResponse = await fetch(`/api/series/${data.series}/title`);

            if (seriesResponse.ok && seriestitleResponse.ok) {
              const seriesData = await seriesResponse.json();
              const seriesTitleData = await seriestitleResponse.json();
              setSeriesPosts(seriesData);
              setSeriesTitle(seriesTitleData);
            } else {
              const errorText = await seriesResponse.text();
              console.error('Failed to fetch series posts:', errorText);
            }
          } else {
            console.log('No series found for this post');
          }

          // 閲覧数のカウントを更新
          await fetch(`/api/posts/${id}/view`, { method: 'POST' });

          // ログイン済みのユーザーの状態を確認
          const likeResponse = await fetch(`/api/posts/${id}/isLiked`, {
            credentials: 'include',  // クッキーを含めてリクエストを送信

          });
          const likeData = await likeResponse.json();
          setHasLiked(likeData.hasLiked);

          const bookshelfResponse = await fetch(`/api/posts/${id}/isInBookshelf`, {
            credentials: 'include',  // クッキーを含めてリクエストを送信

          });
          const bookshelfData = await bookshelfResponse.json();
          setIsInBookshelf(bookshelfData.isInBookshelf);

          const followResponse = await fetch(`/api/users/${data.author._id}/is-following`, {
            credentials: 'include',  // クッキーを含めてリクエストを送信

          });
          const followData = await followResponse.json();
          setIsFollowing(followData.isFollowing);
        }

      } catch (error) {
        if (isMounted) {
          console.error('Failed to fetch post:', error);
        }
      }
    };

    fetchPost();

    return () => {
      isMounted = false; // クリーンアップ時にマウント状態を解除
    };
  }, [id]); // 依存配列に`id`と`API_URL`を指定

  useEffect(() => {
    if (location.state?.scrollTo) {
      setTimeout(() => {
        window.scrollTo(0, location.state.scrollTo);
      }, 100);
    }
  }, [location]);
  const formatDate = useCallback((date) => {
    if (!date) return '未設定';

    const parsedDate = new Date(date);

    if (isNaN(parsedDate)) {
      return date;
    }

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');
    const hours = String(parsedDate.getHours()).padStart(2, '0');
    const minutes = String(parsedDate.getMinutes()).padStart(2, '0');

    return `${year}/${month}/${day} ${hours}:${minutes}`;
  }, []);
  const handleGoodClick = useCallback(async () => {
    try {

      const response = await fetch(`/api/posts/${id}/good`, {
        method: 'POST',
        credentials: 'include',  // クッキーを含めてリクエストを送信

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
  }, [ id, hasLiked]);

  const handleBookshelfClick = useCallback(async () => {
    try {

      const response = await fetch(`/api/posts/${id}/bookshelf`, {
        method: 'POST',
        credentials: 'include',  // クッキーを含めてリクエストを送信
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
  }, [ id, isInBookshelf]);

  const handleBookmarkClick = useCallback(() => {
    setIsBookmarkMode(!isBookmarkMode);
  }, [isBookmarkMode]);

  const handleTextClick = useCallback(async (event) => {
    if (isBookmarkMode) {
      const bookmarkPosition = window.scrollY + event.clientY;

      try {
        const response = await fetch(`/api/me/bookmark`, {
          method: 'POST',
          credentials: 'include',  // クッキーを含めてリクエストを送信

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
  }, [ id, isBookmarkMode]);

  const handleFollowToggle = useCallback(async () => {

    try {

      const url = isFollowing
        ? `/api/users/unfollow/${post.author._id}`
        : `/api/users/follow/${post.author._id}`;
      const method = isFollowing ? 'DELETE' : 'POST';

      const response = await fetch(url, {
        method,
        credentials: 'include',  // クッキーを含めてリクエストを送信
      });
      if (!response.ok) {

        navigate('/login'); // ログインページにリダイレクト
        return;
      }

      if (response.ok) {
        setIsFollowing(!isFollowing);
      } else {
        console.error('Error toggling follow status:', await response.json());
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
    }
  }, [ post, isFollowing, navigate]);
  const handleSeriesChange = useCallback((event) => {
    const newPostId = event.target.value;
    setSelectedPostId(newPostId);
    navigate(`/novel/${newPostId}`);
  }, [navigate]);

  const handleTagClick = useCallback((tag) => {
    navigate(`/search?mustInclude=${encodeURIComponent(tag)}`);
  }, [navigate]);

  if (!post) return <div>Loading...</div>;

  return (
    <Container sx={{ marginTop: 4, position: 'relative' }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={9}>
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
          <CommentSection postId={id} />
        </Grid>
        <Grid item xs={12} md={3}>
          <AuthorInfo
            author={post.author}
            isFollowing={isFollowing}
            handleFollowToggle={handleFollowToggle}
          />
          {post.series && seriesPosts.length > 0 && (
            <SeriesSelector
              seriesTitle={seriesTitle}
              seriesPosts={seriesPosts}
              selectedPostId={selectedPostId}
              handleSeriesChange={handleSeriesChange}
            />
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

const NovelContent = memo(({
  post,
  viewCount,
  goodCount,
  bookshelfCount,
  hasLiked,
  isBookmarkMode,
  scrollSpeed,
  setScrollSpeed,
  handleGoodClick,
  handleBookshelfClick,
  handleBookmarkClick,
  handleTextClick,
  handleTagClick,
  isInBookshelf,
  postDate
}) => (
  <>
    <Typography variant="h4" gutterBottom>
      {post.title}
    </Typography>
    <Typography variant="body1" color="textSecondary" gutterBottom>
      {post.description}
    </Typography>
    <Statistics
      viewCount={viewCount}
      goodCount={goodCount}
      bookshelfCount={bookshelfCount}
      postDate={postDate}
    />
    <Tags tags={post.tags} handleTagClick={handleTagClick} />
    <Box sx={{ height: '16px' }} />
    <AutoScroll scrollSpeed={scrollSpeed} setScrollSpeed={setScrollSpeed} />
    <Content
      content={post.content}
      isBookmarkMode={isBookmarkMode}
      handleTextClick={handleTextClick}
    />
    <BookmarkIndicator isBookmarkMode={isBookmarkMode} handleBookmarkClick={handleBookmarkClick} />
    <ActionButtons
      hasLiked={hasLiked}
      isInBookshelf={isInBookshelf}
      handleGoodClick={handleGoodClick}
      handleBookshelfClick={handleBookshelfClick}
    />
  </>
));

const Statistics = memo(({ viewCount, goodCount, bookshelfCount, postDate }) => (
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
    <Box display="flex" alignItems="center" sx={{ marginRight: 2, marginBottom: 1 }}>
      <StarIcon fontSize="small" sx={{ marginRight: 0.5 }} />
      <Typography variant="caption">
        総合ポイント: {((goodCount || 0) * 2) + ((bookshelfCount || 0) * 2)}pt
      </Typography>
    </Box>
    <Box display="flex" alignItems="center" sx={{ marginBottom: 1 }}>
      <Typography variant="caption" sx={{ marginRight: 0.5 }}>
        投稿日:
      </Typography>
      <Typography variant="caption">
      {postDate}
      </Typography>
    </Box>
  </Box>
));

const Tags = memo(({ tags, handleTagClick }) => (
  <Box sx={{ marginTop: 2 }}>
    <Box display="flex" flexWrap="wrap" gap={1}>
      {tags && tags.length > 0 ? (
        tags.map((tag, index) => (
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
));

const Content = memo(({ content, isBookmarkMode, handleTextClick }) => (
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
      <span dangerouslySetInnerHTML={{ __html: content }} />
    </Typography>
  </Box>
));

const BookmarkIndicator = memo(({ isBookmarkMode, handleBookmarkClick }) => (
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
));

const ActionButtons = memo(({ hasLiked, isInBookshelf, handleGoodClick, handleBookshelfClick }) => (
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
));

const AuthorInfo = memo(({ author, isFollowing, handleFollowToggle }) => (
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
      <RouterLink to={`/user/${author._id}`}>
        <Avatar
          src={`${author.icon}`}
          alt={author.nickname}
          sx={{ width: 100, height: 100, marginBottom: 2 }}
        />
      </RouterLink>
      <Typography variant="h6">{author.nickname}</Typography>
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
));

const SeriesSelector = memo(({ seriesTitle, seriesPosts, selectedPostId, handleSeriesChange }) => (
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
));

export default NovelDetail;
