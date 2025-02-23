import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { SearchProvider } from "./context/SearchContext";  // ✅ 検索コンテキストを追加

import Layout from './components/layout/Layout';
import Home from './pages/Home';
import PostEditor from './pages/PostEditor';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Register from './pages/Register';
import MyPage from './pages/MyPage';
import NovelDetail from './pages/NovelDetail'; // 追加
import UserPage from './pages/UserPage'; // 追加
import SearchPage from './pages/SearchPage'; // サーチページをインポート
import SeriesEditPage from './pages/SeriesEditPage';
import PostEditPage from './pages/PostEditPage';
import WorksInSeries from './pages/WorksInSeries';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AnalytisPage from './pages/AnalytisPage';
import ContestList from './pages/contests/ContestList';
import ContestDetail from './pages/contests/ContestDetail';
import ContestEntry from './pages/contests/ContestEntry';
import ContestCreate from './pages/contests/ContestCreate';
import ContestPreview from './pages/contests/ContestPreview';
import ContestEdit from './pages/contests/ContestEdit';

const theme = createTheme();

function App() {
  const [auth, setAuth] = useState(false);
  const [user, setUser] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL;

  // パラメータで受け取ったトークンを使って、パスワードリセットリクエストをサーバーに送信
  useEffect(() => {

    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/user/me`, {
          credentials: 'include',  // セッションを含めてリクエストを送信
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
    fetchUserData();
  }, []);



  return (
    <ThemeProvider theme={theme}>
      <Router>
      <SearchProvider> {/* ✅ 検索プロバイダーで全体をラップ */}

        <Layout auth={auth} setAuth={setAuth}>
          <Routes>
            <Route path="/" element={<Home auth={auth} />} />
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
              path="/forgot-password"
              element={<ForgotPassword />}
            />
            <Route path="/reset-password" element={<ResetPassword />} />
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
            <Route path="/mypage/series/:id/edit" element={<SeriesEditPage />} />
            <Route path="/mypage/novel/:id/edit" element={<PostEditPage />} />
            <Route path="/series/:id/works" element={<WorksInSeries />} />  {/* ここにルートを追加 */}
            <Route path="/analytics/:id" element={<AnalytisPage />} />  {/* ここにルートを追加 */}
            <Route path="/contests" element={<ContestList />} />
            <Route path="/contests/:id" element={<ContestDetail />} />
            <Route path="/contests/:id/enter" element={<ContestEntry />} />
            <Route path="/contests/create" element={<ContestCreate />} />;
            <Route path="/contest-preview" element={<ContestPreview />} />
            <Route path="/contest-edit/:id" element={<ContestEdit />} />

          </Routes>
        </Layout>
        </SearchProvider>

      </Router>
    </ThemeProvider>
  );
}

export default App;
