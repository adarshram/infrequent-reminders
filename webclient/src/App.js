import './App.css';
import React, { useState, useEffect } from 'react';
import { initializeFireBase } from './api/fireBaseUtility';
import Axios from 'axios';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { red } from '@mui/material/colors';

import CreateSchedule from './pages/CreateSchedule';
import ListSchedules from './pages/ListSchedules';
import Dashboard from './pages/Dashboard';

import UserProfile from './pages/UserProfile';
import PendingNotifications from './pages/PendingNotifications';
import ScheduleDetails from './pages/ScheduleDetails';
import ReminderSet from './pages/ReminderSet/index';

import Login from './pages/Login';

import Footer from './components/footer';
import Header from './components/header';

import usePendingCount from './hooks/usePendingCount';

import { Container, CssBaseline } from '@mui/material';
import PrivateRoute from './components/routes/PrivateRoute';
import { UserContext } from './models/UserContext';
import { PendingReminderContext } from './models/PendingReminderContext';
import FullPageLoader from './components/Loaders/FullPageLoader';
import { getAuth } from 'firebase/auth';

Axios.defaults.baseURL = process.env.REACT_APP_PROXY
  ? process.env.REACT_APP_PROXY
  : 'https://localhost:3050';

function App() {
  const theme = createTheme({
    palette: {
      neutral: {
        contrastText: '#fff',
        dark: '#7b1fa2',
        light: '#fff',
        main: red[50],
      },
    },
  });
  initializeFireBase();
  const auth = getAuth();

  const [userObject, setUserObject] = useState(null);
  useEffect(() => {
    let stateChangedSubscription = auth.onAuthStateChanged(function (user) {
      if (user) {
        Axios.defaults.headers.common['Authorization'] = user.accessToken
          ? `Bearer ${user.accessToken}`
          : ``;
      }
      setUserObject(user ? user : false);
    });

    return () => {
      stateChangedSubscription();
    };
  }, [auth]);

  const [pendingCount, loadPendingCount] = usePendingCount();

  useEffect(() => {
    const hasPendingCountInitiated = !(pendingCount === null);
    if (userObject && !hasPendingCountInitiated) {
      loadPendingCount();
    }
  }, [userObject, pendingCount, loadPendingCount]);
  const hasUserObjectInitiated = !(userObject === null);

  if (!hasUserObjectInitiated) {
    return <FullPageLoader />;
  }

  const sharedUserObject = { user: userObject, setUser: setUserObject };
  const pendingReminders = { count: pendingCount ? pendingCount : 0, load: loadPendingCount };

  return (
    <ThemeProvider theme={theme}>
      <UserContext.Provider value={sharedUserObject}>
        <PendingReminderContext.Provider value={pendingReminders}>
          <BrowserRouter>
            <Header />
            <Container component="main" maxWidth="100%" sx={{ ml: 0 }}>
              <CssBaseline />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route element={<PrivateRoute />}>
                  <Route path="/create/:id" element={<CreateSchedule />} />
                  <Route path="/create" element={<CreateSchedule />} />
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/list" element={<ListSchedules />} />
                  <Route path="/pending" element={<PendingNotifications />} />
                  <Route path="/details/:id" element={<ScheduleDetails />} />
                  <Route path="/set/:type" element={<ReminderSet />} />
                  <Route path="/set/:type/:id" element={<ReminderSet />} />
                </Route>

                <Route path="/userProfile" element={<UserProfile />} />
              </Routes>
            </Container>
            <Footer />
          </BrowserRouter>
        </PendingReminderContext.Provider>
      </UserContext.Provider>
    </ThemeProvider>
  );
}

export default App;
