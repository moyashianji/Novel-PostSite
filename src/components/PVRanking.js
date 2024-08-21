import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, Button, Typography, Box, Avatar, Divider } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

const PVRanking = () => {
  const [ranking, setRanking] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/posts/ranking');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setRanking(data);
        } else {
          console.error('Unexpected data format:', data);
          setRanking([]);
        }
      } catch (error) {
        console.error('Error fetching ranking:', error);
        setRanking([]);
      }
    };

    fetchRanking();
  }, []);

  // 順位に応じた色を設定するヘルパー関数
  const getRankColor = (index) => {
    if (index === 0) return { bgcolor: '#ffd700', starColor: 'gold' }; // 1位は金色
    if (index === 1) return { bgcolor: '#c0c0c0', starColor: 'silver' }; // 2位は銀色
    if (index === 2) return { bgcolor: '#cd7f32', starColor: '#cd7f32' }; // 3位は銅色
    return { bgcolor: '#3f51b5', starColor: 'inherit' }; // それ以外は青色
  };

  return (
    <Box sx={{ padding: 2, backgroundColor: '#f5f5f5', borderRadius: 2, boxShadow: 2 }}>
      <Typography variant="h6" gutterBottom>
        PVランキング
      </Typography>
      <List dense>
        {ranking.slice(0, showAll ? 30 : 10).map((post, index) => {
          const { bgcolor, starColor } = getRankColor(index);
          return (
            <React.Fragment key={post._id}>
              <ListItem 
                button 
                component="a" 
                href={`/novel/${post._id}`}
                sx={{
                  display: 'flex', 
                  alignItems: 'center',
                  padding: '10px 0',
                }}
              >
                <Avatar sx={{ bgcolor, marginRight: 2 }}>
                  {index + 1}
                </Avatar>
                <ListItemText 
                  primary={
                    <Typography variant="subtitle1" sx={{ fontWeight: index < 3 ? 'bold' : 'normal' }}>
                      {post.title}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="textSecondary">
                      閲覧数: {post.viewCounter}
                    </Typography>
                  }
                />
                {index < 3 && <StarIcon sx={{ color: starColor, marginLeft: 'auto' }} />}
              </ListItem>
              {index < ranking.length - 1 && <Divider />}
            </React.Fragment>
          );
        })}
      </List>
      {ranking.length > 10 && (
        <Button 
          variant="outlined" 
          fullWidth 
          onClick={() => setShowAll(!showAll)} 
          sx={{ marginTop: 2 }}
        >
          {showAll ? '閉じる' : 'もっと表示'}
        </Button>
      )}
    </Box>
  );
};

export default PVRanking;
