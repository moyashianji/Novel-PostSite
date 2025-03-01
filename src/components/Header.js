import React, { useCallback } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Button, Box, Badge } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from './header/SearchBar';

const Header = React.memo(({ auth, handleLogout }) => {
  const navigate = useNavigate();

  const onLogout = useCallback(async () => {
    await handleLogout();
    navigate('/login');
  }, [handleLogout, navigate]);

  return (
    <AppBar position="fixed">
      <Toolbar sx={{ justifyContent: 'space-between' }}>
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

        <SearchBar />

        <Box display="flex" alignItems="center">
          <IconButton color="inherit" sx={{ marginRight: 2 }}>
            <Badge badgeContent={4} color="secondary"></Badge>
          </IconButton>

          <Button variant="contained" color="primary" sx={{ marginRight: 2 }} component={Link} to="/new-post">
            小説投稿
          </Button>

          {auth ? (
            <>
              <Button variant="outlined" color="inherit" sx={{ marginRight: 2 }} component={Link} to="/mypage">
                マイページ
              </Button>
              <Button variant="contained" color="secondary" onClick={onLogout}>
                ログアウト
              </Button>
            </>
          ) : (
            <>
              <Button variant="outlined" color="inherit" sx={{ marginRight: 2 }} component={Link} to="/login">
                ログイン
              </Button>
              <Button variant="contained" color="secondary" component={Link} to="/register">
                新規登録
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
});

export default Header;