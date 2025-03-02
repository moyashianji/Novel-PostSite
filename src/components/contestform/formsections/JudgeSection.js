import React from 'react';
import { Grid, Typography, Box, FormControlLabel, Checkbox, TextField, Button, CircularProgress, Paper, Avatar, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

/**
 * 審査員入力フォーム
 */
const JudgeInput = React.memo(({
  judgeId,
  setJudgeId,
  isValidObjectId,
  handleAddJudge,
  loadingJudge
}) => (
  <Grid container spacing={2}>
    <Grid item xs={10}>
      <TextField
        label="審査員アカウントID"
        variant="outlined"
        fullWidth
        value={judgeId}
        onChange={(e) => setJudgeId(e.target.value)}
        error={judgeId && !isValidObjectId(judgeId)}
        helperText={judgeId && !isValidObjectId(judgeId) ? '無効なID形式です' : ''}
      />
    </Grid>
    <Grid item xs={2}>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddJudge}
        startIcon={<AddIcon />}
        fullWidth
        disabled={loadingJudge}
      >
        {loadingJudge ? <CircularProgress size={24} color="inherit" /> : '追加'}
      </Button>
    </Grid>
  </Grid>
));

/**
 * 審査員リスト
 */
const JudgeList = React.memo(({ judges, handleRemoveJudge }) => (
  <Box mt={2}>
    {judges.map((judge, index) => (
      <Paper
        key={index}
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: 2,
          mb: 1,
          backgroundColor: '#fafafa',
        }}
      >
        <Avatar src={judge.avatar} alt={judge.name} sx={{ width: 40, height: 40, mr: 2 }} />
        <Typography flexGrow={1}>{judge.name}</Typography>
        <IconButton onClick={() => handleRemoveJudge(index)} color="error">
          <DeleteIcon />
        </IconButton>
      </Paper>
    ))}
  </Box>
));

/**
 * 審査員設定セクション
 */
const JudgeSection = React.memo(({
  enableJudges,
  setEnableJudges,
  judgeId,
  setJudgeId,
  isValidObjectId,
  handleAddJudge,
  loadingJudge,
  judges,
  handleRemoveJudge
}) => {
  return (
    <Grid item xs={12}>
      <Typography variant="h6" sx={{ mb: 1, color: '#555' }}>
        審査員設定
      </Typography>
      <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={enableJudges}
              onChange={(e) => setEnableJudges(e.target.checked)}
            />
          }
          label="審査員リストを指定する（個人または会社のすみわけID）"
        />
        {enableJudges && (
          <Box mt={2}>
            <JudgeInput
              judgeId={judgeId}
              setJudgeId={setJudgeId}
              isValidObjectId={isValidObjectId}
              handleAddJudge={handleAddJudge}
              loadingJudge={loadingJudge}
            />
            <JudgeList 
              judges={judges} 
              handleRemoveJudge={handleRemoveJudge} 
            />
          </Box>
        )}
      </Box>
    </Grid>
  );
});

export default JudgeSection;
