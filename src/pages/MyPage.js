import React, { useState, useEffect } from 'react';
import { Box, Button, Grid, Divider, Typography, CardMedia, Card, Chip, CardContent, Avatar } from '@mui/material';
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
  const [contests, setContests] = useState([]);

  const [displayedContent, setDisplayedContent] = useState('works');
  const API_URL = process.env.REACT_APP_API_URL;

  const navigate = useNavigate();


  const fetchUserData = async () => {

    try {
      const response = await fetch(`${API_URL}/api/user/me`, {
        credentials: 'include',  // クッキーを含めてリクエストを送信

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
    try {
      const response = await fetch(`${API_URL}/api/users/me/works`, {

        credentials: 'include',

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
    try {
      const response = await fetch(`${API_URL}/api/users/me/series`, {
        credentials: 'include',

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
    try {
      const response = await fetch(`${API_URL}/api/users/following`, {
        credentials: 'include',

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
    try {
      const response = await fetch(`${API_URL}/api/users/followers`, {
        credentials: 'include',

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
    try {
      const response = await fetch(`${API_URL}/api/posts/user/liked`, {
        credentials: 'include',

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
    try {
      const response = await fetch(`${API_URL}/api/me/bookshelf`, {
        credentials: 'include',

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
    try {
      const response = await fetch(`${API_URL}/api/me/bookmarks`, {
        credentials: 'include',

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
  const fetchContests = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/me/contests`, {
        credentials: 'include',
      });
      if (response.ok) {
        const contestsData = await response.json();
        setContests(contestsData);
        setDisplayedContent('contests');
      } else {
        console.error('Failed to fetch contests');
      }
    } catch (error) {
      console.error('Error fetching contests:', error);
    }
  };
  useEffect(() => {
    fetchUserData();
    fetchMyWorks(); // ページロード時に自分の作品一覧を表示
  }, []);

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser); // プロフィール情報を更新
  };
  const handleAddContest = () => {
    navigate('/contests/create'); // コンテスト作成画面に遷移
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
  const handleViewContest = (id) => {
    navigate(`/contests/${id}`);
  };

  const renderContent = () => {
    switch (displayedContent) {
      case 'contests':
        return (
          <Box>
            <Box textAlign="center">

              <Button
                variant="contained"
                color="primary"
                onClick={handleAddContest}
                sx={{ marginTop: 2, marginBottom: 5 }}
              >
                コンテストを追加
              </Button>
              <Divider sx={{ my: 2 }} />

            </Box>
            <Typography variant="h5" gutterBottom>
              自分が主催するコンテスト一覧
            </Typography>
            <Grid container spacing={3}>

              {contests.length > 0 ? (
                contests.map((contest) => (
                  <Grid item xs={12} sm={6} md={4} key={contest._id}>
                    <Card
                      sx={{
                        position: 'relative',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="180"
                        image={`${API_URL}${contest.iconImage}`}
                        alt={contest.title}
                        sx={{
                          filter: 'brightness(0.8)', // 画像を暗くしてテキストを見やすく
                          cursor: 'pointer', // マウスカーソルをポインタに変更
                        }}
                        onClick={() => handleViewContest(contest._id)} // 画像クリックで遷移
                      />
                      <CardContent
                        sx={{
                          padding: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                        }}
                      >
                        {/* タイトル */}
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 'bold',
                            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                            wordBreak: 'break-word', // タイトルが長い場合は折り返し表示
                          }}
                        >
                          {contest.title}
                        </Typography>
                        {/* 応募期間 */}
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 'bold',
                            color: 'gray',
                          }}
                        >
                          応募期間: {new Date(contest.applicationStartDate).toLocaleDateString()} 〜{' '}
                          {new Date(contest.applicationEndDate).toLocaleDateString()}
                        </Typography>
                        {/* 説明文 */}
                        <Typography
                          variant="body2"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: 'gray',
                          }}
                        >
                          {contest.shortDescription}
                        </Typography>
                      </CardContent>
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: 2,
                          background: 'linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent)',
                          color: 'white',
                        }}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={() => handleViewContest(contest._id)}
                        sx={{
                          borderRadius: 0,
                        }}
                      >
                        詳細を見る
                      </Button>

                    </Card>
                    {contest.creator === user._id && (

                      <Button
                        variant="outlined"
                        color="secondary"
                        fullWidth
                        onClick={() => navigate(`/contest-edit/${contest._id}`)}
                        sx={{
                          borderRadius: 0,
                        }}>
                        編集する
                      </Button>
                    )}

                  </Grid>
                ))
              ) : (
                <Typography variant="body1">主催しているコンテストはありません。</Typography>
              )}
            </Grid>
            c            <Divider sx={{ my: 2 }} />

            <Box textAlign="center">

              <Button
                variant="contained"
                color="primary"
                onClick={handleAddContest}
                sx={{ marginTop: 2, marginBottom: 5 }}
              >
                コンテストを追加
              </Button>
            </Box>

          </Box>
        );

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
              <Avatar src={`${API_URL}${user.icon}`} alt={user.nickname} sx={{ marginRight: 2 }} />
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
              <Avatar src={`${API_URL}${user.icon}`} alt={user.nickname} sx={{ marginRight: 2 }} />
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
          <Button fullWidth onClick={fetchContests} variant="contained" color="primary">
            コンテストを開催
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
