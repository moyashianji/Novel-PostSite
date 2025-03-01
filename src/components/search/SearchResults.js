import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Container, Grid, Typography, CircularProgress, 
  Box, Pagination, Tabs, Tab 
} from "@mui/material";
import PostCard from "../../components/PostCard";
import SeriesCard from "../../components/series/SeriesCard";

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 🔍 `location.search` から `searchParams` を動的に取得
  const searchParams = useMemo(() => {
    const query = new URLSearchParams(location.search);
    return {
      mustInclude: query.get("mustInclude") || "",
      shouldInclude: query.get("shouldInclude") || "",
      mustNotInclude: query.get("mustNotInclude") || "",
      fields: query.get("fields") ? query.get("fields").split(",") : ["title", "content", "tags"],
      tagSearchType: query.get("tagSearchType") || "partial",
      type: query.get("type") || "posts",
      page: parseInt(query.get("page")) || 1,
      size: parseInt(query.get("size")) || 10,
    };
  }, [location.search]); // ✅ `location.search` が変わるたびに `searchParams` を更新

  const [tab, setTab] = useState(searchParams.type);
  const [posts, setPosts] = useState([]);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      setError("");

      try {
        const queryString = new URLSearchParams();
        Object.keys(searchParams).forEach((key) => {
          if (searchParams[key]) {
            queryString.set(
              key,
              Array.isArray(searchParams[key]) ? searchParams[key].join(",") : searchParams[key]
            );
          }
        });

        console.log("🔍 APIリクエストURL:", `/api/search?${queryString.toString()}`);

        const response = await fetch(`/api/search?${queryString.toString()}`);
        const data = await response.json();

        console.log("📥 取得したデータ:", data);

        if (response.ok) {
          if (tab === "posts") {
            setPosts(data.results || []);
          } else {
            setSeries(data.results || []);
          }
          setTotalResults(data.total || 0);
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

    fetchSearchResults();
  }, [searchParams]); // ✅ `searchParams` の変更を監視して検索を実行

  const totalPages = Math.ceil(totalResults / searchParams.size);

  // ✅ ページネーション処理
  const handlePageChange = (event, newPage) => {
    const updatedParams = new URLSearchParams(location.search);
    updatedParams.set("page", newPage);
    updatedParams.set("type", searchParams.type);

    navigate({ search: updatedParams.toString() });
  };

  // ✅ タブ切り替え処理
  const handleTabChange = (event, newValue) => {
    const updatedParams = new URLSearchParams(location.search);
    updatedParams.set("type", newValue);
    updatedParams.set("page", "1");

    setTab(newValue);
    navigate({ search: updatedParams.toString() });
  };

  // ✅ `searchParams.type` の変更を監視してタブを更新
  useEffect(() => {
    setTab(searchParams.type);
  }, [searchParams.type]);

  const newLocal = <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
    <Tabs value={tab} onChange={handleTabChange} centered>
      <Tab label={`作品${tab === "posts" ? ` (${totalResults})` : ""}`} value="posts" />
      <Tab label={`シリーズ${tab === "series" ? ` (${totalResults})` : ""}`} value="series" />
    </Tabs>
  </Box>;
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        "{searchParams.mustInclude}" の検索結果
      </Typography>

      {newLocal}

      {loading ? (
        <CircularProgress sx={{ display: "block", margin: "20px auto" }} />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : tab === "posts" && posts.length > 0 ? (
        <Grid container spacing={3}>
          {posts.map((post) => (
            <Grid item xs={12} sm={6} md={4} key={post._id}>
              <PostCard post={post} />
            </Grid>
          ))}
        </Grid>
      ) : tab === "series" && series.length > 0 ? (
        <Grid container spacing={3}>
          {series.map((series) => (
            <Grid item xs={12} sm={6} md={4} key={series._id}>
              <SeriesCard series={series} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1">検索結果が見つかりませんでした。</Typography>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination count={totalPages} page={searchParams.page} onChange={handlePageChange} color="primary" />
        </Box>
      )}
    </Container>
  );
};

export default SearchResults;
