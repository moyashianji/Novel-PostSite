import React, { createContext, useState, useContext, useCallback, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Contextの作成
export const SearchContext = createContext();

export const SearchProvider = memo(({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // 🔹 現在のURLから `type` を取得（デフォルトは `posts`）
    const urlParams = new URLSearchParams(location.search);
    const defaultType = urlParams.get("type") || "posts";

    // 検索パラメータの状態管理
    const [searchParams, setSearchParams] = useState({
        mustInclude: "",
        shouldInclude: "",
        mustNotInclude: "",
        fields: defaultType === "series" ? ["title", "description", "tags"] : ["title", "content", "tags"],
        tagSearchType: "partial",
        type: defaultType, // 🔹 `type` を保持
    });

    // 🔍 検索関数
    const handleSearch = useCallback((params) => {
        const updatedParams = { ...searchParams, ...params };
        setSearchParams(updatedParams);

        const query = new URLSearchParams();
        Object.keys(updatedParams).forEach((key) => {
            if (updatedParams[key]) {
                query.set(key, updatedParams[key]);
            }
        });


        navigate(`/search?${query.toString()}`);
    }, [searchParams, navigate]);

    return (
        <SearchContext.Provider value={{ searchParams, setSearchParams, handleSearch }}>
            {children}
        </SearchContext.Provider>
    );
});

// カスタムフック
export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error("useSearch must be used within a SearchProvider");
    }
    return context;
};
