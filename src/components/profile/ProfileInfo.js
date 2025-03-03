// ProfileInfo.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Avatar, 
  Typography, 
  IconButton, 
  Card, 
  CardContent, 
  Divider, 
  Chip, 
  Stack, 
  Tooltip, 
  Tabs, 
  Tab,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
  CircularProgress
} from '@mui/material';
import EditProfile from './EditProfile';
import TwitterIcon from '@mui/icons-material/Twitter';
import PixivIcon from '@mui/icons-material/Pix';
import LinkIcon from '@mui/icons-material/Link';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import TagIcon from '@mui/icons-material/Tag';
import CommentIcon from '@mui/icons-material/Comment';
import UpdateIcon from '@mui/icons-material/Update';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import WarningIcon from '@mui/icons-material/Warning';
import FilterListIcon from '@mui/icons-material/FilterList';

// TabPanel component for the tabs
const TabPanel = React.memo(({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
});

TabPanel.displayName = 'TabPanel';

const ProfileInfo = ({ user, onProfileUpdate }) => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [error, setError] = useState(null);
  
  // 実際のデータを取得する
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user || !user._id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // ユーザー統計情報を取得
        const statsResponse = await fetch(`${API_URL}/api/users/${user._id}/stats`);
        if (!statsResponse.ok) {
          throw new Error('統計情報の取得に失敗しました');
        }
        const statsData = await statsResponse.json();
        
        // 最近の活動を取得
        const activityResponse = await fetch(`${API_URL}/api/users/${user._id}/activity`);
        if (!activityResponse.ok) {
          throw new Error('活動情報の取得に失敗しました');
        }
        const activityData = await activityResponse.json();
        
        setUserStats(statsData);
        setRecentActivity(activityData);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message);
        
        // エラー時にはデモデータを使用
        setUserStats({
          postCount: user.posts?.length || 0,
          totalViews: 0,
          totalLikes: 0,
          totalBookmarks: 0,
          commentCount: 0,
          topTags: [],
          aiUsagePercent: 0,
          originalContentPercent: 0,
          adultContentCount: 0,
          seriesCount: 0
        });
        setRecentActivity([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserStats();
  }, [API_URL, user]);
  
  // 統計情報を計算
  const calculatedStats = useMemo(() => {
    if (!user || !userStats) return null;
    
    // 統計情報がAPIから取得できなかった場合は、可能な限り利用可能なデータから計算
    const posts = user.posts || [];
    const followers = user.followers || [];
    const series = user.series || [];
    
    // タグの出現回数を計算
    const tagCounts = {};
    posts.forEach(post => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach(tag => {
          if (!tagCounts[tag]) {
            tagCounts[tag] = 0;
          }
          tagCounts[tag]++;
        });
      }
    });
    
    // 上位のタグを抽出
    const topTags = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // AIコンテンツとオリジナルコンテンツの割合を計算
    const aiPosts = posts.filter(post => post.aiGenerated).length;
    const originalPosts = posts.filter(post => post.isOriginal).length;
    const aiUsagePercent = posts.length > 0 ? Math.round((aiPosts / posts.length) * 100) : 0;
    const originalContentPercent = posts.length > 0 ? Math.round((originalPosts / posts.length) * 100) : 0;
    
    // R18コンテンツ数
    const adultContentCount = posts.filter(post => post.isAdultContent).length;
    
    // 閲覧数・いいね数などの集計
    const totalViews = posts.reduce((sum, post) => sum + (post.viewCounter || 0), 0);
    const totalLikes = posts.reduce((sum, post) => sum + (post.goodCounter || 0), 0);
    const totalBookmarks = posts.reduce((sum, post) => sum + (post.bookmarkCounter || 0), 0);
    
    // 計算した統計情報をAPIから取得した情報と結合
    return {
      ...userStats,
      postCount: posts.length,
      seriesCount: series.length,
      followerCount: followers.length,
      topTags: userStats.topTags?.length > 0 ? userStats.topTags : topTags,
      totalViews: userStats.totalViews || totalViews,
      totalLikes: userStats.totalLikes || totalLikes,
      totalBookmarks: userStats.totalBookmarks || totalBookmarks,
      aiUsagePercent: userStats.aiUsagePercent || aiUsagePercent,
      originalContentPercent: userStats.originalContentPercent || originalContentPercent,
      adultContentCount: userStats.adultContentCount || adultContentCount
    };
  }, [user, userStats]);
  
  // 最近の活動を整形
  const formattedActivity = useMemo(() => {
    if (!recentActivity || recentActivity.length === 0) {
      return [];
    }
    
    return recentActivity.map(activity => {
      return {
        type: activity.type || 'post',
        title: activity.title || (activity.post?.title || '無題'),
        postTitle: activity.postTitle || (activity.post?.title || '無題'),
        date: activity.date || activity.createdAt,
        views: activity.views || activity.post?.viewCounter || 0
      };
    }).slice(0, 5); // 最新5件に制限
  }, [recentActivity]);

  // Function to handle tab changes
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Function to determine if a string is non-empty
  const hasContent = (str) => str && str.trim().length > 0;
  
  // Add cache buster to prevent stale images
  const avatarUrl = user && user.icon ? `${API_URL}${user.icon}?${new Date().getTime()}` : null;
  
  // Count how many social links exist
  const socialLinksCount = user ? [user.xLink, user.pixivLink, user.otherLink].filter(hasContent).length : 0;
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
  };

  // データロード中の表示
  if (isLoading) {
    return (
      <Card 
        elevation={3}
        sx={{ 
          width: '100%', 
          mb: 4, 
          borderRadius: 4,
          overflow: 'visible',
          position: 'relative',
          minHeight: 400,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <CircularProgress />
      </Card>
    );
  }

  // エラー時の表示
  if (error && !calculatedStats) {
    return (
      <Card 
        elevation={3}
        sx={{ 
          width: '100%', 
          mb: 4, 
          borderRadius: 4,
          p: 3
        }}
      >
        <Typography color="error">データの読み込みに失敗しました: {error}</Typography>
      </Card>
    );
  }

  // ユーザーデータがない場合
  if (!user) {
    return (
      <Card 
        elevation={3}
        sx={{ 
          width: '100%', 
          mb: 4, 
          borderRadius: 4,
          p: 3
        }}
      >
        <Typography>ユーザー情報が見つかりません</Typography>
      </Card>
    );
  }

  return (
    <Card 
      elevation={3}
      sx={{ 
        width: '100%', 
        mb: 4, 
        borderRadius: 4,
        overflow: 'visible',
        position: 'relative',
      }}
    >
      {/* Header Section with Cover Image */}
      <Box 
        sx={{ 
          height: 150, 
          width: '100%', 
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
          position: 'relative',
          overflow: 'hidden'
        }} 
      >
        {/* Decorative elements in the cover */}
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            background: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
          }}
        />
      </Box>
      
      <CardContent sx={{ p: 0, position: 'relative' }}>
        <Box px={4} pb={3} pt={0} position="relative">
          {/* Avatar that overlaps the cover */}
          <Avatar
            src={avatarUrl}
            alt={user.nickname}
            sx={{ 
              width: 130, 
              height: 130, 
              border: '5px solid white',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              position: 'relative',
              top: -65,
              mb: -4,
            }}
          />
          
          {/* Badge indicators for user profile */}
          <Box position="absolute" top={-35} left={150}>
            <Stack direction="row" spacing={1}>
              {calculatedStats?.aiUsagePercent > 50 && (
                <Tooltip title="AIを活用している作家">
                  <Chip 
                    icon={<SmartToyIcon />} 
                    label="AI創作" 
                    size="small" 
                    sx={{ bgcolor: 'rgba(25, 118, 210, 0.8)', color: 'white' }}
                  />
                </Tooltip>
              )}
              
              {calculatedStats?.originalContentPercent > 50 && (
                <Tooltip title="オリジナル作品が多い">
                  <Chip 
                    icon={<LocalLibraryIcon />} 
                    label="オリジナル" 
                    size="small" 
                    sx={{ bgcolor: 'rgba(46, 125, 50, 0.8)', color: 'white' }}
                  />
                </Tooltip>
              )}
              
              {calculatedStats?.adultContentCount > 0 && (
                <Tooltip title="成人向けコンテンツあり">
                  <Chip 
                    icon={<WarningIcon />} 
                    label="R-18" 
                    size="small" 
                    sx={{ bgcolor: 'rgba(211, 47, 47, 0.8)', color: 'white' }}
                  />
                </Tooltip>
              )}
            </Stack>
          </Box>
          
          {/* Edit button positioned on the top right */}
          <Box position="absolute" top={-45} right={24}>
            <EditProfile user={user} onProfileUpdate={onProfileUpdate} />
          </Box>
          
          {/* User basic info */}
          <Box mt={2}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              {user.nickname}
            </Typography>
            
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Chip 
                icon={<PeopleAltIcon />} 
                label={`フォロワー ${user.followers?.length || 0}`}
                size="small"
                sx={{ 
                  backgroundColor: 'rgba(0,0,0,0.05)', 
                  '& .MuiChip-icon': { color: 'primary.main' } 
                }}
              />
              
              <Chip 
                icon={<AutoStoriesIcon />} 
                label={`作品数 ${calculatedStats?.postCount || 0}`}
                size="small"
                sx={{ 
                  backgroundColor: 'rgba(0,0,0,0.05)', 
                  '& .MuiChip-icon': { color: 'primary.main' } 
                }}
              />
              
              <Chip 
                icon={<FilterListIcon />} 
                label={`シリーズ ${calculatedStats?.seriesCount || 0}`}
                size="small"
                sx={{ 
                  backgroundColor: 'rgba(0,0,0,0.05)', 
                  '& .MuiChip-icon': { color: 'primary.main' } 
                }}
              />
            </Stack>
            
            {hasContent(user.description) && (
              <Paper elevation={0} sx={{ p: 2, mt: 3, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                  {user.description}
                </Typography>
              </Paper>
            )}
            
            {/* Social links - only show if at least one link exists */}
            {socialLinksCount > 0 && (
              <Box display="flex" justifyContent="flex-start" mt={3}>
                {user.xLink && (
                  <Tooltip title="X (Twitter)">
                    <IconButton 
                      href={user.xLink} 
                      target="_blank" 
                      sx={{ 
                        color: '#1DA1F2', 
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        mr: 1,
                        transition: 'all 0.2s',
                        '&:hover': { 
                          color: '#0d8ddb',
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <TwitterIcon />
                    </IconButton>
                  </Tooltip>
                )}
                {user.pixivLink && (
                  <Tooltip title="Pixiv">
                    <IconButton 
                      href={user.pixivLink} 
                      target="_blank" 
                      sx={{ 
                        color: '#0096fa', 
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        mr: 1,
                        transition: 'all 0.2s',
                        '&:hover': { 
                          color: '#007bb5',
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <PixivIcon />
                    </IconButton>
                  </Tooltip>
                )}
                {user.otherLink && (
                  <Tooltip title={user.otherLink}>
                    <IconButton 
                      href={user.otherLink} 
                      target="_blank" 
                      sx={{ 
                        color: '#444', 
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        transition: 'all 0.2s',
                        '&:hover': { 
                          color: '#000',
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <LinkIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            )}
          </Box>
          
          {/* Stats & Activity section */}
          <Box mt={4}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="fullWidth" 
              sx={{
                '& .MuiTab-root': {
                  fontSize: '0.9rem',
                  minHeight: '48px'
                },
                '& .Mui-selected': {
                  fontWeight: 'bold'
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                }
              }}
            >
              <Tab icon={<VisibilityIcon fontSize="small" />} iconPosition="start" label="統計" />
              <Tab icon={<UpdateIcon fontSize="small" />} iconPosition="start" label="活動" />
              <Tab icon={<TagIcon fontSize="small" />} iconPosition="start" label="タグ" />
            </Tabs>
            
            <Divider />
            
            {/* Stats Tab */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, rgba(176,196,222,0.2) 0%, rgba(220,237,255,0.2) 100%)',
                      border: '1px solid rgba(176,196,222,0.3)'
                    }}
                  >
                    <VisibilityIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.8, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 0 }}>
                      {(calculatedStats?.totalViews || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      総閲覧数
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, rgba(255,192,203,0.2) 0%, rgba(255,228,225,0.2) 100%)',
                      border: '1px solid rgba(255,192,203,0.3)'
                    }}
                  >
                    <FavoriteIcon sx={{ fontSize: 40, color: '#e91e63', opacity: 0.8, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 0 }}>
                      {(calculatedStats?.totalLikes || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      総いいね数
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, rgba(255,222,173,0.2) 0%, rgba(255,239,213,0.2) 100%)',
                      border: '1px solid rgba(255,222,173,0.3)'
                    }}
                  >
                    <BookmarkIcon sx={{ fontSize: 40, color: '#ff9800', opacity: 0.8, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 0 }}>
                      {(calculatedStats?.totalBookmarks || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      本棚追加数
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, rgba(144,238,144,0.2) 0%, rgba(240,255,240,0.2) 100%)',
                      border: '1px solid rgba(144,238,144,0.3)'
                    }}
                  >
                    <CommentIcon sx={{ fontSize: 40, color: '#4caf50', opacity: 0.8, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 0 }}>
                      {(calculatedStats?.commentCount || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      総コメント数
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              
              <Box mt={4}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  創作スタイル
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <SmartToyIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="subtitle2">
                          AI活用率
                        </Typography>
                      </Box>
                      <Box position="relative" height={24} bgcolor="rgba(0,0,0,0.05)" borderRadius={1}>
                        <Box 
                          position="absolute"
                          top={0}
                          left={0}
                          height="100%"
                          width={`${calculatedStats?.aiUsagePercent || 0}%`}
                          bgcolor="primary.main"
                          borderRadius={1}
                        />
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            position: 'absolute', 
                            top: '50%', 
                            left: '50%', 
                            transform: 'translate(-50%, -50%)',
                            color: 'white',
                            fontWeight: 'bold',
                            textShadow: '0 0 2px rgba(0,0,0,0.5)'
                          }}
                        >
                          {calculatedStats?.aiUsagePercent || 0}%
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <LocalLibraryIcon sx={{ mr: 1, color: '#2e7d32' }} />
                        <Typography variant="subtitle2">
                          オリジナル作品率
                        </Typography>
                      </Box>
                      <Box position="relative" height={24} bgcolor="rgba(0,0,0,0.05)" borderRadius={1}>
                        <Box 
                          position="absolute"
                          top={0}
                          left={0}
                          height="100%"
                          width={`${calculatedStats?.originalContentPercent || 0}%`}
                          bgcolor="#2e7d32"
                          borderRadius={1}
                        />
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            position: 'absolute', 
                            top: '50%', 
                            left: '50%', 
                            transform: 'translate(-50%, -50%)',
                            color: 'white',
                            fontWeight: 'bold',
                            textShadow: '0 0 2px rgba(0,0,0,0.5)'
                          }}
                        >
                          {calculatedStats?.originalContentPercent || 0}%
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>
            
            {/* Activity Tab */}
            <TabPanel value={tabValue} index={1}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                最近の活動
              </Typography>
              {formattedActivity.length > 0 ? (
                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <List disablePadding>
                    {formattedActivity.map((activity, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && <Divider component="li" />}
                        <ListItem sx={{ px: 3, py: 2 }}>
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                bgcolor: activity.type === 'post' ? 'primary.main' : 'secondary.main',
                              }}
                            >
                              {activity.type === 'post' ? <AutoStoriesIcon /> : <CommentIcon />}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle2">
                                {activity.type === 'post' 
                                  ? `「${activity.title}」を公開しました` 
                                  : `「${activity.postTitle}」にコメントしました`}
                              </Typography>
                            }
                            secondary={
                              <Box mt={0.5}>
                                <Typography variant="body2" color="textSecondary" component="span">
                                  {formatDate(activity.date)}
                                </Typography>
                                {activity.type === 'post' && activity.views && (
                                  <Chip
                                    icon={<VisibilityIcon style={{ fontSize: 14 }} />}
                                    label={`${activity.views} 閲覧`}
                                    size="small"
                                    sx={{ ml: 1, height: 20, '& .MuiChip-label': { px: 1, py: 0 } }}
                                  />
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              ) : (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 2, 
                    bgcolor: 'rgba(0,0,0,0.02)', 
                    textAlign: 'center' 
                  }}
                >
                  <Typography color="textSecondary">
                    最近の活動はありません
                  </Typography>
                </Paper>
              )}
            </TabPanel>
            
            {/* Tags Tab */}
            <TabPanel value={tabValue} index={2}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                よく使うタグ
              </Typography>
              {calculatedStats?.topTags && calculatedStats.topTags.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {calculatedStats.topTags.map((tag, index) => (
                    <Chip
                      key={index}
                      icon={<TagIcon />}
                      label={`${tag.name} (${tag.count})`}
                      sx={{
                        py: 2.5,
                        fontWeight: 5 - index > 0 ? 'bold' : 'normal',
                        fontSize: `${Math.max(0.9, 1.1 - index * 0.05)}rem`,
                        bgcolor: index === 0 
                          ? 'rgba(25, 118, 210, 0.1)' 
                          : index === 1 
                            ? 'rgba(25, 118, 210, 0.05)'
                            : 'rgba(0, 0, 0, 0.02)',
                        border: index === 0 
                          ? '1px solid rgba(25, 118, 210, 0.2)' 
                          : '1px solid rgba(0, 0, 0, 0.08)'
                      }}
                    />
                  ))}
                </Box>
              ) : (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 2, 
                    bgcolor: 'rgba(0,0,0,0.02)', 
                    textAlign: 'center' 
                  }}
                >
                  <Typography color="textSecondary">
                    タグ情報がありません
                  </Typography>
                </Paper>
              )}
            </TabPanel>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default React.memo(ProfileInfo);