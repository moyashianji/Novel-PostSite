import React, { memo } from 'react';
import { Typography, Box, Paper, Button, Avatar } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const AuthorInfo = memo(({ author, isFollowing, handleFollowToggle }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
    <Paper
      elevation={3}
      sx={{
        padding: 2,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {author && (
        <RouterLink to={`/user/${author._id}`}>
          <Avatar
            src={`${author.icon}`}
            alt={author.nickname}
            sx={{ width: 100, height: 100, marginBottom: 2 }}
          />
        </RouterLink>
      )}
      {author && <Typography variant="h6">{author.nickname}</Typography>}
      <Button
        variant={isFollowing ? 'contained' : 'outlined'}
        color="primary"
        onClick={handleFollowToggle}
        sx={{ mt: 2 }}
      >
        {isFollowing ? 'フォロー解除' : 'フォロー'}
      </Button>
    </Paper>
  </Box>
));

export default AuthorInfo;
