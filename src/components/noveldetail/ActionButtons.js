import React, { memo } from 'react';
import { Button, Box } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

const ActionButtons = memo(({ hasLiked, isInBookshelf, handleGoodClick, handleBookshelfClick }) => (
  <Box
    display="flex"
    alignItems="center"
    sx={{
      marginBottom: 4,
      gap: 2,
      flexWrap: 'wrap'
    }}
  >
    <Button
      variant="contained"
      color={hasLiked ? 'secondary' : 'primary'}
      startIcon={hasLiked ? <ThumbUpIcon /> : <ThumbUpOffAltIcon />}
      onClick={handleGoodClick}
      sx={{
        marginBottom: { xs: 2, md: 0 },
        minWidth: '150px',
        flex: '1',
        textAlign: 'center'
      }}
    >
      {hasLiked ? 'いいねを解除' : 'いいね'}
    </Button>
    <Button
      variant="contained"
      color={isInBookshelf ? 'secondary' : 'primary'}
      startIcon={isInBookshelf ? <LibraryAddCheckIcon /> : <LibraryBooksIcon />}
      onClick={handleBookshelfClick}
      sx={{
        minWidth: '150px',
        flex: '1',
        textAlign: 'center'
      }}
    >
      {isInBookshelf ? '本棚から削除' : '本棚に追加'}
    </Button>
  </Box>
));

export default ActionButtons;
