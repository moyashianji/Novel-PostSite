import React, { useState, useEffect } from 'react';
import { Grid, Box } from '@mui/material';
import ProfileInfo from '../components/profile/ProfileInfo';
import Sidebar from '../components/mypage/Sidebar';
import ContentSection from '../components/mypage/ContentSection';
import { useAPI } from '../hooks/useAPI';

const MyPage = () => {
  const [user, setUser] = useState(null);
  const [displayedContent, setDisplayedContent] = useState('works');
  const [contentData, setContentData] = useState([]);
  
  const { fetchUserData } = useAPI();

  useEffect(() => {
    // Fetch user data on component mount
    const loadUserData = async () => {
      const userData = await fetchUserData();
      if (userData) {
        setUser(userData);
      }
    };
    
    loadUserData();
  }, []);

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleContentChange = (contentType, data) => {
    setDisplayedContent(contentType);
    setContentData(data);
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
        <Sidebar 
          onContentChange={handleContentChange} 
          currentContent={displayedContent}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <ContentSection 
          contentType={displayedContent} 
          contentData={contentData}
          user={user}
        />
      </Grid>

      {/* Right sidebar/empty space */}
      <Grid item xs={12} md={3}>
        <Box sx={{ height: '100%', backgroundColor: 'transparent' }} />
      </Grid>
    </Grid>
  );
};

export default MyPage;
