import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, IconButton, Typography, InputBase, Button, Box, Badge, Container, Grid } from '@mui/material';
import { Search as SearchIcon, Notifications as NotificationsIcon } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';
import Footer from './Footer'; // Footerコンポーネントをインポート
import PostCard from '../components/PostCard'; // PostCardコンポーネントをインポート

// スタイリングされた検索ボックス
const SearchBox = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.grey[200],
  '&:hover': {
    backgroundColor: theme.palette.grey[300],
  },
  width: '100%',
  maxWidth: '600px',
  marginLeft: theme.spacing(2),
  marginRight: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  paddingLeft: `calc(1em + ${theme.spacing(4)})`,
  width: '100%',
  '&::placeholder': {
    color: 'black', // プレースホルダーの文字色を黒に変更
    opacity: 1,
  },
}));

const Layout = ({ children, auth, setAuth }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL;

  // クライアント側でクッキーをチェックして認証状態を管理する
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_URL}/api/check-auth`, {
          method: 'GET',
          credentials: 'include',  // クッキーを含めて送信
        });
        if (response.ok) {
          setAuth(true);
          console.error('Auth check success');

        } else {
          setAuth(false);
          console.error('Auth check failed');

        }
      } catch (error) {
        console.error('Auth check failed', error);
        setAuth(false);
      }
    };
    checkAuth();
  }, [setAuth]);

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_URL}/api/logout`, {
        method: 'POST',
        credentials: 'include', // クッキーを含めて送信
      });
      if (response.ok) {
        setAuth(false);
        navigate('/login'); // ログアウト後にログイン画面に遷移
      } else {
        console.error('Logout failed', response);
      }
    } catch (error) {
      console.error('Error logging out', error);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div>
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
                  lineHeight: '1', // 行間を詰める
                  margin: '0', // 不要な余白を削除
                  padding: '0', // パディングを削除
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
                  lineHeight: '1', // 行間を詰める
                  margin: '0', // 不要な余白を削除
                  padding: '0', // パディングを削除
                }}
              >
                AI小説投稿サイト
              </Typography>
            </Box>
          </Box>

          {/* 中央の検索ボックス */}
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <SearchBox>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="タイトル・タグなどで検索しましょう！"
                inputProps={{ 'aria-label': 'search' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress} // Enterキーで検索実行
              />
            </SearchBox>
            <Button variant="contained" color="secondary" sx={{ marginLeft: 1 }} onClick={handleSearch}>
              検索
            </Button>
          </Box>

          {/* 右側のボタン群 */}
          <Box display="flex" alignItems="center">
            <IconButton color="inherit" sx={{ marginRight: 2 }}>
              <Badge badgeContent={4} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <Button variant="contained" color="primary" sx={{ marginRight: 2 }} component={Link} to="/new-post">
              小説投稿
            </Button>

            {/* ログインしているかどうかで表示を切り替え */}
            {auth ? (
              <>
                <Button variant="outlined" color="inherit" sx={{ marginRight: 2 }} component={Link} to="/mypage">
                  マイページ
                </Button>
                <Button variant="contained" color="secondary" onClick={handleLogout}>
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

      {/* ページ内容 */}
      <Box component="main" sx={{ paddingTop: 8 }}>
        {searchResults.length > 0 ? (
          <Container sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              検索結果
            </Typography>
            <Grid container spacing={3}>
              {searchResults.map((post) => (
                <Grid item xs={12} sm={6} md={4} key={post._id}>
                  <PostCard post={post} />
                </Grid>
              ))}
            </Grid>
          </Container>
        ) : (
          children
        )}
      </Box>

      <Footer />
    </div>
  );
};

export default Layout;
