import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import ResetPassword from './components/auth/ResetPassword';
import UserProfile from './components/profile/UserProfile';
import Home from './components/home/Home';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider, useAuth } from './hooks/useAuth';
import RequireUsername from './components/auth/RequireUsername';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/home" />} />
      <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/home" />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <RequireUsername>
              <Home />
            </RequireUsername>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <RequireUsername>
              <UserProfile />
            </RequireUsername>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to={user ? "/home" : "/login"} />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
