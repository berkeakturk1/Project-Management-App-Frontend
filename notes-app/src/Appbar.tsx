import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import Avatar from '@mui/material/Avatar';
import { Box, InputBase, Modal, TextField, Grid } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';

interface MyAppBarProps {
  handleLogout: () => void;
}

const theme = createTheme({
  typography: {
    fontFamily: 'ffdin, sans-serif',
  },
});

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const MyAppBar: React.FC<MyAppBarProps> = ({ handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleWorkspacesClick = () => {
    navigate('/workspace');
  };

  const handleTeamsClick = () => {
    navigate('/teams');
  };

  const getButtonStyle = (path: string) => ({
    textTransform: 'none',
    fontSize: '18px',
    borderBottom: location.pathname === path ? '2px solid #1976d2' : 'none',
  });

  const fetchWorkspaceId = async (userId: string) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/workspaceId?userId=${userId}`);
      return response.data.workspaceId;
    } catch (error) {
      console.error('Error fetching workspace ID:', error);
      return null;
    }
  };

  const handleCreateTaskboard = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('User ID is missing');
      return;
    }

    const workspaceId = await fetchWorkspaceId(userId);
    if (!workspaceId) {
      console.error('Workspace ID is missing');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/taskboards', {
        title,
        description,
        workspace_id: workspaceId,
      });

      if (response.status === 201) {
        console.log('Taskboard created successfully');
        handleClose();
      } else {
        console.error('Failed to create taskboard');
      }
    } catch (error) {
      console.error('Error creating taskboard:', error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static" color="default">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Project Management Software
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button color="inherit" sx={getButtonStyle('/workspace')} onClick={handleWorkspacesClick}>Workspace</Button>
          <Button color="inherit" sx={getButtonStyle('/filters')}>Sprints</Button>
          <Button color="inherit" sx={getButtonStyle('/your-work')}>Retrospectives</Button>
          <Button color="inherit" sx={getButtonStyle('/dashboards')}>Dashboard</Button>
          <Button color="inherit" sx={getButtonStyle('/teams')} onClick={handleTeamsClick}>Teams</Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="contained" color="primary" sx={{ textTransform: 'none', fontSize: '18px' }} onClick={handleOpen}>
            Create
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <InputBase
              placeholder="Search"
              inputProps={{ 'aria-label': 'search' }}
              sx={{ ml: 1, flex: 1 }}
            />
            <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
              <SearchIcon />
            </IconButton>
          </Box>
          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>
          <IconButton color="inherit">
            <HelpOutlineIcon />
          </IconButton>
          <IconButton color="inherit">
            <SettingsIcon />
          </IconButton>
          <Avatar alt="User Avatar" src="" />
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Create Taskboard
          </Typography>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sx={{ textAlign: 'right' }}>
              <Button onClick={handleClose} sx={{ mr: 2 }}>Cancel</Button>
              <Button variant="contained" color="primary" onClick={handleCreateTaskboard}>
                Create
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </ThemeProvider>
  );
};

export default MyAppBar;
