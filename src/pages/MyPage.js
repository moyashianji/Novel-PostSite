import React, { useState, useEffect } from 'react';
import { Box, Button, Grid, Typography, Card,Chip, CardContent, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ProfileInfo from '../components/ProfileInfo';

const MyPage = () => {
  const [user, setUser] = useState(null);
  const [works, setWorks] = useState([]);
  const [series, setSeries] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [followerList, setFollowerList] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [bookshelf, setBookshelf] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [displayedContent, setDisplayedContent] = useState('works');
  
  const navigate = useNavigate();

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/user/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        console.error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchMyWorks = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/users/me/works', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const worksData = await response.json();
        setWorks(worksData);
        setDisplayedContent('works');
      } else {
        console.error('Failed to fetch works data');
      }
    } catch (error) {
      console.error('Error fetching works data:', error);
    }
  };
  const fetchMySeries = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/users/me/series', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const seriesData = await response.json();
        setSeries(seriesData);
        setDisplayedContent('series');
      } else {
        console.error('Failed to fetch series data');
      }
    } catch (error) {
      console.error('Error fetching series data:', error);
    }
  };
  const fetchFollowingList = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/users/following', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFollowingList(data);
        setDisplayedContent('following');
      } else {
        console.error('Failed to fetch following list');
      }
    } catch (error) {
      console.error('Error fetching following list:', error);
    }
  };

  const fetchFollowerList = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/users/followers', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFollowerList(data);
        setDisplayedContent('followers');
      } else {
        console.error('Failed to fetch follower list');
      }
    } catch (error) {
      console.error('Error fetching follower list:', error);
    }
  };

  const fetchLikedPosts = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/posts/user/liked', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setLikedPosts(data);
        setDisplayedContent('likedPosts');
      } else {
        console.error('Failed to fetch liked posts');
      }
    } catch (error) {
      console.error('Error fetching liked posts:', error);
    }
  };

  const fetchBookshelf = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/me/bookshelf', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setBookshelf(data);
        setDisplayedContent('bookshelf');
      } else {
        console.error('Failed to fetch bookshelf');
      }
    } catch (error) {
      console.error('Error fetching bookshelf:', error);
    }
  };

  const fetchBookmarks = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/me/bookmarks', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setBookmarks(data);
        setDisplayedContent('bookmarks');
      } else {
        console.error('Failed to fetch bookmarks');
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchMyWorks(); // ページロード時に自分の作品一覧を表示
  }, []);

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser); // プロフィール情報を更新
  };

  const handleCardClick = (url) => {
    navigate(url);
  };

  const handleBookmarkClick = (novelId, position) => {
    navigate(`/novel/${novelId}`, { state: { scrollTo: position } });
  };
  const handleEditClick = (workId) => {
    navigate(`/mypage/novel/${workId}/edit`);
  };
  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };
  const renderContent = () => {
    switch (displayedContent) {
      case 'works':
        return (
          <Grid container spacing={2}>
            {works.map((work) => (
              <Grid item xs={12} sm={6} md={4} key={work._id}>
                <Card
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleCardClick(`/novel/${work._id}`)}
                >
                  <CardContent>
                    <Typography variant="subtitle1">
                      {truncateText(work.title, 30)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {truncateText(work.description, 200)}
                    </Typography>
                    <Box mt={2}>
                      {work.tags && work.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          sx={{ marginRight: 0.5, marginBottom: 0.5 }}
                        />
                      ))}
                    </Box>
                    <Box mt={2}>
                      <Typography variant="caption">閲覧数: {work.viewCounter}</Typography>
                      <Typography variant="caption" sx={{ marginLeft: 1 }}>いいね数: {work.goodCounter}</Typography>
                      <Typography variant="caption" sx={{ marginLeft: 1 }}>本棚登録数: {work.bookShelfCounter}</Typography>
                      <Typography variant="caption" sx={{ marginLeft: 1 }}>総合ポイント: {(work.goodCounter * 2) + (work.bookShelfCounter * 2)}pt</Typography>
                    </Box>
                  </CardContent>
                  <Box sx={{ padding: 2, paddingTop: 0 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(work._id);
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
        
        case 'series':
          return series.map((seriesItem) => {
            return (
              <Card key={seriesItem._id} sx={{ marginBottom: 2, width: '100%', cursor: 'pointer' }}>
                <CardContent>
                  <Typography variant="h6">{seriesItem.title}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {seriesItem.description}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" sx={{ marginTop: 1 }}>
                    <Typography variant="caption">いいね数: {seriesItem.totalLikes}</Typography>
                    <Typography variant="caption">本棚登録数: {seriesItem.totalBookshelf}</Typography>
                    <Typography variant="caption">閲覧数: {seriesItem.totalViews}</Typography>
                    <Typography variant="caption">総合ポイント: {seriesItem.totalPoints}pt</Typography>
                  </Box>
                  <Box sx={{ marginTop: 2 }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={() => navigate(`/mypage/series/${seriesItem._id}/edit`)}
                    >
                      シリーズを編集
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            );
          });
      case 'following':
        return followingList.map((user) => (
          <Card
            key={user._id}
            sx={{ marginBottom: 2, width: '100%', cursor: 'pointer' }}
            onClick={() => handleCardClick(`/user/${user._id}`)}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar src={`http://localhost:5000${user.icon}`} alt={user.nickname} sx={{ marginRight: 2 }} />
              <Box>
                <Typography variant="subtitle1">{user.nickname}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {user.description}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ));
      case 'followers':
        return followerList.map((user) => (
          <Card
            key={user._id}
            sx={{ marginBottom: 2, width: '100%', cursor: 'pointer' }}
            onClick={() => handleCardClick(`/user/${user._id}`)}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar src={`http://localhost:5000${user.icon}`} alt={user.nickname} sx={{ marginRight: 2 }} />
              <Box>
                <Typography variant="subtitle1">{user.nickname}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {user.description}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ));
      case 'likedPosts':
        return likedPosts.map((post) => (
          <Card
            key={post._id}
            sx={{ marginBottom: 2, width: '100%', cursor: 'pointer' }}
            onClick={() => handleCardClick(`/novel/${post._id}`)}
          >
            <CardContent>
              <Typography variant="subtitle1">{post.title}</Typography>
              <Typography variant="body2" color="textSecondary">
                {post.description}
              </Typography>
            </CardContent>
          </Card>
        ));
      case 'bookshelf':
        return bookshelf.map((post) => (
          <Card
            key={post._id}
            sx={{ marginBottom: 2, width: '100%', cursor: 'pointer' }}
            onClick={() => handleCardClick(`/novel/${post._id}`)}
          >
            <CardContent>
              <Typography variant="subtitle1">{post.title}</Typography>
              <Typography variant="body2" color="textSecondary">
                {post.description}
              </Typography>
            </CardContent>
          </Card>
        ));
      case 'bookmarks':
        return bookmarks.map((bookmark, index) => (
          <Card
            key={index}
            sx={{ marginBottom: 2, width: '100%', cursor: 'pointer' }}
            onClick={() => handleBookmarkClick(bookmark.novelId._id, bookmark.position)}
          >
            <CardContent>
              <Typography variant="subtitle1">{bookmark.novelId.title}</Typography>
              <Typography variant="body2" color="textSecondary">
                位置: {bookmark.position} | 日時: {new Date(bookmark.date).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        ));
      default:
        return null;
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
<Grid container spacing={3}>
  <Grid item xs={12}>
    <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
      <ProfileInfo user={user} onProfileUpdate={handleProfileUpdate} />
    </Box>
  </Grid>

  <Grid item xs={12} md={3}>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 3,
        borderRadius: 2,
        backgroundColor: 'white',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        gap: 2, // ボタンの間にスペースを追加
      }}
    >
      <Button fullWidth onClick={fetchMyWorks}>
        自分の作品一覧
      </Button>
      <Button fullWidth onClick={fetchMySeries}>
        自分のシリーズ一覧
      </Button>
      <Button fullWidth onClick={fetchFollowingList}>
        フォローリスト
      </Button>
      <Button fullWidth onClick={fetchFollowerList}>
        フォロワーリスト
      </Button>
      <Button fullWidth onClick={fetchLikedPosts}>
        いいねした作品
      </Button>
      <Button fullWidth onClick={fetchBookshelf}>
        自分の本棚
      </Button>
      <Button fullWidth onClick={fetchBookmarks}>
        しおりを見る
      </Button>
    </Box>
  </Grid>

  <Grid item xs={12} md={6}>
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {renderContent()}
    </Box>
  </Grid>

  {/* 右サイドバーとしての空白部分 */}
  <Grid item xs={12} md={3}>
    <Box
      sx={{
        height: '100%', // サイドバーの高さをコンテナに合わせる
        backgroundColor: 'transparent', // 背景色を透明に設定
      }}
    >
      {/* ここに広告や他のコンテンツを追加することができます */}
    </Box>
  </Grid>
</Grid>
  );
};

export default MyPage;
