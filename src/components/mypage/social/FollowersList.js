import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAPI } from '../../../hooks/useAPI';

const FollowersList = ({ followerList = [] }) => {
  const navigate = useNavigate();
  const { API_URL } = useAPI();

  const handleCardClick = (userId) => {
    navigate(`/user/${userId}`);
  };

  if (followerList.length === 0) {
    return (
      <Box sx={{ padding: 2, width: '100%', textAlign: 'center' }}>
        <Typography>フォロワーはいません</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {followerList.map((user) => (
        <Card
          key={user._id}
          sx={{ marginBottom: 2, width: '100%', cursor: 'pointer' }}
          onClick={() => handleCardClick(user._id)}
        >
          <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar src={`${API_URL}${user.icon}`} alt={user.nickname} sx={{ marginRight: 2 }} />
            <Box>
              <Typography variant="subtitle1">{user.nickname}</Typography>
              <Typography variant="body2" color="textSecondary">
                {user.description}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default FollowersList;
