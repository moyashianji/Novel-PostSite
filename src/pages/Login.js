import React, { useState } from 'react';
import { useNavigate ,Link} from 'react-router-dom';
import { TextField, Button, Box, Typography, Paper } from '@mui/material';
import ReCAPTCHA from 'react-google-recaptcha'; // ReCAPTCHAをインポート

const Login = ({ setAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState(null); // reCAPTCHAトークンを追加
  const [captchaRequired, setCaptchaRequired] = useState(false); // CAPTCHAが必要かどうか
  const [isSubmitting, setIsSubmitting] = useState(false); // 送信中かどうか
  const navigate = useNavigate();

  const handleCaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  const handleLogin = async () => {
    if (captchaRequired && !recaptchaToken) {
      alert('Please complete the CAPTCHA');
      return;
    }

    // ボタン連打を防ぐための送信中フラグ設定
    setIsSubmitting(true);

    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, recaptchaToken }),
    });

    setIsSubmitting(false); // リクエスト完了後、ボタンを再度有効に

    if (response.ok) {
      const data = await response.json();
      setAuth(true);
      navigate('/mypage');
    } else {
      const errorData = await response.json();
      if (errorData.message === 'Too many attempts') {
        setCaptchaRequired(true); // 失敗回数が多い場合にCAPTCHAを表示
      }
      alert('Invalid email or password');
    }
  };

  return (
    <Paper elevation={3} style={{ padding: '2em', maxWidth: '400px', margin: '2em auto' }}>
      <Typography variant="h5" component="h1" gutterBottom>Login</Typography>
      <Box display="flex" flexDirection="column">
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {captchaRequired && (
          <ReCAPTCHA
            sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
            onChange={handleCaptchaChange}
          />
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={handleLogin}
          disabled={isSubmitting} // 送信中はボタンを無効にする
          style={{ marginTop: '1em' }}
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </Button>

        {/* パスワードを忘れた場合のリンクを追加 */}
        <Typography variant="body2" align="center" style={{ marginTop: '1em' }}>
          <Link to="/forgot-password" style={{ textDecoration: 'none', color: '#1976d2' }}>
            パスワードを忘れた場合
          </Link>
        </Typography>
      </Box>
    </Paper>
  );
};

export default Login;
