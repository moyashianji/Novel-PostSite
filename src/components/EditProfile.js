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
  maxHeight: '80vh',
  overflowY: 'auto',
  backgroundColor: theme.palette.background.paper,
  border: '2px solid #000',
  boxShadow: 24,
  padding: theme.spacing(4),
}));

const EditProfile = ({ user, onProfileUpdate }) => {
  const [open, setOpen] = useState(false);
  const [nickname, setNickname] = useState(user.nickname);
  const [icon, setIcon] = useState(null);
  const [preview, setPreview] = useState(`http://localhost:5000${user.icon}` || '');
  const [description, setDescription] = useState(user.description || '');
  const [xLink, setXLink] = useState(user.xLink || '');
  const [pixivLink, setPixivLink] = useState(user.pixivLink || '');
  const [otherLink, setOtherLink] = useState(user.otherLink || '');
  const [charCount, setCharCount] = useState(description.length);
  const [errorMessages, setErrorMessages] = useState({});
  const [formValid, setFormValid] = useState(true);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const validateForm = () => {
    const nicknameError = !nickname ? 'ニックネームが必要です' : '';
    const xLinkError = xLink ? validateLink(xLink) : ''; // 空欄の場合はバリデーションを無視
    const pixivLinkError = pixivLink ? validateLink(pixivLink) : ''; // 空欄の場合はバリデーションを無視
    const otherLinkError = otherLink ? validateLink(otherLink) : ''; // 空欄の場合はバリデーションを無視

    const errors = {
      nickname: nicknameError,
      xLink: xLinkError,
      pixivLink: pixivLinkError,
      otherLink: otherLinkError,
    };
    console.log(errors);
    setErrorMessages(errors);

    const isValid = !Object.values(errors).some((error) => error !== '');
    setFormValid(isValid);
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessages((prev) => ({ ...prev, general: 'ファイルサイズは2MB以下にしてください' }));
        return;
      }
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setErrorMessages((prev) => ({ ...prev, general: '無効なファイル形式です。jpeg, png, gifのみ許可されています' }));
        return;
      }

      setIcon(file);
      setErrorMessages((prev) => ({ ...prev, general: '' }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    validateForm();
    if (!formValid) return;
    if (!nickname) return;
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

      if (response.ok) {
        const updatedUser = await response.json();
        onProfileUpdate(updatedUser);
        handleClose();
      } else {
        alert('プロフィールの更新に失敗しました');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const validateLink = (link) => {
    const urlPattern = /^https?:\/\/.*/;

    if (!urlPattern.test(link)) {
      
      return 'http://またはhttps://で始まる正しいリンクを入力してください';
    }
    if (link.length > 300) {

      return 'リンクは300文字以内で入力してください';
    }
    return '';
  };

  const handleLinkChange = (setLink, value, linkType) => {
    setLink(value);
    // リンクが空欄の場合、エラーメッセージをクリア
    const errorMessage = value ? validateLink(value) : '';
    setErrorMessages((prev) => ({ ...prev, [linkType]: errorMessage }));

  };

  const handleInputChange = (setInput, value, inputType) => {
    setInput(value);
    if (!value) {
      // 入力が空の場合、エラーメッセージをクリア
      setErrorMessages((prev) => ({ ...prev, [inputType]: '' }));
    }
  };

  return (
    <div>
      <Button variant="contained" onClick={handleOpen}>編集</Button>
      <Modal open={open} onClose={handleClose}>
        <ModalBox>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h6">プロフィールを編集</Typography>
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
            onChange={(e) => handleInputChange(setNickname, e.target.value, 'nickname')}
            helperText={errorMessages.nickname}
            error={!!errorMessages.nickname}
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

          <Typography variant="body2" color="textSecondary" mt={1}>
            画像容量は2MB以内で、対応形式はPNG/JPG/GIFです
          </Typography>
          {errorMessages.general && (
            <Typography color="error" variant="body2">
              {errorMessages.general}
            </Typography>
          )}
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
              handleInputChange(setDescription, e.target.value, 'description');
              setCharCount(e.target.value.length);
            }}
            inputProps={{ maxLength: 300 }}
          />
          <Typography variant="caption">{charCount}/300</Typography>

          <TextField
            label="外部リンク（XやPixiv、Youtubeなど）"
            variant="outlined"
            fullWidth
            margin="normal"
            value={xLink}
            onChange={(e) => handleLinkChange(setXLink, e.target.value, 'xLink')}
            helperText={errorMessages.xLink || 'http://またはhttps://で始まるリンクを入力してください'}
            error={!!errorMessages.xLink}
          />

          <TextField
            label="外部リンク（XやPixiv、Youtubeなど）"
            variant="outlined"
            fullWidth
            margin="normal"
            value={pixivLink}
            onChange={(e) => handleLinkChange(setPixivLink, e.target.value, 'pixivLink')}
            helperText={errorMessages.pixivLink || 'http://またはhttps://で始まるリンクを入力してください'}
            error={!!errorMessages.pixivLink}
          />

          <TextField
            label="外部リンク（XやPixiv、Youtubeなど）"
            variant="outlined"
            fullWidth
            margin="normal"
            value={otherLink}
            onChange={(e) => handleLinkChange(setOtherLink, e.target.value, 'otherLink')}
            helperText={errorMessages.otherLink || 'http://またはhttps://で始まるリンクを入力してください'}
            error={!!errorMessages.otherLink}
          />

          <Box mt={2} display="flex" justifyContent="space-between">
            <Button variant="contained" color="primary" onClick={handleSave} disabled={!formValid}>
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
