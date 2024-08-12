import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';

interface ProjectCardProps {
  title: string;
  description: string;
  roles: string[];
  stats: {
    completed: number;
    total: number;
    tasks: number;
  };
}

const ProjectCard: React.FC<ProjectCardProps> = ({ title, description, roles, stats }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>{description}</Typography>
        <Box display="flex" flexWrap="wrap" mb={2}>
          {roles.map((role, index) => (
            <Chip key={index} label={role} sx={{ marginRight: 1, marginBottom: 1 }} />
          ))}
        </Box>
        <Typography variant="body2">Completed: {stats.completed}/{stats.total}</Typography>
        <Typography variant="body2">Tasks: {stats.tasks}</Typography>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
