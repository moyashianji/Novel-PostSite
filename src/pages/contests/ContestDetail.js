import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  const [judgeDetails, setJudgeDetails] = useState({});
  const [creatorInfo, setCreatorInfo] = useState(null);
  const [sortOrder, setSortOrder] = useState('latest');

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

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSearchQuery('');
    setFilteredWorks(works);
  }, [works]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredWorks(works);
    } else {
      const lowerCaseQuery = query.toLowerCase();
      setFilteredWorks(
        works.filter((work) => work.title.toLowerCase().includes(lowerCaseQuery))
      );
    }
  }, [works]);

  const isWorkAlreadyApplied = useCallback((workId) =>
    contest.entries.some((entry) => entry.postId._id === workId), [contest]);

  const handleSubmitEntry = useCallback(async (workId) => {
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
  }, [id]);

  const handleCancelEntry = useCallback((workId) => {
    setSelectedWorkForCancellation(workId);
    setConfirmationOpen(true);
  }, []);

  const confirmCancelEntry = useCallback(async () => {
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
  }, [id, selectedWorkForCancellation]);

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
          }
        } catch (error) {
          console.error(`Error fetching judge info for ID ${judgeId}:`, error);
        }
      })
    );

    setJudgeDetails(judgeData);
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

  const sortedEntries = useMemo(() => {
    if (!contest || !contest.entries) return [];
    const sorted = [...contest.entries];

    switch (sortOrder) {
      case 'latest':
        return sorted.sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.submissionDate) - new Date(b.submissionDate));
      case 'mostViewed':
        return sorted.sort((a, b) => b.postId.viewCount - a.postId.viewCount);
      case 'mostLiked':
        return sorted.sort((a, b) => b.postId.likes - a.postId.likes);
      default:
        return sorted;
    }
  }, [contest, sortOrder]);

  const handleTagClick = useCallback((tag) => {
    navigate(`/search?query=${encodeURIComponent(tag)}`);
  }, [navigate]);

  const getStatusChip = useCallback((status) => {
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
  }, []);

  const renderStatusChip = useCallback((status) => (
    <Chip
      label={status ? '可' : '不可'}
      color={status ? 'success' : 'error'}
      sx={{ fontWeight: 'bold', marginLeft: 1 }}
    />
  ), []);

  const formatDate = useCallback((date) => {
    if (!date) return '未設定';

    const parsedDate = new Date(date);

    if (isNaN(parsedDate)) {
      return date;
    }

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');
    const hours = String(parsedDate.getHours()).padStart(2, '0');
    const minutes = String(parsedDate.getMinutes()).padStart(2, '0');

    return `${year}/${month}/${day} ${hours}:${minutes}`;
  }, []);

  const fixImagePaths = useCallback((html) => {
    return html.replace(/<img src="\/uploads\/(.*?)"/g, `<img src="http://localhost:5000/uploads/$1"`);
  }, []);

  if (loading) return <CircularProgress sx={{ display: 'block', margin: '50px auto' }} />;
  if (!contest) return <Typography>コンテストが見つかりませんでした。</Typography>;

  return (
    <Grid container spacing={2} sx={{ maxWidth: '1400px', margin: '0 auto', paddingTop: 4 }}>
      <Grid item xs={12} md={3}>
        <Sidebar
          creatorInfo={creatorInfo}
          contest={contest}
          getStatusChip={getStatusChip}
          handleOpenModal={handleOpenModal}
        />
      </Grid>
      <Grid item xs={12} md={8} sx={{ paddingLeft: 2, paddingRight: 2 }}>
        <Box sx={{ maxWidth: '1200px', margin: '0 auto', padding: 4 }}>
          {contest.headerImage && (
            <HeaderImage headerImage={contest.headerImage} title={contest.title} />
          )}
          <ContestOverview
            contest={contest}
            fixImagePaths={fixImagePaths}
            handleOpenModal={handleOpenModal}
          />
          <EntryConditions
            contest={contest}
            renderStatusChip={renderStatusChip}
            handleTagClick={handleTagClick}
          />
          <ScheduleInfo contest={contest} formatDate={formatDate} />
          {contest.enableJudges && contest.judges.length > 0 && (
            <JudgesInfo judges={contest.judges} />
          )}
          <ApplyModal
            modalOpen={modalOpen}
            handleCloseModal={handleCloseModal}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
            filteredWorks={filteredWorks}
            isWorkAlreadyApplied={isWorkAlreadyApplied}
            handleSubmitEntry={handleSubmitEntry}
            handleCancelEntry={handleCancelEntry}
          />
          <ConfirmationDialog
            confirmationOpen={confirmationOpen}
            setConfirmationOpen={setConfirmationOpen}
            confirmCancelEntry={confirmCancelEntry}
          />
          <EntriesList
            contest={contest}
            sortedEntries={sortedEntries}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />
        </Box>
      </Grid>
    </Grid>
  );
};

