import React, { useState, useContext, useCallback } from "react";
import { Box, Button, InputBase } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { styled } from "@mui/system";
import { SearchContext } from "../../../context/SearchContext";

const SearchBox = styled("div")(({ theme }) => ({
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.grey[200],
    "&:hover": {
        backgroundColor: theme.palette.grey[300],
    },
    width: "100%",
    maxWidth: "600px",
    display: "flex",
    alignItems: "center",
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: "inherit",
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    width: "100%",
    "&::placeholder": {
        color: "black",
        opacity: 1,
    },
}));

const MemoizedSearchIconWrapper = React.memo(() => (
    <SearchIconWrapper>
        <SearchIcon sx={{ color: "#888" }} />
    </SearchIconWrapper>
));

const MemoizedStyledInputBase = React.memo(({ value, onChange, onKeyPress }) => (
    <StyledInputBase
        placeholder="タイトル・タグなどで検索しましょう！"
        inputProps={{ "aria-label": "search" }}
        value={value}
        onChange={onChange}
        onKeyPress={onKeyPress}
        sx={{ color: "black" }}
    />
));

const MemoizedButton = React.memo(({ onClick }) => (
    <Button variant="contained" color="primary" sx={{ marginLeft: 1 }} onClick={onClick}>
        検索
    </Button>
));

const SearchBar = () => {
    const { handleSearch } = useContext(SearchContext);
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearchSubmit = useCallback(() => {
        if (searchQuery.trim()) {
            handleSearch({ mustInclude: searchQuery });
        }
    }, [searchQuery, handleSearch]);

    const handleInputChange = useCallback((e) => {
        setSearchQuery(e.target.value);
    }, []);

    const handleKeyPress = useCallback((e) => {
        if (e.key === "Enter") {
            handleSearchSubmit();
        }
    }, [handleSearchSubmit]);

    return (
        <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            <SearchBox sx={{ backgroundColor: "white", border: "1px solid #ccc" }}>
                <MemoizedSearchIconWrapper />
                <MemoizedStyledInputBase
                    value={searchQuery}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                />
            </SearchBox>
            <MemoizedButton onClick={handleSearchSubmit} />
        </Box>
    );
};

export default React.memo(SearchBar);
