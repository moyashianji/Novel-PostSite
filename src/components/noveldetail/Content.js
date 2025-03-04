
// Content.js
import React, { memo } from 'react';
import { Typography, Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const ContentContainer = styled(Paper)(({ theme, isbookmarkmode }) => ({
  position: 'relative',
  backgroundColor: isbookmarkmode === 'true' ? 'rgba(63, 81, 181, 0.05)' : theme.palette.background.paper,
  padding: theme.spacing(3, 4),
  cursor: isbookmarkmode === 'true' ? 'pointer' : 'default',
  borderRadius: 16,
  boxShadow: isbookmarkmode === 'true' ? '0 0 0 2px rgba(63, 81, 181, 0.3)' : 'none',
  transition: 'all 0.2s ease',
  marginBottom: theme.spacing(4),
  '&:hover': {
    backgroundColor: isbookmarkmode === 'true' ? 'rgba(63, 81, 181, 0.1)' : theme.palette.background.paper,
    boxShadow: isbookmarkmode === 'true' ? '0 0 0 3px rgba(63, 81, 181, 0.5), 0 6px 16px rgba(0, 0, 0, 0.05)' : 'none',
  },
}));

const NovelText = styled(Typography)(({ theme }) => ({
  fontSize: '1.05rem',
  lineHeight: 1.9,
  letterSpacing: '0.01em',
  color: theme.palette.text.primary,
  
  '& p': {
    marginBottom: theme.spacing(2.5),
    textAlign: 'justify',
  },
  
  '& img': {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: 8,
    margin: theme.spacing(2, 0),
  },
  
  '& a': {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    fontWeight: 700,
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
    color: theme.palette.text.primary,
  },
}));

const Content = memo(({ content, isBookmarkMode, handleTextClick }) => (
  <ContentContainer 
    onClick={handleTextClick}
    isbookmarkmode={isBookmarkMode ? 'true' : 'false'}
    elevation={0}
  >
    <NovelText variant="body1" paragraph>
      <span dangerouslySetInnerHTML={{ __html: content }} />
    </NovelText>
  </ContentContainer>
));

export default Content;