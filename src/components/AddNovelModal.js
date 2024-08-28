import React, { useEffect, useState } from 'react';
import { Box, Typography, Modal, Card, CardContent, Button } from '@mui/material';

const AddNovelModal = ({ open, handleClose, seriesId }) => {
  const [novels, setNovels] = useState([]);

  useEffect(() => {
    const fetchNovels = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:5000/api/user/me/novels', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setNovels(data);
      } catch (error) {
        console.error('Error fetching novels:', error);
      }
    };

    if (open) {
      fetchNovels();
    }
  }, [open]);

  const handleAddToSeries = async (novelId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/series/${seriesId}/addPost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ postId: novelId }),
      });

      if (response.ok) {
        alert('作品がシリーズに追加されました。');
        handleClose(); // モーダルを閉じる
      } else {
        console.error('Failed to add novel to series:', await response.text());
      }
    } catch (error) {
      console.error('Error adding novel to series:', error);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxHeight: '80%',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          overflowY: 'auto', // モーダル内のスクロールを有効にする
        }}
      >
        <Typography variant="h6" gutterBottom>
          シリーズに追加したい作品を選択してください
        </Typography>
        {novels.length > 0 ? (
          novels.map((novel) => (
            <Card key={novel._id} sx={{ marginBottom: 2 }}>
              <CardContent>
                <Typography variant="h6">{novel.title}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {novel.description}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ marginTop: 2 }}
                  onClick={() => handleAddToSeries(novel._id)}
                >
                  シリーズに追加
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            追加可能な作品がありません。
          </Typography>
        )}
      </Box>
    </Modal>
  );
};

export default AddNovelModal;
