import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { Typography, Box, Button, Avatar, Grid, Chip, Link } from '@mui/material';
import { styled } from '@mui/system';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import SeriesCarousel from '../components/series/SeriesCarousel'; // 新しいコンポーネントをインポート

const UserCard = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  padding: theme.spacing(4),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  borderRadius: theme.shape.borderRadius,
}));

const WorkCard = styled(Box)(({ theme }) => ({
  height: 250,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  textAlign: 'left',
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(2),
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.02)',
  },
}));

const WorkCardContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: '100%',
}));

const WorkInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
}));

const truncateTitle = (title, maxLength) => {
  return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title;
};

const UserPage = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [works, setWorks] = useState([]);
  const [series, setSeries] = useState([]);
  const [filteredWorks, setFilteredWorks] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/users/${id}`);
        const data = await response.json();
        setUser(data);
        setFollowerCount(data.followerCount);
        const followStatusResponse = await fetch(`/api/users/${id}/is-following`, {
          credentials: 'include',  // クッキーを含めてリクエストを送信
        });
        const followStatus = await followStatusResponse.json();
        setIsFollowing(followStatus.isFollowing);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    const fetchWorks = async () => {
      try {
        const response = await fetch(`/api/users/${id}/works`);
        const data = await response.json();
        setWorks(data);
        setFilteredWorks(data);
      } catch (error) {
        console.error('Error fetching works:', error);
      }
    };

    const fetchSeries = async () => {
      try {
        const response = await fetch(`/api/users/${id}/series`);
        const data = await response.json();
        setSeries(data);
      } catch (error) {
        console.error('Error fetching series:', error);
      }
    };

    fetchUserData();
    fetchWorks();
    fetchSeries();
  }, [id]);

  const handleTagClick = (event, tag) => {
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
    setSelectedTag(tag);
    if (tag) {
      setFilteredWorks(works.filter((work) => work.tags.includes(tag)));
    } else {
      setFilteredWorks(works);
    }
  };

  const handleFollowToggle = async () => {

    try {

      const url = isFollowing
        ? `/api/users/unfollow/${id}`
        : `/api/users/follow/${id}`;
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

        const response = await fetch(`/api/users/${id}`);
        const data = await response.json();
        setFollowerCount(data.followerCount);

      } else {
        console.error('Error toggling follow status:', await response.json());
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
    }
  };

  if (!user) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ maxWidth: 1200, margin: 'auto', paddingTop: 4 }}>
      <UserCard>
        <Box display="flex" alignItems="center">
          <Avatar src={`${user.icon}`} alt={user.nickname} sx={{ width: 100, height: 100, marginRight: 2 }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{user.nickname}</Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
              {user.description}
            </Typography>
            <Typography variant="body2">フォロワー数: {followerCount}</Typography>
          </Box>
        </Box>
        <Button
          variant={isFollowing ? 'contained' : 'outlined'}
          color="primary"
          onClick={handleFollowToggle}
          startIcon={isFollowing ? <PersonRemoveIcon /> : <PersonAddIcon />}
        >
          {isFollowing ? 'フォロー解除' : 'フォロー'}
        </Button>
      </UserCard>

      {/* シリーズ一覧 */}
      <SeriesCarousel series={series} />  {/* SeriesCarouselコンポーネントを使用 */}

      {selectedTag && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">タグ: {selectedTag}</Typography>
          <Button variant="text" onClick={(event) => handleTagClick(null, '')}>
            全ての作品を表示
          </Button>
        </Box>
      )}

      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>作品一覧</Typography>
      <Grid container spacing={2}>
        {filteredWorks.map((work, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <WorkCard>
              <WorkCardContent>
                <Link component={RouterLink} to={`/novel/${work._id}`} underline="none">
                  <Box>
                    <Typography variant="h6">{truncateTitle(work.title, 30)}</Typography>
                    <WorkInfo>
                      <Typography variant="caption">文字数: {work.wordCount}</Typography>
                      <Typography variant="caption">閲覧数: {work.viewCounter}</Typography>
                      <Typography variant="caption">いいね数: {work.goodCounter}</Typography>
                    </WorkInfo>
                  </Box>
                </Link>
                <Box sx={{ mb: 1 }}>
                  {work.tags && work.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      sx={{ marginRight: 0.5, marginBottom: 0.5 }}
                      onClick={(event) => handleTagClick(event, tag)}
                    />
                  ))}
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {work.description.slice(0, 50)}...
                </Typography>
              </WorkCardContent>
            </WorkCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default UserPage;
