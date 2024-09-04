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

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIcon(file); // ファイルオブジェクトをセット
      setPreview(URL.createObjectURL(file)); // 新しい画像が選択された場合、その画像をプレビューに表示
    }
  };

  const handleSave = async () => {
    if (!nickname) {
      alert('Nickname is required');
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
      const token = localStorage.getItem('token'); // JWTトークンを取得
      const response = await fetch(`http://localhost:5000/api/users/${user._id}/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, // 認証トークンをヘッダーに追加
        },
        body: formData,
      });
      if (response.ok) {
        const updatedUser = await response.json();
        onProfileUpdate(updatedUser);
        handleClose();
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
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
            Upload Icon
            <input type="file" hidden onChange={handleIconChange} />
          </Button>
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
          <Typography variant="caption">
            {charCount}/300
          </Typography>
          <TextField
            label="X Link"
            variant="outlined"
            fullWidth
            margin="normal"
            value={xLink}
            onChange={(e) => setXLink(e.target.value)}
          />
          <TextField
            label="Pixiv Link"
            variant="outlined"
            fullWidth
            margin="normal"
            value={pixivLink}
            onChange={(e) => setPixivLink(e.target.value)}
          />
          <TextField
            label="Other Link"
            variant="outlined"
            fullWidth
            margin="normal"
            value={otherLink}
            onChange={(e) => setOtherLink(e.target.value)}
          />
          <Box mt={2} display="flex" justifyContent="space-between">
            <Button variant="contained" color="primary" onClick={handleSave}>Save</Button>
            <Button variant="outlined" onClick={handleClose}>Cancel</Button>
          </Box>
        </ModalBox>
      </Modal>
    </div>
  );
};

export default EditProfile;
