import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Container, Grid, Typography, CircularProgress } from "@mui/material";
import PostCard from "../../components/PostCard";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const SearchResults = () => {
  const query = useQuery();
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 検索パラメータの取得
  const searchParams = {
    mustInclude: query.get("mustInclude") || "",
    shouldInclude: query.get("shouldInclude") || "",
    mustNotInclude: query.get("mustNotInclude") || "",
    fields: query.get("fields") ? query.get("fields").split(",") : ["title", "content", "tags"],
    tagSearchType: query.get("tagSearchType") || "partial",
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      setError("");

      try {
        const queryString = new URLSearchParams(searchParams).toString();
        const response = await fetch(`/api/posts/search?${queryString}`);
        const data = await response.json();

        if (response.ok) {
          setSearchResults(data || []);
        } else {
          setError("検索に失敗しました");
        }
      } catch (error) {
        console.error("❌ Error fetching search results:", error);
        setError("検索に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    // 🔹 必要なパラメータが揃っている場合のみ検索実行
    if (searchParams.mustInclude || searchParams.shouldInclude) {
      fetchSearchResults();
    }
  }, [query.toString()]); // 🔥 `query.toString()` のみを依存配列に設定

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        "{searchParams.mustInclude}" の検索結果
      </Typography>

      {loading ? (
        <CircularProgress sx={{ display: "block", margin: "20px auto" }} />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : searchResults.length > 0 ? (
        <Grid container spacing={3}>
          {searchResults.map((post) => (
            <Grid item xs={12} sm={6} md={4} key={post._id}>
              <PostCard post={post} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1">検索結果が見つかりませんでした。</Typography>
      )}
    </Container>
  );
};

export default SearchResults;
