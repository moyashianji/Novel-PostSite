import React from 'react';
import { Grid, Typography, Box, FormControlLabel, Checkbox, TextField, Button, Chip } from '@mui/material';

/**
 * オプション設定セクション
 * 様々なコンテスト設定オプションをまとめたコンポーネント
 */
const OptionSection = React.memo(({
  // 作品関連オプション
  allowFinishedWorks,
  setAllowFinishedWorks,
  allowPreStartDate,
  setAllowPreStartDate,
  allowSeries,
  setAllowSeries,
  allowR18,
  setAllowR18,
  
  // AI制限関連
  restrictAI,
  setRestrictAI,
  aiTagInput,
  setAiTagInput,
  handleAddAiTag,
  aiTags,
  handleRemoveAiTag,
  
  // ジャンル制限関連
  restrictGenres,
  setRestrictGenres,
  genreInput,
  setGenreInput,
  handleAddGenre,
  genres,
  handleRemoveGenre,
  
  // 文字数制限関連
  restrictWordCount,
  setRestrictWordCount,
  minWordCount,
  setMinWordCount,
  maxWordCount,
  setMaxWordCount,
  
  // 投稿数関連
  minEntries,
  setMinEntries,
  maxEntries,
  setMaxEntries,
  
  // コンテストステータス
  status,
  setStatus
}) => {
  return (
    <>
      {/* 作品タイプ制限 */}
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ mb: 1, color: '#555' }}>
          作品制限設定
        </Typography>
        <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={allowFinishedWorks}
                    onChange={(e) => setAllowFinishedWorks(e.target.checked)}
                  />
                }
                label="完結済作品に限定する"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={allowPreStartDate}
                    onChange={(e) => setAllowPreStartDate(e.target.checked)}
                  />
                }
                label="応募開始日以前の作品を許可"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={allowSeries}
                    onChange={(e) => setAllowSeries(e.target.checked)}
                  />
                }
                label="シリーズ作品を許可する"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={allowR18}
                    onChange={(e) => setAllowR18(e.target.checked)}
                  />
                }
                label="R18作品を許可"
              />
            </Grid>
          </Grid>
        </Box>
      </Grid>

      {/* AI制限 */}
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ mb: 1, color: '#555' }}>
          AI制限
        </Typography>
        <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={restrictAI}
                onChange={(e) => setRestrictAI(e.target.checked)}
              />
            }
            label="使用しているAIを制限する"
          />
          {restrictAI && (
            <Box mt={2}>
              <TextField
                label="AI名を入力"
                variant="outlined"
                fullWidth
                value={aiTagInput}
                onChange={(e) => setAiTagInput(e.target.value)}
              />
              <Typography variant="caption" sx={{ color: '#555', display: 'block' }}>
                {aiTagInput.length} / 50
              </Typography>
              <Button
                onClick={handleAddAiTag}
                variant="outlined"
                sx={{ mt: 1 }}
                disabled={!aiTagInput || aiTags.length >= 10}
              >
                タグを追加
              </Button>
              <Box mt={2}>
                {aiTags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleRemoveAiTag(tag)}
                    sx={{ margin: '4px' }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Grid>

      {/* ジャンル制限 */}
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ mb: 1, color: '#555' }}>
          ジャンル制限
        </Typography>
        <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={restrictGenres}
                onChange={(e) => setRestrictGenres(e.target.checked)}
              />
            }
            label="ジャンルを制限する"
          />
          {restrictGenres && (
            <Box mt={2}>
              <TextField
                label="ジャンルを入力"
                variant="outlined"
                fullWidth
                value={genreInput}
                onChange={(e) => setGenreInput(e.target.value)}
              />
              <Typography variant="caption" sx={{ color: '#555', display: 'block' }}>
                {genreInput.length} / 50
              </Typography>
              <Button
                onClick={handleAddGenre}
                variant="outlined"
                sx={{ mt: 1 }}
                disabled={!genreInput || genres.length >= 10}
              >
                タグを追加
              </Button>
              <Box mt={2}>
                {genres.map((genre, index) => (
                  <Chip
                    key={index}
                    label={genre}
                    onDelete={() => handleRemoveGenre(genre)}
                    sx={{ margin: '4px' }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Grid>

      {/* 文字数制限 */}
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ mb: 1, color: '#555' }}>
          文字数制限
        </Typography>
        <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={restrictWordCount}
                onChange={(e) => setRestrictWordCount(e.target.checked)}
              />
            }
            label="作品の文字数を制限する"
          />
          {restrictWordCount && (
            <Box mt={2}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="最小文字数"
                    variant="outlined"
                    type="number"
                    fullWidth
                    value={minWordCount}
                    onChange={(e) => setMinWordCount(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="最大文字数"
                    variant="outlined"
                    type="number"
                    fullWidth
                    value={maxWordCount}
                    onChange={(e) => setMaxWordCount(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </Grid>

      {/* 投稿数制限 */}
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ mb: 1, color: '#555' }}>
          投稿数制限
        </Typography>
        <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="最低投稿数"
                variant="outlined"
                type="number"
                fullWidth
                value={minEntries}
                onChange={(e) => setMinEntries(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="最大投稿数"
                variant="outlined"
                type="number"
                fullWidth
                value={maxEntries}
                onChange={(e) => setMaxEntries(e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>
      </Grid>

      {/* コンテストステータス */}
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ mb: 1, color: '#555' }}>
          コンテストステータス<Typography component="span" color="error"> ※</Typography>
        </Typography>
        <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
          <TextField
            select
            label="ステータス"
            variant="outlined"
            fullWidth
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value="開催予定">開催予定</option>
            <option value="募集中">募集中</option>
            <option value="募集終了">募集終了</option>
            <option value="募集一時停止中">募集一時停止中</option>
          </TextField>
        </Box>
      </Grid>
    </>
  );
});

export default OptionSection;
