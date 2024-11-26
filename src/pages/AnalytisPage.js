import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Chart from 'react-apexcharts';
import { Box, Typography } from '@mui/material';

const AnalyticsPage = () => {
  const { id } = useParams(); // URLパラメータから作品IDを取得
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/${id}/analytics`);
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        const data = await response.json();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [id]);

  // データをApexCharts形式に変換
  const chartData = {
    series: [
      {
        name: 'Views',
        data: analyticsData.map((entry) => ({
          x: new Date(entry.timestamp).toLocaleString(),
          y: entry.count,
        })),
      },
    ],
  };

  const chartOptions = {
    chart: {
      type: 'line',
      toolbar: { show: true }, // ダウンロードボタンを表示
    },
    xaxis: {
      type: 'category',
      title: { text: 'Timestamp' },
    },
    yaxis: {
      title: { text: 'View Count' },
    },
    stroke: {
      curve: 'smooth', // 滑らかな線
    },
    markers: {
      size: 5,
    },
  };

  if (loading) {
    return <Typography>Loading analytics...</Typography>;
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Analytics for Post ID: {id}
      </Typography>
      {analyticsData.length > 0 ? (
        <Chart options={chartOptions} series={chartData.series} type="line" height={350} />
      ) : (
        <Typography variant="body1">No analytics data available.</Typography>
      )}
    </Box>
  );
};

export default AnalyticsPage;
