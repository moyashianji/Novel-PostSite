// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import PVRanking from '../components/PVRanking.js';  // 正しいパスでインポート
import { Box, Typography, Grid,Pagination ,Button, TextField ,IconButton } from '@mui/material';
import PopularTags from '../components/PopularTags'; // 人気タグのコンポーネントをインポート
import { Delete as DeleteIcon } from '@mui/icons-material'; // 削除アイコンをインポート

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tagContainers, setTagContainers] = useState([]);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    const fetchPosts = async (page = 1) => {
      try {
        const response = await fetch(`http://localhost:5000/api/posts?page=${page}`);
        const data = await response.json();
        setPosts(data.posts);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts(currentPage);
  }, [currentPage]);

  const handleChangePage = (event, value) => {
    setCurrentPage(value);
  };
    // タグ追加ボタンのクリック時の処理
    const handleAddTagContainer = () => {
      if (tagContainers.length >= 10) return; // 最大10個まで
      setTagContainers([...tagContainers, { tag: '', posts: [], page: 1, totalPages: 1 }]);
    };
  
    // タグコンテナ内のタグ変更時の処理
    const handleTagChange = (index, value) => {
      const updatedContainers = [...tagContainers];
      updatedContainers[index].tag = value;
      setTagContainers(updatedContainers);
    };
  
    // タグに関連する投稿を取得する処理
    const fetchPostsByTag = async (index, tag, page = 1) => {
      try {
        const response = await fetch(`http://localhost:5000/api/posts/tag/${tag}?page=${page}`);
        const data = await response.json();
        console.log(data)
        const updatedContainers = [...tagContainers];
        updatedContainers[index].posts = data.posts;
        updatedContainers[index].totalPages = data.totalPages;
        updatedContainers[index].page = data.currentPage;
        setTagContainers(updatedContainers);
      } catch (error) {
        console.error('Error fetching posts by tag:', error);
      }
    };
  
  // タグコンテナ内のEnterキーでのタグ登録
  const handleTagSubmit = (index) => {
    fetchPostsByTag(index, tagContainers[index].tag);
  };

  
    // タグコンテナ内のページ変更時の処理
    const handleTagPageChange = (index, value) => {
      const tag = tagContainers[index].tag;
      fetchPostsByTag(index, tag, value);
    };
    // タグコンテナ削除
    const handleDeleteTagContainer = (index) => {
      const updatedContainers = [...tagContainers];
      updatedContainers.splice(index, 1); // 指定したコンテナを削除
      setTagContainers(updatedContainers);
    };
  
  return (
    <Grid container spacing={1} sx={{ maxWidth: '1400px', margin: '0 auto', paddingTop: 4 }}>
      {/* 左サイドバー: 人気タグ一覧 */}
      <Grid item xs={12} md={2.5} sx={{ paddingLeft: 1 }}>
        <Box sx={{ paddingRight: 1 }}>
          <PopularTags />
        </Box>
      </Grid>

      {/* 中央: 新着作品 */}
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
            count={totalPages} // 総ページ数
            page={currentPage}
            onChange={handleChangePage}
            color="primary"
          />
        </Box>

        {/* タグ追加機能 */}
        {/* タグ追加機能 */}
        <Box mt={4}>
          <Typography variant="h5">タグ登録機能（最大10個まで登録可能）</Typography>
          <Grid container spacing={2}>
            {tagContainers.map((container, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Box
                  sx={{
                    border: '1px dashed #ccc',
                    padding: 2,
                    backgroundColor: '#f9f9f9',
                    minHeight: '150px', // 最低限の高さを設定
                    height: 'auto',     // コンテンツに応じて高さを自動調整                    
                  }}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    {/* タグ削除ボタン */}
                    <IconButton
                      onClick={() => handleDeleteTagContainer(index)}
                      sx={{ marginRight: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>

                    {/* タグ入力テキストフィールド */}
                    <TextField
                      label="タグを入力"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      value={container.tag}
                      onChange={(e) => handleTagChange(index, e.target.value)}
                    />

                    {/* タグ登録ボタン */}
                    <Button variant="contained" onClick={() => handleTagSubmit(index)}>
                      登録
                    </Button>
                  </Box>
                  {container.posts.length > 0 ? (
                    <Box>
                      {container.posts.map(post => (
                        <PostCard post={post} />

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
            ))}

            {tagContainers.length < 10 && (
              <Grid item xs={12} sm={6}>
                <Button
                  onClick={handleAddTagContainer}
                  sx={{
                    border: '1px dashed #ccc',
                    padding: '16px',
                    width: '100%',
                    height: '20',
                    backgroundColor: '#f9f9f9',
                    minHeight: '150px', // 最低限の高さを設定
                    height: 'auto',     // コンテンツに応じて高さを自動調整 
                  }}
                >
                  タグを追加
                </Button>
              </Grid>
            )}
          </Grid>
        </Box>
      </Grid>

      {/* 右サイドバー: PVランキング */}
      <Grid item xs={12} md={2.5} sx={{ paddingRight: 1 }}>
        <Box sx={{ paddingLeft: 1 }}>
          <PVRanking />
        </Box>
      </Grid>
    </Grid>
  );
};
export default Home;
