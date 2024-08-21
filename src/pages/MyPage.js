// src/pages/MyPage.js
import React, { useState, useEffect } from 'react';
import ProfileInfo from '../components/ProfileInfo';

const MyPage = () => {
  const [user, setUser] = useState(null);

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:5000/api/user/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        console.error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser); // プロフィール情報を更新
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <ProfileInfo user={user} onProfileUpdate={handleProfileUpdate} />
    </div>
  );
};

export default MyPage;
