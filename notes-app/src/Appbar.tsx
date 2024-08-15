import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge'; // Import Badge component
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import Avatar from '@mui/material/Avatar';
import { Box, InputBase, Modal, TextField, Grid, Menu, MenuItem } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
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
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hiddenButtons, setHiddenButtons] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMoreMenuOpen = Boolean(anchorEl);
  const [notifications, setNotifications] = useState(0); // State to track notifications

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleWorkspacesClick = () => {
    navigate('/workspace');
  };

  const handleSprintsClick = () => {
    navigate('/SprintManagement');
  }

  const handleTeamsClick = () => {
    navigate('/teams');
  };

  const handleMyTasksClick = () => {
    navigate("/mytasks");
  };

  const handleMoreClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMoreClose = () => {
    setAnchorEl(null);
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

  const checkOverflow = () => {
    if (!toolbarRef.current) return;

    const toolbarWidth = toolbarRef.current.clientWidth;
    const buttons = Array.from(toolbarRef.current.children) as HTMLElement[];
    let totalWidth = 0;
    const newHiddenButtons: string[] = [];

    buttons.forEach((button) => {
      if (button.className.includes("button-action")) {
        totalWidth += button.clientWidth;
        if (totalWidth > toolbarWidth - 150) { // 150px reserved for the icons on the right
          newHiddenButtons.push(button.id);
        }
      }
    });

    setHiddenButtons(newHiddenButtons);
  };

  const incrementNotifications = () => {
    setNotifications(notifications + 1);
  };

  useEffect(() => {
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => {
      window.removeEventListener('resize', checkOverflow);
    };
  }, []);

  return (
      <ThemeProvider theme={theme}>
        <AppBar position="static" color="default">
          <Toolbar ref={toolbarRef}>
            <IconButton edge="start" color="inherit" aria-label="menu">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap>
              Project Management Software
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            {!hiddenButtons.includes('workspace') && (
                <Button id="workspace" color="inherit" sx={getButtonStyle('/workspace')} className="button-action" onClick={handleWorkspacesClick}>Workspace</Button>
            )}
            {!hiddenButtons.includes('filters') && (
                <Button id="filters" color="inherit" sx={getButtonStyle('/SprintManagement')} className="button-action" onClick={handleSprintsClick}>Sprints</Button>
            )}
            {!hiddenButtons.includes('your-work') && (
                <Button id="your-work" color="inherit" sx={getButtonStyle('/your-work')} className="button-action">Retrospectives</Button>
            )}
            {!hiddenButtons.includes('mytasks') && (
                <Button id="mytasks" color="inherit" sx={getButtonStyle('/mytasks')} className="button-action" onClick={handleMyTasksClick}>My Tasks</Button>
            )}

            <Box sx={{ flexGrow: 1 }} />
            <Button variant="contained" color="primary" sx={{ textTransform: 'none', fontSize: '18px' }} onClick={handleOpen}>
              Create
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
              </IconButton>
            </Box>
            <IconButton color="inherit">
              <Badge badgeContent={notifications} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton color="inherit">
              <HelpOutlineIcon />
            </IconButton>
            <IconButton color="inherit">
              <SettingsIcon />
            </IconButton>
            <Avatar alt="User Avatar" src="" />
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
            {hiddenButtons.length > 0 && (
                <IconButton color="inherit" onClick={handleMoreClick}>
                  <MoreVertIcon />
                </IconButton>
            )}
            <Menu
                anchorEl={anchorEl}
                open={isMoreMenuOpen}
                onClose={handleMoreClose}
            >
              {hiddenButtons.includes('workspace') && (
                  <MenuItem onClick={handleWorkspacesClick}>Workspace</MenuItem>
              )}
              {hiddenButtons.includes('filters') && (
                  <MenuItem>Sprints</MenuItem>
              )}
              {hiddenButtons.includes('mytasks') && (
                  <MenuItem onClick={handleMyTasksClick}>My Tasks</MenuItem>
              )}
            </Menu>
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
