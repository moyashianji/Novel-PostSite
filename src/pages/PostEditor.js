import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Checkbox, 
  FormControlLabel, 
  IconButton, 
  MenuItem, 
  Select, 
  InputLabel, 
  FormControl,
  Radio,
  RadioGroup,
  FormLabel,
  Paper,
  Tooltip,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';

import { styled } from '@mui/system';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import InfoIcon from '@mui/icons-material/Info';
import { useNavigate } from 'react-router-dom';
import SeriesCreationModal from '../components/series/SeriesCreationModal'; 
import CustomEditor from '../components/wysiwyg/CustomEditor';

// 画像処理ユーティリティをインポート
import { processHtmlImages } from '../components/contestform/utils/imageProcessor'; 

// スタイルコンポーネント - スタイルは変更されないのでメモ化の外に配置
const TagContainer = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  marginTop: '16px'
});

const Tag = styled(Box)({
  padding: '4px 8px',
  backgroundColor: '#1976d2',
  color: '#ffffff',
  borderRadius: '4px'
});

const SectionBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#f8f8f8',
  padding: '16px',
  borderRadius: '8px',
  marginTop: '16px',
  border: '1px solid #e0e0e0'
}));

const AiChipsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  marginTop: '16px',
  marginBottom: '16px'
}));

// AI候補のサンプルリスト - 定数なのでコンポーネント外に配置
const AI_SUGGESTIONS = [
  "AIのべりすと","ChatGPT", "Claude", "GPT-4", "DALL-E", "Midjourney", "Stable Diffusion", 
  "Bard", "Bing AI", "Jasper", "Rytr", "Copy.ai", "Novel AI", "AI Dungeon",
  "Replika", "Character.AI", "Playground AI", "DeepL", "Notion AI", "Sudowrite",
  "Synthesia", "RunwayML", "Kaiber", "Leonardo.AI", "Firefly"
];

// InfoIcon付きのTooltipをメモ化したコンポーネントとして定義
const InfoTooltip = memo(({ title }) => (
  <Tooltip title={title}>
    <IconButton size="small">
      <InfoIcon fontSize="small" />
    </IconButton>
  </Tooltip>
));

// 共通のフォームフィールドをメモ化
const LabeledTextField = memo(({ label, value, onChange, required, maxLength, rows, multiline, placeholder, tooltip, startIcon, type = 'text', disabled = false, onKeyPress }) => {
  // 入力ハンドラをメモ化
  const handleChange = useCallback((e) => {
    onChange(e.target.value);
  }, [onChange]);

  // キープレスハンドラをメモ化
  const handleKeyPress = useCallback((e) => {
    if (onKeyPress && e.key === 'Enter') {
      onKeyPress();
    }
  }, [onKeyPress]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <TextField
        label={label}
        variant="outlined"
        fullWidth
        margin="normal"
        value={value}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        inputProps={{ maxLength }}
        required={required}
        multiline={multiline}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        type={type}
        InputProps={startIcon ? {
          startAdornment: startIcon
        } : undefined}
      />
      {tooltip && <InfoTooltip title={tooltip} />}
    </Box>
  );
});

// メモ化したタグ表示コンポーネント
const TagList = memo(({ tags, onRemove }) => (
  <TagContainer>
    {tags.map((tag, index) => (
      <Tag key={`${tag}-${index}`}>
        {tag}
        <IconButton size="small" onClick={() => onRemove(tag)}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Tag>
    ))}
  </TagContainer>
));

