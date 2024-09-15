import React, { useState, useRef,useEffect } from 'react';
import { Box, Button, TextField, Checkbox, FormControlLabel, Typography, Paper, IconButton, Avatar, MenuItem,styled  } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import zxcvbn from 'zxcvbn';  // パスワード強度チェックライブラリ

import { ja } from 'date-fns/locale';
// 性別選択肢の定義
const genderOptions = [
  { value: 'male', label: '男性' },
  { value: 'female', label: '女性' },
  { value: 'other', label: 'どちらでもない' },
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
  const [expirationTime, setExpirationTime] = useState(null);  // 確認コードの有効期限
  const [isCodeExpired, setIsCodeExpired] = useState(false);  // 確認コードの有効期限切れフラグ
  const [isSubmitting, setIsSubmitting] = useState(false); // 送信中かどうかの状態
  const [verificationCodeExpiration, setVerificationCodeExpiration] = useState(null); // 失効時間
  const [remainingTime, setRemainingTime] = useState(null); // 残り時間
  const [isResendCode, setIsResendCode] = useState(false); // 送信中かどうかの状態
  const [isVerifyCode, setIsVerifyCode] = useState(false); // 送信中かどうかの状態
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');

 // 現在の日付を取得
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // 月は0から始まるので+1
  const currentDay = today.getDate();
  // リアルタイムで残り時間を計算して表示
  useEffect(() => {
    if (verificationCodeExpiration) {
      const intervalId = setInterval(() => {
        const now = new Date();
        const timeLeft = Math.ceil((verificationCodeExpiration - now) / 1000);

        setRemainingTime(timeLeft > 0 ? timeLeft : 0);

        if (timeLeft <= 0) {
          setIsCodeExpired(true);  // 期限が切れた場合のフラグ
          clearInterval(intervalId);
        }
      }, 1000);

      // クリーンアップ関数でインターバルをクリア
      return () => clearInterval(intervalId);
    }
  }, [verificationCodeExpiration]);    
  // 入力制限
  const handleYearChange = (e) => {
    const value = e.target.value;
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setYear(value);
    }
  };

  const handleMonthChange = (e) => {
    const value = e.target.value;
    if (value.length <= 2 && /^\d*$/.test(value) && (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 12))) {
      setMonth(value);
    }
  };

  const handleDayChange = (e) => {
    const value = e.target.value;
    if (value.length <= 2 && /^\d*$/.test(value) && (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 31))) {
      setDay(value);
    }
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
  // パスワード強度の評価を適切に初期化・設定するための変更
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    const result = zxcvbn(newPassword);

    // zxcvbnのscoreは0〜4の範囲で返されるが、万一のために範囲外の場合の処理
    setPasswordStrength(result ? Math.min(result.score, 3) : 0); 
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
    // 送信ボタンを無効化
    setIsSubmitting(true);

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
        setVerificationCodeExpiration(new Date(new Date().getTime() + 5 * 60 * 1000)); // 5分後に失効
       // setExpirationTime(expiration);
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

    if (isCodeExpired) {
      setErrorMessages({ general: '確認コードの有効期限が切れました。再発行してください。' });
      return;
    }

    setIsVerifyCode(true);

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
        setIsVerifyCode(false);

      }
    } catch (error) {
      setErrorMessages({ general: 'サーバーエラーが発生しました' });
    }
  };
  // 確認コード再発行
  const handleResendCode = async () => {
    // 送信ボタンを無効化
    setIsResendCode(true);
    try {

      const response = await fetch('http://localhost:5000/api/resend-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await response.json();
      if (response.ok) {
        setErrorMessages({ general: '新しい確認コードが送信されました。' });
        setVerificationCodeExpiration(new Date(new Date().getTime() + 5 * 60 * 1000)); // 5分後に失効
        //setExpirationTime(expiration);
        setIsCodeExpired(false);

      } else {
        setErrorMessages({ general: data.message });
      }
    } catch (error) {
      setErrorMessages({ general: 'サーバーエラーが発生しました' });
    }
  };
  // Step3: 本登録処理
  const handleRegister = async () => {
    const errors = {};


    // 入力された年、月、日が未来の日付かどうかをチェック
    if (!year || year.length !== 4 || parseInt(year) > currentYear) {
      errors.year = '過去または今年の年を入力してください';
    }
    if (!month || parseInt(month) < 1 || parseInt(month) > 12 || (parseInt(year) === currentYear && parseInt(month) > currentMonth)) {
      errors.month = '過去または現在の月を入力してください';
    }
    if (!day || parseInt(day) < 1 || parseInt(day) > 31 || 
       (parseInt(year) === currentYear && parseInt(month) === currentMonth && parseInt(day) > currentDay)) {
      errors.day = '過去または現在の日を入力してください';
    }


    // エラーがある場合はエラーメッセージを表示
    if (Object.keys(errors).length > 0) {
      setErrorMessages(errors);
    } else {
      // バリデーションOKならデータを送信
      const dob = new Date(`${year}-${month}-${day}`).toISOString().split('T')[0]; // 例: 2023-01-11形式

      console.log('生年月日:', dob);
      // サーバーに送信する処理をここに追加
    

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
        inputProps={{ maxLength: 30 }}  // 最大30文字に制限
        error={!!errorMessages.password}
        helperText={errorMessages.password || `パスワードの強度: ${['弱い', '弱い', '中', '強い'][passwordStrength || 0]}`}  // passwordStrengthが未定義なら0を使用
        />
      <TextField
        label="Confirm Password"
        variant="outlined"
        type="password"
        fullWidth
        margin="normal"
        value={passwordConfirmation}
        onChange={(e) => setPasswordConfirmation(e.target.value)}
        inputProps={{ maxLength: 30 }}  // 最大30文字に制限
        error={!!errorMessages.passwordConfirmation}
        helperText={errorMessages.passwordConfirmation || ''}
      />
      <ReCAPTCHA
        sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
        onChange={handleRecaptchaChange}
        onExpired={handleRecaptchaExpired}
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
          disabled={isSubmitting} // 送信中はボタンを無効化

        >
          {isSubmitting ? '送信中...' : '次へ'}
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
        onChange={(e) => {
          const value = e.target.value;
          // 半角数字のみ許可し、6文字まで入力可能にする
          if (/^\d{0,6}$/.test(value)) {
            setVerificationCode(value);
          }
        }}
        error={!!errorMessages.code}
        helperText={errorMessages.code || ''}
        inputProps={{
          maxLength: 6, // 最大6文字まで
          inputMode: 'numeric', // モバイルで数字キーボードを表示
          pattern: '[0-9]*', // 数字のみ許可
        }}   
      />
      {errorMessages.general && (
        <Typography color="error" variant="body2">
          {errorMessages.general}
        </Typography>
      )}
      {isCodeExpired ? (
        <Typography color="error" variant="body2">
          確認コードの有効期限が切れました。
        </Typography>
      ) : (
        <Typography variant="body2">
        確認コードは{remainingTime}秒で失効します。失効した場合は確認コードを再送信してください。
        </Typography>
      )}
      <Box mt={2}>
        <Button
         variant="contained"
          color="primary"
          onClick={handleVerifyCode}
          disabled={isVerifyCode}
          >
          {isVerifyCode ? '送信中...' : '次へ'}
        </Button>
        <Button
         variant="outlined"
          color="secondary"
          onClick={handleResendCode}
          sx={{ ml: 2 }}
          disabled={isResendCode}
          >
        {isResendCode ? '送信済' : '確認コード再送信'}
        </Button>
      </Box>
    </Paper>
  );

  // Step3: 本登録画面（ユーザー情報入力）
  const renderStepThree = () => (
    <Paper style={StyledPaper}>
    <Typography variant="h5" component="h2" gutterBottom>
      Step 3: ユーザー情報入力
    </Typography>
    
    {/* アイコン (任意) */}
    <Typography variant="body1">アイコン <span style={{ color: 'gray' }}>任意</span></Typography>
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

    {/* ニックネーム */}
    <Typography variant="body1">ニックネーム <span style={{ color: 'red' }}>*必須</span></Typography>
    <TextField
      label="Nickname"
      variant="outlined"
      fullWidth
      margin="normal"
      value={nickname}
      onChange={(e) => setNickname(e.target.value)}
      inputProps={{maxLength: 30}}
      error={!!errorMessages.nickname}
      helperText={errorMessages.nickname || ''}
    />

     <Typography variant="body1">生年月日 <span style={{ color: 'red' }}>*必須</span></Typography>
      <Box display="flex" gap={2}>
        <TextField
          label="年"
          value={year}
          onChange={handleYearChange}
          placeholder="YYYY"
          error={!!errorMessages.year}
          helperText={errorMessages.year || ''}
          inputProps={{ maxLength: 4 }}
        />
        <TextField
          label="月"
          value={month}
          onChange={handleMonthChange}
          placeholder="MM"
          error={!!errorMessages.month}
          helperText={errorMessages.month || ''}
          inputProps={{ maxLength: 2 }}
        />
        <TextField
          label="日"
          value={day}
          onChange={handleDayChange}
          placeholder="DD"
          error={!!errorMessages.day}
          helperText={errorMessages.day || ''}
          inputProps={{ maxLength: 2 }}
        />
      </Box>
    {errorMessages.dob && (
      <Typography color="error" variant="body2">
        {errorMessages.dob}
      </Typography>
    )}

    {/* 性別 */}
    <Typography variant="body1">性別 <span style={{ color: 'red' }}>*必須</span></Typography>
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

    {/* 規約 */}
    <FormControlLabel
      control={<Checkbox checked={termsAgreed} onChange={(e) => setTermsAgreed(e.target.checked)} />}
      label="規約に同意します"
    />
    {errorMessages.termsAgreed && (
      <Typography color="error" variant="body2">
        {errorMessages.termsAgreed}
      </Typography>
    )}

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
