import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Checkbox, FormControlLabel } from '@mui/material';

const SeriesEditSidebar = ({ series }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isOriginal, setIsOriginal] = useState(false);
  const [isAdultContent, setIsAdultContent] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  // サイドバーが開かれたときや、シリーズが更新されたときに状態を更新する
  useEffect(() => {
    if (series) {
      setTitle(series.title || '');
      setDescription(series.description || '');
      setTags(series.tags || []);
      setIsOriginal(series.isOriginal || false);
      setIsAdultContent(series.isAdultContent || false);
      setAiGenerated(series.aiGenerated || false);
    }
  }, [series]);

  const handleAddTag = () => {
    if (newTag && tags.length < 10) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSaveSeriesInfo = async () => {
    if (title.length < 5 || title.length > 400) {
      setTitleError('タイトルは5文字以上400文字以内で入力してください。');
      return;
    }
    if (description.length < 20 || description.length > 2000) {
      setDescriptionError('あらすじは20文字以上2000文字以内で入力してください。');
      return;
    }

    const updatedSeries = {
      title,
      description,
      tags,
      isOriginal,
      isAdultContent,
      aiGenerated,
    };

    try {
      const response = await fetch(`http://localhost:5000/api/series/${series._id}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updatedSeries),
      });

      if (response.ok) {
        const updatedData = await response.json();
        // 成功した場合のみ状態を更新
        setTitle(updatedData.title);
        setDescription(updatedData.description);
        setTags(updatedData.tags);
        setIsOriginal(updatedData.isOriginal);
        setIsAdultContent(updatedData.isAdultContent);
        setAiGenerated(updatedData.aiGenerated);
        alert('シリーズ情報が更新されました。');
      } else {
        const errorMessage = await response.text();
        console.error('Failed to update series information:', errorMessage);
      }
    } catch (error) {
      console.error('Error updating series information:', error);
    }
  };

  return (
    <Box sx={{ width: 300, padding: 2, borderLeft: '1px solid #ddd' }}>
      <Typography variant="h6" gutterBottom>
        シリーズ情報の編集
      </Typography>
      <TextField
        fullWidth
        label="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        margin="normal"
        error={Boolean(titleError)}
        helperText={titleError}
      />
      <TextField
        fullWidth
        label="あらすじ"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        margin="normal"
        multiline
        rows={4}
        error={Boolean(descriptionError)}
        helperText={descriptionError}
      />
      <TextField
        fullWidth
        label="タグ追加"
        value={newTag}
        onChange={(e) => setNewTag(e.target.value)}
        margin="normal"
        disabled={tags.length >= 10}
      />
      <Button variant="contained" onClick={handleAddTag} disabled={tags.length >= 10}>
        タグ追加
      </Button>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, marginTop: 2 }}>
        {tags.map((tag, index) => (
          <Box key={index} sx={{ backgroundColor: '#1976d2', color: '#fff', padding: '4px 8px', borderRadius: '4px' }}>
            {tag}
            <Button size="small" onClick={() => handleRemoveTag(tag)}>
              &times;
            </Button>
          </Box>
        ))}
      </Box>
      <Box mt={2}>
        <Typography>オリジナル作品ですか？</Typography>
        <FormControlLabel
          control={<Checkbox checked={isOriginal} onChange={(e) => setIsOriginal(e.target.checked)} />}
          label="はい"
        />
      </Box>
      <Box mt={2}>
        <Typography>対象年齢</Typography>
        <FormControlLabel
          control={<Checkbox checked={isAdultContent} onChange={(e) => setIsAdultContent(e.target.checked)} />}
          label="成人向け"
        />
      </Box>
      <Box mt={2}>
        <Typography>AIを使用していますか？</Typography>
        <FormControlLabel
          control={<Checkbox checked={aiGenerated} onChange={(e) => setAiGenerated(e.target.checked)} />}
          label="はい"
        />
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSaveSeriesInfo}
        sx={{ marginTop: 2 }}
      >
        保存
      </Button>
    </Box>
  );
};

export default SeriesEditSidebar;
