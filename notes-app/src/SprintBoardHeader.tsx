import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box, Divider } from '@mui/material';
import { ArrowDropDown, FilterList, Add, PlayArrow, MoreVert, Sort } from '@mui/icons-material';

const SprintBoardHeader = () => {
  return (
      <Box sx={{ flexGrow: 1, marginTop: 10 }}>
        <Box sx={{ backgroundColor: '#fff', padding: '16px 24px', borderBottom: '1px solid #e1e4e8', borderRadius: '8px 8px 0 0' }}>
          <Toolbar sx={{ justifyContent: 'space-between', padding: 0 }}>
            {/* Left Side - Sprint Board Title */}
            <Box display="flex" alignItems="center">
              <PlayArrow sx={{ fontSize: 36, marginRight: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                Sprint board
              </Typography>
              <Box sx={{ marginLeft: 1, backgroundColor: '#e1e4e8', color: '#000', padding: '2px 8px', borderRadius: 2, fontSize: 12 }}>
                Beta
              </Box>
            </Box>

            {/* Center - Sprint Info */}
            <Box display="flex" alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', marginRight: 2 }}>
                Current: Sprint 2
                <ArrowDropDown fontSize="medium" />
              </Typography>
            </Box>

            {/* Right Side - Actions */}
            <Box display="flex" alignItems="center">
              <Button sx={{ textTransform: 'none', color: '#0366d6', marginRight: 2, fontSize: 16 }}>
                Filter
              </Button>
              <IconButton sx={{ fontSize: 24 }}>
                <Sort />
              </IconButton>
              <IconButton sx={{ fontSize: 24 }}>
                <MoreVert />
              </IconButton>
              <Button variant="contained" color="primary" sx={{ textTransform: 'none', marginLeft: 2, fontSize: 16 }} startIcon={<Add />}>
                New
              </Button>
            </Box>
          </Toolbar>

          <Divider sx={{ marginTop: 2 }} />

          <Toolbar sx={{ justifyContent: 'space-between', paddingTop: 8, padding: 0 }}>
            {/* Left Side - Sprint Filter */}
            <Box display="flex" alignItems="center">
              <Button variant="outlined" startIcon={<PlayArrow />} sx={{ textTransform: 'none', marginRight: 2, fontSize: 16 }}>
                Sprint: Current
              </Button>
              <Button sx={{ textTransform: 'none', color: '#0366d6', fontSize: 16 }}>
                + Add filter
              </Button>
            </Box>

            {/* Right Side - Sprint Stats */}
            <Box display="flex" alignItems="center">
              <Typography variant="body1" sx={{ marginRight: 2, fontSize: 16 }}>
                1 / 4 tasks
              </Typography>
              <Button variant="outlined" sx={{ textTransform: 'none', fontSize: 16 }} startIcon={<PlayArrow />}>
                Complete sprint
              </Button>
            </Box>
          </Toolbar>
        </Box>
      </Box>
  );
};

export default SprintBoardHeader;
