import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    FormControlLabel,
    Checkbox,
    Chip,
    CircularProgress,
    IconButton,
    Paper,
    Avatar,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
} from '@mui/material';
import 'react-quill/dist/quill.snow.css';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomEditor from '../../components/CustomEditor'; // CustomEditor をインポート

const ContestCreate = () => {
    const navigate = useNavigate();
    // **`localStorage` からデータを取得する関数**
    const getLocalStorageData = (key, defaultValue) => {
        const storedData = localStorage.getItem('contestFormData');
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            return parsedData[key] !== undefined ? parsedData[key] : defaultValue;
        }
        return defaultValue;
    };
    // **初期値を `localStorage` から取得**
    const [title, setTitle] = useState(getLocalStorageData('title', ''));
    const [shortDescription, setShortDescription] = useState(getLocalStorageData('shortDescription', ''));
    const [description, setDescription] = useState(getLocalStorageData('description', ''));
    const [iconImage, setIconImage] = useState(null);
    const [headerImage, setHeaderImage] = useState(null);
    const [iconPreview, setIconPreview] = useState(getLocalStorageData('iconPreview', null));
    const [headerPreview, setHeaderPreview] = useState(getLocalStorageData('headerPreview', null));

    const [applicationStartDate, setApplicationStartDate] = useState(getLocalStorageData('applicationStartDate', ''));
    const [applicationEndDate, setApplicationEndDate] = useState(getLocalStorageData('applicationEndDate', ''));
    const [reviewStartDate, setReviewStartDate] = useState(getLocalStorageData('reviewStartDate', ''));
    const [reviewEndDate, setReviewEndDate] = useState(getLocalStorageData('reviewEndDate', ''));
    const [resultAnnouncementDate, setResultAnnouncementDate] = useState(getLocalStorageData('resultAnnouncementDate', ''));
    const [applicationStartDateType, setApplicationStartDateType] = useState('calendar');
    const [applicationEndDateType, setApplicationEndDateType] = useState('calendar');
    const [reviewStartDateType, setReviewStartDateType] = useState('calendar');
    const [reviewEndDateType, setReviewEndDateType] = useState('calendar');
    const [resultAnnouncementDateType, setResultAnnouncementDateType] = useState('calendar');

    const [enableJudges, setEnableJudges] = useState(getLocalStorageData('enableJudges', false));
    const [judges, setJudges] = useState(getLocalStorageData('judges', []));
    const [judgeName, setJudgeName] = useState('');
    const [judgeSNS, setJudgeSNS] = useState('');
    const [loadingJudge, setLoadingJudge] = useState(false);
    const [judgeId, setJudgeId] = useState('');

    const [allowFinishedWorks, setAllowFinishedWorks] = useState(getLocalStorageData('allowFinishedWorks', false));
    const [allowPreStartDate, setAllowPreStartDate] = useState(getLocalStorageData('allowPreStartDate', false));
    const [restrictAI, setRestrictAI] = useState(getLocalStorageData('restrictAI', false));
    const [aiTags, setAiTags] = useState(getLocalStorageData('aiTags', []));
    const [aiTagInput, setAiTagInput] = useState('');

    const [allowR18, setAllowR18] = useState(getLocalStorageData('allowR18', false));
    const [restrictGenres, setRestrictGenres] = useState(getLocalStorageData('restrictGenres', false));
    const [genres, setGenres] = useState(getLocalStorageData('genres', []));
    const [genreInput, setGenreInput] = useState('');

    const [restrictWordCount, setRestrictWordCount] = useState(getLocalStorageData('restrictWordCount', false));
    const [minWordCount, setMinWordCount] = useState(getLocalStorageData('minWordCount', ''));
    const [maxWordCount, setMaxWordCount] = useState(getLocalStorageData('maxWordCount', ''));

    const [allowSeries, setAllowSeries] = useState(getLocalStorageData('allowSeries', false));
    const [minEntries, setMinEntries] = useState(getLocalStorageData('minEntries', ''));
    const [maxEntries, setMaxEntries] = useState(getLocalStorageData('maxEntries', ''));
    const [status, setStatus] = useState(getLocalStorageData('status', '開催予定'));
    const [applicationStartDateError, setApplicationStartDateError] = useState(false);
    const [applicationEndDateError, setApplicationEndDateError] = useState(false);

    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null); // ✅ ログインユーザー情報を保存

    const isValidObjectId = (id) => /^[a-fA-F0-9]{24}$/.test(id);


    // ✅ ユーザー情報を取得
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await fetch('/api/user/me', { credentials: 'include' });
                if (response.ok) {
                    const data = await response.json();
                    setUser(data); // ✅ ユーザー情報を保存
                } else {
                    console.error('Failed to fetch user info');
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
            }
        };

        fetchUserInfo();
    }, []);

    const base64ToFile = (base64, filename) => {
        const arr = base64.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };
    useEffect(() => {
        const storedIconPreview = localStorage.getItem('iconPreview');
        const storedIconName = localStorage.getItem('iconImageName');
        if (storedIconPreview && storedIconName) {
            setIconPreview(storedIconPreview);
            setIconImage(base64ToFile(storedIconPreview, storedIconName));
        }

        const storedHeaderPreview = localStorage.getItem('headerPreview');
        const storedHeaderName = localStorage.getItem('headerImageName');
        if (storedHeaderPreview && storedHeaderName) {
            setHeaderPreview(storedHeaderPreview);
            setHeaderImage(base64ToFile(storedHeaderPreview, storedHeaderName));
        }
    }, []);
    useEffect(() => {
        const formData = {
            title,
            shortDescription,
            description,
            iconPreview,
            headerPreview,
            applicationStartDate,
            applicationEndDate,
            reviewStartDate,
            reviewEndDate,
            resultAnnouncementDate,
            enableJudges,
            judges,
            allowFinishedWorks,
            allowPreStartDate,
            restrictAI,
            aiTags,
            allowR18,
            restrictGenres,
            genres,
            restrictWordCount,
            minWordCount,
            maxWordCount,
            allowSeries,
            minEntries,
            maxEntries,
            status,
        };

        localStorage.setItem('contestFormData', JSON.stringify(formData));
    }, [
        title,
        shortDescription,
        description,
        iconPreview,
        headerPreview,
        applicationStartDate,
        applicationEndDate,
        reviewStartDate,
        reviewEndDate,
        resultAnnouncementDate,
        enableJudges,
        judges,
        allowFinishedWorks,
        allowPreStartDate,
        restrictAI,
        aiTags,
        allowR18,
        restrictGenres,
        genres,
        restrictWordCount,
        minWordCount,
        maxWordCount,
        allowSeries,
        minEntries,
        maxEntries,
        status,
    ]);
    const handleImageUpload = (event, type) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64String = e.target.result;

                if (type === 'icon') {
                    setIconImage(file);
                    setIconPreview(base64String);
                    localStorage.setItem('iconPreview', base64String);
                    localStorage.setItem('iconImageName', file.name); // 元のファイル名を保存
                } else if (type === 'header') {
                    setHeaderImage(file);
                    setHeaderPreview(base64String);
                    localStorage.setItem('headerPreview', base64String);
                    localStorage.setItem('headerImageName', file.name);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const fetchJudgeInfo = async (id) => {
        try {
            setLoadingJudge(true);
            const response = await fetch(`/api/users/${id}`);
            if (!response.ok) throw new Error('ユーザーが見つかりません');
            const data = await response.json();

            return { id, name: data.nickname, avatar: data.icon };
        } catch (error) {
            console.error('Error fetching judge:', error);
            alert('ユーザーが見つかりません');
            return null;
        } finally {
            setLoadingJudge(false);
        }
    };
    const handleAddJudge = async () => {
        if (!judgeId) {
            alert('審査員のアカウントIDを入力してください');
            return;
        }

        // **ObjectId形式以外の値を弾く**
        if (!isValidObjectId(judgeId)) {
            alert('無効なアカウントIDです。正しいIDを入力してください。');
            return;
        }

        // **重複チェック**（すでにリストにある場合は追加しない）
        if (judges.some((judge) => judge.id === judgeId)) {
            alert('この審査員はすでに追加されています');
            return;
        }

        const judgeInfo = await fetchJudgeInfo(judgeId);
        if (judgeInfo) {
            setJudges([...judges, judgeInfo]);

            setJudgeId('');
        }
    };

    const handleRemoveJudge = (index) => {
        setJudges(judges.filter((_, i) => i !== index));
    };


    const handleAddAiTag = () => {
        if (aiTagInput && aiTags.length < 10) {
            setAiTags([...aiTags, aiTagInput]);
            setAiTagInput('');
        }
    };

    const handleRemoveAiTag = (tag) => {
        setAiTags(aiTags.filter((t) => t !== tag));
    };

    const handleAddGenre = () => {
        if (genreInput && genres.length < 10) {
            setGenres([...genres, genreInput]);
            setGenreInput('');
        }
    };

    const handleRemoveGenre = (genre) => {
        setGenres(genres.filter((g) => g !== genre));
    };
    // **HTML 内の Base64 画像を抽出**
    const extractBase64Images = (html) => {
        const matches = html.match(/data:image\/[a-zA-Z]+;base64,[^"]+/g) || [];
        return matches;
    };

    // **Base64 を WebP に変換 & サーバーにアップロード**
    const uploadBase64Image = async (base64String) => {
        try {
            const blob = await convertBase64ToWebP(base64String);
            const formData = new FormData();
            formData.append('image', blob, 'image.webp');

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('アップロード失敗');

            const data = await response.json();
            return data.imageUrl; // WebP の URL
        } catch (error) {
            console.error('画像アップロードエラー:', error);
            return base64String; // 失敗時は元の Base64 をそのまま使用
        }
    };

    // **Base64 を WebP Blob に変換**
    const convertBase64ToWebP = (base64) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/webp', 0.8);
            };
        });
    };

    const handleSubmit = async () => {
        if (!title || !shortDescription || !description) {
            alert('必須項目をすべて入力してください。');
            return;
        }
        if (!validateForm()) {
            alert('必須項目をすべて入力してください');
            return;
        }
        // **HTML 内の Base64 画像を抽出**
        const base64Images = extractBase64Images(description);

        // **Base64 を WebP に変換し、サーバーにアップロード**
        const uploadedImages = await Promise.all(base64Images.map(uploadBase64Image));

        // **HTML 内の Base64 を WebP の URL に置換**
        let updatedDescription = description;
        base64Images.forEach((base64, index) => {
            updatedDescription = updatedDescription.replace(base64, uploadedImages[index]);
        });
        const formData = new FormData();
        formData.append('title', title);
        formData.append('shortDescription', shortDescription);
        formData.append('description', updatedDescription);
        if (iconImage) formData.append('iconImage', iconImage);
        if (headerImage) formData.append('headerImage', headerImage);

        formData.append('applicationStartDate', applicationStartDate);
        formData.append('applicationEndDate', applicationEndDate);
        formData.append('reviewStartDate', reviewStartDate);
        formData.append('reviewEndDate', reviewEndDate);
        formData.append('resultAnnouncementDate', resultAnnouncementDate);
        formData.append('enableJudges', enableJudges);
        formData.append('judges', JSON.stringify(judges));
        formData.append('allowFinishedWorks', allowFinishedWorks);
        formData.append('allowPreStartDate', allowPreStartDate);
        formData.append('restrictAI', restrictAI);
        formData.append('aiTags', JSON.stringify(aiTags));
        formData.append('allowR18', allowR18);
        formData.append('restrictGenres', restrictGenres);
        formData.append('genres', JSON.stringify(genres));
        formData.append('restrictWordCount', restrictWordCount);
        formData.append('minWordCount', minWordCount);
        formData.append('maxWordCount', maxWordCount);
        formData.append('allowSeries', allowSeries);
        formData.append('minEntries', minEntries);
        formData.append('maxEntries', maxEntries);
        formData.append('status', status);

        setLoading(true);

        try {
            const response = await fetch(`/api/contests/create`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            if (response.ok) {
                alert('コンテストが作成されました！');
                navigate('/contests');
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'コンテスト作成に失敗しました。');
            }
        } catch (error) {
            console.error('Error creating contest:', error);
            alert('エラーが発生しました。');
        } finally {
            setLoading(false);
        }
    };

    const characterCountDisplay = (current, max) => (
        <Typography variant="caption" sx={{ color: '#555' }}>{`${current} / ${max}`}</Typography>
    );
    const renderDateInput = (label, value, setValue, type, setType, isRequired) => (
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
                    error={isRequired && !value} // ✅ 必須項目が未入力の場合、エラー表示
                    helperText={isRequired && !value ? `${label}は必須です` : ''}

                />
            ) : (
                <TextField
                    fullWidth
                    placeholder="例: 1月中旬 / 春頃 / 2025年3月予定"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    error={isRequired && !value}
                    helperText={isRequired && !value ? `${label}は必須です` : ''}

                />
            )}
        </Grid>
    );

    const validateForm = () => {
        let isValid = true;

        if (!applicationStartDate) {
            setApplicationStartDateError(true);
            isValid = false;
        } else {
            setApplicationStartDateError(false);
        }

        if (!applicationEndDate) {
            setApplicationEndDateError(true);
            isValid = false;
        } else {
            setApplicationEndDateError(false);
        }

        return isValid;
    };
    const handlePreview = () => {
        if (!user) {
            alert('ユーザー情報が取得できませんでした。ログインしていますか？');
            return;
        }
        const previewData = {
            title,
            shortDescription,
            description,
            applicationStartDate,
            applicationEndDate,
            reviewStartDate,
            reviewEndDate,
            resultAnnouncementDate,
            enableJudges,
            judges: judges.map(judge => ({
                userId: { _id: judge.id, nickname: judge.name, icon: judge.avatar }
            })),
            creator: {
                _id: user._id, // ✅ 自分のユーザーID
                nickname: user.nickname, // ✅ 自分の名前
                icon: user.icon // ✅ 自分のアイコン
            },
            entries: [], // 応募作品は空
            status: status,
            headerImage: headerPreview,
            allowFinishedWorks: allowFinishedWorks,
            allowPreStartDate: allowPreStartDate,
            allowR18: allowR18,
            allowSeries: allowSeries,
            restrictGenres: restrictGenres,
            genres: restrictGenres ? genres : [], // ✅ `restrictGenres` が `true` の場合のみジャンルを保存
            restrictAI: restrictAI,
            aiTags: restrictAI ? aiTags : [],
            minWordCount: minWordCount,
            maxWordCount: maxWordCount,
            minEntries: minEntries,
        };

        // ✅ `sessionStorage` にデータを保存
        sessionStorage.setItem('contestPreviewData', JSON.stringify(previewData));

        // ✅ 新しいタブでプレビューを開く
        window.open('/contest-preview', '_blank');
    };


    return (
        <Box
            sx={{
                padding: 4,
                backgroundColor: '#f5f5f5',
                borderRadius: 4,
                maxWidth: '1200px',
                margin: '0 auto',
                boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
            }}
        >
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', color: '#333' }}>
                コンテスト作成
            </Typography>
            <Grid container spacing={3}>
                {/* コンテスト情報 */}
                <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 1, color: '#555' }}>
                        コンテスト基本情報<Typography component="span" color="error"> ※</Typography>
                    </Typography>
                    <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>

                        <Box display="flex" alignItems="center">
                            <TextField
                                label="コンテストタイトル"
                                variant="outlined"
                                fullWidth
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                inputProps={{ maxLength: 50 }}
                            />
                            <Typography variant="body2" color="error" ml={2}>
                                ※
                            </Typography>
                        </Box>
                        {characterCountDisplay(title.length, 50)}
                    </Box>

                </Grid>
                <Grid item xs={12}>
                    <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>

                        <Box display="flex" alignItems="center">
                            <TextField
                                label="短い概要（50字以内）"
                                variant="outlined"
                                fullWidth
                                value={shortDescription}
                                onChange={(e) => setShortDescription(e.target.value)}
                                required
                                inputProps={{ maxLength: 50 }}
                            />
                            <Typography variant="body2" color="error" ml={2}>
                                ※
                            </Typography>
                        </Box>
                        {characterCountDisplay(shortDescription.length, 50)}
                    </Box>

                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 1, color: '#555' }}>
                        詳細説明 <Typography component="span" color="error">※</Typography>
                    </Typography>
                    <Typography variant="h7" sx={{ mb: 1, color: '#555' }}>
                        （コンテスト概要、募集ジャンル、賞、賞金等、応募資格、応募方法、スケジュール、選考方法、規約など必要な情報を詳細に記載してください）
                    </Typography>
                    <Paper variant="outlined" sx={{ padding: 2, backgroundColor: '#fff' }}>
                        <CustomEditor value={description} onChange={setDescription} />

                    </Paper>
                </Grid>

                {/* アイコン・ヘッダー画像 */}
                <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 1, color: '#555' }}>
                        コンテスト画像設定
                    </Typography>
                    <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Button variant="contained" component="label">
                                    アイコン画像をアップロード
                                    <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={(e) => handleImageUpload(e, 'icon')}
                                    />
                                </Button>
                                {iconPreview && (
                                    <Box mt={2}>
                                        <img
                                            src={iconPreview}
                                            alt="アイコン画像プレビュー"
                                            style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }}
                                        />
                                    </Box>
                                )}
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Button variant="contained" component="label">
                                    ヘッダー画像をアップロード
                                    <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={(e) => handleImageUpload(e, 'header')}
                                    />
                                </Button>
                                {headerPreview && (
                                    <Box mt={2}>
                                        <img
                                            src={headerPreview}
                                            alt="ヘッダー画像プレビュー"
                                            style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }}
                                        />
                                    </Box>
                                )}
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
                {/* 日程設定 */}
                <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 1, color: '#555' }}>
                        日程設定<Typography component="span" color="error"> ※応募開始、終了日必須</Typography>
                    </Typography>
                    <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
                        <Grid container spacing={2}>
                            {renderDateInput('応募開始日', applicationStartDate, setApplicationStartDate, applicationStartDateType, setApplicationStartDateType, true)}
                            {renderDateInput('応募終了日', applicationEndDate, setApplicationEndDate, applicationEndDateType, setApplicationEndDateType, true)}
                            {renderDateInput('審査開始日', reviewStartDate, setReviewStartDate, reviewStartDateType, setReviewStartDateType, false)}
                            {renderDateInput('審査終了日', reviewEndDate, setReviewEndDate, reviewEndDateType, setReviewEndDateType, false)}
                            {renderDateInput('結果発表日', resultAnnouncementDate, setResultAnnouncementDate, resultAnnouncementDateType, setResultAnnouncementDateType, false)}
                        </Grid>
                    </Box>
                </Grid>

                {/* 審査員 */}
                <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 1, color: '#555' }}>
                        詳細設定
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
                                <Grid container spacing={2}>
                                    <Grid item xs={10}>
                                        <TextField
                                            label="審査員アカウントID"
                                            variant="outlined"
                                            fullWidth
                                            value={judgeId}
                                            onChange={(e) => setJudgeId(e.target.value)}
                                            error={judgeId && !isValidObjectId(judgeId)} // エラーハンドリング
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
                            </Box>
                        )}
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={allowFinishedWorks}
                                    onChange={(e) => setAllowFinishedWorks(e.target.checked)}
                                />
                            }
                            label="完結済作品に限定する"
                        />
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={allowPreStartDate}
                                    onChange={(e) => setAllowPreStartDate(e.target.checked)}
                                />
                            }
                            label="応募開始日以前の作品を許可"
                        />
                    </Box>
                </Grid>
                <Grid item xs={12}>
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
                <Grid item xs={12}>
                    <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={allowR18}
                                    onChange={(e) => setAllowR18(e.target.checked)}
                                />
                            }
                            label="R18作品を許可"
                        />
                    </Box>
                </Grid>
                <Grid item xs={12}>
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
                <Grid item xs={12}>
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
                                <TextField
                                    label="最小文字数"
                                    variant="outlined"
                                    type="number"
                                    fullWidth
                                    value={minWordCount}
                                    onChange={(e) => setMinWordCount(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    label="最大文字数"
                                    variant="outlined"
                                    type="number"
                                    fullWidth
                                    value={maxWordCount}
                                    onChange={(e) => setMaxWordCount(e.target.value)}
                                />
                            </Box>
                        )}
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={allowSeries}
                                    onChange={(e) => setAllowSeries(e.target.checked)}
                                />
                            }
                            label="シリーズ作品を許可する"
                        />
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>

                        <TextField
                            label="最低投稿数"
                            variant="outlined"
                            type="number"
                            fullWidth
                            value={minEntries}
                            onChange={(e) => setMinEntries(e.target.value)}
                        />
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>

                        <TextField
                            label="最大投稿数"
                            variant="outlined"
                            type="number"
                            fullWidth
                            value={maxEntries}
                            onChange={(e) => setMaxEntries(e.target.value)}
                        />
                    </Box>
                </Grid>
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

                <Grid item xs={12}>
                    <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>

                        <Button
                            variant="outlined"
                            color="primary"
                            fullWidth
                            onClick={handlePreview}
                            sx={{ mt: 2 }}
                        >
                            プレビュー
                        </Button>
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit}
                            disabled={loading}
                            fullWidth
                        >
                            {loading ? <CircularProgress size={24} /> : 'コンテスト作成'}
                        </Button>
                    </Box>
                </Grid>

            </Grid>
        </Box>
    );
};
export default ContestCreate;
