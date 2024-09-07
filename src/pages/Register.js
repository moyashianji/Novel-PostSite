import React, { useState, useRef } from 'react';
import { Box, Button, TextField, Checkbox, FormControlLabel, Typography, Paper, IconButton, Avatar, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import zxcvbn from 'zxcvbn';  // パスワード強度チェックライブラリ
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// 性別選択肢の定義
const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const StyledPaper = {
  padding: '16px',
  maxWidth: '600px',
  margin: 'auto',
  marginTop: '16px',
};

const Register = () => {
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);

  const [step, setStep] = useState(1); // ステップ制御
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [verificationCode, setVerificationCode] = useState(''); // 確認コード入力用
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const [nickname, setNickname] = useState('');
  const [icon, setIcon] = useState(null);
  const [dob, setDob] = useState(null);
  const [gender, setGender] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [termsExpanded, setTermsExpanded] = useState(false);
  const [preview, setPreview] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [errorMessages, setErrorMessages] = useState({});

  // ReCAPTCHAの変更時処理
  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
    setRecaptchaVerified(true);
  };

  // パスワード強度チェック
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    const strength = zxcvbn(e.target.value).score;
    setPasswordStrength(strength);
  };

  // Step1: 仮登録（確認コード送信）
  const handleNextStep = async () => {
    const errors = {};

    // クライアント側バリデーション
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = '有効なメールアドレスを入力してください';
    }
    if (passwordStrength < 2) {
      errors.password = 'パスワードの強度が弱いです';
    }
    if (password !== passwordConfirmation) {
      errors.passwordConfirmation = 'パスワード確認が一致しません';
    }
    if (!recaptchaVerified) {
      errors.recaptcha = 'Recaptchaを完了してください';
    }

    // エラーがある場合は表示して終了
    if (Object.keys(errors).length > 0) {
      setErrorMessages(errors);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/register-step1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',  // セッションを含めてリクエストを送信
        body: JSON.stringify({ email, password, passwordConfirmation, recaptchaToken }),
      });

      const data = await response.json();
      if (response.ok) {
        setStep(2); // 確認コード入力ステップへ移行
      } else {
        setErrorMessages({ general: data.message });
      }
    } catch (error) {
      setErrorMessages({ general: 'サーバーエラーが発生しました' });
    }
  };

  // Step2: 確認コードの検証
  const handleVerifyCode = async () => {
    // Step 2の処理（確認コードの検証）
    try {
      const response = await fetch('http://localhost:5000/api/register-step2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',  // セッションを含めてリクエストを送信
        body: JSON.stringify({ verificationCode }), // 確認コードを送信
      });

      const data = await response.json();
      if (response.ok) {
        setStep(3);
      } else {
        setErrorMessages({ general: data.message });
      }
    } catch (error) {
      setErrorMessages({ general: 'サーバーエラーが発生しました' });
    }
  };

  // Step3: 本登録処理
  const handleRegister = async () => {
    const formData = new FormData();
    formData.append('nickname', nickname);
    formData.append('dob', dob);
    formData.append('gender', gender);
    if (icon) formData.append('icon', icon);

    try {
      const response = await fetch('http://localhost:5000/api/register-step3', {
        method: 'POST',
        credentials: 'include',  // セッションを含めてリクエストを送信
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        navigate('/mypage');
      } else {
        setErrorMessages({ general: data.message });
      }
    } catch (error) {
      setErrorMessages({ general: 'サーバーエラーが発生しました' });
    }
  };

  // アイコンファイル選択処理
  const handleIconChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessages({ general: 'ファイルサイズは2MB以下にしてください' });
        return;
      }
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setErrorMessages({ general: '無効なファイル形式です。jpeg, png, gifのみ許可されています' });
        return;
      }

      setIcon(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleNicknameChange = (e) => {
    setNickname(e.target.value);
  };

  // Step1: 仮登録画面（確認コード送信）
  const renderStepOne = () => (
    <Paper style={StyledPaper}>
      <Typography variant="h5" component="h2" gutterBottom>
        Step 1: 仮登録
      </Typography>
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
      <TextField
        label="Password"
        variant="outlined"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={handlePasswordChange}
        error={!!errorMessages.password}
        helperText={errorMessages.password || `パスワードの強度: ${['弱い', '弱い', '中', '強い'][passwordStrength]}`}
      />
      <TextField
        label="Confirm Password"
        variant="outlined"
        type="password"
        fullWidth
        margin="normal"
        value={passwordConfirmation}
        onChange={(e) => setPasswordConfirmation(e.target.value)}
        error={!!errorMessages.passwordConfirmation}
        helperText={errorMessages.passwordConfirmation || ''}
      />
      <ReCAPTCHA
        sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
        onChange={handleRecaptchaChange}
        ref={recaptchaRef}
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
      <Box mt={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNextStep}
        >
          次へ
        </Button>
      </Box>
    </Paper>
  );

  // Step2: 確認コード入力画面
  const renderStepTwo = () => (
    <Paper style={StyledPaper}>
      <Typography variant="h5" component="h2" gutterBottom>
        Step 2: 確認コードの入力
      </Typography>
      <TextField
        label="確認コード"
        variant="outlined"
        fullWidth
        margin="normal"
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value)}
        error={!!errorMessages.code}
        helperText={errorMessages.code || ''}
      />
      {errorMessages.general && (
        <Typography color="error" variant="body2">
          {errorMessages.general}
        </Typography>
      )}
      <Box mt={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleVerifyCode}
        >
          次へ
        </Button>
      </Box>
    </Paper>
  );

  // Step3: 本登録画面（ユーザー情報入力）
  const renderStepThree = () => (
    <Paper style={StyledPaper}>
      <Typography variant="h5" component="h2" gutterBottom>
        Step 3: 詳細情報
      </Typography>
      <TextField
        label="Nickname"
        variant="outlined"
        fullWidth
        margin="normal"
        value={nickname}
        onChange={handleNicknameChange}
        error={!!errorMessages.nickname}
        helperText={errorMessages.nickname || ''}
      />
      <Box display="flex" alignItems="center" mt={2}>
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="icon-button-file"
          type="file"
          onChange={handleIconChange}
        />
        <label htmlFor="icon-button-file">
          <IconButton color="primary" component="span">
            <Avatar src={preview || ''} alt="icon preview" />
          </IconButton>
        </label>
      </Box>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Date of Birth"
          value={dob}
          onChange={(newValue) => setDob(newValue)}
          renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
        />
      </LocalizationProvider>
      <TextField
        label="Gender"
        select
        fullWidth
        margin="normal"
        value={gender}
        onChange={(e) => setGender(e.target.value)}
        error={!!errorMessages.gender}
        helperText={errorMessages.gender || ''}
      >
        {genderOptions.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      <FormControlLabel
        control={<Checkbox checked={termsAgreed} onChange={(e) => setTermsAgreed(e.target.checked)} />}
        label="規約に同意します"
      />
      {errorMessages.general && (
        <Typography color="error" variant="body2">
          {errorMessages.general}
        </Typography>
      )}
      <Box mt={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleRegister}
          disabled={!termsAgreed}
        >
          登録
        </Button>
      </Box>
    </Paper>
  );

  // ステップごとの表示切り替え
  return (
    <Box mt={4}>
      {step === 1 && renderStepOne()}
      {step === 2 && renderStepTwo()}
      {step === 3 && renderStepThree()}
    </Box>
  );
};

export default Register;