// メモ化したAIツール選択コンポーネント
const AiToolSelector = memo(({ usedAiTools, newAiTool, setNewAiTool, handleAddAiTool, handleRemoveAiTool, handleAddAiSuggestion }) => {
  // テキスト入力ハンドラをメモ化
  const handleAiToolChange = useCallback((e) => {
    setNewAiTool(e.target.value);
  }, [setNewAiTool]);

  // Enterキーでの追加ハンドラをメモ化
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && newAiTool && !usedAiTools.includes(newAiTool) && usedAiTools.length < 20) {
      handleAddAiTool();
    }
  }, [newAiTool, usedAiTools, handleAddAiTool]);

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          label="AIツール名"
          variant="outlined"
          fullWidth
          value={newAiTool}
          onChange={handleAiToolChange}
          disabled={usedAiTools.length >= 20}
          onKeyPress={handleKeyPress}
        />
        <Button 
          variant="contained" 
          onClick={handleAddAiTool} 
          disabled={!newAiTool || usedAiTools.includes(newAiTool)}
        >
          追加
        </Button>
      </Box>
      
      <AiChipsContainer>
        {usedAiTools.map((tool, index) => (
          <Chip
            key={`tool-${tool}-${index}`}
            label={tool}
            onDelete={() => handleRemoveAiTool(tool)}
            color="primary"
            variant="outlined"
          />
        ))}
      </AiChipsContainer>
      
      <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
        一般的なAIツール（クリックで追加）:
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {AI_SUGGESTIONS.map((suggestion) => (
          <Chip
            key={`suggestion-${suggestion}`}
            label={suggestion}
            onClick={() => handleAddAiSuggestion(suggestion)}
            color="default"
            variant="outlined"
            clickable
            disabled={usedAiTools.includes(suggestion)}
            size="small"
          />
        ))}
      </Box>
    </>
  );
});

// メモ化したラジオグループコンポーネント
const RadioButtonGroup = memo(({ legend, value, onChange, options, tooltip }) => (
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    <FormControl component="fieldset">
      <FormLabel component="legend">{legend}</FormLabel>
      <RadioGroup
        row
        value={value}
        onChange={onChange}
      >
        {options.map(option => (
          <FormControlLabel 
            key={option.value} 
            value={option.value} 
            control={<Radio />} 
            label={option.label} 
          />
        ))}
      </RadioGroup>
    </FormControl>
    {tooltip && <InfoTooltip title={tooltip} />}
  </Box>
));

