// src/pages/Home.js
import React, { useState, useEffect, useTransition, useCallback, useMemo } from 'react';
import PostCard from '../components/PostCard';
import PVRanking from '../components/PVRanking.js';  // 正しいパスでインポート
import { Box, Typography, Grid, Pagination, Button, TextField, IconButton } from '@mui/material';
import PopularTags from '../components/PopularTags'; // 人気タグのコンポーネントをインポート
import { Delete as DeleteIcon } from '@mui/icons-material'; // 削除アイコンをインポート

const Home = ({ auth }) => {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tagContainers, setTagContainers] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isPending, startTransition] = useTransition();  // useTransitionを使用
  const [text, setText] = useState({});  // 各タグ入力用の一時的な状態

  useEffect(() => {
    const fetchPosts = async (page = 1) => {
      try {
        const response = await fetch(`http://localhost:5000/api/posts?page=${page}`);
        const data = await response.json();
        startTransition(() => {

        setPosts(data.posts);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
      });

      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts(currentPage);


  }, [auth, currentPage]);

  const handleChangePage = useCallback((event, value) => {
    setCurrentPage(value);
  }, []);

  // ユーザーのタグ情報を取得する
  const fetchUserTags = useCallback(async () => {
    if (!auth) return;
    try {
      const response = await fetch(`http://localhost:5000/api/users/tags`, {
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
      const response = await fetch(`http://localhost:5000/api/users/tags`, {
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

      const response = await fetch(`http://localhost:5000/api/posts/tag/${tag}?page=${page}`);
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
    const response = await fetch(`http://localhost:5000/api/users/tags/${index}`, {
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

  return (
    <Grid container spacing={1} sx={{ maxWidth: '1400px', margin: '0 auto', paddingTop: 4 }}>
      <Grid item xs={12} md={2.5} sx={{ paddingLeft: 1 }}>
        <Box sx={{ paddingRight: 1 }}>
          <PopularTags />
        </Box>
      </Grid>

      <Grid item xs={12} md={7} sx={{ paddingLeft: 2, paddingRight: 2 }}>
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
          <PVRanking />
        </Box>
      </Grid>
    </Grid>
  );
};

export default React.memo(Home);
