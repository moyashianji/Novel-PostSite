import React, { useState, useEffect, useContext, useCallback } from "react";
import { Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import Footer from '../footer/Footer';
import Header from '../header/Header';
import { SearchContext } from "../../context/SearchContext";

const Layout = ({ children, auth, setAuth }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { searchParams, handleSearch } = useContext(SearchContext);
  const [searchQuery, setSearchQuery] = useState(searchParams.mustInclude || "");

  useEffect(() => {
    setSearchQuery(searchParams.mustInclude || "");
  }, [location.search]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`/api/check-auth`, {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          setAuth(true);
          console.error('Auth check success');
        } else {
          setAuth(false);
          console.error('Auth check failed');
        }
      } catch (error) {
        console.error('Auth check failed', error);
        setAuth(false);
      }
    };
    checkAuth();
  }, [setAuth]);

  const handleLogout = useCallback(async () => {
    try {
      const response = await fetch(`/api/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        setAuth(false);
      } else {
        console.error('Logout failed', response);
      }
    } catch (error) {
      console.error('Error logging out', error);
    }
  }, [setAuth]);

  return (
    <div>
      <Header auth={auth} handleLogout={handleLogout} />
      <Box component="main" sx={{ paddingTop: 8 }}>{children}</Box>
      <Footer />
    </div>
  );
};

export default Layout;
