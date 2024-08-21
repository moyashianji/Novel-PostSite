import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Card, CardContent, Avatar, IconButton, Menu, MenuItem, Modal } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { styled } from '@mui/system';

const BlurredCardContent = styled(CardContent)(({ blur }) => ({
  filter: blur ? 'blur(4px)' : 'none',
  transition: 'filter 0.5s ease',
}));

const ReportModal = ({ open, onClose, onSubmit }) => {
  const [reportText, setReportText] = useState('');
  const [charCount, setCharCount] = useState(0);

  const handleSubmit = () => {
    if (reportText.trim() !== '') {
      onSubmit(reportText);
      setReportText('');
      setCharCount(0);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 300, bgcolor: 'background.paper', p: 4 }}>
        <Typography variant="h6" gutterBottom>通報</Typography>
        <TextField
          label="通報内容"
          variant="outlined"
          fullWidth
          multiline
          rows={3}
          value={reportText}
          onChange={(e) => {
            setReportText(e.target.value);
            setCharCount(e.target.value.length);
          }}
          inputProps={{ maxLength: 100 }}
          sx={{ mb: 2 }}
        />
        <Typography variant="caption">
          {charCount}/100
        </Typography>
        <Box mt={2} display="flex" justifyContent="space-between">
          <Button variant="contained" color="primary" onClick={handleSubmit}>通報</Button>
          <Button variant="outlined" onClick={onClose}>キャンセル</Button>
        </Box>
      </Box>
    </Modal>
  );
};

const CommentSection = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/comments`);
      const data = await response.json();
      setComments(data.reverse());
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleCommentSubmit = async () => {
    if (newComment.trim() === '') {
      alert('コメントを入力してください。');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('ログインが必要です');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newComment }),
      });

      if (response.ok) {
        setNewComment('');
        setCharCount(0);
        fetchComments(); // 投稿後にコメント一覧を再取得
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'コメントの追加に失敗しました。');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleMenuOpen = (event, comment) => {
    setAnchorEl(event.currentTarget);
    setSelectedComment(comment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedComment(null);
  };

  const handleDeleteComment = async () => {
    if (!selectedComment) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('ログインが必要です');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/posts/${postId}/comments/${selectedComment._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setComments(comments.filter(comment => comment._id !== selectedComment._id));
        handleMenuClose();
      } else {
        alert('コメントの削除に失敗しました。');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleReportSubmit = (reportText) => {
    console.log(`Reported: ${reportText}`);
    handleReportClose();
  };

  const handleReportOpen = () => {
    setReportOpen(true);
    handleMenuClose();
  };

  const handleReportClose = () => {
    setReportOpen(false);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6">コメント</Typography>
      <TextField
        label="コメントを入力"
        variant="outlined"
        fullWidth
        multiline
        rows={3}
        value={newComment}
        onChange={(e) => {
          setNewComment(e.target.value);
          setCharCount(e.target.value.length);
        }}
        inputProps={{ maxLength: 300 }}
        sx={{ mb: 2 }}
      />
      <Typography variant="caption">
        {charCount}/300
      </Typography>
      <Button variant="contained" color="primary" onClick={handleCommentSubmit} sx={{ mt: 2 }}>
        コメントを投稿
      </Button>

      <Box sx={{ mt: 4 }}>
        {comments.slice(0, 2).map((comment, index) => (
          <Card key={comment._id} sx={{ mb: 2 }}>
            <BlurredCardContent blur={!showComments}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" mb={1}>
                  <Avatar src={`http://localhost:5000${comment.author.icon}`} alt={comment.author.nickname} sx={{ marginRight: 1 }} />
                  <Typography variant="body2" fontWeight="bold">
                  {comment.author.nickname} #{index + 1}
                  </Typography>
                </Box>
                <IconButton onClick={(event) => handleMenuOpen(event, comment)}>
                  <MoreVertIcon />
                </IconButton>
              </Box>
              <Typography variant="body1">{comment.text}</Typography>
              <Typography variant="body2" color="textSecondary">
                {new Date(comment.createdAt).toLocaleString()}
              </Typography>
            </BlurredCardContent>
          </Card>
        ))}
      </Box>

      {!showComments && comments.length > 2 && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Button variant="contained" color="primary" onClick={() => setShowComments(true)}>
            コメントを表示
          </Button>
        </Box>
      )}

      {showComments && (
        <Box sx={{ mt: 4 }}>
          {comments.slice(2).map((comment, index) => (
            <Card key={comment._id} sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" mb={1}>
                    <Avatar src={`http://localhost:5000${comment.author.icon}`} alt={comment.author.nickname} sx={{ marginRight: 1 }} />
                    <Typography variant="body2" fontWeight="bold">
                      {comment.author.nickname} #{(index + 3)}
                    </Typography>
                  </Box>
                  <IconButton onClick={(event) => handleMenuOpen(event, comment)}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                <Typography variant="body1">{comment.text}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {new Date(comment.createdAt).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedComment && selectedComment.author._id === localStorage.getItem('userId') && (
          <MenuItem onClick={handleDeleteComment}>削除</MenuItem>
        )}
        <MenuItem onClick={handleReportOpen}>通報</MenuItem>
      </Menu>

      <ReportModal open={reportOpen} onClose={handleReportClose} onSubmit={handleReportSubmit} />
    </Box>
  );
};

export default CommentSection;
