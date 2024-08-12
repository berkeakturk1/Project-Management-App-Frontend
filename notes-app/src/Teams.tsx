import React from 'react';
import { Container, Grid, Typography, Avatar, Box } from '@mui/material';
import ProjectCard from './ProjectCard';
import MemberRow from './MemberRow';

interface Project {
  title: string;
  description: string;
  roles: string[];
  stats: {
    completed: number;
    total: number;
    tasks: number;
  };
}

interface Member {
  name: string;
  avatar: string;
  timeOff: string[];
  assignedTo: string;
  project: string;
}

const teamMembers: Member[] = [
  { name: 'Member 1', avatar: '/path/to/avatar1.jpg', timeOff: ['M', 'T', 'W'], assignedTo: 'S-211', project: 'Chat App' },
  { name: 'Member 2', avatar: '/path/to/avatar2.jpg', timeOff: ['T', 'W', 'F'], assignedTo: 'S-201', project: 'Dashboard' },
  { name: 'Member 3', avatar: '/path/to/avatar3.jpg', timeOff: ['W', 'F'], assignedTo: 'S-201', project: 'Chat Web' },
  { name: 'Member 4', avatar: '/path/to/avatar4.jpg', timeOff: ['M', 'T', 'W', 'F'], assignedTo: 'B-17', project: 'Connective Profile' }
];

const projects: Project[] = [
  { title: 'Chat App', description: 'This application is created to make users life easier', roles: ['Dev', 'Design'], stats: { completed: 4, total: 1, tasks: 4 } },
  { title: 'Chat Web', description: 'Web is accompanying the chat app', roles: ['Design'], stats: { completed: 5, total: 7, tasks: 2 } },
  { title: 'Connective Profile', description: 'This is our biggest cross platform profile', roles: ['Dev'], stats: { completed: 7, total: 1, tasks: 8 } },
  { title: 'Dashboard', description: 'Needed to manage the applications', roles: ['Dev', 'Design'], stats: { completed: 11, total: 29, tasks: 1 } }
];

const App: React.FC = () => {
  return (
    <Container>
      <Box my={4}>
        <Typography variant="h4" gutterBottom>Dream Team</Typography>
        <Box display="flex" alignItems="center" mb={2}>
          <AvatarGroup members={teamMembers} />
          <Typography variant="body2" ml={2}>+12</Typography>
        </Box>
      </Box>
      <Box my={4}>
        <Typography variant="h6" gutterBottom>Current Projects (4)</Typography>
        <Grid container spacing={3}>
          {projects.map((project, index) => (
            <Grid item xs={12} md={3} key={index}>
              <ProjectCard {...project} />
            </Grid>
          ))}
        </Grid>
      </Box>
      <Box my={4}>
        <Typography variant="h6" gutterBottom>Allocation</Typography>
        <Grid container spacing={3}>
          {teamMembers.map((member, index) => (
            <Grid item xs={12} key={index}>
              <MemberRow {...member} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

const AvatarGroup: React.FC<{ members: Member[] }> = ({ members }) => (
  <Box display="flex" alignItems="center">
    {members.slice(0, 3).map((member, index) => (
      <Avatar key={index} src={member.avatar} sx={{ marginRight: 1 }} />
    ))}
  </Box>
);

export default App;
