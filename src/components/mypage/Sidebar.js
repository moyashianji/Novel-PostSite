import React from 'react';
import { Box, Button } from '@mui/material';
import { useAPI } from '../../hooks/useAPI';

const Sidebar = ({ onContentChange, currentContent }) => {
  const { 
    fetchMyWorks, 
    fetchMySeries, 
    fetchFollowingList, 
    fetchFollowerList, 
    fetchLikedPosts, 
    fetchBookshelf, 
    fetchBookmarks, 
    fetchContests 
  } = useAPI();

  const handleContentSelect = async (contentType, fetchFunction) => {
    const data = await fetchFunction();
    if (data) {
      onContentChange(contentType, data);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 3,
        borderRadius: 2,
        backgroundColor: 'white',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        gap: 2,
      }}
    >
      <Button 
        fullWidth 
        onClick={() => handleContentSelect('works', fetchMyWorks)}
        variant={currentContent === 'works' ? 'contained' : 'outlined'}
      >
        自分の作品一覧
      </Button>
      
      <Button 
        fullWidth 
        onClick={() => handleContentSelect('series', fetchMySeries)}
        variant={currentContent === 'series' ? 'contained' : 'outlined'}
      >
        自分のシリーズ一覧
      </Button>
      
      <Button 
        fullWidth 
        onClick={() => handleContentSelect('following', fetchFollowingList)}
        variant={currentContent === 'following' ? 'contained' : 'outlined'}
      >
        フォローリスト
      </Button>
      
      <Button 
        fullWidth 
        onClick={() => handleContentSelect('followers', fetchFollowerList)}
        variant={currentContent === 'followers' ? 'contained' : 'outlined'}
      >
        フォロワーリスト
      </Button>
      
      <Button 
        fullWidth 
        onClick={() => handleContentSelect('likedPosts', fetchLikedPosts)}
        variant={currentContent === 'likedPosts' ? 'contained' : 'outlined'}
      >
        いいねした作品
      </Button>
      
      <Button 
        fullWidth 
        onClick={() => handleContentSelect('bookshelf', fetchBookshelf)}
        variant={currentContent === 'bookshelf' ? 'contained' : 'outlined'}
      >
        自分の本棚
      </Button>
      
      <Button 
        fullWidth 
        onClick={() => handleContentSelect('bookmarks', fetchBookmarks)}
        variant={currentContent === 'bookmarks' ? 'contained' : 'outlined'}
      >
        しおりを見る
      </Button>
      
      <Button 
        fullWidth 
        onClick={() => handleContentSelect('contests', fetchContests)}
        variant={currentContent === 'contests' ? 'contained' : 'outlined'}
      >
        コンテストを開催
      </Button>
    </Box>
  );
};

export default Sidebar;
