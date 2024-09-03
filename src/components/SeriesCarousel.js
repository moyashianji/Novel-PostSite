import React, { useRef, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Link } from '@mui/material';
import { styled } from '@mui/system';
import { Link as RouterLink } from 'react-router-dom';

const SeriesCard = styled(Card)(({ theme }) => ({
  height: 300, // カードの高さを大きく調整
  minWidth: 300, // カードの幅を大きく調整
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  textAlign: 'left',
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(2),
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
  transition: 'transform 0.3s, box-shadow 0.3s',
  borderRadius: theme.shape.borderRadius,
  marginRight: theme.spacing(3),
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
  },
}));

const SeriesCardContent = styled(CardContent)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'normal', // 改行を許可する
  wordWrap: 'break-word', // 長い単語も適切に改行されるように
}));

const SeriesCarousel = ({ series }) => {
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const handleWheelScroll = (event) => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        container.scrollLeft += event.deltaY;

        if (event.deltaY !== 0) {
          event.preventDefault();
          event.stopPropagation();
        }
      }
    };

    const container = scrollContainerRef.current;
    container.addEventListener('wheel', handleWheelScroll);

    return () => {
      container.removeEventListener('wheel', handleWheelScroll);
    };
  }, []);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>シリーズ一覧</Typography>
      <Box
        ref={scrollContainerRef}
        sx={{
          display: 'flex',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          paddingBottom: '10px',
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            height: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#888',
            borderRadius: '3px',
          },
        }}
      >
        {series.map((s) => (
          <SeriesCard key={s._id}>
            <SeriesCardContent>
              <Link component={RouterLink} to={`/series/${s._id}/works`} underline="none">
                <Typography variant="h6">{s.title}</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  {s.description.slice(0, 100)}...
                </Typography>
              </Link>
            </SeriesCardContent>
          </SeriesCard>
        ))}
      </Box>
    </Box>
  );
};

export default SeriesCarousel;
