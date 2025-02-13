import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PostCard from '../components/PostCard';
import PVRanking from '../components/PVRanking.js';
import { Box, Typography, Grid, Card, Pagination, Button, TextField, IconButton, Paper, CardContent, CardMedia } from '@mui/material';
import PopularTags from '../components/PopularTags';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';

const Home = ({ auth }) => {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tagContainers, setTagContainers] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [text, setText] = useState({});
  const [announcements, setAnnouncements] = useState([]);
  const [contests, setContests] = useState([]);
  const navigate = useNavigate();

  const ADMIN_USER_ID = '66c360d0dd9964e79ab728b6';
  const MAX_ANNOUNCEMENTS_DISPLAY = 5;
  const MAX_CONTESTS_DISPLAY = 10;

  useEffect(() => {
    const fetchPosts = async (page = 1) => {
      try {
        const response = await fetch(`/api/posts?page=${page}`);
        const data = await response.json();
        setPosts(data.posts);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    const fetchAnnouncements = async () => {
      try {
        const response = await fetch(`/api/users/${ADMIN_USER_ID}/works`);
        if (response.ok) {
          const data = await response.json();
          const sortedAnnouncements = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setAnnouncements(sortedAnnouncements);
        } else {
          console.error('Failed to fetch announcements');
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    };

    const fetchContests = async () => {
      try {
        const response = await fetch('/api/contests');
        if (response.ok) {
          const data = await response.json();
          setContests(data);
        } else {
          console.error('Failed to fetch contests');
        }
      } catch (error) {
        console.error('Error fetching contests:', error);
      }
    };

    fetchPosts(currentPage);
    fetchAnnouncements();
    fetchContests();
  }, [auth, currentPage]);

  const handleChangePage = useCallback((event, value) => {
    setCurrentPage(value);
  }, []);

  const fetchUserTags = useCallback(async () => {
    if (!auth) return;
    try {
      const response = await fetch(`/api/users/tags`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      const fetchedTagContainers = data.tagContainers || [];
      setTagContainers(fetchedTagContainers);
      fetchedTagContainers.forEach((container, index) => {
        if (container.tag) {
          fetchPostsByTag(index, container.tag);
        }
      });
    } catch (error) {
      console.error('Error fetching user tags:', error);
    }
  }, [auth]);

  const saveTagToUser = useCallback(async (index, tag) => {
    try {
      const response = await fetch(`/api/users/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ index, tag }),
      });
      if (response.ok) {
        console.log('タグ情報が保存されました');
      }
    } catch (error) {
      console.error('Error saving tag:', error);
    }
  }, []);

  const handleTagSubmit = useCallback((index) => {
    const tag = text[index] || '';
    fetchPostsByTag(index, tag);
    saveTagToUser(index, tag);
  }, [text, saveTagToUser]);

  const handleAddTagContainer = useCallback(() => {
    if (tagContainers.length >= 10) return;
    setTagContainers([...tagContainers, { tag: '', posts: [], page: 1, totalPages: 1 }]);
  }, [tagContainers]);

  const handleTagChange = useCallback((index, value) => {
    const updatedContainers = [...tagContainers];
    updatedContainers[index] = { ...updatedContainers[index], tag: value };
    setTagContainers(updatedContainers);
  }, [tagContainers]);

  const handleTextChange = useCallback((index, value) => {
    setText(prevText => ({
      ...prevText,
      [index]: value,
    }));
  }, []);

  const fetchPostsByTag = useCallback(async (index, tag, page = 1) => {
    if (!tagContainers[index]) {
      console.error(`Invalid index: ${index}`);
      return;
    }
    try {
      const response = await fetch(`/api/posts/tag/${tag}?page=${page}`);
      const data = await response.json();
      const updatedContainers = [...tagContainers];
      updatedContainers[index].posts = data.posts;
      updatedContainers[index].totalPages = data.totalPages;
      updatedContainers[index].page = data.currentPage;
      updatedContainers[index].fetched = true;
      setTagContainers(updatedContainers);
    } catch (error) {
      console.error('Error fetching posts by tag:', error);
    }
  }, [tagContainers]);

  useEffect(() => {
    if (tagContainers.length > 0) {
      tagContainers.forEach((container, index) => {
        if (container.tag && !container.fetched) {
          fetchPostsByTag(index, container.tag);
        }
      });
    }
  }, [tagContainers, fetchPostsByTag]);

  useEffect(() => {
    if (auth) {
      fetchUserTags();
    }
  }, [auth, fetchUserTags]);

  const handleTagPageChange = useCallback((index, value) => {
    const tag = tagContainers[index].tag;
    fetchPostsByTag(index, tag, value);
  }, [tagContainers, fetchPostsByTag]);

  const handleDeleteTagContainer = useCallback(async (index) => {
    try {
      const response = await fetch(`/api/users/tags/${index}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        const updatedContainers = [...tagContainers];
        updatedContainers.splice(index, 1);
        const updatedContainersWithCorrectIndex = updatedContainers.map((container, newIndex) => ({
          ...container,
          index: newIndex,
        }));
        setTagContainers(updatedContainersWithCorrectIndex);
      } else {
        console.error('Error deleting tag on server');
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  }, [tagContainers]);

  const handleViewContest = useCallback((id) => {
    navigate(`/contests/${id}`);
  }, [navigate]);

  const renderedAnnouncements = useMemo(() => (
    <Announcements announcements={announcements} />
  ), [announcements]);

  const renderedTagContainers = useMemo(() => (
    <TagContainers
      tagContainers={tagContainers}
      handleDeleteTagContainer={handleDeleteTagContainer}
      handleTagSubmit={handleTagSubmit}
      handleTagPageChange={handleTagPageChange}
      handleTextChange={handleTextChange}
      text={text}
      auth={auth}
      navigate={navigate} 
    />
  ), [tagContainers, handleDeleteTagContainer, handleTagSubmit, handleTagPageChange, handleTextChange, text, auth,navigate]);

  const renderedContests = useMemo(() => (
    <Contests
     contests={contests}
     handleViewContest={handleViewContest}
      navigate={navigate} 
      />
  ), [contests, handleViewContest, navigate]);

  return (
    <Grid container spacing={1} sx={{ maxWidth: '1400px', margin: '0 auto', paddingTop: 4 }}>
      <LeftSidebar contests={contests} handleViewContest={handleViewContest} />
      <MainContent
        posts={posts}
        totalPages={totalPages}
        currentPage={currentPage}
        handleChangePage={handleChangePage}
        renderedContests={renderedContests}
        renderedTagContainers={renderedTagContainers}
        handleAddTagContainer={handleAddTagContainer}
        auth={auth}
        tagContainers={tagContainers} // ここに tagContainers を追加
      />
      <RightSidebar renderedAnnouncements={renderedAnnouncements} />
    </Grid>
  );
};

const LeftSidebar = React.memo(({ contests, handleViewContest }) => (
  <Grid item xs={12} md={2.5} sx={{ paddingLeft: 1 }}>
    <Box sx={{ paddingRight: 1 }}>
      <PopularTags />
    </Box>
    <Box sx={{ paddingLeft: 1 }}>
      <Typography variant="h6" gutterBottom>
        開催予定のコンテスト
      </Typography>
      <UpcomingContests contests={contests} handleViewContest={handleViewContest} />
    </Box>
  </Grid>
));

const MainContent = React.memo(({
  posts,
  totalPages,
  currentPage,
  handleChangePage,
  renderedContests,
  renderedTagContainers,
  handleAddTagContainer,
  auth,
  tagContainers
}) => (
  <Grid item xs={12} md={7} sx={{ paddingLeft: 2, paddingRight: 2 }}>
    {renderedContests}
    <Typography variant="h4" gutterBottom>
      新着作品
    </Typography>
    {posts.length > 0 ? (
      <Grid container spacing={2}>
        {posts.map(post => (
          <Grid item xs={12} sm={6} key={post._id}>
            <PostCard post={post} />
          </Grid>
        ))}
      </Grid>
    ) : (
      <Typography variant="body1">まだ投稿がありません。</Typography>
    )}
    <Box display="flex" justifyContent="center" mt={4}>
      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={handleChangePage}
        color="primary"
      />
    </Box>
    <Box mt={4}>
      <Typography variant="h5">
        {auth ? 'タグ登録機能（最大10個まで登録可能）' : 'デフォルトタグの投稿'}
      </Typography>
      <Grid container spacing={2}>
        {renderedTagContainers}
        {auth && tagContainers.length < 10 && (
          <Grid item xs={12} sm={6}>
            <Button
              onClick={handleAddTagContainer}
              sx={{
                border: '1px dashed #ccc',
                padding: '16px',
                width: '100%',
                height: '20',
                backgroundColor: '#f9f9f9',
                minHeight: '150px',
                height: 'auto',
              }}
            >
              タグを追加
            </Button>
          </Grid>
        )}
      </Grid>
    </Box>
  </Grid>
));

const RightSidebar = React.memo(({ renderedAnnouncements }) => (
  <Grid item xs={12} md={2.5} sx={{ paddingRight: 1 }}>
    <Box sx={{ paddingLeft: 1 }}>
      {renderedAnnouncements}
      <PVRanking />
    </Box>
  </Grid>
));

const Announcements = React.memo(({ announcements }) => {
  const ADMIN_USER_ID = '66c360d0dd9964e79ab728b6';
  const MAX_ANNOUNCEMENTS_DISPLAY = 5;

  return (
    <Paper elevation={3} sx={{ padding: 2, marginBottom: 2 }}>
      <Typography variant="h6" gutterBottom>
        お知らせ
      </Typography>
      {announcements.length > 0 ? (
        <ul style={{ paddingLeft: 16, margin: 0 }}>
          {announcements.slice(0, MAX_ANNOUNCEMENTS_DISPLAY).map((post, index) => (
            <React.Fragment key={post._id}>
              <li
                key={post._id}
                style={{
                  marginBottom: '1px',
                  transition: 'background-color 0.3s',
                  borderRadius: '4px',
                }}
              >
                <Link
                  to={`/novel/${post._id}`}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    padding: '8px',
                    display: 'block',
                    borderRadius: '4px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      lineHeight: 1.3,
                    }}
                  >
                    {post.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      marginTop: '4px',
                      fontSize: '12px',
                      color: 'gray',
                    }}
                  >
                    {new Date(post.createdAt).toLocaleString()}
                  </Typography>
                </Link>
              </li>
              {index < announcements.slice(0, MAX_ANNOUNCEMENTS_DISPLAY).length - 1 && (
                <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '1px 0' }} />
              )}
            </React.Fragment>
          ))}
        </ul>
      ) : (
        <Typography variant="body2" color="textSecondary">
          現在お知らせはありません。
        </Typography>
      )}
      {announcements.length > MAX_ANNOUNCEMENTS_DISPLAY && (
        <Box textAlign="center" mt={2}>
          <Button
            variant="text"
            color="primary"
            component={Link}
            to={`/user/${ADMIN_USER_ID}`}
            style={{ textDecoration: 'none' }}
          >
            もっと見る
          </Button>
        </Box>
      )}
    </Paper>
  );
});

const MemoizedTextField = React.memo(({ index, value, handleTextChange }) => (
  <TextField
    label="タグを入力"
    variant="outlined"
    fullWidth
    margin="normal"
    value={value}
    onChange={(e) => handleTextChange(index, e.target.value)}
    inputProps={{ maxLength: 200 }}
  />
));

const TagContainer = React.memo(({ container, index, handleDeleteTagContainer, handleTagSubmit, handleTagPageChange, handleTextChange, text, auth ,navigate}) => (
  <Grid item xs={12} sm={6}>
    <Box
      key={index}
      sx={{
        border: '1px dashed #ccc',
        padding: 2,
        backgroundColor: '#f9f9f9',
        minHeight: '150px',
        height: 'auto',
      }}
    >
      {auth ? (
        <>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <IconButton onClick={() => handleDeleteTagContainer(index)} sx={{ marginRight: 1 }}>
              <DeleteIcon />
            </IconButton>
            <MemoizedTextField
              index={index}
              value={text[index] !== undefined ? text[index] : container.tag || ''}
              handleTextChange={handleTextChange}
            />
            <Button variant="contained" onClick={() => handleTagSubmit(index)}>
              登録
            </Button>
          </Box>
        </>
      ) : (
        <Typography variant="h6">{container.tag || ''}</Typography>
      )}
      {container.posts && container.posts.length > 0 ? (
        <Box>
          {container.posts.map(post => (
            <PostCard post={post} key={post._id} />
          ))}
          <Pagination
            count={container.totalPages}
            page={container.page}
            onChange={(e, value) => handleTagPageChange(index, value)}
          />
          <Box display="flex" justifyContent="center" mt={2}>
            <Button 
            variant="outlined"
             color="primary" 
             onClick={() => navigate(`/search?query=${encodeURIComponent(container.tag)}`
            )}>
              全部の作品を見る
            </Button>
          </Box>
        </Box>
      ) : (
        <Typography variant="body2">まだ投稿がありません。</Typography>
      )}
    </Box>
  </Grid>
));

const TagContainers = React.memo(({
  tagContainers,
  handleDeleteTagContainer,
  handleTagSubmit,
  handleTagPageChange,
  handleTextChange,
  text,
  auth,
  navigate
}) => (
  <>
    {tagContainers.map((container, index) => (
      <TagContainer
        key={index}
        container={container}
        index={index}
        handleDeleteTagContainer={handleDeleteTagContainer}
        handleTagSubmit={handleTagSubmit}
        handleTagPageChange={handleTagPageChange}
        handleTextChange={handleTextChange}
        text={text}
        auth={auth}
        navigate={navigate}
      />
    ))}
  </>
));

const Contests = React.memo(({ contests, handleViewContest, navigate }) => (
  
  <Box sx={{ padding: 4 }}>
    <Typography variant="h4" gutterBottom>
      開催中のコンテスト
    </Typography>
    <Grid container spacing={3}>
      {contests.filter((contest) => contest.status === '募集中')
        .slice(0, 6)
        .map((contest) => (
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
                image={`${contest.iconImage}`}
                alt={contest.title}
                sx={{
                  filter: 'brightness(0.8)',
                  cursor: 'pointer',
                }}
                onClick={() => handleViewContest(contest._id)}
              />
              <CardContent
                sx={{
                  padding: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                    wordBreak: 'break-word',
                  }}
                >
                  {contest.title}
                </Typography>
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
          </Grid>
        ))}
    </Grid>
    <Box display="flex" justifyContent="center" mt={4}>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => navigate('/contests')}
        sx={{ width: '100%', maxWidth: '400px' }}
      >
        全部のコンテストを見る
      </Button>
    </Box>
  </Box>
));

const UpcomingContests = React.memo(({ contests, handleViewContest }) => (
  <>
    {contests.filter(contest => contest.status === '開催予定')
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(contest => (
        <Grid item key={contest._id}>
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
              image={`${contest.iconImage}`}
              alt={contest.title}
              sx={{
                filter: 'brightness(0.8)',
                cursor: 'pointer',
              }}
              onClick={() => handleViewContest(contest._id)}
            />
            <CardContent
              sx={{
                padding: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                  wordBreak: 'break-word',
                }}
              >
                {contest.title}
              </Typography>
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
        </Grid>
      ))}
  </>
));

export default React.memo(Home);
