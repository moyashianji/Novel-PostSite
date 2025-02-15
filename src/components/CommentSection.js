import React, { useState, useEffect, useCallback, memo } from 'react';
import { Box, Button, TextField, Typography, Card, CardContent, Avatar, IconButton, Menu, MenuItem, Modal, InputAdornment } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SendIcon from '@mui/icons-material/Send';
import ReplyIcon from '@mui/icons-material/Reply';

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
  const [replyText, setReplyText] = useState(''); // 返信用テキスト
  const [replyTarget, setReplyTarget] = useState(null); // 返信対象
  const [charCount, setCharCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [selectedReplyComment, setSelectedReplyComment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [reportOpen, setReportOpen] = useState(false);
  const [userId, setUserId] = useState(null); // ユーザーIDを保存するステート
  const [loading, setLoading] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;

  // ユーザー情報の取得
  const fetchUserInfo = async () => {
    try {
      const response = await fetch(`/api/user/me`, {
        method: 'GET',
        credentials: 'include', // 認証トークンを含める
      });
      const data = await response.json();
      setUserId(data._id); // ユーザーIDをセット
      console.log(data._id);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  useEffect(() => {
    fetchUserInfo(); // コンポーネントのマウント時にユーザー情報を取得
  }, []);

  const fetchComments = useCallback(async (page = 1, reset = false) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments?page=${page}&limit=5`);
      const data = await response.json();
      if (reset) {
        setComments(data.comments);
      } else {
        setComments(prevComments => [...prevComments, ...data.comments]);
      }
      setTotalComments(data.totalComments);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
    setLoading(false);
  }, [ postId]);

  useEffect(() => {
    fetchComments(1, true);
  }, [fetchComments]);

  const handleLoadMore = useCallback(() => {
    if (currentPage < totalPages) {
      fetchComments(currentPage + 1);
    }
  }, [currentPage, totalPages, fetchComments]);

  const handleCommentSubmit = useCallback(async () => {
    if (newComment.trim() === '') {
      alert('コメントを入力してください。');
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ text: newComment }),
      });

      if (response.ok) {
        setNewComment('');
        setCharCount(0);
        fetchComments(1, true); // コメントリストをリセットして再取得
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'コメントの追加に失敗しました。');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  }, [ postId, newComment, fetchComments]);

  const handleReplySubmit = useCallback(async (parentCommentId) => {
    if (replyText.trim() === '') {
      alert('返信を入力してください。');
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/comments/${parentCommentId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ text: replyText }),
      });

      if (response.ok) {
        setReplyText('');
        setReplyTarget(null);
        fetchComments(1, true); // コメントリストをリセットして再取得
      } else {
        const errorData = await response.json();
        alert(errorData.message || '返信の追加に失敗しました。');
      }
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  }, [ postId, replyText, fetchComments]);

  const handleMenuOpen = useCallback((event, comment, replyComment = null) => {
    setAnchorEl(event.currentTarget);
    setSelectedComment(comment);
    console.log(comment)

    if (replyComment) {
      // 返信コメントが存在する場合は、返信コメントを選択
      setSelectedReplyComment(replyComment);
    } else {
      // 返信がない場合、返信コメントの選択をクリア
      setSelectedReplyComment(null);
    }
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setSelectedComment(null);
  }, []);

  const handleDeleteComment = useCallback(async () => {
    let isReply = false;
    let commentId = selectedComment._id; // デフォルトは元コメントのID
    let replyId = null;

    if (selectedReplyComment) {
      isReply = true;
      replyId = selectedReplyComment._id; // 返信コメントのID
    }
    try {
      let url = `/api/posts/${postId}/comments/${commentId}`;
      console.log(replyId)
      // 返信を削除する場合、replyIdをクエリパラメータとして送信
      if (isReply && replyId) {
        url += `?replyId=${replyId}`;
      }

      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',  // 認証情報を含めてリクエスト
      });

      if (response.ok) {
        if (isReply && replyId) {
          // 返信を削除した場合の更新
          setComments(comments.map(comment => {
            if (comment._id === selectedComment._id) {
              // 返信を削除
              comment.replies = comment.replies.filter(reply => reply._id !== replyId);
            }
            return comment;
          }));
        } else {
          // コメント自体を削除した場合
          setComments(comments.filter(comment => comment._id !== selectedComment._id));
        }
        handleMenuClose();
      } else {
        alert('削除に失敗しました。');
      }
    } catch (error) {
      console.error('Error deleting comment or reply:', error);
    }
  }, [ postId, selectedComment, selectedReplyComment, comments]);

  const handleReplyClick = useCallback((comment) => {
    setReplyTarget(comment);
  }, []);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>コメント</Typography>
      <CommentInput
        newComment={newComment}
        setNewComment={setNewComment}
        charCount={charCount}
        setCharCount={setCharCount}
        handleCommentSubmit={handleCommentSubmit}
      />
      {comments.map((comment) => (
        <Comment
          key={comment._id}
          comment={comment}
          handleMenuOpen={handleMenuOpen}
          handleReplyClick={handleReplyClick}
          replyTarget={replyTarget}
          replyText={replyText}
          setReplyText={setReplyText}
          handleReplySubmit={handleReplySubmit}
          API_URL={API_URL}
        />
      ))}
      {currentPage < totalPages && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Button variant="contained" color="primary" onClick={handleLoadMore} disabled={loading}>
            {loading ? '読み込み中...' : 'さらに表示'}
          </Button>
        </Box>
      )}
      <CommentMenu
        anchorEl={anchorEl}
        handleMenuClose={handleMenuClose}
        handleDeleteComment={handleDeleteComment}
        setReportOpen={setReportOpen}
        selectedComment={selectedComment}
        selectedReplyComment={selectedReplyComment}
        userId={userId}
      />
      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} onSubmit={(text) => console.log(`Reported: ${text}`)} />
    </Box>
  );
};

const CommentInput = memo(({ newComment, setNewComment, charCount, setCharCount, handleCommentSubmit }) => (
  <Box sx={{ mb: 2 }}>
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
      sx={{ mb: 1 }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={handleCommentSubmit} color="primary">
              <SendIcon />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
    <Typography variant="caption" color="textSecondary">
      {charCount}/300
    </Typography>
  </Box>
));

const Comment = memo(({
  comment,
  handleMenuOpen,
  handleReplyClick,
  replyTarget,
  replyText,
  setReplyText,
  handleReplySubmit,
  API_URL
}) => (
  <Box key={comment._id} sx={{ mt: 2 }}>
    <Card sx={{ mb: 2, borderRadius: 2, boxShadow: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <Avatar src={`${comment.author.icon}`} alt={comment.author.nickname} sx={{ marginRight: 1 }} />
            <Typography variant="body2" fontWeight="bold">
              {comment.author.nickname}
            </Typography>
          </Box>
          <IconButton onClick={(event) => handleMenuOpen(event, comment)}>
            <MoreVertIcon />
          </IconButton>
        </Box>
        <Typography variant="body1" sx={{ mt: 1, wordBreak: 'break-word' }}>{comment.text}</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          {new Date(comment.createdAt).toLocaleString()}
        </Typography>
        <Button
          variant="text"
          color="primary"
          startIcon={<ReplyIcon />}
          onClick={() => handleReplyClick(comment)}
          sx={{ mt: 1 }}
        >
          返信
        </Button>
      </CardContent>
    </Card>
    {comment.replies && comment.replies.length > 0 && (
      <Box sx={{ ml: 4 }}>
        {comment.replies.map((reply) => (
          <Reply
            key={`${comment._id}-${reply._id}`}
            comment={comment}
            reply={reply}
            handleMenuOpen={handleMenuOpen}
            API_URL={API_URL}
          />
        ))}
      </Box>
    )}
    {replyTarget?._id === comment._id && (
      <ReplyInput
        replyText={replyText}
        setReplyText={setReplyText}
        handleReplySubmit={handleReplySubmit}
        commentId={comment._id}
      />
    )}
  </Box>
));

const Reply = memo(({ comment, reply, handleMenuOpen, API_URL }) => (
  <Card key={`${comment._id}-${reply._id}`} sx={{ mt: 2, borderRadius: 2, boxShadow: 2 }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center">
          <Avatar src={`${reply.author.icon}`} alt={reply.author.nickname} sx={{ marginRight: 1 }} />
          <Typography variant="body2" fontWeight="bold">{reply.author.nickname}</Typography>
        </Box>
        <IconButton onClick={(event) => handleMenuOpen(event, comment, reply)}>
          <MoreVertIcon />
        </IconButton>
      </Box>
      <Typography variant="body1" sx={{ mt: 1, wordBreak: 'break-word' }}>{reply.text}</Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
        {new Date(reply.createdAt).toLocaleString()}
      </Typography>
    </CardContent>
  </Card>
));

const ReplyInput = memo(({ replyText, setReplyText, handleReplySubmit, commentId }) => (
  <Box sx={{ ml: 4, mt: 2 }}>
    <TextField
      label="返信を入力"
      variant="outlined"
      fullWidth
      multiline
      rows={2}
      value={replyText}
      onChange={(e) => setReplyText(e.target.value)}
      inputProps={{ maxLength: 300 }} // 300文字制限を追加
      sx={{ mb: 1 }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={() => handleReplySubmit(commentId)} color="primary">
              <SendIcon />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
    <Typography variant="caption" color="textSecondary">
      {replyText.length}/300
    </Typography>
  </Box>
));

const CommentMenu = memo(({
  anchorEl,
  handleMenuClose,
  handleDeleteComment,
  setReportOpen,
  selectedComment,
  selectedReplyComment,
  userId
}) => (
  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
    {selectedComment && !selectedReplyComment && selectedComment.author._id === userId && (
      <MenuItem onClick={handleDeleteComment}>コメントを削除</MenuItem>
    )}
    {selectedReplyComment && selectedReplyComment.author._id === userId && (
      <MenuItem onClick={handleDeleteComment}>返信を削除</MenuItem>
    )}
    <MenuItem onClick={() => setReportOpen(true)}>通報</MenuItem>
  </Menu>
));

export default CommentSection;
