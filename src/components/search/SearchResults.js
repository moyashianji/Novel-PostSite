import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Grid, Typography, CircularProgress, Box, Pagination } from "@mui/material";
import PostCard from "../../components/PostCard";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const SearchResults = () => {
  const query = useQuery();
  const navigate = useNavigate();

  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(parseInt(query.get("page")) || 1);

  // 🔹 検索パラメータの取得
  const searchParams = {
    mustInclude: query.get("mustInclude") || "",
    shouldInclude: query.get("shouldInclude") || "",
    mustNotInclude: query.get("mustNotInclude") || "",
    fields: query.get("fields") ? query.get("fields").split(",") : ["title", "content", "tags"],
    tagSearchType: query.get("tagSearchType") || "partial",
    page: parseInt(query.get("page")) || 1,
    size: 10, // 🔥 1ページあたりの件数（固定）
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
          setSearchResults(data.posts || []);
          setTotalResults(data.total || 0);
          setPage(data.page);
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

    if (searchParams.mustInclude || searchParams.shouldInclude) {
      fetchSearchResults();
    }
  }, [query.toString()]);

  const totalPages = Math.ceil(totalResults / searchParams.size);

  // 🔹 ページ切り替え処理
  const handlePageChange = (event, newPage) => {
    const updatedParams = new URLSearchParams(query.toString());
    updatedParams.set("page", newPage);
    navigate({ search: updatedParams.toString() });
  };

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
        <>
          <Grid container spacing={3}>
            {searchResults.map((post) => (
              <Grid item xs={12} sm={6} md={4} key={post._id}>
                <PostCard post={post} />
              </Grid>
            ))}
          </Grid>

          {/* 🔹 ページネーション */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      ) : (
        <Typography variant="body1">検索結果が見つかりませんでした。</Typography>
      )}
    </Container>
  );
};

export default SearchResults;
