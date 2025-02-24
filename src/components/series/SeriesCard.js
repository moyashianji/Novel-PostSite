import React from 'react';
import { Card, CardContent, Typography, Link } from '@mui/material';
import { styled } from '@mui/system';
import { Link as RouterLink } from 'react-router-dom';

const StyledCard = styled(Card)(({ theme }) => ({
  height: 300,
  minWidth: 300,
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

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'normal',
  wordWrap: 'break-word',
}));

const SeriesCard = ({ series }) => (
  <StyledCard>
    <StyledCardContent>
      <Link component={RouterLink} to={`/series/${series._id}/works`} underline="none">
        <Typography variant="h6">{series.title}</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          {series.description.slice(0, 100)}...
        </Typography>
      </Link>
    </StyledCardContent>
  </StyledCard>
);

export default SeriesCard;