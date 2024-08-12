import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Main from './main';
import reportWebVitals from './reportWebVitals';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const theme = createTheme({
  typography: {
    fontFamily: 'ffdin, sans-serif',
  },
  palette: {
    primary: {
      main: '#1976d2', // Adjust the primary color as needed
    },
    background: {
      default: '#f7f9fc', // Set the background color for the whole app
    },
  },
});
root.render(
  
  <BrowserRouter>
  
    <ThemeProvider theme={theme}>
      <CssBaseline />
    <Main />
    </ThemeProvider>
  
  </BrowserRouter>
  
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
