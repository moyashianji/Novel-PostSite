import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Card, CardContent, IconButton, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddNovelModal from '../components/AddNovelModal';
import DeleteIcon from '@mui/icons-material/Delete';

const SeriesEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [series, setSeries] = useState(null);
  const [isModified, setIsModified] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  useEffect(() => {
    const fetchSeries = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://localhost:5000/api/series/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        // エピソード番号でソートする
        data.posts.sort((a, b) => a.episodeNumber - b.episodeNumber);

        setSeries(data);
      } catch (error) {
        console.error('Error fetching series details:', error);
      }
    };

    fetchSeries();
  }, [id]);

  const moveCard = useCallback(
    (dragIndex, hoverIndex) => {
      const updatedPosts = [...series.posts];
      const [removed] = updatedPosts.splice(dragIndex, 1);
      updatedPosts.splice(hoverIndex, 0, removed);
  
      console.log(`Moved card from index ${dragIndex} to ${hoverIndex}`);
      console.log('Updated post order after move:', updatedPosts.map(post => ({
        postId: post._id,
        title: post.title,
        newPosition: updatedPosts.indexOf(post) + 1,
      })));
  
      setSeries({ ...series, posts: updatedPosts });
      setIsModified(true); // 移動があった場合、保存ボタンを有効化
    },
    [series]
  );

  const handleAddNovelClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleDeleteClick = (post) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) {
      console.error('No post selected for deletion');
      return;
    }

    console.log('Attempting to delete post with ID:', postToDelete);

    try {
      const response = await fetch(`http://localhost:5000/api/series/${id}/removePost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ postId: postToDelete }),
      });

      if (response.ok) {
        console.log(`Successfully removed post with ID: ${postToDelete}`);
        setSeries({
          ...series,
          posts: series.posts.filter(post => post._id !== postToDelete),
        });
        setDeleteDialogOpen(false);  // ダイアログを閉じる

        setPostToDelete(null);
      } else {
        const errorMessage = await response.text();
        console.error('Failed to remove post from series:', errorMessage);
      }
    } catch (error) {
      console.error('Error removing post from series:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPostToDelete(null);
  };

  const handleSave = async () => {
    const updatedPosts = series.posts.map((post, index) => ({
      postId: post._id, // postIdをそのまま送る
      episodeNumber: index + 1, // カードが上から何番目にあるかを基に新しいエピソード番号を設定
    }));
  
    console.log('Saving new post order:', updatedPosts);
  
    try {
      const response = await fetch(`http://localhost:5000/api/series/${id}/updatePosts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ posts: updatedPosts }),
      });
  
      if (response.ok) {
        console.log('Successfully updated episode numbers.');
        setIsModified(false);
        alert('エピソード番号が更新されました。');
      } else {
        const errorMessage = await response.text();
        console.error('Failed to update posts order:', errorMessage);
      }
    } catch (error) {
      console.error('Error saving updated series:', error);
    }
  };

  if (!series) return <div>Loading...</div>;

  return (
    <DndProvider backend={HTML5Backend}>
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
          <Typography variant="h4" gutterBottom>
            シリーズ: {series.title}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            disabled={!isModified} // 変更がない場合はボタンを無効化
            onClick={handleSave}
          >
            保存
          </Button>
        </Box>
        {series.posts && series.posts.length > 0 ? (
          series.posts.map((post, index) => (
            <CardItem
              key={post._id}
              post={post}
              index={index}
              moveCard={moveCard}
              onDelete={handleDeleteClick} // 削除ボタンのクリックイベントを渡す
            />
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            このシリーズにはまだ作品がありません。
          </Typography>
        )}

        {/* 削除確認ダイアログ */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
        >
          <DialogTitle>作品を削除しますか？</DialogTitle>
          <DialogContent>
            <DialogContentText>
              本当にシリーズからこの作品を削除しますか？この操作は取り消せません。
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} color="primary">
              キャンセル
            </Button>
            <Button onClick={handleDeleteConfirm} color="secondary">
              削除
            </Button>
          </DialogActions>
        </Dialog>
      </Container>

      {/* 右下に固定された「小説を追加」ボタン */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={handleAddNovelClick}
      >
        <AddIcon />
      </Fab>

      {/* モーダル表示 */}
      {isModalOpen && (
        <AddNovelModal
          open={isModalOpen}
          handleClose={handleCloseModal}
          seriesId={id}
        />
      )}
    </DndProvider>
  );
};

export default SeriesEditPage;

const CardItem = ({ post, index, moveCard, onDelete }) => {
  const ref = React.useRef(null);

  const [, drop] = useDrop({
    accept: 'CARD',
    hover(item, monitor) {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveCard(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'CARD',
    item: { type: 'CARD', index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <Card
      ref={ref}
      sx={{
        marginBottom: 2,
        width: '100%',
        cursor: 'move',
        opacity: isDragging ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <IconButton>
        <DragIndicatorIcon />
      </IconButton>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle1">
          {index + 1}. {post.title}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {post.description}
        </Typography>
        <Box display="flex" justifyContent="space-between" sx={{ marginTop: 1 }}>
          <Typography variant="caption">いいね数: {post.goodCounter}</Typography>
          <Typography variant="caption">本棚登録数: {post.bookShelfCounter}</Typography>
          <Typography variant="caption">閲覧数: {post.viewCounter}</Typography>
        </Box>
      </CardContent>
      <IconButton
        onClick={() => onDelete(post._id)} // 削除ボタンのクリックイベントを呼び出す
        color="secondary"
        sx={{ marginLeft: 'auto' }}
      >
        <DeleteIcon />
      </IconButton>
    </Card>
  );
};
