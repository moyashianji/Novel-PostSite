import React from 'react';
import { Box, Typography, Link, Grid } from '@mui/material';

const Footer = () => {
  return (
    <Box sx={{
      backgroundColor: '#333',
      color: '#fff',
      padding: '20px 0',
      marginTop: 'auto',
    }}>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} sm={4}>
          <Typography variant="h6" align="center" gutterBottom>
            A7Studio
          </Typography>
          <Typography variant="body2" align="center">
            &copy; {new Date().getFullYear()} A7Studio. All Rights Reserved.
          </Typography>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant="h6" align="center" gutterBottom>
            Links
          </Typography>
          <Box display="flex" justifyContent="center">
            <Link href="#" color="inherit" sx={{ margin: '0 10px' }}>Home</Link>
            <Link href="#" color="inherit" sx={{ margin: '0 10px' }}>About</Link>
            <Link href="#" color="inherit" sx={{ margin: '0 10px' }}>Contact</Link>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant="h6" align="center" gutterBottom>
            Follow Us
          </Typography>
          <Box display="flex" justifyContent="center">
            <Link href="#" color="inherit" sx={{ margin: '0 10px' }}>Twitter</Link>
            <Link href="#" color="inherit" sx={{ margin: '0 10px' }}>Facebook</Link>
            <Link href="#" color="inherit" sx={{ margin: '0 10px' }}>Instagram</Link>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Footer;
