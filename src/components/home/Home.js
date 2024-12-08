import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { auth } from '../../firebase/config';
import './Home.css';

const Home = () => {
  const { user } = useAuth();

  const handleSignOut = () => {
    auth.signOut();
  };

  return (
    <div className="home">
      <nav className="nav-bar">
        <h2>Welcome, {user?.email}!</h2>
        <div className="nav-links">
          <Link to="/profile" className="nav-link">Profile</Link>
          <button onClick={handleSignOut} className="sign-out-btn">Sign Out</button>
        </div>
      </nav>
      
      <div className="content">
        <h1>Dashboard</h1>
        <p>Welcome to your dashboard. This is a protected route.</p>
      </div>
    </div>
  );
};

export default Home; 