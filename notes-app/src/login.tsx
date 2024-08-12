import React, { useState } from 'react';
import axios from 'axios';
import { Container, Box, Avatar, Typography, TextField, Button, Grid, Link } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const Login = ({ onLogin }: { onLogin: (userType: string) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/login', { username, password });
      console.log('Response data:', response.data); // Log the entire response data
      const { token, userType, userId } = response.data;

      if (!userId) {
        throw new Error('UserId is missing in the response');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId.toString()); // Convert userId to string
      localStorage.setItem('userType', userType);
      onLogin(userType);
      console.log('User type after login:', userType);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Login failed', error.response?.data || error.message);
      } else {
        console.error('Login failed', error);
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: 3,
          padding: 3,
          borderRadius: 2,
          backgroundColor: 'background.paper',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main', boxShadow: 2 }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold' }}>
          Welcome Back
        </Typography>
        <Typography component="h2" variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
          Sign in to your account
        </Typography>
        <Box sx={{ mt: 1, width: '100%' }}>
          <form onSubmit={handleSubmit}>
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
              sx={{ boxShadow: 1 }}
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
              sx={{ boxShadow: 1 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, boxShadow: 2 }}
            >
              Sign In
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2" sx={{ textDecoration: 'underline' }}>
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="/register" variant="body2" sx={{ textDecoration: 'underline' }}>
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;