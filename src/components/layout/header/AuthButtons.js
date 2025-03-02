import React, { useCallback } from 'react';
import { Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const AuthButtons = React.memo(({ auth, handleLogout }) => {
  const navigate = useNavigate();

  const onLogout = useCallback(async () => {
    await handleLogout();
    navigate('/login');
  }, [handleLogout, navigate]);

  return (
    <Box display="flex" alignItems="center">
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
  );
});

export default AuthButtons;