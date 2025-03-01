import React from 'react';
import { Card, Typography, Avatar, Box, Chip } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const PostCard = ({ post }) => {
  const { _id, title, author, description, content, wordCount, tags, series } = post; // ✅ `series` を追加

  return (
    <Card sx={{ marginBottom: 2, padding: 2 }}>
      {series && <PostSeries series={series} />} {/* ✅ シリーズタイトルを追加 */}
      <PostTitle _id={_id} title={title} />
      <PostAuthor author={author} />
      <PostDescription description={description} />
      <PostContent content={content} />
      <PostWordCount wordCount={wordCount} />
      <PostTags tags={tags} />
    </Card>
  );
};

const PostSeries = React.memo(({ series }) => {
  if (!series || !series.title) return null; // ✅ シリーズがない場合は何も表示しない

  const maxLength = 20;
  const truncatedTitle =
    series.title.length > maxLength ? series.title.substring(0, maxLength) + '...' : series.title;

  return (
    <Link to={`/series/${series._id}/works`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <Typography variant="subtitle2" color="primary" gutterBottom>
        {truncatedTitle}
      </Typography>
    </Link>
  );
});


const PostTitle = React.memo(({ _id, title }) => (
  <Link to={`/novel/${_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
    <Typography variant="h5" gutterBottom>
      {title}
    </Typography>
  </Link>
));

const PostAuthor = React.memo(({ author }) => {
  if (!author) return null; // Check if author is null or undefined

  return (
    <Box display="flex" alignItems="center" mb={2}>
      <Link to={`/user/${author._id}`}>
        <Avatar 
          src={`${author.icon}`} 
          alt={author.nickname} 
          sx={{ width: 32, height: 32 }} 
        />
      </Link>
      <Link to={`/user/${author._id}`} style={{ textDecoration: 'none', color: 'inherit', marginLeft: '8px' }}>
        <Typography variant="subtitle1">{author.nickname}</Typography>
      </Link>
    </Box>
  );
});

const PostDescription = React.memo(({ description }) => (
  <Typography variant="body1" color="textSecondary" gutterBottom>
    {description}
  </Typography>
));

const PostContent = React.memo(({ content }) => {
  const safeContent = content ? content.slice(0, 100) + '...' : ''; // 🔥 contentがundefinedなら空文字を返す

  return (
    <Typography variant="body2" color="textSecondary">
      <span dangerouslySetInnerHTML={{ __html: safeContent }} />
    </Typography>
  );
});
const PostWordCount = React.memo(({ wordCount }) => (
  <Typography variant="caption" display="block" gutterBottom>
    文字数: {wordCount}
  </Typography>
));

const PostTags = React.memo(({ tags }) => {
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
          color="primary"
        />
      ))}
    </Box>
  );
});

export default React.memo(PostCard);
