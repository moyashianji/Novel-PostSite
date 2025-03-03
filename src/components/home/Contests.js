import React from 'react';
import { 
  Paper, 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Chip, 
  Button 
} from '@mui/material';
import { 
  Whatshot as WhatshotIcon,
  EmojiEvents as EmojiEventsIcon,
  ArrowForward as ArrowForwardIcon 
} from '@mui/icons-material';
import ContestsSkeleton from './Skeletons/ContestsSkeleton';

const ContestCard = React.memo(({ contest, handleViewContest }) => (
  <Card
    elevation={2}
    sx={{
      position: 'relative',
      borderRadius: 2,
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: 5,
        '& .contest-image': {
          transform: 'scale(1.05)',
        }
      }
    }}
  >
    <Box sx={{ position: 'relative', height: 160, overflow: 'hidden' }}>
      <CardMedia
        component="img"
        image={`${contest.iconImage}`}
        alt={contest.title}
        className="contest-image"
        sx={{
          height: '100%',
          objectFit: 'cover',
          transition: 'transform 0.5s ease',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7))',
        }}
      />
      <Chip
        label="募集中"
        color="success"
        size="small"
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          fontWeight: 'bold',
        }}
      />
      <Typography
        variant="subtitle1"
        sx={{
          position: 'absolute',
          bottom: 8,
          left: 12,
          right: 12,
          color: 'white',
          fontWeight: 'bold',
          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
        }}
      >
        {contest.title}
      </Typography>
    </Box>
    
    <CardContent sx={{ p: 2 }}>
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          mb: 1,
          color: 'text.secondary',
        }}
      >
        応募期間: {new Date(contest.applicationStartDate).toLocaleDateString()} 〜{' '}
        {new Date(contest.applicationEndDate).toLocaleDateString()}
      </Typography>
      
      <Typography
        variant="body2"
        sx={{
          height: 40,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          mb: 2,
          color: 'text.secondary',
        }}
      >
        {contest.shortDescription}
      </Typography>
      
      <Button
        variant="contained"
        color="secondary"
        fullWidth
        onClick={() => handleViewContest(contest._id)}
        startIcon={<EmojiEventsIcon />}
        sx={{
          borderRadius: 6,
          textTransform: 'none',
          fontWeight: 'bold',
        }}
      >
        詳細を見る
      </Button>
    </CardContent>
  </Card>
));

const EmptyContests = ({ navigate }) => (
  <Box 
    sx={{ 
      textAlign: 'center', 
      py: 6, 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'rgba(0,0,0,0.02)',
      borderRadius: 2
    }}
  >
    <EmojiEventsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
    <Typography variant="h6" color="textSecondary" gutterBottom>
      現在開催中のコンテストはありません
    </Typography>
    <Typography variant="body2" color="textSecondary" sx={{ mb: 3, maxWidth: 600 }}>
      コンテストは定期的に開催されます。新しいコンテストが始まるとここに表示されます。
    </Typography>
    <Button
      variant="outlined"
      color="primary"
      onClick={() => navigate('/contests')}
      sx={{ borderRadius: 6 }}
    >
      過去のコンテストを見る
    </Button>
  </Box>
);

const Contests = ({ contests, handleViewContest, navigate, loading }) => {
  const activeContests = contests.filter((contest) => contest.status === '募集中');
  
  return (
    <Paper 
      elevation={2} 
      sx={{ 
        borderRadius: 3, 
        overflow: 'hidden',
        mb: 4
      }}
    >
      <Box 
        sx={{ 
          p: 3, 
          bgcolor: 'secondary.dark',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <WhatshotIcon sx={{ mr: 1.5 }} />
          <Typography variant="h5" fontWeight="bold">
            開催中のコンテスト
          </Typography>
        </Box>
        {!loading && (
          <Chip 
            label={`${activeContests.length}件`}
            sx={{ 
              bgcolor: 'white', 
              color: 'secondary.dark', 
              fontWeight: 'bold' 
            }} 
          />
        )}
      </Box>
      
      <Box sx={{ p: 3 }}>
        {loading ? (
          <ContestsSkeleton />
        ) : (
          activeContests.length > 0 ? (
            <>
              <Grid container spacing={3}>
                {activeContests.slice(0, 6).map((contest) => (
                  <Grid item xs={12} sm={6} md={4} key={contest._id}>
                    <ContestCard contest={contest} handleViewContest={handleViewContest} />
                  </Grid>
                ))}
              </Grid>
              
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => navigate('/contests')}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    borderRadius: 6,
                    px: 4,
                    py: 1,
                    fontWeight: 'bold'
                  }}
                >
                  すべてのコンテストを見る
                </Button>
              </Box>
            </>
          ) : (
            <EmptyContests navigate={navigate} />
          )
        )}
      </Box>
    </Paper>
  );
};

export default React.memo(Contests);