const Sidebar = React.memo(({ creatorInfo, contest, getStatusChip, handleOpenModal }) => (
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
      <Box textAlign="center">
        <Button variant="contained" color="primary" size="large" onClick={handleOpenModal}>
          応募する
        </Button>
      </Box>
    </Paper>
  </Box>
));

const HeaderImage = React.memo(({ headerImage, title }) => (
  <Paper elevation={3} sx={{ overflow: 'hidden', borderRadius: '8px', marginBottom: 4 }}>
    <img
      src={headerImage}
      alt={title}
      style={{ width: '100%', height: '300px', objectFit: 'cover' }}
    />
  </Paper>
));

const ContestOverview = React.memo(({ contest, fixImagePaths, handleOpenModal }) => (
  <>
    <Typography variant="h5" gutterBottom>
      コンテスト概要
    </Typography>
    <Paper
      elevation={3}
      sx={{
        padding: 3,
        borderRadius: '8px',
        backgroundColor: '#fff',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        maxWidth: '100%',
        whiteSpace: 'normal',
      }}
    >
      <Typography variant="h3" fontWeight="bold" gutterBottom>
        {contest.title}
      </Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {contest.shortDescription}
      </Typography>
      <div
        className="contest-description"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(fixImagePaths(contest.description)) }}
      />
    </Paper>
    <style>
      {`
        .contest-description img {
          max-width: 100% !important;
          height: auto !important;
          display: block !important;
          margin: 10px auto !important;
        }
      `}
    </style>
    <Box textAlign="center" mt={4}>
      <Button variant="contained" color="primary" size="large" onClick={handleOpenModal}>
        応募する
      </Button>
    </Box>
  </>
));

const EntryConditions = React.memo(({ contest, renderStatusChip, handleTagClick }) => (
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
));

const ScheduleInfo = React.memo(({ contest, formatDate }) => (
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
));

const JudgesInfo = React.memo(({ judges }) => (
  <Box mt={4}>
    <Typography variant="h5" gutterBottom>
      審査員
    </Typography>
    <Grid container spacing={2}>
      {judges.map((judge, index) => (
        <Grid item xs={12} sm={6} md={4} key={judge.userId._id}>
          <Card elevation={3} sx={{ borderRadius: '8px' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <RouterLink to={`/user/${judge.userId._id}`}>
                <Avatar
                  src={judge.userId.icon}
                  alt={judge.userId.nickname}
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
));

const ApplyModal = React.memo(({
  modalOpen,
  handleCloseModal,
  searchQuery,
  setSearchQuery,
  handleSearch,
  filteredWorks,
  isWorkAlreadyApplied,
  handleSubmitEntry,
  handleCancelEntry,
}) => (
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
));

const ConfirmationDialog = React.memo(({
  confirmationOpen,
  setConfirmationOpen,
  confirmCancelEntry,
}) => (
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
));

const EntriesList = React.memo(({
  contest,
  sortedEntries,
  sortOrder,
  setSortOrder,
}) => (
  <Box sx={{ maxWidth: '1200px', margin: '0 auto', padding: 4 }}>
    <Typography variant="h5" gutterBottom>応募作品一覧</Typography>
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
    {contest.entries.length > 0 ? (
      <Grid container spacing={2}>
        {sortedEntries.map((entry) => (
          <Grid item xs={12} sm={6} key={entry.postId._id}>
            <PostCard post={entry.postId} />
          </Grid>
        ))}
      </Grid>
    ) : (
      <Typography variant="body1">まだ応募作品がありません。</Typography>
    )}
  </Box>
));

export default ContestDetail;
