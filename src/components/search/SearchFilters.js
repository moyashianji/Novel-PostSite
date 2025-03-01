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
import { useLocation, useNavigate } from "react-router-dom";

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
    const location = useLocation();
    const navigate = useNavigate();

    const query = new URLSearchParams(location.search);
    const type = query.get("type") || "posts"; // 🔹 URLから `type` を取得

    const handleInputChange = useCallback((field, value) => {
        setSearchParams((prev) => ({
            ...prev,
            [field]: field === "fields" ? value.split(",") : value,
        }));
        console.log(`✅ ${field} が更新:`, value);
    }, [setSearchParams]);

    const handleSearchClick = useCallback(() => {
        const updatedQuery = new URLSearchParams(location.search);
    
        Object.keys(searchParams).forEach((key) => {
            if (searchParams[key]) {
                updatedQuery.set(
                    key,
                    Array.isArray(searchParams[key]) ? searchParams[key].join(",") : searchParams[key]
                );
            }
        });

        // 🔹 type パラメータを維持
        updatedQuery.set("type", type);

        console.log("🔍 更新された検索クエリ:", updatedQuery.toString());
        navigate(`/search?${updatedQuery.toString()}`);
    }, [searchParams, type, setSearchParams, navigate, location.search]);

    // 🔹 `posts` と `series` で検索フィールドを切り替え
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

            <Button variant="contained" color="primary" onClick={handleSearchClick} sx={{ mt: 2 }}>
                検索
            </Button>
        </FormControl>
    );
};

export default SearchFilters;
