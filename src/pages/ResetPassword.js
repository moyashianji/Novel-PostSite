import React, { useState } from 'react';
import { useParams,useSearchParams } from 'react-router-dom';
import { TextField, Button, Box, Typography, Paper } from '@mui/material';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();  // クエリパラメータを取得
  const token = searchParams.get('token');  // "token" パラメータを取得

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        alert('Password reset successfully');
      } else {
        const data = await response.json();
        setError(data.message || 'Password reset failed');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setError('An error occurred while resetting the password.');
    }
  };

  return (
    <Paper elevation={3} style={{ padding: '2em', maxWidth: '400px', margin: '2em auto' }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Reset Password
      </Typography>
      <Box display="flex" flexDirection="column">
        <TextField
          label="New Password"
          variant="outlined"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          label="Confirm Password"
          variant="outlined"
          type="password"
          fullWidth
          margin="normal"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={handleResetPassword}
          style={{ marginTop: '1em' }}
        >
          Reset Password
        </Button>
      </Box>
    </Paper>
  );
};

export default ResetPassword;
