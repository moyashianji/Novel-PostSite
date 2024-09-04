import React, { useEffect, useState } from 'react';
import { Box, Typography, Modal, Card, CardContent, Button } from '@mui/material';

const AddNovelModal = ({ open, handleClose, seriesId }) => {
  const [novels, setNovels] = useState([]);
  const [addedNovelIds, setAddedNovelIds] = useState(new Set());

  useEffect(() => {
    const fetchNovels = async () => {
      console.log('Fetching novels for the user...');
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:5000/api/users/me/novels', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          console.error('Failed to fetch novels. Status:', response.status);
          return;
        }
        const data = await response.json();
        console.log('Fetched novels:', data);
        setNovels(data);
      } catch (error) {
        console.error('Error fetching novels:', error);
      }
    };

    const fetchSeries = async () => {
      console.log('Fetching series details for seriesId:', seriesId);
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://localhost:5000/api/series/${seriesId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          console.error('Failed to fetch series details. Status:', response.status);
          return;
        }
        const seriesData = await response.json();
        console.log('Fetched series data:', seriesData);

        console.log('aaaa',seriesData.posts)
;        // postIdが存在するか確認してからIDを取得
      const novelIds = new Set(
        seriesData.posts
          .map(post => post._id.toString()) // postId._idを文字列に変換して取得
      );
        console.log('Extracted novel IDs already in the series:', novelIds);
        setAddedNovelIds(novelIds);
      } catch (error) {
        console.error('Error fetching series details:', error);
      }
    };

    if (open) {
      console.log('Modal opened, fetching data...');
      fetchNovels();
      fetchSeries();
    } else {
      console.log('Modal closed, skipping data fetch.');
    }
  }, [open, seriesId]);

  const handleAddToSeries = async (novelId) => {
    console.log('Attempting to add novel to series. Novel ID:', novelId, 'Series ID:', seriesId);
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
        console.log('Successfully added novel to series.');
        alert('作品がシリーズに追加されました。');
        handleClose(); // モーダルを閉じる
      } else {
        const errorMessage = await response.text();
        console.error('Failed to add novel to series:', errorMessage);
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
          novels.map((novel) => {
            const isAlreadyAdded = addedNovelIds.has(novel._id.toString());
            console.log(`Rendering novel ID: ${novel._id}, Already added: ${isAlreadyAdded}`);
            return (
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
                    disabled={isAlreadyAdded} // すでに追加されている作品の場合、ボタンを無効化
                  >
                    {isAlreadyAdded ? '追加済み' : 'シリーズに追加'}
                  </Button>
                </CardContent>
              </Card>
            );
          })
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
