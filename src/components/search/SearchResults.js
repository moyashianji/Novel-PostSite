import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Container, Grid, Typography, CircularProgress, 
  Box, Pagination, Tabs, Tab, Chip, Alert, Paper
} from "@mui/material";
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SearchIcon from '@mui/icons-material/Search';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PostCard from "../post/PostCard";
import SeriesCard from "../../components/series/SeriesCard";

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // URLから検索パラメータを取得
  const searchParams = useMemo(() => {
    const query = new URLSearchParams(location.search);
    return {
      mustInclude: query.get("mustInclude") || "",
      shouldInclude: query.get("shouldInclude") || "",
      mustNotInclude: query.get("mustNotInclude") || "",
      fields: query.get("fields") ? query.get("fields").split(",") : ["title", "content", "tags"],
      tagSearchType: query.get("tagSearchType") || "partial",
      type: query.get("type") || "posts",
      aiTool: query.get("aiTool") || "", // AIツールパラメータ
      page: parseInt(query.get("page")) || 1,
      size: parseInt(query.get("size")) || 10,
    };
  }, [location.search]);

  const [tab, setTab] = useState(searchParams.type);
  const [posts, setPosts] = useState([]);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalResults, setTotalResults] = useState(0);

  // 検索結果を取得する関数
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
        
        if (!response.ok) {
          throw new Error(`サーバーエラー: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("📥 取得したデータ:", data);

        if (tab === "posts") {
          setPosts(data.results || []);
        } else {
          setSeries(data.results || []);
        }
        setTotalResults(data.total || 0);
      } catch (error) {
        console.error("❌ Error fetching search results:", error);
        setError(error.message || "検索に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchParams, tab]);

  const totalPages = Math.ceil(totalResults / searchParams.size);

  // ページネーション処理
  const handlePageChange = (event, newPage) => {
    const updatedParams = new URLSearchParams(location.search);
    updatedParams.set("page", newPage);
    navigate({ search: updatedParams.toString() });
  };

  // タブ切り替え処理
  const handleTabChange = (event, newValue) => {
    const updatedParams = new URLSearchParams(location.search);
    updatedParams.set("type", newValue);
    updatedParams.set("page", "1");

    setTab(newValue);
    navigate({ search: updatedParams.toString() });
  };

  // AIツールフィルターをクリアする処理
  const clearAIToolFilter = () => {
    const updatedParams = new URLSearchParams(location.search);
    updatedParams.delete("aiTool");
    updatedParams.set("page", "1");
    navigate({ search: updatedParams.toString() });
  };

  // `searchParams.type`の変更を監視してタブを更新
  useEffect(() => {
    setTab(searchParams.type);
  }, [searchParams.type]);

  // 検索タイトルの生成
  const searchTitle = useMemo(() => {
    const parts = [];
    let hasFilters = false;
    
    if (searchParams.mustInclude) {
      parts.push(<span key="must">{`"${searchParams.mustInclude}"`}</span>);
      hasFilters = true;
    }
    
    if (searchParams.aiTool) {
      parts.push(
        <Chip 
          key="aiTool"
          icon={<SmartToyIcon />}
          label={searchParams.aiTool} 
          color="secondary"
          onDelete={clearAIToolFilter}
          size="medium"
          sx={{ ml: 1, fontWeight: 500 }}
        />
      );
      hasFilters = true;
    }
    
    if (!hasFilters) {
      return "すべての結果";
    }
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
        <SearchIcon sx={{ mr: 1 }} />
        <Typography variant="h5" component="span" sx={{ mr: 1 }}>
          検索結果
        </Typography>
        {parts}
      </Box>
    );
  }, [searchParams.mustInclude, searchParams.aiTool]);

  // 表示するコンテンツを決定
  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      );
    }

    if ((tab === "posts" && posts.length === 0) || (tab === "series" && series.length === 0)) {
      return (
        <Paper sx={{ p: 3, my: 2, textAlign: 'center' }}>
          <InfoOutlinedIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h6" color="textSecondary">
            検索結果が見つかりませんでした
          </Typography>
          <Typography variant="body2" color="textSecondary">
            別のキーワードで試してみてください
          </Typography>
        </Paper>
      );
    }

    if (tab === "posts") {
      return (
        <Grid container spacing={3}>
          {posts.map((post) => (
            <Grid item xs={12} sm={6} md={4} key={post._id}>
              <PostCard post={post} />
            </Grid>
          ))}
        </Grid>
      );
    }

    return (
      <Grid container spacing={3}>
        {series.map((series) => (
          <Grid item xs={12} sm={6} md={4} key={series._id}>
            <SeriesCard series={series} />
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ mb: 3 }}>
        {searchTitle}
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tab} onChange={handleTabChange} centered>
          <Tab label={`作品${tab === "posts" ? ` (${totalResults})` : ""}`} value="posts" />
          <Tab label={`シリーズ${tab === "series" ? ` (${totalResults})` : ""}`} value="series" />
        </Tabs>
      </Box>

      {renderContent()}

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 2 }}>
          <Pagination 
            count={totalPages} 
            page={searchParams.page} 
            onChange={handlePageChange} 
            color="primary"
            showFirstButton 
            showLastButton
          />
        </Box>
      )}
    </Container>
  );
};

export default SearchResults;