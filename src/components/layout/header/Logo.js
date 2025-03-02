import React from 'react';
import { IconButton, Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const Logo = React.memo(() => (
  <Box sx={{ display: 'flex', alignItems: 'center', marginRight: 2 }}>
    <IconButton
      edge="start"
      color="inherit"
      aria-label="main page"
      component={Link}
      to="/"
      sx={{ marginRight: 1 }}
    >
      <img
        src="./logo.png"
        alt="logo"
        style={{
          height: '40px',
          width: '40px',
          borderRadius: '50%',
          objectFit: 'cover',
        }}
      />
    </IconButton>
    <Box
      component={Link}
      to="/"
      sx={{
        textDecoration: 'none',
        color: 'inherit',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Typography
        sx={{
          fontFamily: "'Dancing Script', cursive",
          fontSize: '28px',
          fontWeight: 'bold',
          lineHeight: '1',
          margin: '0',
          padding: '0',
        }}
      >
        すみわけ
      </Typography>
      <Typography
        sx={{
          fontFamily: "'Roboto', sans-serif",
          fontSize: '12px',
          fontWeight: 'light',
          color: 'white',
          textAlign: 'center',
          lineHeight: '1',
          margin: '0',
        }}
      >
        AI小説投稿サイト
      </Typography>
    </Box>
  </Box>
));

export default Logo;