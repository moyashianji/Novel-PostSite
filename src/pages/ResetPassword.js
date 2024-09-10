import React, { useState,useRef } from 'react';
import { useNavigate, useParams,useSearchParams } from 'react-router-dom';
import { TextField, Button, Box, Typography, Paper } from '@mui/material';
import ReCAPTCHA from 'react-google-recaptcha';
import zxcvbn from 'zxcvbn';  // パスワード強度チェックライブラリ

const ResetPassword = () => {
  const [searchParams] = useSearchParams();  // クエリパラメータを取得
  const token = searchParams.get('token');  // "token" パラメータを取得
  const recaptchaRef = useRef(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setPasswordConfirmation] = useState('');
  const [error, setError] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false); // 送信中かどうかの状態
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const navigate = useNavigate();

  // パスワード強度の評価を適切に初期化・設定するための変更
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    const result = zxcvbn(newPassword);
    // zxcvbnのscoreは0〜4の範囲で返されるが、万一のために範囲外の場合の処理
    setPasswordStrength(result ? Math.min(result.score, 3) : 0); 
  };
    // ReCAPTCHAの変更時処理
  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
    setRecaptchaVerified(true);
  };
  // ReCAPTCHAのトークンが無効になったときに呼び出される
  const handleRecaptchaExpired = () => {
    setRecaptchaToken('');
    setRecaptchaVerified(false);
    alert('ReCAPTCHAの有効期限が切れました。再度確認をお願いします。');
  };
  const handleResetPassword = async () => {
    const errors = {};

    if (passwordStrength < 2) {
      errors.password = 'パスワードの強度が弱いです';
    }
    if (password !== confirmPassword) {
      errors.passwordConfirmation = 'パスワード確認が一致しません';
    }
    if (!recaptchaVerified) {
      errors.recaptcha = 'Recaptchaを完了してください';
    }
    // エラーがある場合は表示して終了
    if (Object.keys(errors).length > 0) {
        setError(errors);
        return;
    }

    // 送信ボタンを無効化
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, confirmPassword, recaptchaToken }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('パスワードの変更に成功しました');
        navigate('/login');

      } else {
        setError({ general: data.message });
      }
    } catch (error) {
      setError({ general: 'サーバーエラーが発生しました'});
    }
  };

  return (
    <Paper elevation={3} style={{ padding: '2em', maxWidth: '400px', margin: '2em auto' }}>
      <Typography variant="h5" component="h1" gutterBottom>
        パスワードを変更する
      </Typography>
      <Box display="flex" flexDirection="column">
        <TextField
          label="New Password"
          variant="outlined"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={handlePasswordChange}
          inputProps={{ maxLength: 30 }}  // 最大30文字に制限
          error={!!error.password}
          helperText={error.password || `パスワードの強度: ${['弱い', '弱い', '中', '強い'][passwordStrength || 0]}`}  // passwordStrengthが未定義なら0を使用

        />
        <TextField
          label="Confirm Password"
          variant="outlined"
          type="password"
          fullWidth
          margin="normal"
          value={confirmPassword}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          inputProps={{ maxLength: 30 }}  // 最大30文字に制限
          error={!!error.passwordConfirmation}
          helperText={error.passwordConfirmation || ''}
     
        />
       <ReCAPTCHA
        sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
        onChange={handleRecaptchaChange}
        onExpired={handleRecaptchaExpired}
        ref={recaptchaRef}
        />
        {error.recaptcha && (
          <Typography color="error" variant="body2">
            {error.recaptcha}
          </Typography>
        )}
        {error.general && (
          <Typography color="error" variant="body2">
            {error.general}
          </Typography>
        )}       
        <Button
          variant="contained"
          color="primary"
          onClick={handleResetPassword}
          disabled={isSubmitting} // 送信中はボタンを無効化
          style={{ marginTop: '1em' }}
        >
        {isSubmitting ? '送信中...' : 'パスワードを変更する'}
        </Button>
      </Box>
    </Paper>
  );
};

export default ResetPassword;
