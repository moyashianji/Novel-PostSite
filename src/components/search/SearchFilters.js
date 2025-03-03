import React, { useCallback } from "react";
import {
    TextField,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Button,
    Box,
    Typography,
    Chip,
    Divider,
    IconButton,
    Tooltip,
} from "@mui/material";
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useSearch } from "../../context/SearchContext";
import { useLocation, useNavigate } from "react-router-dom";

const KeywordFilter = React.memo(({ label, value, onChange }) => (
    <TextField
        label={label}
        value={value || ''}
        onChange={onChange}
        fullWidth
        sx={{ mb: 2 }}
        variant="outlined"
        size="small"
    />
));

const RadioFilter = React.memo(({ label, value, options, onChange }) => (
    <FormControl component="fieldset" sx={{ mb: 2 }}>
        <FormLabel component="legend">{label}</FormLabel>
        <RadioGroup row value={value} onChange={onChange}>
            {options.map((option) => (
                <FormControlLabel
                    key={option.value}
                    value={option.value}
                    control={<Radio size="small" />}
                    label={option.label}
                />
            ))}
        </RadioGroup>
    </FormControl>
));

// AIツールフィルター
const AIToolFilter = React.memo(({ value, onChange, clearFilter }) => {
    // 一般的なAIツールのリスト
    const commonAITools = [ "AIのべりすと","ChatGPT", "Claude", "GPT-4", "DALL-E", "Midjourney", "Stable Diffusion", 
        "Bard", "Bing AI", "Jasper", "Rytr", "Copy.ai", "Novel AI", "AI Dungeon",
        "Replika", "Character.AI", "Playground AI", "DeepL", "Notion AI", "Sudowrite",
        "Synthesia", "RunwayML", "Kaiber", "Leonardo.AI", "Firefly"];
    
    return (
        <Box sx={{ mb: 2 }}>
            <FormLabel component="legend" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SmartToyIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                AIツールで絞り込み（現在作品のみの対応です）
            </FormLabel>
            
            {value && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>選択中:</Typography>
                    <Chip 
                        label={value} 
                        onDelete={clearFilter}
                        color="secondary"
                        size="small"
                    />
                </Box>
            )}
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                {commonAITools.map((tool) => (
                    <Chip
                        key={tool}
                        label={tool}
                        onClick={() => onChange(tool)}
                        sx={{ mr: 1, mb: 1 }}
                        color={value === tool ? "secondary" : "default"}
                        variant={value === tool ? "filled" : "outlined"}
                        size="small"
                    />
                ))}
            </Box>
        </Box>
    );
});

const SearchFilters = () => {
    const { searchParams, setSearchParams, handleSearch, clearSearchParams } = useSearch();
    const location = useLocation();
    const navigate = useNavigate();

    const query = new URLSearchParams(location.search);
    const type = query.get("type") || "posts";
    const aiTool = query.get("aiTool") || "";

    const handleInputChange = useCallback((field, value) => {
        setSearchParams((prev) => ({
            ...prev,
            [field]: field === "fields" ? value.split(",") : value,
            // 検索条件変更時はページを1に戻す
            page: "1"
        }));
    }, [setSearchParams]);

    // AIツールの選択処理
    const handleAIToolSelect = useCallback((tool) => {
        setSearchParams((prev) => ({
            ...prev,
            aiTool: prev.aiTool === tool ? "" : tool, // 同じツールを選択した場合は解除
            page: "1"
        }));
    }, [setSearchParams]);

    // AIツールフィルターのクリア
    const clearAIToolFilter = useCallback(() => {
        setSearchParams((prev) => ({
            ...prev,
            aiTool: "",
            page: "1"
        }));
    }, [setSearchParams]);

    const handleSearchClick = useCallback(() => {
        const updatedQuery = new URLSearchParams();
    
        Object.keys(searchParams).forEach((key) => {
            if (searchParams[key]) {
                updatedQuery.set(
                    key,
                    Array.isArray(searchParams[key]) ? searchParams[key].join(",") : searchParams[key]
                );
            }
        });

        console.log("🔍 更新された検索クエリ:", updatedQuery.toString());
        navigate(`/search?${updatedQuery.toString()}`);
    }, [searchParams, navigate]);

    // 検索フィールドのオプション
    const fieldsOptions = type === "series"
        ? [
            { value: "title,description,tags", label: "タイトル・説明・タグ" },
            { value: "title", label: "タイトル" },
            { value: "description", label: "説明" },
            { value: "tags", label: "タグ" },
        ]
        : [
            { value: "title,content,tags", label: "タイトル・本文・タグ" },
            { value: "title", label: "タイトル" },
            { value: "content", label: "本文" },
            { value: "tags", label: "タグ" },
        ];

    return (
        <FormControl component="fieldset" sx={{ 
            mb: 3, 
            p: 2, 
            border: "1px solid #e0e0e0", 
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <FormLabel component="legend" sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                    検索オプション
                </FormLabel>
                <Tooltip title="検索条件をクリア">
                    <IconButton size="small" onClick={clearSearchParams}>
                        <ClearIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>

            <KeywordFilter
                label="以下のキーワードをすべて含む"
                value={searchParams.mustInclude}
                onChange={(e) => handleInputChange("mustInclude", e.target.value)}
            />
            <KeywordFilter
                label="以下のキーワードのいずれかを含む"
                value={searchParams.shouldInclude}
                onChange={(e) => handleInputChange("shouldInclude", e.target.value)}
            />
            <KeywordFilter
                label="以下のキーワードを除外する"
                value={searchParams.mustNotInclude}
                onChange={(e) => handleInputChange("mustNotInclude", e.target.value)}
            />

            <Divider sx={{ my: 2 }} />

            {/* AIツールフィルター */}
            <AIToolFilter 
                value={searchParams.aiTool} 
                onChange={handleAIToolSelect}
                clearFilter={clearAIToolFilter}
            />

            <Divider sx={{ my: 2 }} />

            <RadioFilter
                label="検索対象"
                value={Array.isArray(searchParams.fields) ? searchParams.fields.join(",") : searchParams.fields}
                options={fieldsOptions}
                onChange={(e) => handleInputChange("fields", e.target.value)}
            />

            <RadioFilter
                label="タグ検索の精度"
                value={searchParams.tagSearchType}
                options={[
                    { value: "partial", label: "あいまい一致" },
                    { value: "exact", label: "完全一致" },
                ]}
                onChange={(e) => handleInputChange("tagSearchType", e.target.value)}
            />

            <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSearchClick} 
                sx={{ mt: 2 }}
                startIcon={<SearchIcon />}
                size="medium"
                fullWidth
            >
                検索
            </Button>
        </FormControl>
    );
};

export default SearchFilters;