import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Grid } from '@mui/material';
import NovelContent from '../components/noveldetail/NovelContent';
import CommentSection from '../components/comment/CommentSection';
import AuthorInfo from '../components/noveldetail/AuthorInfo';
import SeriesSelector from '../components/noveldetail/SeriesSelector';
import { formatDate } from '../utils/dateUtils';

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
    let isMounted = true;

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

          // Fetch series posts if part of a series
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

          // Update view count
          await fetch(`/api/posts/${id}/view`, { method: 'POST' });

          // Check authenticated user state
          const likeResponse = await fetch(`/api/posts/${id}/isLiked`, {
            credentials: 'include',
          });
          const likeData = await likeResponse.json();
          setHasLiked(likeData.hasLiked);

          const bookshelfResponse = await fetch(`/api/posts/${id}/isInBookshelf`, {
            credentials: 'include',
          });
          const bookshelfData = await bookshelfResponse.json();
          setIsInBookshelf(bookshelfData.isInBookshelf);

          const followResponse = await fetch(`/api/users/${data.author._id}/is-following`, {
            credentials: 'include',
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
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (location.state?.scrollTo) {
      setTimeout(() => {
        window.scrollTo(0, location.state.scrollTo);
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
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'いいねに失敗しました。');
      }
    } catch (error) {
      console.error('Error toggling good:', error);
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
      } else {
        const errorData = await response.json();
        alert(errorData.message || '本棚登録に失敗しました。');
      }
    } catch (error) {
      console.error('Error toggling bookshelf status:', error);
    }
  }, [id, isInBookshelf]);

  const handleBookmarkClick = useCallback(() => {
    setIsBookmarkMode(!isBookmarkMode);
  }, [isBookmarkMode]);

  const handleTextClick = useCallback(async (event) => {
    if (isBookmarkMode) {
      const bookmarkPosition = window.scrollY + event.clientY;
      console.log(bookmarkPosition);
      console.log(id)
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
        navigate('/login');
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
  }, [post, isFollowing, navigate]);

  const handleSeriesChange = useCallback((event) => {
    const newPostId = event.target.value;
    setSelectedPostId(newPostId);
    navigate(`/novel/${newPostId}`);
  }, [navigate]);

  const handleTagClick = useCallback((tag) => {
    navigate(`/search?mustInclude=${encodeURIComponent(tag)}&type=posts`);
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

export default NovelDetail;