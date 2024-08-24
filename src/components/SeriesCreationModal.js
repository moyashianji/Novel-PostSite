// src/components/SeriesCreationModal.js
import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Checkbox, FormControlLabel, Modal } from '@mui/material';

const SeriesCreationModal = ({ open, onClose, onCreateSeries }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isOriginal, setIsOriginal] = useState(false);
  const [isAdultContent, setIsAdultContent] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  const handleAddTag = () => {
    if (newTag && tags.length < 10) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = () => {
    if (title.length < 5 || title.length > 400) {
      setTitleError('タイトルは5文字以上400文字以内で入力してください。');
      return;
    }
    if (description.length < 20 || description.length > 2000) {
      setDescriptionError('あらすじは20文字以上2000文字以内で入力してください。');
      return;
    }

    const seriesData = {
      title,
      description,
      tags,
      isOriginal,
      isAdultContent,
      aiGenerated,
    };

    onCreateSeries(seriesData);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ width: 400, padding: 4, margin: 'auto', backgroundColor: 'white', mt: '10%', overflowY: 'auto', maxHeight: '80vh' }}>
        <Typography variant="h6" gutterBottom>シリーズ作成</Typography>
        <TextField
          label="タイトル"
          variant="outlined"
          fullWidth
          margin="normal"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setTitleError(''); }}
          error={Boolean(titleError)}
          helperText={titleError}
        />
        <TextField
          label="あらすじ"
          variant="outlined"
          fullWidth
          margin="normal"
          multiline
          rows={4}
          value={description}
          onChange={(e) => { setDescription(e.target.value); setDescriptionError(''); }}
          error={Boolean(descriptionError)}
          helperText={descriptionError}
        />
        <TextField
          label="タグ追加"
          variant="outlined"
          fullWidth
          margin="normal"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
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
        <Box mt={2} display="flex" justifyContent="space-between">
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            作成
          </Button>
          <Button variant="outlined" onClick={onClose}>
            キャンセル
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default SeriesCreationModal;
