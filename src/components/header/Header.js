import React from 'react';
import { AppBar, Toolbar, IconButton, Badge } from '@mui/material';
import { Link } from 'react-router-dom';
import SearchBar from '../search/SearchBar';
import Logo from './Logo';
import AuthButtons from './AuthButtons';

const Header = React.memo(({ auth, handleLogout }) => (
  <AppBar position="fixed">
    <Toolbar sx={{ justifyContent: 'space-between' }}>
      <Logo />
      <SearchBar />
      <IconButton color="inherit" sx={{ marginRight: 2 }}>
        <Badge badgeContent={4} color="secondary"></Badge>
      </IconButton>
      <AuthButtons auth={auth} handleLogout={handleLogout} />
    </Toolbar>
  </AppBar>
));

export default Header;