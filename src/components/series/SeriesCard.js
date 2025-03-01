import React from "react";
import { Card, Typography, Avatar, Box, Chip, CardContent } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { styled } from "@mui/system";

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "scale(1.03)",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.3)",
  },
}));

const SeriesCard = ({ series }) => {
  const { _id, title, description, author, tags, worksCount } = series;
  return (
    <StyledCard>
      <CardContent>
        <SeriesTitle _id={_id} title={title} />
        <SeriesAuthor author={author} />
        <SeriesDescription description={description} />
        <SeriesWorksCount worksCount={worksCount} />
        <SeriesTags tags={tags} />
      </CardContent>
    </StyledCard>
  );
};

// ✅ シリーズタイトル（クリックで遷移）
const SeriesTitle = React.memo(({ _id, title }) => (
  <Link to={`/series/${_id}/works`} style={{ textDecoration: "none", color: "inherit" }}>
    <Typography variant="h5" gutterBottom>
      {title.length > 30 ? `${title.slice(0, 30)}...` : title} {/* 文字数制限 */}
    </Typography>
  </Link>
));

// ✅ 作者情報
const SeriesAuthor = React.memo(({ author }) => (
  <Box display="flex" alignItems="center" mb={2}>
    <Link to={`/user/${author._id}`}>
      <Avatar src={author.icon} alt={author.nickname} sx={{ width: 32, height: 32 }} />
    </Link>
    <Link
      to={`/user/${author._id}`}
      style={{ textDecoration: "none", color: "inherit", marginLeft: "8px" }}
    >
      <Typography variant="subtitle1">{author.nickname}</Typography>
    </Link>
  </Box>
));

// ✅ シリーズ説明（100文字制限）
const SeriesDescription = React.memo(({ description }) => (
  <Typography variant="body2" color="textSecondary">
    {description.length > 100 ? `${description.slice(0, 100)}...` : description}
  </Typography>
));

// ✅ シリーズの作品数
const SeriesWorksCount = React.memo(({ worksCount }) => (
  <Typography variant="caption" display="block" gutterBottom>
    作品数: {worksCount} 作
  </Typography>
));

// ✅ シリーズタグ
const SeriesTags = React.memo(({ tags }) => {
  const navigate = useNavigate();

  const handleTagClick = (tag) => {
    navigate(`/search?mustInclude=${encodeURIComponent(tag)}`);
  };

  return (
    <Box mt={1} display="flex" flexWrap="wrap">
      {tags.map((tag, index) => (
        <Chip
          key={index}
          label={tag}
          sx={{ marginRight: 0.5, marginBottom: 0.5 }}
          onClick={() => handleTagClick(tag)}
        />
      ))}
    </Box>
  );
});

export default React.memo(SeriesCard);
