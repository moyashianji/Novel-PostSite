import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Checkbox, FormControlLabel, IconButton, MenuItem, Select, InputLabel, FormControl } from '@mui/material';

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { styled } from '@mui/system';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import SeriesCreationModal from '../components/SeriesCreationModal'; // モーダルコンポーネントをインポート

// ReactQuill のスタイルに直接マージンを適用する
const StyledQuill = styled(ReactQuill)({
  marginTop: '16px',   // theme.spacing(2) 相当
  marginBottom: '16px' // theme.spacing(2) 相当
});

const TagContainer = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px', // theme.spacing(1) 相当
  marginTop: '16px' // theme.spacing(2) 相当
});

const Tag = styled(Box)({
  padding: '4px 8px', // theme.spacing(0.5, 1) 相当
  backgroundColor: '#1976d2',
  color: '#ffffff',
  borderRadius: '4px'
});

const PostEditor = ({ user }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [description, setDescription] = useState('');
  const [aiGenerated, setAiGenerated] = useState(null);
  const [original, setOriginal] = useState(null);
  const [adultContent, setAdultContent] = useState(null);

  const [series, setSeries] = useState('');
  const [seriesList, setSeriesList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [imageCount, setImageCount] = useState(0); // 追加: 画像の枚数管理

  const [charCount, setCharCount] = useState(0);
  const [descCharCount, setDescCharCount] = useState(0);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const author = user ? user._id : null;
  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await fetch(`${API_URL}/api/series`, {
          credentials: 'include',  // セッションを含めてリクエストを送信

        });
        if (response.ok) {
          const seriesData = await response.json();
          setSeriesList(seriesData);
        } else {
          console.error('Failed to fetch series list');
        }
      } catch (error) {
        console.error('Error fetching series:', error);
      }
    };

    fetchSeries();
  }, []);
  const handleContentChange = (value) => {
    setContent(value);
    setCharCount(value.replace(/<[^>]*>/g, '').length); // HTMLタグを除去して文字数をカウント
  };
  const handleImageUpload = (file) => {
    if (file.size > 3 * 1024 * 1024) {
      alert('画像のサイズは3MB以内にしてください。');
      return;
    }

    const validTypes = ['image/png', 'image/jpeg'];
    if (!validTypes.includes(file.type)) {
      alert('無効な画像形式です。PNGまたはJPEGを選択してください。');
      return;
    }

    if (imageCount >= 8) {
      alert('画像は最大8枚までです。');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const range = this.quillRef.getEditor().getSelection();
      this.quillRef.getEditor().clipboard.dangerouslyPasteHTML(range.index, `<img src="${reader.result}" alt="image"/>`);
      setImageCount((prevCount) => prevCount + 1);
    };
    reader.readAsDataURL(file);
  };

  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/png, image/jpeg');
    input.click();
    input.onchange = () => {
      const file = input.files[0];
      if (file) {
        handleImageUpload(file);
      }
    };
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

  const handleSubmit = async () => {
    if (!title || !content || !description || tags.length === 0 || aiGenerated === null) {
      alert('すべてのフィールドに入力してください。');
      return;
    }

    if (!user || !user._id) {
      alert('ユーザー情報が見つかりません。再ログインしてください。');
      return;
    }

    const postData = {
      title,
      content,
      description,
      tags,
      original,
      adultContent,
      aiGenerated,
      charCount,
      author,  // author を含める
      series: series || null, // 選択されたシリーズを含める
    };

    try {
      const response = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',  // セッションを含めてリクエストを送信
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        const post = await response.json();

        // シリーズが選択されている場合、そのシリーズに投稿を追加
        if (series) {
          await fetch(`${API_URL}/api/series/${series}/addPost`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',  // セッションを含めてリクエストを送信
            body: JSON.stringify({ postId: post._id }),
          });
        }


        navigate('/');
      } else {
        alert('投稿に失敗しました。');
      }
    } catch (error) {
      console.error('Error submitting post:', error);
    }
  };


  const handleCreateSeries = async (seriesData) => {
    try {
      const response = await fetch(`${API_URL}/api/series`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',  // セッションを含めてリクエストを送信
        body: JSON.stringify(seriesData),
      });
      if (response.ok) {
        const newSeries = await response.json();
        setSeriesList([...seriesList, newSeries]);
        setSeries(newSeries._id);
        setOpenModal(false);
      } else {
        console.error('Failed to create series');
      }
    } catch (error) {
      console.error('Error creating series:', error);
    }
  };
  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', padding: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        新規投稿
      </Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel>シリーズ選択</InputLabel>
        <Select
          value={series}
          onChange={(e) => setSeries(e.target.value)}
        >
          {seriesList.map((s) => (
            <MenuItem key={s._id} value={s._id}>
              {s.title}
            </MenuItem>
          ))}
          <MenuItem value="" onClick={() => setOpenModal(true)}>
            シリーズを新規作成
          </MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="タイトル"
        variant="outlined"
        fullWidth
        margin="normal"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        inputProps={{ maxLength: 500 }}

      />
      <Typography variant="contained" gutterBottom> {title.length}/500</Typography>

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

      <Typography variant="contained" gutterBottom> {charCount}/70000</Typography>

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

      <Typography variant="contained" gutterBottom> {tags.length}/10</Typography>

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
      <Typography variant="contained" gutterBottom>
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
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          投稿
        </Button>
      </Box>
      <SeriesCreationModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreateSeries={handleCreateSeries}
      />
    </Box>
  );
};

export default PostEditor;
