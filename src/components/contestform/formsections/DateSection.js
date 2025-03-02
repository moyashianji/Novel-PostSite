import React from 'react';
import { Grid, Typography, Box, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

/**
 * 日付入力コンポーネント
 */
const DateInput = React.memo(({ 
  label, 
  value, 
  setValue, 
  type, 
  setType, 
  isRequired, 
  error 
}) => (
  <Grid item xs={12} md={6}>
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select value={type} onChange={(e) => setType(e.target.value)}>
        <MenuItem value="calendar">カレンダーから選択</MenuItem>
        <MenuItem value="text">自由入力</MenuItem>
      </Select>
    </FormControl>
    {type === 'calendar' ? (
      <TextField
        type="datetime-local"
        fullWidth
        InputLabelProps={{ shrink: true }}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        error={isRequired && !value}
        helperText={isRequired && !value ? `${label}は必須です` : ''}
        sx={{ mt: 1 }}
      />
    ) : (
      <Box sx={{ mt: 1 }}>
        <TextField
          fullWidth
          placeholder="例: 1月中旬 / 春頃 / 2025年3月予定"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          inputProps={{ maxLength: 30 }}
          error={isRequired && !value}
          helperText={isRequired && !value ? `${label}は必須です` : ''}
        />
        <Typography variant="caption" sx={{ color: '#555' }}>
          {value.length} / 30
        </Typography>
      </Box>
    )}
  </Grid>
));

/**
 * 日程設定セクションコンポーネント
 */
const DateSection = React.memo(({
  applicationStartDate,
  setApplicationStartDate,
  applicationEndDate,
  setApplicationEndDate,
  reviewStartDate,
  setReviewStartDate,
  reviewEndDate,
  setReviewEndDate,
  resultAnnouncementDate,
  setResultAnnouncementDate,
  applicationStartDateType,
  setApplicationStartDateType,
  applicationEndDateType,
  setApplicationEndDateType,
  reviewStartDateType,
  setReviewStartDateType,
  reviewEndDateType,
  setReviewEndDateType,
  resultAnnouncementDateType,
  setResultAnnouncementDateType,
  applicationStartDateError,
  applicationEndDateError
}) => {
  return (
    <Grid item xs={12}>
      <Typography variant="h6" sx={{ mb: 1, color: '#555' }}>
        日程設定<Typography component="span" color="error"> ※応募開始、終了日必須</Typography>
      </Typography>
      <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
        <Grid container spacing={2}>
          {/* 応募開始日 */}
          <DateInput
            label="応募開始日"
            value={applicationStartDate}
            setValue={setApplicationStartDate}
            type={applicationStartDateType}
            setType={setApplicationStartDateType}
            isRequired={true}
            error={applicationStartDateError}
          />
          
          {/* 応募終了日 */}
          <DateInput
            label="応募終了日"
            value={applicationEndDate}
            setValue={setApplicationEndDate}
            type={applicationEndDateType}
            setType={setApplicationEndDateType}
            isRequired={true}
            error={applicationEndDateError}
          />
          
          {/* 審査開始日 */}
          <DateInput
            label="審査開始日"
            value={reviewStartDate}
            setValue={setReviewStartDate}
            type={reviewStartDateType}
            setType={setReviewStartDateType}
            isRequired={false}
            error={false}
          />
          
          {/* 審査終了日 */}
          <DateInput
            label="審査終了日"
            value={reviewEndDate}
            setValue={setReviewEndDate}
            type={reviewEndDateType}
            setType={setReviewEndDateType}
            isRequired={false}
            error={false}
          />
          
          {/* 結果発表日 */}
          <DateInput
            label="結果発表日"
            value={resultAnnouncementDate}
            setValue={setResultAnnouncementDate}
            type={resultAnnouncementDateType}
            setType={setResultAnnouncementDateType}
            isRequired={false}
            error={false}
          />
        </Grid>
      </Box>
    </Grid>
  );
});

export default DateSection;
