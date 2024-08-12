import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, List, ListItem, ListItemText, IconButton, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface User {
  id: number;
  full_name: string;
  // other user properties
}

interface UserPopupProps {
  open: boolean;
  onClose: () => void;
  taskboardId: number; // Ensure this prop is passed to know which taskboard the user will be added to
}

const UserPopup: React.FC<UserPopupProps> = ({ open, onClose, taskboardId }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        console.log('Fetched users:', data); // Debug: Log fetched users
        setUsers(data);
        setFilteredUsers(data); // Initialize filteredUsers with the full list
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (open) {
      fetchUsers(); // Fetch users only when the popup is open
    }
  }, [open]);

  useEffect(() => {
    // Filter users based on search term, ensuring user.full_name is defined
    const filtered = users.filter(user =>
      user.full_name?.toLowerCase().includes(search.toLowerCase())
    );
    console.log('Filtered users:', filtered); // Debug: Log filtered users
    setFilteredUsers(filtered);
  }, [search, users]);

  const handleAddUser = async (userId: number) => {
    try {
      const response = await fetch(`/api/user_taskboards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          taskboard_id: taskboardId,
          role: 'editor', // You can adjust the role as needed
        }),
      });

      if (response.ok) {
        console.log(`User ${userId} added to taskboard ${taskboardId}`);
        // Optionally, you could provide feedback to the user (e.g., a success message)
      } else {
        console.error(`Failed to add user ${userId} to taskboard ${taskboardId}`);
      }
    } catch (error) {
      console.error('Error adding user to taskboard:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add User to Project</DialogTitle>
      <DialogContent style={{ height: '400px' }}>
        <TextField
          fullWidth
          label="Search Users"
          variant="outlined"
          margin="normal"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div style={{ overflowY: 'auto', height: 'calc(100% - 100px)' }}>
          <List>
            {filteredUsers.map(user => (
              <ListItem
                key={user.id}
                secondaryAction={
                  <IconButton edge="end" aria-label="add" onClick={() => handleAddUser(user.id)}>
                    <AddIcon />
                  </IconButton>
                }
              >
                <ListItemText primary={user.full_name} />
              </ListItem>
            ))}
          </List>
        </div>
        <Button onClick={onClose} color="primary" variant="contained" fullWidth>
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default UserPopup;
