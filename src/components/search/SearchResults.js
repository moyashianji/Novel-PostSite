import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Container, Grid, Typography, CircularProgress, 
  Box, Pagination, Tabs, Tab 
} from "@mui/material";
import PostCard from "../../components/PostCard";
import SeriesCard from "../../components/series/SeriesCard";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const SearchResults = () => {
  const query = useQuery();
  const navigate = useNavigate();

  // 🔹 現在のタブ状態（作品 or シリーズ）
  const [tab, setTab] = useState(query.get("type") || "posts");

  // 🔹 検索結果と状態
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(parseInt(query.get("page")) || 1);

  // 🔹 検索パラメータ
  const searchParams = {
    mustInclude: query.get("mustInclude") || "",
    shouldInclude: query.get("shouldInclude") || "",
    mustNotInclude: query.get("mustNotInclude") || "",
    fields: query.get("fields") ? query.get("fields").split(",") : ["title", "content", "tags"],
    tagSearchType: query.get("tagSearchType") || "partial",
    page: page,
    size: 10, // 1ページあたりの件数
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      setError("");

      try {
        const queryString = new URLSearchParams(searchParams);
        queryString.set("type", tab);

        const requestUrl = `/api/search?${queryString.toString()}`;
        console.log("🔍 APIリクエストURL:", requestUrl);

        const response = await fetch(requestUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("📥 取得したデータ:", data);

        setData(data.results || []);
        setTotalResults(data.total || 0);
        setPage(data.page);
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
  }, [query.toString(), tab]);

  const totalPages = Math.ceil(totalResults / searchParams.size);

  // 🔹 ページ変更時の処理
  const handlePageChange = (event, newPage) => {
    const updatedParams = new URLSearchParams(query.toString());
    updatedParams.set("page", newPage);
    updatedParams.set("type", tab);
    navigate({ search: updatedParams.toString() });
  };

  // 🔹 タブの変更処理
  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    const updatedParams = new URLSearchParams(query.toString());
    updatedParams.set("type", newValue);
    updatedParams.set("page", "1"); // タブ切り替え時にページをリセット
    navigate({ search: updatedParams.toString() });
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        "{searchParams.mustInclude}" の検索結果
      </Typography>

      {/* 🔹 タブの UI */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs value={tab} onChange={handleTabChange} centered>
          <Tab label="作品" value="posts" />
          <Tab label="シリーズ" value="series" />
        </Tabs>
      </Box>

      {loading ? (
        <CircularProgress sx={{ display: "block", margin: "20px auto" }} />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {data.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item._id}>
                {tab === "posts" ? <PostCard post={item} /> : <SeriesCard series={item} />}
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
      )}
    </Container>
  );
};

export default SearchResults;
