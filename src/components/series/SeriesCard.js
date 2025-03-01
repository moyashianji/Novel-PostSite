import React from "react";
import { Card, Typography, Avatar, Box, Chip, CardContent } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { styled } from "@mui/system";

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
}));

const SeriesCard = ({ series }) => {
  if (!series) {
    return null; // ✅ `series` が `null` または `undefined` の場合は何も描画しない
  }

  const { _id, title = "無題", description = "説明なし", author = {}, tags = [], posts = [] } = series;

  return (
    <StyledCard>
      <CardContent>
        <SeriesTitle _id={_id} title={title} />
        <SeriesAuthor author={author} />
        <SeriesDescription description={description} />
        <SeriesWorksCount posts={posts} />  {/* `posts` を渡す */}
        <SeriesTags tags={tags} />
      </CardContent>
    </StyledCard>
  );
};
// ✅ シリーズタイトル（クリックで遷移）
const SeriesTitle = React.memo(({ _id, title }) => (
  <Link to={_id ? `/series/${_id}/works` : "#"} style={{ textDecoration: "none", color: "inherit" }}>
    <Typography variant="h5" gutterBottom>
      {title.length > 30 ? `${title.slice(0, 30)}...` : title}
    </Typography>
  </Link>
));

// ✅ 作者情報
const SeriesAuthor = React.memo(({ author }) => {
  if (!author || !author._id) {
    return <Typography variant="subtitle2" color="textSecondary">不明な作者</Typography>;
  }

  return (
    <Box display="flex" alignItems="center" mb={2}>
      <Link to={`/user/${author._id}`}>
        <Avatar src={author.icon || "/default-avatar.png"} alt={author.nickname || "不明"} sx={{ width: 32, height: 32 }} />
      </Link>
      <Link to={`/user/${author._id}`} style={{ textDecoration: "none", color: "inherit", marginLeft: "8px" }}>
        <Typography variant="subtitle1">{author.nickname || "不明"}</Typography>
      </Link>
    </Box>
  );
});

// ✅ シリーズ説明（100文字制限）
const SeriesDescription = React.memo(({ description }) => (
  <Typography variant="body2" color="textSecondary">
    {description?.length > 100 ? `${description.slice(0, 100)}...` : description}
  </Typography>
));

// ✅ シリーズの最新エピソード番号を取得（`posts` 内の `episodeNumber` の最大値）
const SeriesWorksCount = React.memo(({ posts }) => {
  // posts が存在しない場合はデフォルトで 0 を表示
  const latestEpisode = posts && posts.length > 0
    ? Math.max(...posts.map(post => post.episodeNumber || 0)) // `episodeNumber` の最大値を取得
    : 0;

  return (
    <Typography variant="caption" display="block" gutterBottom>
      最新エピソード: {latestEpisode} 話
    </Typography>
  );
});

// ✅ シリーズタグ
const SeriesTags = React.memo(({ tags }) => {
  const navigate = useNavigate();

  if (!tags || tags.length === 0) {
    return null;
  }

  const handleTagClick = (tag) => {
    navigate(`/search?mustInclude=${encodeURIComponent(tag)}&type=series`);
  };

  return (
    <Box mt={1} display="flex" flexWrap="wrap">
      {tags.map((tag, index) => (
        <Chip
          key={index}
          label={tag}
          sx={{ marginRight: 0.5, marginBottom: 0.5 }}
          onClick={() => handleTagClick(tag)}
          color="primary"
        />
      ))}
    </Box>
  );
});

export default React.memo(SeriesCard);
