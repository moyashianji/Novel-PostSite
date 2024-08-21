// src/components/ProfileInfo.js
import React from 'react';
import { Box, Avatar, Typography, IconButton } from '@mui/material';
import EditProfile from './EditProfile';
import TwitterIcon from '@mui/icons-material/Twitter';
import PixivIcon from '@mui/icons-material/Pix';
import LinkIcon from '@mui/icons-material/Link';

const ProfileInfo = ({ user, onProfileUpdate }) => { // onProfileUpdate を受け取る
  return (
    <Box display="flex" alignItems="center" p={2}>
<Avatar
  src={`http://localhost:5000${user.icon}?${new Date().getTime()}`} // キャッシュバスターを追加
  alt={user.nickname}
  sx={{ width: 80, height: 80, mr: 2 }}
/><Box flexGrow={1}>
        <Typography variant="h6">{user.nickname}</Typography>
        <Typography variant="body2" color="textSecondary">{user.description}</Typography>
        <Box mt={1} display="flex" alignItems="center">
          {user.xLink && (
            <IconButton href={user.xLink} target="_blank">
              <TwitterIcon />
            </IconButton>
          )}
          {user.pixivLink && (
            <IconButton href={user.pixivLink} target="_blank">
              <PixivIcon />
            </IconButton>
          )}
          {user.otherLink && (
            <IconButton href={user.otherLink} target="_blank">
              <LinkIcon />
            </IconButton>
          )}
        </Box>
      </Box>
      <EditProfile user={user} onProfileUpdate={onProfileUpdate} /> {/* onProfileUpdate を渡す */}
    </Box>
  );
};

export default ProfileInfo;
