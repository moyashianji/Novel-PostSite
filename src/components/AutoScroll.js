// src/components/AutoScroll.js
import React, { useRef } from 'react';
import { Box, Button, TextField } from '@mui/material';

const AutoScroll = ({ scrollSpeed, setScrollSpeed }) => {
  const scrollIntervalRef = useRef(null);

  const handleScroll = () => {
    // スクロールを開始
    scrollIntervalRef.current = setInterval(() => {
      window.scrollBy(0, 1); // 1ピクセルずつ下にスクロール
    }, scrollSpeed);
  };

  const handleStopScroll = () => {
    // スクロールを停止
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  React.useEffect(() => {
    const handleStopOnInteraction = () => {
      handleStopScroll(); // キーボードやマウスの操作があったらスクロール停止
    };

    window.addEventListener('keydown', handleStopOnInteraction);
    window.addEventListener('mousedown', handleStopOnInteraction);
    window.addEventListener('touchstart', handleStopOnInteraction);

    return () => {
      window.removeEventListener('keydown', handleStopOnInteraction);
      window.removeEventListener('mousedown', handleStopOnInteraction);
      window.removeEventListener('touchstart', handleStopOnInteraction);
      handleStopScroll(); // クリーンアップ時にスクロールを停止
    };
  }, []);

  return (
    <Box display="flex" alignItems="center" mb={4}>
      <TextField
        label="スクロール速度"
        type="number"
        value={scrollSpeed}
        onChange={(e) => setScrollSpeed(Number(e.target.value))}
        sx={{ marginRight: 2 }}
        inputProps={{ min: 1 }}
      />
      <Button variant="contained" onClick={handleScroll}>
        自動スクロール
      </Button>
    </Box>
  );
};

export default AutoScroll;
