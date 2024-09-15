import React, { useState } from 'react';
import { Box, Button, Modal, TextField, Typography, IconButton, Avatar } from '@mui/material';
import { styled } from '@mui/system';
import CloseIcon from '@mui/icons-material/Close';

const ModalBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  maxHeight: '80vh', // 最大高さを設定
  overflowY: 'auto', // 縦スクロールを有効にする
  backgroundColor: theme.palette.background.paper,
  border: '2px solid #000',
  boxShadow: 24,
  padding: theme.spacing(4),
}));

const EditProfile = ({ user, onProfileUpdate }) => {
  const [open, setOpen] = useState(false);
  const [nickname, setNickname] = useState(user.nickname);
  const [icon, setIcon] = useState(null); // ファイルオブジェクトを保持
  const [preview, setPreview] = useState(`http://localhost:5000${user.icon}` || ''); // 既存のアイコンをプレビューとして表示
  const [description, setDescription] = useState(user.description || '');
  const [xLink, setXLink] = useState(user.xLink || '');
  const [pixivLink, setPixivLink] = useState(user.pixivLink || '');
  const [otherLink, setOtherLink] = useState(user.otherLink || '');
  const [charCount, setCharCount] = useState(description.length);
  const [errorMessages, setErrorMessages] = useState({});

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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
      setErrorMessages({ general: '' });

      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!nickname) {
      alert('ニックネームが必要です');
      return;
    }
  
    const formData = new FormData();
    formData.append('nickname', nickname);
    if (icon) formData.append('icon', icon);
    formData.append('description', description);
    formData.append('xLink', xLink);
    formData.append('pixivLink', pixivLink);
    formData.append('otherLink', otherLink);
  
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user._id}/update`, {
        method: 'POST',
        credentials: 'include',  
        body: formData,
      });
      console.log(user._id);
      if (response.ok) {
        const updatedUser = await response.json();
        onProfileUpdate(updatedUser);
        handleClose();
      } else {
        alert('プロフィールの更新に失敗しました');
      }
    } catch (error) {
    }
  };

  return (
    <div>
      <Button variant="contained" onClick={handleOpen}>Edit Profile</Button>
      <Modal open={open} onClose={handleClose}>
        <ModalBox>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h6">Edit Profile</Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
  
          <TextField
            label="Nickname"
            variant="outlined"
            fullWidth
            margin="normal"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
  
          <Button variant="contained" component="label">
            アイコンを更新する
            <input
              accept="image/png, image/jpeg, image/gif"
              style={{ display: 'none' }}
              type="file"
              onChange={handleIconChange}
            />
          </Button>
  
          {/* 画像の制限に関するメッセージを表示 */}
          <Typography variant="body2" color="textSecondary" mt={1}>
            画像容量は2MB以内で、対応形式はPNG/JPG/GIFです
          </Typography>
  
          {preview && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Avatar
                src={preview}
                alt="Icon preview"
                sx={{ width: 100, height: 100 }}
              />
            </Box>
          )}
  
          <TextField
            label="Description"
            variant="outlined"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setCharCount(e.target.value.length);
            }}
            inputProps={{ maxLength: 300 }}
          />
          <Typography variant="caption">{charCount}/300</Typography>
  
          {/* X Linkに対するバリデーション */}
          <TextField
            label="X Link"
            variant="outlined"
            fullWidth
            margin="normal"
            value={xLink}
            onChange={(e) => setXLink(e.target.value)}
            inputProps={{ pattern: 'https?://.*' }} // リンク以外を無効にする
            helperText="http://またはhttps://で始まるリンクを入力してください"
          />
  
          {/* Pixiv Linkに対するバリデーション */}
          <TextField
            label="Pixiv Link"
            variant="outlined"
            fullWidth
            margin="normal"
            value={pixivLink}
            onChange={(e) => setPixivLink(e.target.value)}
            inputProps={{ pattern: 'https?://.*' }} // リンク以外を無効にする
            helperText="http://またはhttps://で始まるリンクを入力してください"
          />
  
          {/* Other Linkに対するバリデーション */}
          <TextField
            label="Other Link"
            variant="outlined"
            fullWidth
            margin="normal"
            value={otherLink}
            onChange={(e) => setOtherLink(e.target.value)}
            inputProps={{ pattern: 'https?://.*' }} // リンク以外を無効にする
            helperText="http://またはhttps://で始まるリンクを入力してください"
          />
  
          {errorMessages.general && (
            <Typography color="error" variant="body2">
              {errorMessages.general}
            </Typography>
          )}
  
          <Box mt={2} display="flex" justifyContent="space-between">
            <Button variant="contained" color="primary" onClick={handleSave}>
              保存
            </Button>
            <Button variant="outlined" onClick={handleClose}>
              キャンセル
            </Button>
          </Box>
        </ModalBox>
      </Modal>
    </div>
  );
};

export default EditProfile;
