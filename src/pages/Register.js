import React, { useState } from 'react';
import { Box, Button, TextField, Checkbox, FormControlLabel, Typography, Paper, IconButton, Avatar, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { styled } from '@mui/system';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: 600,
  margin: 'auto',
  marginTop: theme.spacing(4),
}));

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const [nickname, setNickname] = useState('');
  const [icon, setIcon] = useState(null);
  const [dob, setDob] = useState(null);
  const [gender, setGender] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [termsExpanded, setTermsExpanded] = useState(false);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');  // エラーメッセージの状態を管理

  const handleRecaptchaChange = () => {
    setRecaptchaVerified(true);
  };

  const handleNextStep = async () => {
    // メールアドレスの重複チェック
    const response = await fetch('http://localhost:5000/api/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.exists) {
        setError('このメールアドレスは既に登録されています');
      } else {
        setError('');
        setStep(step + 1);
      }
    } else {
      setError('メールアドレスの確認に失敗しました');
    }
  };

  const handleRegister = async () => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('nickname', nickname);
    formData.append('dob', dob);
    formData.append('gender', gender);
  
    if (icon) {
      formData.append('icon', icon);
    }
  
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        body: formData,
      });
  
      if (response.ok) {
        navigate('/'); // 登録成功後にメインページに遷移
      } else {
        console.error('登録に失敗しました');
      }
    } catch (error) {
      console.error('エラーが発生しました', error);
    }
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      setIcon(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const renderStepOne = () => (
    <StyledPaper>
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
        error={!!error}
        helperText={error}
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
      <ReCAPTCHA
        sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
        onChange={handleRecaptchaChange}
      />
      <Box mt={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNextStep}
          disabled={!email || !password || !recaptchaVerified}
        >
          次へ
        </Button>
      </Box>
    </StyledPaper>
  );

  const renderStepTwo = () => (
    <StyledPaper>
      <Typography variant="h5" component="h2" gutterBottom>
        Step 2: 詳細情報
      </Typography>
      <TextField
        label="Nickname"
        variant="outlined"
        fullWidth
        margin="normal"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
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
            <Avatar 
              src={preview || ''} 
              alt="icon preview"
            />
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
      >
        {genderOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      <FormControlLabel
        control={<Checkbox checked={termsAgreed} onChange={(e) => setTermsAgreed(e.target.checked)} />}
        label="規約に同意する"
      />
      <Typography variant="body2">
        {termsExpanded
          ? '規約の全文がここに表示されます。' 
          : '規約の一部がここに表示されます。'}
        <Button onClick={() => setTermsExpanded(!termsExpanded)}>
          {termsExpanded ? '閉じる' : '全文表示'}
        </Button>
      </Typography>
      <Box mt={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleRegister}
          disabled={!nickname || !icon || !dob || !gender || !termsAgreed}
        >
          登録
        </Button>
      </Box>
    </StyledPaper>
  );

  return (
    <Box mt={4}>
      {step === 1 ? renderStepOne() : renderStepTwo()}
    </Box>
  );
};

export default Register;
