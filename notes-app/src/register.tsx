// Register.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { Container, Box, Avatar, Typography, TextField, Button, CssBaseline, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import './register.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('user');
  const [email, setemail] = useState('');
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await axios.post('http://localhost:3001/register', { username, password, userType,email,fname,lname });
      alert('User registered successfully');
    } catch (error) {
      console.error('Registration failed', error);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Register
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="fName"
            label="First Name"
            name="First Name"
            autoComplete="First Name"
            autoFocus
            value={fname}
            onChange={(e) => setFname(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="lName"
            label="Last Name"
            name="Last Name"
            autoComplete="Last Name"
            autoFocus
            value={lname}
            onChange={(e) => setLname(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="e-mail"
            label="e-mail"
            name="e-mail"
            autoComplete="e-mail"
            autoFocus
            value={email}
            onChange={(e) => setemail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="user-type-label">User Type</InputLabel>
            <Select
              labelId="user-type-label"
              id="user-type"
              value={userType}
              label="User Type"
              onChange={(e) => setUserType(e.target.value)}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Register
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;