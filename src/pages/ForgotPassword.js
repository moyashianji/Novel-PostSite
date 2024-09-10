import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Paper } from '@mui/material';
import ReCAPTCHA from 'react-google-recaptcha';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessages, setErrorMessages] = useState({});

  const handleCaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  const handleResetPassword = async () => {
    const errors = {};

    // クライアント側バリデーション
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = '有効なメールアドレスを入力してください';
    }
    if (!recaptchaToken) {
        errors.recaptcha = 'Recaptchaを完了してください';
    }
 
    // エラーがある場合は表示して終了
    if (Object.keys(errors).length > 0) {
      setErrorMessages(errors);
      return;
    }
    setIsSubmitting(true);
    
    const response = await fetch('http://localhost:5000/api/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, recaptchaToken }),
    });

    setIsSubmitting(false);
    const data = await response.json();

    if (response.ok) {
      alert('メールアドレスにパスワードを変更するリンクを送信しました');
    } else {
     setErrorMessages({ general: data.message });
    }
  };

  return (
    <Paper elevation={3} style={{ padding: '2em', maxWidth: '400px', margin: '2em auto' }}>
      <Typography variant="h5" component="h1" gutterBottom>登録しているメールアドレスを入力してください</Typography>
      <Box display="flex" flexDirection="column">
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={!!errorMessages.email}
          helperText={errorMessages.email || ''}
   
        />
        <ReCAPTCHA
          sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
          onChange={handleCaptchaChange}
        />
      {errorMessages.recaptcha && (
        <Typography color="error" variant="body2">
          {errorMessages.recaptcha}
        </Typography>
      )}
      {errorMessages.general && (
        <Typography color="error" variant="body2">
          {errorMessages.general}
        </Typography>
      )}        
        <Button
          variant="contained"
          color="primary"
          onClick={handleResetPassword}
          disabled={isSubmitting}
          style={{ marginTop: '1em' }}
        >
          {isSubmitting ? '送信中...' : 'パスワードを変更する'}
        </Button>
      </Box>
    </Paper>
  );
};

export default ForgotPassword;
