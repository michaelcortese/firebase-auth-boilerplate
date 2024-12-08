import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import UsernamePrompt from './UsernamePrompt';

const RequireUsername = ({ children }) => {
  const { user, needsUsername } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (needsUsername) {
    return <UsernamePrompt user={user} onComplete={() => {}} />;
  }

  return children;
};

export default RequireUsername; 