import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Checkbox, FormControlLabel, IconButton, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

const StyledQuill = styled(ReactQuill)({
  marginTop: '16px',
  marginBottom: '16px',
});

const TagContainer = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  marginTop: '16px',
});

const Tag = styled(Box)({
  padding: '4px 8px',
  backgroundColor: '#1976d2',
  color: '#ffffff',
  borderRadius: '4px',
});

const PostEditPage = ({ user }) => {
  const { id } = useParams();  // 投稿IDを取得
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [description, setDescription] = useState('');
  const [aiGenerated, setAiGenerated] = useState(null);
  const [original, setOriginal] = useState(null);
  const [adultContent, setAdultContent] = useState(null);

  const [charCount, setCharCount] = useState(0);
  const [descCharCount, setDescCharCount] = useState(0);

  useEffect(() => {
    const fetchPostDetails = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://localhost:5000/api/posts/${id}/edit`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setTitle(data.title || '');
          setContent(data.content || '');
          setTags(data.tags || []);
          setDescription(data.description || '');
          setAiGenerated(data.isAI || false);
          setOriginal(data.isOriginal || false);
          setAdultContent(data.isAdultContent || false);
          setCharCount(data.content ? data.content.replace(/<[^>]*>/g, '').length : 0);
          setDescCharCount(data.description ? data.description.length : 0);
        } else if (response.status === 302) {
            const data = await response.json();
            navigate(data.redirectUrl);
          } else {
            console.error('Failed to fetch post details');
            navigate('/mypage'); // その他のエラー時にもマイページにリダイレクト
          }

      } catch (error) {
        console.error('Error fetching post details:', error);
        navigate('/mypage');

      }
    };

    fetchPostDetails();
  }, [id]);

  const handleContentChange = (value) => {
    setContent(value);
    setCharCount(value.replace(/<[^>]*>/g, '').length);
  };

  const handleAddTag = () => {
    if (newTag && tags.length < 10) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!title || !content || !description || tags.length === 0 || aiGenerated === null || original === null || adultContent === null) {
      alert('すべてのフィールドに入力してください。');
      return;
    }

    const updatedPostData = {
      title,
      content,
      description,
      tags,
      original,
      adultContent,
      aiGenerated,
      charCount,
    };

    try {
      const response = await fetch(`http://localhost:5000/api/posts/${id}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updatedPostData),
      });

      if (response.ok) {
        alert('投稿が更新されました。');
        navigate(`/mypage`);
      } else {
        alert('投稿の更新に失敗しました。');
      }
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', padding: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        投稿編集
      </Typography>
      <TextField
        label="タイトル"
        variant="outlined"
        fullWidth
        margin="normal"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <StyledQuill
        value={content}
        onChange={handleContentChange}
        modules={{
          toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'font': [] }],
            [{ 'align': [] }],
            ['link', 'image'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['clean']
          ],
        }}
        formats={[
          'header', 'bold', 'italic', 'underline', 'strike', 'color', 'background',
          'font', 'align', 'link', 'image', 'list', 'bullet'
        ]}
        style={{ height: 300 }}
      />

      <Typography variant="caption">
        {charCount}/70000
      </Typography>

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

      <TagContainer>
        {tags.map((tag, index) => (
          <Tag key={index}>
            {tag}
            <IconButton size="small" onClick={() => handleRemoveTag(tag)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tag>
        ))}
      </TagContainer>

      <TextField
        label="作品説明"
        variant="outlined"
        fullWidth
        margin="normal"
        multiline
        rows={4}
        value={description}
        onChange={(e) => {
          setDescription(e.target.value);
          setDescCharCount(e.target.value.length);
        }}
        inputProps={{ maxLength: 3000 }}
      />
      <Typography variant="caption">
        {descCharCount}/3000
      </Typography>

      <Box mt={2}>
        <Typography>オリジナル作品ですか？</Typography>
        <FormControlLabel
          control={<Checkbox checked={original === true} onChange={() => setOriginal(true)} />}
          label="はい"
        />
        <FormControlLabel
          control={<Checkbox checked={original === false} onChange={() => setOriginal(false)} />}
          label="いいえ"
        />
      </Box>

      <Box mt={2}>
        <Typography>対象年齢</Typography>
        <FormControlLabel
          control={<Checkbox checked={adultContent === true} onChange={() => setAdultContent(true)} />}
          label="全年齢"
        />
        <FormControlLabel
          control={<Checkbox checked={adultContent === false} onChange={() => setAdultContent(false)} />}
          label="R18"
        />
      </Box>

      <Box mt={2}>
        <Typography>AIで作りましたか？</Typography>
        <FormControlLabel
          control={<Checkbox checked={aiGenerated === true} onChange={() => setAiGenerated(true)} />}
          label="はい"
        />
        <FormControlLabel
          control={<Checkbox checked={aiGenerated === false} onChange={() => setAiGenerated(false)} />}
          label="いいえ"
        />
      </Box>

      <Box mt={2} display="flex" justifyContent="flex-end">
        <Button variant="contained" color="primary" onClick={handleSave}>
          保存
        </Button>
      </Box>
    </Box>
  );
};

export default PostEditPage;
