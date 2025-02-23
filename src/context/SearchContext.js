import React, { createContext, useState, useContext, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";

// Contextの作成
export const SearchContext = createContext();

export const SearchProvider = memo(({ children }) => {
    const navigate = useNavigate();

    // 検索パラメータの状態管理
    const [searchParams, setSearchParams] = useState({
        mustInclude: "",
        shouldInclude: "",
        mustNotInclude: "",
        fields: ["title", "content", "tags"],
        tagSearchType: "partial",
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

        // 🔥 `replace` を使って履歴を増やさないようにする
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
