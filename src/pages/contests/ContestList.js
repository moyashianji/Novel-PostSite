import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, Chip, Tabs, Tab, Button, CardMedia } from '@mui/material';

const ContestList = () => {
  const [contests, setContests] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const response = await fetch('/api/contests');
        const data = await response.json();
        setContests(data);
      } catch (error) {
        console.error('Error fetching contests:', error);
      }
    };

    fetchContests();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const filteredContests = contests.filter(contest => {
    if (tabIndex === 0) return contest.status === '募集中';
    if (tabIndex === 1) return contest.status === '開催予定';
    if (tabIndex === 2) return contest.status === '募集一時停止中';
    if (tabIndex === 3) return contest.status === '募集終了';
    return true;
  });

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>コンテスト一覧</Typography>
      <Tabs value={tabIndex} onChange={handleTabChange} centered>
        <Tab label="募集中" />
        <Tab label="開催予定" />
        <Tab label="募集一時停止中" />
        <Tab label="募集終了" />
      </Tabs>
      <Grid container spacing={3} sx={{ marginTop: 2 }}>
        {filteredContests.map(contest => (
          <Grid item xs={12} sm={6} md={4} key={contest._id}>
            <Card sx={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)' }}>
              <CardMedia
                component="img"
                height="200"
                image={`${contest.iconImage}`}
                alt={contest.title}
                sx={{ filter: 'brightness(0.7)', cursor: 'pointer', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' } }}
                onClick={() => window.location.href = `/contests/${contest._id}`}
              />
              <CardContent sx={{ padding: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)', wordBreak: 'break-word' }}>
                  {contest.title}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'gray' }}>
                  応募期間: {new Date(contest.applicationStartDate).toLocaleDateString()} 〜 {new Date(contest.applicationEndDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'gray' }}>
                  {contest.shortDescription}
                </Typography>
              </CardContent>
              <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 2, background: 'linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent)', color: 'white' }} />
              <Button variant="contained" color="primary" fullWidth onClick={() => window.location.href = `/contests/${contest._id}`} sx={{ borderRadius: 0 }}>
                詳細を見る
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ContestList;
