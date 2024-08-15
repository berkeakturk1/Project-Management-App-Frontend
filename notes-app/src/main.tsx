import React, { useState, useEffect } from "react";
import Login from './login';
import Register from './register';
import App from './App';
import MyAppBar from './Appbar';
import RegularUserApp from "./RegularUserApp";
import WorkspacePage from "./Workspace";
import Teams from "./Teams";
import MyTasks from "./MyTasks";
import Loading from './loading'; // Import the Loading component
import SprintManagement from './SprintManagement';
import { Route, Routes, Navigate, useNavigate, useLocation } from "react-router-dom";

const Main = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // State for loading
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserType = localStorage.getItem('user_type');
    if (token && storedUserType) {
      setIsAuthenticated(true);
      setUserType(storedUserType);
    }
    setIsLoading(false); // Stop loading after initial check
  }, []);

  const handleLogin = (userType: string) => {
    setIsAuthenticated(true);
    setUserType(userType);
    localStorage.setItem('user_type', userType);
    console.log(`User type after login: ${userType}`);
    setIsLoading(true); // Start loading before navigating
    navigate('/workspace'); // Use navigate directly
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_type');
    setIsAuthenticated(false);
    setUserType(null);
    navigate('/');
  };

  useEffect(() => {
    // Set loading true whenever the location changes
    setIsLoading(true);

    const handleRouteChangeEnd = () => {
      setIsLoading(false); // Stop loading after navigation
    };

    handleRouteChangeEnd(); // Manually trigger after the route changes

    return () => {
      setIsLoading(false);
    };
  }, [location]);

  return (
    <div>
      {isLoading ? (
        <Loading /> // Show the loading screen if loading
      ) : (
        <>
          {isAuthenticated && <MyAppBar handleLogout={handleLogout} />}
          <Routes>
            <Route path="/taskboard/:taskboardId" element={userType === 'admin' ? <App/> : <RegularUserApp/>}/>
            <Route path="/" element={isAuthenticated ? <Navigate to={'/workspace'} /> : <Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/mytasks" element={<MyTasks />} />
            <Route path="/SprintManagement" element={<SprintManagement />} />
            <Route path="/workspace" element={<WorkspacePage />} />
            <Route path="/taskboard_user" element={<RegularUserApp />} />
            <Route path="/Home" element={isAuthenticated ? <WorkspacePage /> : <Navigate to="/" />} />
            <Route path="/teams" element={<Teams/>} />
          </Routes>
        </>
      )}
    </div>
  );
};

export default Main;
