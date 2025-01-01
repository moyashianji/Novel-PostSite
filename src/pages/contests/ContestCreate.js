import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  FormControl,
  CircularProgress,
} from '@mui/material';

const ContestCreate = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [applicationStartDate, setApplicationStartDate] = useState('');
  const [applicationEndDate, setApplicationEndDate] = useState('');
  const [reviewStartDate, setReviewStartDate] = useState('');
  const [reviewEndDate, setReviewEndDate] = useState('');
  const [rules, setRules] = useState('');
  const [prizes, setPrizes] = useState([]);
  const [judgeName, setJudgeName] = useState('');
  const [judgePosition, setJudgePosition] = useState('');
  const [judgePhoto, setJudgePhoto] = useState(null);
  const [judges, setJudges] = useState([]);
  const [maxEntries, setMaxEntries] = useState(100);
  const [status, setStatus] = useState('draft');
  const [headerImage, setHeaderImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;

  const handleAddJudge = () => {
    if (!judgeName || !judgePosition) {
      alert('審査員名と肩書きを入力してください。');
      return;
    }
    setJudges([...judges, { name: judgeName, position: judgePosition, photo: judgePhoto }]);
    setJudgeName('');
    setJudgePosition('');
    setJudgePhoto(null);
  };

  const handleSubmit = async () => {
    if (!title || !description || !startDate || !endDate || !applicationStartDate || !applicationEndDate || !rules) {
      alert('すべての必須項目を入力してください。');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('theme', theme);
    formData.append('description', description);
    formData.append('startDate', startDate);
    formData.append('endDate', endDate);
    formData.append('applicationStartDate', applicationStartDate);
    formData.append('applicationEndDate', applicationEndDate);
    formData.append('reviewStartDate', reviewStartDate);
    formData.append('reviewEndDate', reviewEndDate);
    formData.append('rules', rules);
    formData.append('prizes', JSON.stringify(prizes));
    formData.append('judges', JSON.stringify(judges));
    formData.append('maxEntries', maxEntries);
    formData.append('status', status);
    if (headerImage) {
      formData.append('headerImage', headerImage);
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/contests/create`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        alert('コンテストが作成されました！');
        navigate('/contests');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'コンテスト作成に失敗しました。');
      }
    } catch (error) {
      console.error('Error creating contest:', error);
      alert('エラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        コンテスト作成
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="コンテストタイトル"
            variant="outlined"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="テーマ"
            variant="outlined"
            fullWidth
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="コンテストの説明"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="開始日"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="終了日"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="応募開始日"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={applicationStartDate}
            onChange={(e) => setApplicationStartDate(e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="応募終了日"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={applicationEndDate}
            onChange={(e) => setApplicationEndDate(e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="審査開始日"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={reviewStartDate}
            onChange={(e) => setReviewStartDate(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="審査終了日"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={reviewEndDate}
            onChange={(e) => setReviewEndDate(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="応募条件・ルール"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="賞品リスト (カンマ区切りで入力)"
            variant="outlined"
            fullWidth
            value={prizes.join(', ')}
            onChange={(e) => setPrizes(e.target.value.split(',').map((prize) => prize.trim()))}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6">審査員</Typography>
          <TextField
            label="審査員名"
            variant="outlined"
            fullWidth
            value={judgeName}
            onChange={(e) => setJudgeName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="肩書き"
            variant="outlined"
            fullWidth
            value={judgePosition}
            onChange={(e) => setJudgePosition(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" component="label">
            写真をアップロード
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => setJudgePhoto(e.target.files[0])}
            />
          </Button>
          <Button variant="outlined" sx={{ mt: 2 }} onClick={handleAddJudge}>
            審査員を追加
          </Button>
          <Box mt={2}>
            {judges.map((judge, index) => (
              <Typography key={index} variant="body1">
                {judge.name} - {judge.position}
              </Typography>
            ))}
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="最大エントリー数"
            type="number"
            fullWidth
            value={maxEntries}
            onChange={(e) => setMaxEntries(e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>ステータス</InputLabel>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              <MenuItem value="draft">ドラフト</MenuItem>
              <MenuItem value="published">公開</MenuItem>
              <MenuItem value="closed">終了</MenuItem>
              <MenuItem value="review">審査中</MenuItem>
              <MenuItem value="results">結果発表</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" component="label">
            ヘッダー画像をアップロード
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => setHeaderImage(e.target.files[0])}
            />
          </Button>
          {headerImage && (
            <Typography variant="body2" mt={1}>
              {headerImage.name}
            </Typography>
          )}
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : '作成'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ContestCreate;
