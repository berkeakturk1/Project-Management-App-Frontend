import React from 'react';
import { Grid, Typography, Avatar, Box, Chip } from '@mui/material';

interface MemberRowProps {
  name: string;
  avatar: string;
  timeOff: string[];
  assignedTo: string;
  project: string;
}

const MemberRow: React.FC<MemberRowProps> = ({ name, avatar, timeOff, assignedTo, project }) => {
  return (
    <Grid container alignItems="center" spacing={3}>
      <Grid item>
        <Avatar src={avatar} />
      </Grid>
      <Grid item xs>
        <Typography>{name}</Typography>
      </Grid>
      <Grid item xs>
        <Box display="flex">
          {timeOff.map((day, index) => (
            <Chip key={index} label={day} variant="outlined" size="small" />
          ))}
        </Box>
      </Grid>
      <Grid item xs>
        <Typography>{assignedTo}</Typography>
      </Grid>
      <Grid item xs>
        <Typography>{project}</Typography>
      </Grid>
    </Grid>
  );
};

export default MemberRow;
