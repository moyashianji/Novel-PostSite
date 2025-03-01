import React, { memo } from 'react';
import { Typography, Box } from '@mui/material';
import Statistics from './Statistics';
import Tags from './Tags';
import AutoScroll from './AutoScroll';
import Content from './Content';
import BookmarkIndicator from './BookmarkIndicator';
import ActionButtons from './ActionButtons';

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

export default NovelContent;
