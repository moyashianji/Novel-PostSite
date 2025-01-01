// src/pages/ContestList.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, Chip } from '@mui/material';

const ContestList = () => {
  const [contests, setContests] = useState([]);

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

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>コンテスト一覧</Typography>
      <Grid container spacing={3}>
        {contests.map(contest => (
          <Grid item xs={12} sm={6} md={4} key={contest._id}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>{contest.title}</Typography>
                <Typography variant="body2" color="textSecondary">{contest.theme}</Typography>
                <Typography variant="body2">開催期間: {new Date(contest.startDate).toLocaleDateString()} 〜 {new Date(contest.endDate).toLocaleDateString()}</Typography>
                <Box mt={1}>
                  <Chip label={contest.status} color="primary" />
                </Box>
                <Box mt={2}>
                  <Link to={`/contests/${contest._id}`}>詳細を見る</Link>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ContestList;