// メインコンポーネント
const PostEditor = memo(({ user }) => {
  const navigate = useNavigate();
  const author = useMemo(() => user ? user._id : null, [user]);
  
  // フォーム状態
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [description, setDescription] = useState('');
  
  // AI関連
  const [usedAiTools, setUsedAiTools] = useState([]);
  const [newAiTool, setNewAiTool] = useState('');
  const [aiEvidenceUrl, setAiEvidenceUrl] = useState('');
  const [aiEvidenceDescription, setAiEvidenceDescription] = useState('');
  
  // 作品設定
  const [original, setOriginal] = useState(null);
  const [adultContent, setAdultContent] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  
  // シリーズ関連
  const [series, setSeries] = useState('');
  const [seriesList, setSeriesList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  
  // 統計情報
  const [imageCount, setImageCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [descCharCount, setDescCharCount] = useState(0);
  
  // UI状態
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // previousContentRef はレンダリングをトリガーせずに前回の値を記憶するために使用
  const previousContentRef = useRef('');
  
  // シリーズデータの取得 - 依存配列を最小限に
  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await fetch(`/api/series`, {
          credentials: 'include',
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

  // エディタ内容変更ハンドラをメモ化
  const handleContentChange = useCallback((value) => {
    setContent(value);
    
    // コストの高い操作は必要な場合のみ実行
    if (value !== previousContentRef.current) {
      previousContentRef.current = value;
      
      // HTMLタグを除去して文字数をカウント
      setCharCount(value.replace(/<[^>]*>/g, '').length);
      
      // Base64画像の検出とカウント
      const imgMatches = value.match(/data:image\/[a-zA-Z]+;base64,[^"]+/g) || [];
      setImageCount(imgMatches.length);
    }
  }, []);

  // タグ追加ハンドラをメモ化
  const handleAddTag = useCallback(() => {
    if (newTag && tags.length < 10 && !tags.includes(newTag)) {
      setTags(prevTags => [...prevTags, newTag]);
      setNewTag('');
    }
  }, [newTag, tags]);

  // タグ削除ハンドラをメモ化
  const handleRemoveTag = useCallback((tagToRemove) => {
    setTags(prevTags => prevTags.filter(tag => tag !== tagToRemove));
  }, []);

  // AIツール追加ハンドラをメモ化
  const handleAddAiTool = useCallback(() => {
    if (newAiTool && !usedAiTools.includes(newAiTool) && usedAiTools.length < 20) {
      setUsedAiTools(prevTools => [...prevTools, newAiTool]);
      setNewAiTool('');
    }
  }, [newAiTool, usedAiTools]);

  // AIツール削除ハンドラをメモ化
  const handleRemoveAiTool = useCallback((toolToRemove) => {
    setUsedAiTools(prevTools => prevTools.filter(tool => tool !== toolToRemove));
  }, []);

  // AI候補からAIツール追加ハンドラをメモ化
  const handleAddAiSuggestion = useCallback((suggestion) => {
    if (!usedAiTools.includes(suggestion) && usedAiTools.length < 20) {
      setUsedAiTools(prevTools => [...prevTools, suggestion]);
    }
  }, [usedAiTools]);

  // フォーム検証ロジックをメモ化
  const validateForm = useCallback(() => {
    // 入力検証の配列 - {条件, メッセージ}
    const validations = [
      { condition: !title, message: 'タイトルを入力してください。' },
      { condition: !content, message: 'コンテンツを入力してください。' },
      { condition: !description, message: '作品説明を入力してください。' },
      { condition: tags.length === 0, message: '少なくとも1つのタグを追加してください。' },
      { condition: original === null, message: 'オリジナル作品かどうかを選択してください。' },
      { condition: adultContent === null, message: '対象年齢を選択してください。' },
      { condition: usedAiTools.length === 0, message: '少なくとも1つのAIツールを追加してください。' },
      { condition: !aiEvidenceDescription, message: 'AI使用の説明を入力してください。' },
    ];

    // エラーがある場合は最初のエラーメッセージを表示
    for (const validation of validations) {
      if (validation.condition) {
        alert(validation.message);
        return false;
      }
    }
    
    return true;
  }, [title, content, description, tags.length, original, adultContent, usedAiTools.length, aiEvidenceDescription]);

  // 送信ハンドラをメモ化
  const handleSubmit = useCallback(async () => {
    // バリデーションチェック
    if (!validateForm()) return;

    if (!user || !user._id) {
      alert('ユーザー情報が見つかりません。再ログインしてください。');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // AI証拠データの準備
      const aiEvidenceData = {
        tools: usedAiTools,
        url: aiEvidenceUrl || null,
        description: aiEvidenceDescription
      };
      
      // HTML内の画像を処理
      const processedContent = await processHtmlImages(content);
      
      const postData = {
        title,
        content: processedContent,
        description,
        tags,
        original,
        adultContent,
        aiGenerated: true,
        aiEvidence: aiEvidenceData,
        charCount,
        author,
        series: series || null,
        imageCount,
        isPublic,
        allowComments,
      };

      // 投稿データを送信
      const response = await fetch(`/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        const post = await response.json();

        // シリーズが選択されている場合、そのシリーズに投稿を追加
        if (series) {
          await fetch(`/api/series/${series}/addPost`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ postId: post._id }),
          });
        }

        navigate('/');
      } else {
        alert('投稿に失敗しました。');
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      alert('エラーが発生しました。しばらくしてから再度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validateForm, 
    user, 
    usedAiTools, 
    aiEvidenceUrl, 
    aiEvidenceDescription, 
    content, 
    title, 
    description, 
    tags, 
    original, 
    adultContent, 
    charCount, 
    author, 
    series, 
    imageCount, 
    isPublic, 
    allowComments, 
    , 
    navigate
  ]);

  // シリーズ作成ハンドラをメモ化
  const handleCreateSeries = useCallback(async (seriesData) => {
    try {
      const response = await fetch(`/api/series`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(seriesData),
      });
      if (response.ok) {
        const newSeries = await response.json();
        setSeriesList(prevList => [...prevList, newSeries]);
        setSeries(newSeries._id);
        setOpenModal(false);
      } else {
        console.error('Failed to create series');
      }
    } catch (error) {
      console.error('Error creating series:', error);
    }
  }, []);

  // シリーズ変更ハンドラをメモ化
  const handleSeriesChange = useCallback((e) => {
    setSeries(e.target.value);
  }, []);

  // モーダル開閉ハンドラをメモ化
  const handleOpenModal = useCallback(() => {
    setOpenModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setOpenModal(false);
  }, []);

  // 説明テキスト変更ハンドラをメモ化
  const handleDescriptionChange = useCallback((value) => {
    setDescription(value);
    setDescCharCount(value.length);
  }, []);

  // 各種設定変更ハンドラをメモ化
  const handleOriginalChange = useCallback((e) => {
    setOriginal(e.target.value === 'yes');
  }, []);

  const handleAdultContentChange = useCallback((e) => {
    setAdultContent(e.target.value === 'all');
  }, []);

  const handlePublicStatusChange = useCallback((e) => {
    setIsPublic(e.target.value === 'public');
  }, []);

  const handleCommentsStatusChange = useCallback((e) => {
    setAllowComments(e.target.value === 'on');
  }, []);

  // オリジナル作品のラジオボタンオプションをメモ化
  const originalOptions = useMemo(() => [
    { value: 'yes', label: 'はい' },
    { value: 'no', label: 'いいえ' }
  ], []);

  // 年齢設定のラジオボタンオプションをメモ化
  const adultContentOptions = useMemo(() => [
    { value: 'all', label: '全年齢' },
    { value: 'r18', label: 'R18' }
  ], []);

  // 公開設定のラジオボタンオプションをメモ化
  const publicOptions = useMemo(() => [
    { value: 'public', label: '公開' },
    { value: 'private', label: '非公開' }
  ], []);

  // コメント設定のラジオボタンオプションをメモ化
  const commentOptions = useMemo(() => [
    { value: 'on', label: 'コメントを許可する' },
    { value: 'off', label: 'コメントを禁止する' }
  ], []);

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', padding: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        新規投稿
      </Typography>
      
      {/* シリーズ選択 */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <FormControl fullWidth margin="normal">
          <InputLabel>シリーズ選択</InputLabel>
          <Select
            value={series}
            onChange={handleSeriesChange}
          >
            {seriesList.map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.title}
              </MenuItem>
            ))}
            <MenuItem value="" onClick={handleOpenModal}>
              シリーズを新規作成
            </MenuItem>
          </Select>
        </FormControl>
        <InfoTooltip title="シリーズは関連する作品をまとめるための機能です。複数の章や連載作品の場合は、シリーズにまとめることをお勧めします。" />
      </Box>
      
      {/* タイトル */}
      <LabeledTextField 
        label="タイトル"
        value={title}
        onChange={setTitle}
        required
        maxLength={500}
        tooltip="作品のタイトルを入力してください。検索結果に表示される重要な情報です。"
      />
      <Typography variant="contained" gutterBottom> {title.length}/500</Typography>

      {/* エディタ */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="subtitle1">本文</Typography>
        <InfoTooltip title="作品の本文です。テキスト、画像を含めることができます。フォーマットや装飾はエディタのツールバーを使用してください。" />
      </Box>
      <Paper elevation={0} variant="outlined" sx={{ p: 1, mb: 2 }}>
        <CustomEditor
          value={content}
          onChange={handleContentChange}
        />
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="contained" gutterBottom> {charCount}/70000</Typography>
        <Typography variant="contained" gutterBottom> 画像: {imageCount}枚</Typography>
      </Box>

      {/* タグ追加 */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
          <TextField
            label="タグ追加"
            variant="outlined"
            fullWidth
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            disabled={tags.length >= 10}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
          />
          <Button 
            variant="contained" 
            onClick={handleAddTag} 
            disabled={tags.length >= 10 || !newTag}
            startIcon={<AddIcon />}
          >
            追加
          </Button>
        </Box>
        <InfoTooltip title="作品を分類するためのタグです。ジャンル、テーマ、キーワードなどを追加してください。最大10個まで設定できます。" />
      </Box>

      <Typography variant="contained" gutterBottom sx={{ mt: 1 }}> {tags.length}/10</Typography>

      {/* タグリスト */}
      <TagList tags={tags} onRemove={handleRemoveTag} />

      {/* 作品説明 */}
      <LabeledTextField 
        label="作品説明"
        value={description}
        onChange={handleDescriptionChange}
        required
        multiline
        rows={4}
        maxLength={3000}
        tooltip="作品の概要や紹介文を入力してください。検索結果に表示される重要な情報です。"
      />
      <Typography variant="contained" gutterBottom>
        {descCharCount}/3000
      </Typography>
      
      {/* オリジナル作品設定 */}
      <SectionBox>
        <RadioButtonGroup 
          legend="オリジナル作品ですか？"
          value={original === true ? 'yes' : original === false ? 'no' : ''}
          onChange={handleOriginalChange}
          options={originalOptions}
          tooltip="オリジナル作品の場合は「はい」、二次創作や翻案の場合は「いいえ」を選択してください。"
        />
      </SectionBox>
      
      {/* 対象年齢設定 */}
      <SectionBox>
        <RadioButtonGroup 
          legend="対象年齢"
          value={adultContent === true ? 'all' : adultContent === false ? 'r18' : ''}
          onChange={handleAdultContentChange}
          options={adultContentOptions}
          tooltip="全年齢向けの作品は誰でも閲覧できます。R18作品は成人向けコンテンツを含みます。"
        />
      </SectionBox>
      
      {/* AI生成設定 */}
      <SectionBox>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            使用したAIツール (必須)
          </Typography>
          <InfoTooltip title="作品の作成に使用したAIツールを選択または入力してください。複数選択可能です。" />
        </Box>
        
        {/* AIツール選択コンポーネント */}
        <AiToolSelector
          usedAiTools={usedAiTools}
          newAiTool={newAiTool}
          setNewAiTool={setNewAiTool}
          handleAddAiTool={handleAddAiTool}
          handleRemoveAiTool={handleRemoveAiTool}
          handleAddAiSuggestion={handleAddAiSuggestion}
        />
        
        {/* URL入力（オプショナル） */}
        <LabeledTextField
          label="AI使用の証明URL（任意）"
          placeholder="https://example.com/"
          value={aiEvidenceUrl}
          onChange={setAiEvidenceUrl}
          startIcon={<LinkIcon sx={{ color: 'action.active', mr: 1 }} />}
          tooltip="AIの使用履歴やプロンプトの保存先URLなどがあれば入力してください。（任意）"
        />
        
        {/* AI説明（必須） */}
        <LabeledTextField
          label="AI使用の説明（必須）"
          placeholder="どのようにAIを使用したか説明してください"
          value={aiEvidenceDescription}
          onChange={setAiEvidenceDescription}
          required
          multiline
          rows={3}
          tooltip="AIをどのように利用して作品を作成したか詳細に説明してください。使用したプロンプトや編集プロセスなどを含めると良いでしょう。"
        />
      </SectionBox>
      
      {/* 公開設定 */}
      <SectionBox>
        <RadioButtonGroup 
          legend="公開設定"
          value={isPublic ? 'public' : 'private'}
          onChange={handlePublicStatusChange}
          options={publicOptions}
          tooltip="公開を選択すると、すべてのユーザーが作品を閲覧できます。非公開の場合は、あなた以外見ることができません。"
        />
      </SectionBox>
      
      {/* コメント設定 */}
      <SectionBox>
        <RadioButtonGroup 
          legend="コメント設定"
          value={allowComments ? 'on' : 'off'}
          onChange={handleCommentsStatusChange}
          options={commentOptions}
          tooltip="コメントを許可すると、他のユーザーが作品にコメントできます。禁止すると、コメント機能が無効になります。"
        />
      </SectionBox>

      {/* 投稿ボタン */}
      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={handleSubmit}
          disabled={isSubmitting}
          startIcon={isSubmitting && <CircularProgress size={20} color="inherit" />}
        >
          {isSubmitting ? '処理中...' : '投稿する'}
        </Button>
      </Box>
      
      {/* シリーズ作成モーダル */}
      <SeriesCreationModal
        open={openModal}
        onClose={handleCloseModal}
        onCreateSeries={handleCreateSeries}
      />
    </Box>
  );
});

export default PostEditor;