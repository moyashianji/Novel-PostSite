// src/pages/Home.js
import React, { useState, useEffect, useTransition, useCallback, useMemo } from 'react';
import PostCard from '../components/PostCard';
import PVRanking from '../components/PVRanking.js';  // 正しいパスでインポート
import { Box, Typography, Grid, Card,Pagination, Button, TextField, IconButton, Paper, CardContent, CardMedia } from '@mui/material';
import PopularTags from '../components/PopularTags'; // 人気タグのコンポーネントをインポート
import { Delete as DeleteIcon } from '@mui/icons-material'; // 削除アイコンをインポート
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Home = ({ auth }) => {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tagContainers, setTagContainers] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isPending, startTransition] = useTransition();  // useTransitionを使用
  const [text, setText] = useState({});  // 各タグ入力用の一時的な状態
  const [announcements, setAnnouncements] = useState([]); // 運営からのお知らせ
  const [contests, setContests] = useState([]); // 開催中のコンテスト
  const navigate = useNavigate();

  const ADMIN_USER_ID = '66c360d0dd9964e79ab728b6';

  const API_URL = process.env.REACT_APP_API_URL;
  const MAX_ANNOUNCEMENTS_DISPLAY = 5; // 表示する最大数
  const MAX_CONTESTS_DISPLAY = 10; // 表示する最大数

  useEffect(() => {
    const fetchPosts = async (page = 1) => {
      try {
        const response = await fetch(`${API_URL}/api/posts?page=${page}`);
        const data = await response.json();
        // カスタムヘッダーを取得する
        const proxyStatus = response.headers.get('X-Proxy-Status');

        // ヘッダー情報を画面に表示
        console.log(proxyStatus);  // "Served via Nginx"と表示されます

        startTransition(() => {

          setPosts(data.posts);
          setTotalPages(data.totalPages);
          setCurrentPage(data.currentPage);
        });

      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    const fetchAnnouncements = async () => {
      try {
        const response = await fetch(`${API_URL}/api/users/${ADMIN_USER_ID}/works`);
        if (response.ok) {
          const data = await response.json();
          const sortedAnnouncements = data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          ); // 新しい投稿ほど上に表示
          setAnnouncements(sortedAnnouncements);
        } else {
          console.error('Failed to fetch announcements');
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    };

    const fetchContests = async () => {
      try {
        const response = await fetch('/api/contests');
        if (response.ok) {
          const data = await response.json();
          setContests(data);
        } else {
          console.error('Failed to fetch contests');
        }
      } catch (error) {
        console.error('Error fetching contests:', error);
      }
    };
    fetchPosts(currentPage);
    fetchAnnouncements();
    fetchContests();

  }, [auth, currentPage, ADMIN_USER_ID]);


  const handleChangePage = useCallback((event, value) => {
    setCurrentPage(value);
  }, []);
  const renderedAnnouncements = useMemo(() => (
    <Paper elevation={3} sx={{ padding: 2, marginBottom: 2 }}>
      <Typography variant="h6" gutterBottom>
        お知らせ
      </Typography>
      {announcements.length > 0 ? (
        <ul style={{ paddingLeft: 16, margin: 0 }}>
          {announcements.slice(0, MAX_ANNOUNCEMENTS_DISPLAY).map((post, index) => (
            <React.Fragment key={post._id}>
              <li
                key={post._id}
                style={{
                  marginBottom: '1px',
                  transition: 'background-color 0.3s',
                  borderRadius: '4px',
                }}
              >
                <Link
                  to={`/novel/${post._id}`}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    padding: '8px',
                    display: 'block',
                    borderRadius: '4px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      wordBreak: 'break-word', // 折り返しを許可
                      whiteSpace: 'pre-wrap',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      lineHeight: 1.3,
                    }}
                  >
                    {post.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      marginTop: '4px',
                      fontSize: '12px',
                      color: 'gray',
                    }}
                  >
                    {new Date(post.createdAt).toLocaleString()}
                  </Typography>
                </Link>
              </li>
              {/* 投稿の間に水平線を挿入（最後の要素を除く） */}
              {index < announcements.slice(0, MAX_ANNOUNCEMENTS_DISPLAY).length - 1 && (
                <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '1px 0' }} />
              )}
            </React.Fragment>
          ))}
        </ul>
      ) : (
        <Typography variant="body2" color="textSecondary">
          現在お知らせはありません。
        </Typography>
      )}
      {announcements.length > MAX_ANNOUNCEMENTS_DISPLAY && (
        <Box textAlign="center" mt={2}>
          <Button
            variant="text"
            color="primary"
            component={Link}
            to={`/user/${ADMIN_USER_ID}`}
            style={{ textDecoration: 'none' }}
          >
            もっと見る
          </Button>
        </Box>
      )}
    </Paper>
  ), [announcements]);


  // ユーザーのタグ情報を取得する
  const fetchUserTags = useCallback(async () => {
    if (!auth) return;
    try {
      const response = await fetch(`${API_URL}/api/users/tags`, {
        method: 'GET',

        credentials: 'include',  // 認証情報を含めてリクエスト
      });
      const data = await response.json();

      const fetchedTagContainers = data.tagContainers || [];  // tagContainersがundefinedの場合に空配列をセット
      console.log('Fetched tag containers:', fetchedTagContainers); // コンテナの状態を確認
      startTransition(() => {

        setTagContainers(fetchedTagContainers);

        // 各タグに関連する投稿を取得
        fetchedTagContainers.forEach((container, index) => {
          if (container.tag) {
            console.log(`Fetching posts for tag: ${container.tag}, index: ${index}`);
            fetchPostsByTag(index, container.tag);  // 各タグに対応する投稿を取得
          }
        });
      });

    } catch (error) {
      console.error('Error fetching user tags:', error);
    }
  }, [auth]);

  // タグ情報を保存する
  const saveTagToUser = useCallback(async (index, tag) => {
    try {
      const response = await fetch(`${API_URL}/api/users/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',  // 認証情報を含めてリクエスト
        body: JSON.stringify({ index, tag }),
      });
      if (response.ok) {
        console.log('タグ情報が保存されました');
      }
    } catch (error) {
      console.error('Error saving tag:', error);
    }
  }, []);
  // タグコンテナ内の登録ボタンを押したときにのみ呼び出す
  const handleTagSubmit = useCallback((index) => {
    const tag = text[index] || '';  // 一時的な text からタグを取得
    startTransition(() => {
      fetchPostsByTag(index, tag);
      saveTagToUser(index, tag);
    });
  }, [text, saveTagToUser]);

  // タグ追加ボタンのクリック時の処理
  const handleAddTagContainer = useCallback(() => {
    if (tagContainers.length >= 10) return; // 最大10個まで
    startTransition(() => {

      setTagContainers([...tagContainers, { tag: '', posts: [], page: 1, totalPages: 1 }]);
    });
  }, [tagContainers]);

  // タグコンテナ内のタグ変更時の処理（入力のみを更新）
  const handleTagChange = useCallback((index, value) => {
    const updatedContainers = [...tagContainers];
    updatedContainers[index] = { ...updatedContainers[index], tag: value };  // タグの入力のみを更新
    setTagContainers(updatedContainers);
  }, [tagContainers]);
  // タグコンテナ内のテキストフィールドの入力内容を保存（登録ボタン押下まで保存しない）
  const handleTextChange = useCallback((index, value) => {
    setText(prevText => ({
      ...prevText,
      [index]: value
    }));
  }, []);
  // 依存関係から tagContainers を除外し、初期化後に一度だけ実行
  // タグに関連する投稿を取得する処理
  const fetchPostsByTag = useCallback(async (index, tag, page = 1) => {
    if (!tagContainers[index]) {
      console.error(`Invalid index: ${index}`);
      return;
    }
    try {

      const response = await fetch(`${API_URL}/api/posts/tag/${tag}?page=${page}`);
      const data = await response.json();
      console.log(data.posts)
      startTransition(() => {

        const updatedContainers = [...tagContainers];
        updatedContainers[index].posts = data.posts;  // postsがundefinedの場合に空配列
        updatedContainers[index].totalPages = data.totalPages;
        updatedContainers[index].page = data.currentPage;
        updatedContainers[index].fetched = true; // 投稿取得済みフラグ

        console.log('Updated containers:', updatedContainers); // 更新されたコンテナを確認

        setTagContainers(updatedContainers);
      });

    } catch (error) {
      console.error('Error fetching posts by tag:', error);
    }
  }, [tagContainers]);

  useEffect(() => {
    if (tagContainers.length > 0) {
      tagContainers.forEach((container, index) => {
        if (container.tag && !container.fetched) {  // まだ取得されていない場合のみ取得
          console.log(`Fetching posts for tag: ${container.tag}, index: ${index}`);

          fetchPostsByTag(index, container.tag);
        }
      });
    }
  }, [tagContainers]);  // tagContainersが更新されたら再実行
  useEffect(() => {
    if (auth) {
      fetchUserTags();  // ページ読み込み時にユーザーのタグコンテナ情報を取得
      console.log('Initial tag containers:', tagContainers); // ここで初期化の確認

    }
  }, [auth]);
  // タグコンテナ内のページ変更時の処理
  const handleTagPageChange = useCallback((index, value) => {
    const tag = tagContainers[index].tag;
    fetchPostsByTag(index, tag, value);
  }, [tagContainers, fetchPostsByTag]);
  // タグコンテナ削除
  // タグコンテナ削除
  const handleDeleteTagContainer = useCallback(async (index) => {
    try {
      // サーバーに削除リクエストを送信
      const response = await fetch(`${API_URL}/api/users/tags/${index}`, {
        method: 'DELETE',
        credentials: 'include',  // 認証情報を含めてリクエスト
      });

      if (response.ok) {
        startTransition(() => {
          // フロントエンドでもタグコンテナを削除し、インデックスを詰める
          const updatedContainers = [...tagContainers];
          updatedContainers.splice(index, 1); // 指定したコンテナを削除

          // インデックスを詰める処理
          const updatedContainersWithCorrectIndex = updatedContainers.map((container, newIndex) => ({
            ...container,
            index: newIndex,  // 新しいインデックスを割り当て
          }));

          setTagContainers(updatedContainersWithCorrectIndex);
        });
      } else {
        console.error('Error deleting tag on server');
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  }, [tagContainers]);
  const renderedTagContainers = useMemo(() => tagContainers.map((container, index) => (
    <Grid item xs={12} sm={6} key={index}>
      <Box
        sx={{
          border: '1px dashed #ccc',
          padding: 2,
          backgroundColor: '#f9f9f9',
          minHeight: '150px',
          height: 'auto',
        }}
      >
        {auth ? (
          <>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <IconButton onClick={() => handleDeleteTagContainer(index)} sx={{ marginRight: 1 }}>
                <DeleteIcon />
              </IconButton>
              <TextField
                label="タグを入力"
                variant="outlined"
                fullWidth
                margin="normal"
                value={text[index] !== undefined ? text[index] : container.tag || ''}  // textが存在しない場合はcontainer.tagを初期値として使用
                onChange={(e) => handleTextChange(index, e.target.value)}
                inputProps={{ maxLength: 200 }}

              />
              <Button variant="contained" onClick={() => handleTagSubmit(index)}>
                登録
              </Button>
            </Box>
          </>
        ) : (
          <Typography variant="h6">{container.tag || ''}</Typography>
        )}
        {container.posts && container.posts.length > 0 ? (
          <Box>
            {container.posts.map(post => (
              <PostCard post={post} key={post._id} />
            ))}
            <Pagination
              count={container.totalPages}
              page={container.page}
              onChange={(e, value) => handleTagPageChange(index, value)}
            />
          </Box>
        ) : (
          <Typography variant="body2">まだ投稿がありません。</Typography>
        )}
      </Box>
    </Grid>
  )), [tagContainers, handleDeleteTagContainer, handleTagSubmit, handleTagPageChange, text, auth]);

  const handleViewContest = (id) => {
    navigate(`/contests/${id}`);
  };

  const renderedContests = useMemo(() => (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        開催中のコンテスト
      </Typography>
      <Grid container spacing={3}>
        {contests.map((contest) => (
          <Grid item xs={12} sm={6} md={4} key={contest._id}>
            <Card
              sx={{
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              <CardMedia
                component="img"
                height="180"
                image={`${API_URL}${contest.headerImage}`}
                alt={contest.title}
                sx={{
                  filter: 'brightness(0.8)', // 画像を暗くしてテキストを見やすく
                  cursor: 'pointer', // マウスカーソルをポインタに変更
                }}
                onClick={() => handleViewContest(contest._id)} // 画像クリックで遷移
              />
              <CardContent
                sx={{
                  padding: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                {/* タイトル */}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                    wordBreak: 'break-word', // タイトルが長い場合は折り返し表示
                  }}
                >
                  {contest.title}
                </Typography>
                {/* 応募期間 */}
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 'bold',
                    color: 'gray',
                  }}
                >
                  応募期間: {new Date(contest.applicationStartDate).toLocaleDateString()} 〜{' '}
                  {new Date(contest.applicationEndDate).toLocaleDateString()}
                </Typography>
                {/* 説明文 */}
                <Typography
                  variant="body2"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: 'gray',
                  }}
                >
                  {contest.description.slice(0, 20)}...
                </Typography>
              </CardContent>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: 2,
                  background: 'linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent)',
                  color: 'white',
                }}
              />
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => handleViewContest(contest._id)}
                sx={{
                  borderRadius: 0,
                }}
              >
                詳細を見る
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  ), [contests]);
  

  return (
    <Grid container spacing={1} sx={{ maxWidth: '1400px', margin: '0 auto', paddingTop: 4 }}>

      <Grid item xs={12} md={2.5} sx={{ paddingLeft: 1 }}>
        <Box sx={{ paddingRight: 1 }}>
          <PopularTags />
        </Box>
      </Grid>

      <Grid item xs={12} md={7} sx={{ paddingLeft: 2, paddingRight: 2 }}>
      {renderedContests} {/* 開催中のコンテスト一覧 */}

        <Typography variant="h4" gutterBottom>
          新着作品
        </Typography>
        {posts.length > 0 ? (
          <Grid container spacing={2}>
            {posts.map(post => (
              <Grid item xs={12} sm={6} key={post._id}>
                <PostCard post={post} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body1">まだ投稿がありません。</Typography>
        )}
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handleChangePage}
            color="primary"
          />
        </Box>

        <Box mt={4}>
          <Typography variant="h5">
            {auth ? 'タグ登録機能（最大10個まで登録可能）' : 'デフォルトタグの投稿'}
          </Typography>
          <Grid container spacing={2}>
            {renderedTagContainers}
            {auth && tagContainers.length < 10 && (
              <Grid item xs={12} sm={6}>
                <Button
                  onClick={handleAddTagContainer}
                  sx={{
                    border: '1px dashed #ccc',
                    padding: '16px',
                    width: '100%',
                    height: '20',
                    backgroundColor: '#f9f9f9',
                    minHeight: '150px',
                    height: 'auto',
                  }}
                >
                  タグを追加
                </Button>
              </Grid>
            )}
          </Grid>
        </Box>
      </Grid>

      <Grid item xs={12} md={2.5} sx={{ paddingRight: 1 }}>
        <Box sx={{ paddingLeft: 1 }}>
          {renderedAnnouncements}

          <PVRanking />     
        </Box>
      </Grid>
    </Grid>
  );
};

export default React.memo(Home);
