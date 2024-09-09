import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Paper } from '@mui/material';
import ReCAPTCHA from 'react-google-recaptcha';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  const handleResetPassword = async () => {
    if (!recaptchaToken) {
      alert('Please complete the CAPTCHA');
      return;
    }

    setIsSubmitting(true);
    
    const response = await fetch('http://localhost:5000/api/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, recaptchaToken }),
    });

    setIsSubmitting(false);

    if (response.ok) {
      alert('Password reset link has been sent to your email.');
    } else {
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <Paper elevation={3} style={{ padding: '2em', maxWidth: '400px', margin: '2em auto' }}>
      <Typography variant="h5" component="h1" gutterBottom>Forgot Password</Typography>
      <Box display="flex" flexDirection="column">
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <ReCAPTCHA
          sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
          onChange={handleCaptchaChange}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleResetPassword}
          disabled={isSubmitting}
          style={{ marginTop: '1em' }}
        >
          {isSubmitting ? 'Submitting...' : 'Reset Password'}
        </Button>
      </Box>
    </Paper>
  );
};

export default ForgotPassword;
