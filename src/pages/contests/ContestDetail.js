import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import DOMPurify from 'dompurify';
import PostCard from '../../components/PostCard';

import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Modal,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Avatar,
  Divider,
  Paper,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ContestDetail = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  const [contest, setContest] = useState(null);
  const [works, setWorks] = useState([]);
  const [filteredWorks, setFilteredWorks] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [selectedWorkForCancellation, setSelectedWorkForCancellation] = useState(null);
  const [judgeDetails, setJudgeDetails] = useState({}); // アカウント情報を保存
  const [creatorInfo, setCreatorInfo] = useState(null);
  const [sortOrder, setSortOrder] = useState('latest'); // ✅ 初期ソートを「最新順」に設定

  const navigate = useNavigate();

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const response = await fetch(`/api/contests/${id}`);
        if (response.ok) {
          const data = await response.json();
          setContest(data);
          fetchJudgesInfo(data.judges);
          fetchCreatorInfo(data.creator);

          console.log(data.creator)

        } else {
          console.error('Failed to fetch contest details');
        }
      } catch (error) {
        console.error('Error fetching contest details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContest();
  }, [id]);

  const fetchWorks = async () => {
    try {
      const response = await fetch(`/api/users/me/works`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setWorks(data);
        setFilteredWorks(data);
      } else {
        console.error('Failed to fetch works');
      }
    } catch (error) {
      console.error('Error fetching works:', error);
    }
  };

  const handleOpenModal = async () => {
    await fetchWorks();
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSearchQuery('');
    setFilteredWorks(works);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredWorks(works);
    } else {
      const lowerCaseQuery = query.toLowerCase();
      setFilteredWorks(
        works.filter((work) => work.title.toLowerCase().includes(lowerCaseQuery))
      );
    }
  };

  const isWorkAlreadyApplied = (workId) =>
    contest.entries.some((entry) => entry.postId._id === workId);

  const handleSubmitEntry = async (workId) => {
    try {
      const response = await fetch(`/api/contests/${id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ selectedPostId: workId }),
      });

      if (response.ok) {
        alert('応募が完了しました！');
        setModalOpen(false);
        const contestResponse = await fetch(`/api/contests/${id}`);
        if (contestResponse.ok) {
          const updatedContest = await contestResponse.json();
          setContest(updatedContest);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || '応募に失敗しました。');
      }
    } catch (error) {
      console.error('Error submitting entry:', error);
      alert('応募に失敗しました。');
    }
  };

  const handleCancelEntry = (workId) => {
    setSelectedWorkForCancellation(workId);
    setConfirmationOpen(true);
  };
  const getStatusChip = (status) => {
    switch (status) {
      case '開催予定':
        return <Chip label="開催予定" color="info" />;
      case '募集中':
        return <Chip label="募集中" color="success" />;
      case '募集終了':
        return <Chip label="募集終了" color="error" />;
      case '募集一時停止中':
        return <Chip label="募集一時停止中" color="warning" />;
      default:
        return <Chip label="不明" color="default" />;
    }
  };
  const confirmCancelEntry = async () => {
    try {
      const response = await fetch(`/api/contests/${id}/entry/${selectedWorkForCancellation}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        alert('応募を取り消しました。');
        const contestResponse = await fetch(`/api/contests/${id}`);
        if (contestResponse.ok) {
          const updatedContest = await contestResponse.json();
          setContest(updatedContest);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || '応募取り消しに失敗しました。');
      }
    } catch (error) {
      console.error('Error cancelling entry:', error);
      alert('応募取り消しに失敗しました。');
    } finally {
      setConfirmationOpen(false);
    }
  };
  const handleTagClick = (tag) => {
    navigate(`/search?query=${encodeURIComponent(tag)}`);
  };
  // 「可」「不可」のチップを生成する関数
  const renderStatusChip = (status) => (
    <Chip
      label={status ? '可' : '不可'}
      color={status ? 'success' : 'error'}
      sx={{ fontWeight: 'bold', marginLeft: 1 }}
    />
  );

  const fetchJudgesInfo = async (judgeIds) => {
    if (!judgeIds || judgeIds.length === 0) return;

    const judgeData = {};
    await Promise.all(
      judgeIds.map(async (judgeId) => {
        try {
          const res = await fetch(`/api/users/${judgeId.name}`);
          if (res.ok) {
            const userData = await res.json();
            judgeData[judgeId] = {
              name: userData.nickname,
              avatar: userData.icon,
            };
            console.log(userData.icon)
          }
        } catch (error) {
          console.error(`Error fetching judge info for ID ${judgeId}:`, error);
        }
      })
    );

    setJudgeDetails(judgeData);
  };

  // **ソート処理**
  const sortedEntries = () => {
    if (!contest || !contest.entries) return [];
    const sorted = [...contest.entries];

    switch (sortOrder) {
      case 'latest': // **最新順**
        return sorted.sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate));
      case 'oldest': // **古い順**
        return sorted.sort((a, b) => new Date(a.submissionDate) - new Date(b.submissionDate));
      case 'mostViewed': // **閲覧数順**
        return sorted.sort((a, b) => b.postId.viewCount - a.postId.viewCount);
      case 'mostLiked': // **いいね数順**
        return sorted.sort((a, b) => b.postId.likes - a.postId.likes);
      default:
        return sorted;
    }
  };

  const fetchCreatorInfo = async (creatorId) => {
    if (!creatorId) return;
    try {
      const res = await fetch(`/api/users/${creatorId}`);
      if (!res.ok) throw new Error('主催者情報の取得に失敗しました');
      const data = await res.json();
      setCreatorInfo(data);
    } catch (error) {
      console.error('Error fetching creator info:', error);
    }
  };
  if (loading) return <CircularProgress sx={{ display: 'block', margin: '50px auto' }} />;
  if (!contest) return <Typography>コンテストが見つかりませんでした。</Typography>;
  const fixImagePaths = (html) => {
    return html.replace(/<img src="\/uploads\/(.*?)"/g, `<img src="http://localhost:5000/uploads/$1"`);
  };

  const formatDate = (date) => {
    if (!date) return '未設定'; // ✅ `null` や `undefined` の場合「未設定」を表示

    const parsedDate = new Date(date);

    if (isNaN(parsedDate)) {
      return date; // ✅ `String` の場合、そのまま表示（例: 「1月中旬」など）
    }

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0'); // ✅ `0埋め` で2桁
    const day = String(parsedDate.getDate()).padStart(2, '0');
    const hours = String(parsedDate.getHours()).padStart(2, '0');
    const minutes = String(parsedDate.getMinutes()).padStart(2, '0');

    return `${year}/${month}/${day} ${hours}:${minutes}`; // ✅ `YYYY/MM/DD HH:MM` の形式に変換
  };
  return (
    <Grid container spacing={2} sx={{ maxWidth: '1400px', margin: '0 auto', paddingTop: 4 }}>
      {/* 左サイドバー（主催者情報） */}
      <Grid item xs={12} md={3}>
        <Box sx={{ top: 80 }}>
          <Paper elevation={3} sx={{ padding: 2, borderRadius: '8px', backgroundColor: '#fff' }}>
            <Typography variant="h6" textAlign="center">主催者</Typography>
            {creatorInfo ? (
              <>
                <RouterLink to={`/user/${creatorInfo._id}`}>

                  <Avatar src={creatorInfo.icon} alt={creatorInfo.nickname} sx={{ width: 80, height: 80, mx: 'auto', mt: 2 }} />
                </RouterLink>

                <Typography variant="h6" textAlign="center">{creatorInfo.nickname}</Typography>
              </>
            ) : (
              <Typography variant="body2" textAlign="center">主催者情報を取得中...</Typography>
            )}
            <Divider sx={{ my: 2 }} />
            <Typography variant="h4" fontWeight="bold" textAlign="center">{contest.entries.length}</Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">応募作品総数</Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              {getStatusChip(contest.status)}
            </Box>

            {/* 応募ボタン（ステータスの下に表示） */}
            <Box textAlign="center">
              <Button variant="contained" color="primary" size="large" onClick={handleOpenModal}>
                応募する
              </Button>
            </Box>
          </Paper>
        </Box>
      </Grid>

      <Grid item xs={12} md={8} sx={{ paddingLeft: 2, paddingRight: 2 }}>

        <Box sx={{ maxWidth: '1200px', margin: '0 auto', padding: 4 }}>
          {/* ヘッダー画像 */}
          {contest.headerImage && (
            <Paper elevation={3} sx={{ overflow: 'hidden', borderRadius: '8px', marginBottom: 4 }}>
              <img
                src={contest.headerImage}
                alt={contest.title}
                style={{ width: '100%', height: '300px', objectFit: 'cover' }}
              />
            </Paper>
          )}

          {/* コンテスト概要 */}
          <Typography variant="h5" gutterBottom>
            コンテスト概要
          </Typography>
          <Paper
            elevation={3}
            sx={{
              padding: 3,
              borderRadius: '8px',
              backgroundColor: '#fff',
              wordBreak: 'break-word', // ✅ 長い単語は自動改行
              overflowWrap: 'break-word', // ✅ テキストがはみ出さないように
              maxWidth: '100%', // ✅ Paper の幅を超えないようにする
              whiteSpace: 'normal', // ✅ 余計なスペースを削除
            }}
          >
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              {contest.title}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {contest.shortDescription}
            </Typography>
            {/* WYSIWYG のリッチテキストをそのまま表示 */}
            <div
              className="contest-description"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(fixImagePaths(contest.description)) }}
            />
          </Paper>

          {/* 画像サイズを調整するための CSS */}
          <style>
            {`
              .contest-description img {
                max-width: 100% !important; /* ✅ Paper の幅を超えない */
                height: auto !important; /* ✅ アスペクト比を維持して自動縮小 */
                display: block !important; /* ✅ インライン要素の余白を削除 */
                margin: 10px auto !important; /* ✅ 画像を中央揃え */
              }
            `}
          </style>

          {/* 応募ボタン */}
          <Box textAlign="center" mt={4}>
            <Button variant="contained" color="primary" size="large" onClick={handleOpenModal}>
              応募する
            </Button>
          </Box>

          {/* 応募条件 */}
          <Box mt={4}>
            <Typography variant="h5" gutterBottom>
              応募条件（詳しくはコンテスト概要を読んでください）
            </Typography>
            <Paper elevation={3} sx={{ padding: 3, borderRadius: '8px', backgroundColor: '#fff' }}>
              <List>
                <ListItem>
                  <ListItemText primary="応募可能な作品のステータス" />

                </ListItem>
                <ListItem>
                  <Chip
                    label={contest.allowFinishedWorks ? '完結済作品のみ応募可能' : '未完結作品も応募可能'}
                    color={contest.allowFinishedWorks ? 'success' : 'warning'}
                    sx={{ fontWeight: 'bold', marginLeft: 1 }}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText primary="コンテスト開催前に投稿された作品の応募" />

                </ListItem>
                <ListItem>
                  {renderStatusChip(contest.allowPreStartDate)}

                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText primary="R18作品" />
                </ListItem>
                <ListItem>
                  {renderStatusChip(contest.allowR18)}

                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText primary="シリーズ作品の応募について" />
                </ListItem>
                <ListItem>
                  {renderStatusChip(contest.allowSeries)}

                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText primary="ジャンル制限" />
                </ListItem>
                <ListItem>
                  <Box>
                    {contest.restrictGenres && contest.genres.length > 0 ? (
                      contest.genres.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          sx={{ marginRight: 0.5, marginBottom: 0.5 }}
                          onClick={() => handleTagClick(tag)}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">なし</Typography>
                    )}
                  </Box>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText primary="AI使用制限" />
                </ListItem>
                <ListItem>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {contest.restrictAI && contest.aiTags.length > 0 ? (
                      contest.aiTags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          sx={{ marginRight: 0.5, marginBottom: 0.5 }}
                          onClick={() => handleTagClick(tag)}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">なし</Typography>
                    )}
                  </Box>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText primary="文字数制限（最低～最大）" />
                </ListItem>
                <ListItem>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {contest.minWordCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ～
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {contest.maxWordCount > 0 ? contest.maxWordCount : '制限なし'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      文字
                    </Typography>
                  </Box>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText primary="コンテストの実施に必要な最低応募総数" />
                </ListItem>
                <ListItem>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {contest.minEntries > 0 ? contest.minEntries : '制限なし'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      作品
                    </Typography>
                  </Box>
                </ListItem>
              </List>
            </Paper>
          </Box>

          {/* 日程情報 */}
          <Box mt={4}>
            <Typography variant="h5" gutterBottom>
              日程情報
            </Typography>
            <Paper elevation={3} sx={{ padding: 3, borderRadius: '8px', backgroundColor: '#fff' }}>
              <List>
                <ListItem>
                  <ListItemText primary="応募期間" secondary={`${formatDate(contest.applicationStartDate)} - ${formatDate(contest.applicationEndDate)}`} />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText primary="審査期間" secondary={`${formatDate(contest.reviewStartDate)} - ${formatDate(contest.reviewEndDate)}`} />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText primary="結果発表日" secondary={formatDate(contest.resultAnnouncementDate)} />
                </ListItem>
              </List>
            </Paper>
          </Box>
          {/* 審査員情報 */}
          {contest.enableJudges && contest.judges.length > 0 && (
            <Box mt={4}>
              <Typography variant="h5" gutterBottom>
                審査員
              </Typography>
              <Grid container spacing={2}>
                {contest.judges.map((judge, index) => (
                  <Grid item xs={12} sm={6} md={4} key={judge.userId._id}> {/* ✅ `judge._id` を `key` に使用 */}
                    <Card elevation={3} sx={{ borderRadius: '8px' }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <RouterLink to={`/user/${judge.userId._id}`}>
                          <Avatar
                            src={judge.userId.icon} // ✅ `judge.userId.icon` を直接使用
                            alt={judge.userId.nickname} // ✅ `judge.userId.nickname` を直接使用
                            sx={{ width: 80, height: 80, marginBottom: 2, margin: '0 auto' }}
                          />
                        </RouterLink>
                        <Typography variant="h6" fontWeight="bold">
                          {judge.userId.nickname || '不明なユーザー'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

          )}

          {/* Apply Modal */}
          <Modal open={modalOpen} onClose={handleCloseModal}>
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              maxHeight: '80vh',
              overflowY: 'auto',
            }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">応募する作品を選択</Typography>
                <IconButton onClick={handleCloseModal}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <TextField
                placeholder="作品名を検索"
                fullWidth
                variant="outlined"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                sx={{ mb: 2 }}
              />
              {filteredWorks.length > 0 ? (
                <List>
                  {filteredWorks.map((work) => (
                    <ListItem
                      key={work._id}
                      button
                      sx={{ border: '1px solid #ccc', borderRadius: '8px', mb: 1 }}
                    >
                      <ListItemText
                        primary={work.title}
                        secondary={work.description || '説明なし'}
                      />
                      {isWorkAlreadyApplied(work._id) ? (
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => handleCancelEntry(work._id)}
                        >
                          応募取り消し
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleSubmitEntry(work._id)}
                        >
                          応募
                        </Button>
                      )}
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2">まだ投稿がありません。</Typography>
              )}
            </Box>
          </Modal>

          {/* Confirmation Dialog */}
          <Dialog
            open={confirmationOpen}
            onClose={() => setConfirmationOpen(false)}
          >
            <DialogTitle>応募取り消しの確認</DialogTitle>
            <DialogContent>
              <DialogContentText>
                本当にこの作品の応募を取り消してもよろしいですか？
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmationOpen(false)}>いいえ</Button>
              <Button onClick={confirmCancelEntry} color="primary" autoFocus>
                はい
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
        <Box sx={{ maxWidth: '1200px', margin: '0 auto', padding: 4 }}>
          <Typography variant="h5" gutterBottom>応募作品一覧</Typography>

          {/* ソート選択 */}
          <FormControl sx={{ minWidth: 200, mb: 2 }}>
            <InputLabel>ソート順</InputLabel>
            <Select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <MenuItem value="latest">最新順</MenuItem>
              <MenuItem value="oldest">古い順</MenuItem>
              <MenuItem value="mostViewed">閲覧数が多い順</MenuItem>
              <MenuItem value="mostLiked">いいね数が多い順</MenuItem>
            </Select>
          </FormControl>

          {/* 応募作品一覧 */}
          {contest.entries.length > 0 ? (
            <Grid container spacing={2}>
              {sortedEntries().map((entry) => (
                <Grid item xs={12} sm={6} key={entry.postId._id}>
                  <PostCard post={entry.postId} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1">まだ応募作品がありません。</Typography>
          )}
        </Box>
      </Grid>


    </Grid>


  );
};

export default ContestDetail;
