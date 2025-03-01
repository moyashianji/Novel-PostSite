import React from 'react';
import { Box } from '@mui/material';

// Import content components
import WorksList from './works/WorksList';
import SeriesList from './series/SeriesList';
import FollowingList from './social/FollowingList';
import FollowersList from './social/FollowersList';
import LikedPostsList from './library/LikedPostsList';
import BookshelfList from './library/BookshelfList';
import BookmarksList from './library/BookmarksList';
import ContestsList from './contests/ContestsList';

const ContentSection = ({ contentType, contentData, user }) => {
  const renderContent = () => {
    switch (contentType) {
      case 'works':
        return <WorksList works={contentData} />;
      case 'series':
        return <SeriesList series={contentData} />;
      case 'following':
        return <FollowingList followingList={contentData} />;
      case 'followers':
        return <FollowersList followerList={contentData} />;
      case 'likedPosts':
        return <LikedPostsList likedPosts={contentData} />;
      case 'bookshelf':
        return <BookshelfList bookshelf={contentData} />;
      case 'bookmarks':
        return <BookmarksList bookmarks={contentData} />;
      case 'contests':
        return <ContestsList contests={contentData} user={user} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {renderContent()}
    </Box>
  );
};

export default ContentSection;
