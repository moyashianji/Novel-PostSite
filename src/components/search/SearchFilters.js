// src/components/search/SearchFilters.js
import React, { useCallback } from "react";
import {
    TextField,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Button,
} from "@mui/material";
import { useSearch } from "../../context/SearchContext";
import { useNavigate } from "react-router-dom";

const KeywordFilter = React.memo(({ label, value, onChange }) => (
    <TextField
        label={label}
        value={value}
        onChange={onChange}
        fullWidth
        sx={{ mb: 2 }}
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
                    control={<Radio />}
                    label={option.label}
                />
            ))}
        </RadioGroup>
    </FormControl>
));

const SearchFilters = () => {
    const { searchParams, setSearchParams, handleSearch } = useSearch();
    const navigate = useNavigate();

    const handleInputChange = useCallback((field, value) => {
        setSearchParams((prev) => ({ ...prev, [field]: value }));
    }, [setSearchParams]);

    const handleSearchClick = useCallback(() => {
        handleSearch(searchParams);
    }, [handleSearch, searchParams]);

    return (
        <FormControl component="fieldset" sx={{ mb: 3, p: 2, border: "1px solid #ccc", borderRadius: "8px" }}>
            <FormLabel component="legend" sx={{ mb: 2, fontWeight: "bold" }}>検索オプション</FormLabel>

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

            <RadioFilter
                label="検索対象"
                value={searchParams.fields.join(",")}
                options={[
                    { value: "title,content,tags", label: "タイトル・全本文・タグ" },
                    { value: "title", label: "タイトル" },
                    { value: "content", label: "全本文" },
                    { value: "tags", label: "タグ" },
                ]}
                onChange={(e) => handleInputChange("fields", e.target.value.split(","))}
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

            <Button variant="contained" color="primary" onClick={handleSearchClick} sx={{ mt: 2 }}>
                検索
            </Button>
        </FormControl>
    );
};

export default SearchFilters;
