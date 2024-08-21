import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Layout from './components/Layout';
import Home from './pages/Home';
import PostEditor from './pages/PostEditor';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Register from './pages/Register';
import MyPage from './pages/MyPage';
import NovelDetail from './pages/NovelDetail'; // 追加
import UserPage from './pages/UserPage'; // 追加
import SearchPage from './pages/SearchPage'; // サーチページをインポート

const theme = createTheme();

function App() {
  const [auth, setAuth] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuth(true);
      fetchUserData(token);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/user/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        console.error('Failed to fetch user data');
        setAuth(false);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setAuth(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Layout auth={auth} setAuth={setAuth}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchPage />} />

            <Route 
              path="/new-post" 
              element={auth ? <PostEditor user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/login" 
              element={<Login setAuth={setAuth} />} 
            />
            <Route 
              path="/signup" 
              element={<SignUp />} 
            />
            <Route 
              path="/register" 
              element={<Register />} 
            />
            <Route 
              path="/mypage" 
              element={auth ? <MyPage user={user} /> : <Navigate to="/login" />} 
            />
            <Route path="/novel/:id" element={<NovelDetail />} /> {/* 作品詳細のルート */}
            <Route path="/user/:id" element={<UserPage />} /> {/* ユーザー詳細のルート */}
       
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
