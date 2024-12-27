import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { useParams ,Link} from 'react-router-dom';




const WorksInSeries = () => {
  const { id } = useParams();
  const [works, setWorks] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        console.log(id);
        const response = await fetch(`${API_URL}/api/series/${id}/works`);
        const data = await response.json();
        console.log(data)
        setWorks(data);
      } catch (error) {
        console.error('Error fetching works:', error);
      }
    };

    fetchWorks();
  }, [id]);

  return (
    <Box sx={{ maxWidth: 1200, margin: 'auto', paddingTop: 4 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
        作品一覧
      </Typography>
      <Box>
        {works.sort((a, b) => a.episodeNumber - b.episodeNumber).map((work) => (
          <Card key={work._id} sx={{ mb: 2 }}>
            <CardContent>
            <Link to={`/novel/${work._id}`}  style={{ textDecoration: 'none', color: 'inherit' }}>

              <Typography variant="h6">
                {work.episodeNumber}. {work.title}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {work.description}
              </Typography>
            </Link>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default WorksInSeries;
