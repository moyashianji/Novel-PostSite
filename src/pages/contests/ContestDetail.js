import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ContestDetail = () => {
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  const [works, setWorks] = useState([]);
  const [filteredWorks, setFilteredWorks] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [selectedWorkForCancellation, setSelectedWorkForCancellation] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const response = await fetch(`${API_URL}/api/contests/${id}`);
        if (response.ok) {
          const data = await response.json();
          setContest(data);
        } else {
          console.error('Failed to fetch contest details');
        }
      } catch (error) {
        console.error('Error fetching contest details:', error);
      }
    };

    fetchContest();
  }, [id, API_URL]);

  const fetchWorks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/me/works`, {
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
      const response = await fetch(`${API_URL}/api/contests/${id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ selectedPostId: workId }),
      });

      if (response.ok) {
        alert('応募が完了しました！');
        setModalOpen(false);
        const contestResponse = await fetch(`${API_URL}/api/contests/${id}`);
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

  const confirmCancelEntry = async () => {
    try {
      const response = await fetch(`${API_URL}/api/contests/${id}/entry/${selectedWorkForCancellation}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        alert('応募を取り消しました。');
        const contestResponse = await fetch(`${API_URL}/api/contests/${id}`);
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

  if (!contest) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ padding: 4 }}>
      {/* Header Section */}
      {contest.headerImage && (
        <Box sx={{ marginBottom: 4 }}>
          <img
            src={`${API_URL}${contest.headerImage}`}
            alt={contest.title}
            style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px' }}
          />
        </Box>
      )}
      <Typography variant="h4" gutterBottom>{contest.title}</Typography>
      <Typography variant="body1" gutterBottom>{contest.description}</Typography>

      {/* Apply Button */}
      <Button variant="contained" color="primary" onClick={handleOpenModal}>
        応募する
      </Button>

      {/* Entries Section */}
      <Typography variant="h6" sx={{ marginTop: 4 }}>応募作品一覧</Typography>
      <Grid container spacing={3} sx={{ marginTop: 2 }}>
        {contest.entries.map(entry => (
          <Grid item xs={12} sm={6} key={entry._id}>
            <Card>
              <CardContent>
                <Typography>{entry.postId.title}</Typography>
                <Typography variant="caption">応募者: {entry.userId.nickname}</Typography>
                <Typography variant="caption" display="block">
                  応募日: {new Date(entry.submissionDate).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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
  );
};

export default ContestDetail;
