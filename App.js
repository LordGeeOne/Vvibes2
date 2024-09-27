import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignupPage from './components/SignupPage';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import ProfilePage from './components/ProfilePage';
import ProfileDetailsPage from './components/ProfileDetailsPage';
import Requests from './components/Requests'; // Import Requests
import Matches from './components/Matches'; // Import Matches
import { AuthProvider } from './hooks/useAuth'; // Import AuthProvider

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-profile" element={<ProfileDetailsPage />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/matches" element={<Matches />} /> {/* Add Matches Route */}
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
