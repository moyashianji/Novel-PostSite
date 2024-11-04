import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Card, CardContent, Avatar, IconButton, Menu, MenuItem, Modal } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const ReportModal = ({ open, onClose, onSubmit }) => {
  const [reportText, setReportText] = useState('');
  const [charCount, setCharCount] = useState(0);
  const API_URL = process.env.REACT_APP_API_URL;

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
      const response = await fetch(`${API_URL}/api/user/me`, {
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
  const fetchComments = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}/comments?page=${page}&limit=5`);
      const data = await response.json();
      setComments(prevComments => [...prevComments, ...data.comments]);
      setTotalComments(data.totalComments);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);
  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      fetchComments(currentPage + 1);
    }
  };

  const handleCommentSubmit = async () => {
    if (newComment.trim() === '') {
      alert('コメントを入力してください。');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}/comments`, {
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
        fetchComments();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'コメントの追加に失敗しました。');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleReplySubmit = async (parentCommentId) => {
    if (replyText.trim() === '') {
      alert('返信を入力してください。');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}/comments/${parentCommentId}/reply`, {
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
        fetchComments();
      } else {
        const errorData = await response.json();
        alert(errorData.message || '返信の追加に失敗しました。');
      }
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const handleMenuOpen = (event, comment, replyComment = null, replyOpen) => {
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
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedComment(null);
  };

  const handleDeleteComment = async () => {
    let isReply = false;
    let commentId = selectedComment._id; // デフォルトは元コメントのID
    let replyId = null;

    if (selectedReplyComment) {
      isReply = true;
      replyId = selectedReplyComment._id; // 返信コメントのID
    }
    try {
      let url = `${API_URL}/api/posts/${postId}/comments/${commentId}`;
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
              // spliceで状態から返信を削除
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
  };

  const handleReplyClick = (comment) => {
    setReplyTarget(comment);
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

      {comments.map((comment, index) => (
        <Box key={comment._id} sx={{ mt: 2 }}>
          <Card key={comment._id}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center">
                  <Avatar src={`${API_URL}${comment.author.icon}`} alt={comment.author.nickname} sx={{ marginRight: 1 }} />
                  <Typography variant="body2" fontWeight="bold">
                    {comment.author.nickname}
                  </Typography>
                </Box>
                <IconButton onClick={(event) => handleMenuOpen(event, comment)}>
                  <MoreVertIcon />
                </IconButton>
              </Box>
              <Typography variant="body1">{comment.text}</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ px: 2 }}>
                {new Date(comment.createdAt).toLocaleString()}
              </Typography>
              <Button variant="text" color="primary" onClick={() => handleReplyClick(comment)}>返信</Button>
            </CardContent>
          </Card>

          {comment.replies && comment.replies.length > 0 && (
            <Box sx={{ ml: 4 }}>
              {comment.replies.map((reply) => (
                <Card key={`${comment._id}-${reply._id}`} sx={{ mt: 2 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">

                      <Box display="flex" alignItems="center">
                        {
                          // コンソールにアバターのリンクを出力
                          console.log('Avatar URL:', `${API_URL}${reply.author.icon}`)
                        }
                        <Avatar src={`${API_URL}${reply.author.icon}`} alt={reply.author.nickname} sx={{ marginRight: 1 }} />
                        <Typography variant="body2" fontWeight="bold">{reply.author.nickname}</Typography>
                      </Box>
                      <IconButton onClick={(event) => handleMenuOpen(event, comment, reply)}>
                        <MoreVertIcon />
                      </IconButton>
                    </Box>

                    <Typography variant="body1">{reply.text}</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ px: 2 }}>
                      {new Date(reply.createdAt).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {replyTarget?._id === comment._id && (
            <Box sx={{ ml: 4, mt: 2 }}>
              <TextField
                label="返信を入力"
                variant="outlined"
                fullWidth
                multiline
                rows={2}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button variant="contained" color="primary" onClick={() => handleReplySubmit(comment._id)}>返信を投稿</Button>
            </Box>
          )}
        </Box>
      ))}
      {currentPage < totalPages && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Button variant="contained" color="primary" onClick={handleLoadMore} disabled={loading}>
            {loading ? '読み込み中...' : 'さらに表示'}
          </Button>
        </Box>
      )}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} >
        {/* 元コメント削除メニュー */}
        {selectedComment && !selectedReplyComment && selectedComment.author._id === userId && (
          <MenuItem onClick={handleDeleteComment}>コメントを削除</MenuItem>
        )}
        {/* 返信削除メニュー */}
        {selectedReplyComment && selectedReplyComment.author._id === userId && (
          <MenuItem onClick={handleDeleteComment}>返信を削除</MenuItem>
        )}
        {console.log(selectedComment)}
        <MenuItem onClick={() => setReportOpen(true)}>通報</MenuItem>
      </Menu>

      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} onSubmit={(text) => console.log(`Reported: ${text}`)} />
    </Box>
  );
};

export default CommentSection;
