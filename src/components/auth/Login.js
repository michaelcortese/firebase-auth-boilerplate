import { useState } from 'react';
import { auth, googleProvider, db } from '../../firebase/config';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './Auth.css';
import UsernamePrompt from './UsernamePrompt';

const Login = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const isEmail = (input) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
  };

  const checkUserHasUsername = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      return userDoc.exists() && userDoc.data().username;
    } catch (err) {
      console.error('Error checking username:', err);
      return false;
    }
  };

  const findEmailByUsername = async (username) => {
    try {
      console.log('Searching for username:', username);
      const usernameLower = username.toLowerCase();
      console.log('Lowercase username:', usernameLower);
      
      const usernameDoc = doc(db, 'usernames', usernameLower);
      const usernameSnapshot = await getDoc(usernameDoc);
      
      console.log('Username document exists:', usernameSnapshot.exists());
      
      if (usernameSnapshot.exists()) {
        const usernameData = usernameSnapshot.data();
        console.log('Username document data:', usernameData);

        if (!usernameData.email || !usernameData.provider) {
          try {
            const userRef = doc(db, 'users', usernameData.uid);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
              const userData = userSnap.data();
              await setDoc(usernameDoc, {
                ...usernameData,
                email: userData.email,
                provider: userData.provider || 'email',
                isGoogleAccount: userData.isGoogleAccount || false
              }, { merge: true });
              
              if (userData.provider === 'google' || userData.isGoogleAccount) {
                return { isGoogleAccount: true };
              }
              return { email: userData.email, isGoogleAccount: false };
            }
          } catch (err) {
            console.error('Error fetching user data:', err);
          }
        }

        if (usernameData.provider === 'google' || usernameData.isGoogleAccount) {
          console.log('Found Google account');
          return { isGoogleAccount: true };
        }

        console.log('Found regular account with email:', usernameData.email);
        return { email: usernameData.email, isGoogleAccount: false };
      }
      
      console.log('No user found for username:', username);
      return { email: null, isGoogleAccount: false };
    } catch (err) {
      console.error('Error finding email:', err);
      return { email: null, isGoogleAccount: false };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    console.log('Attempting login with:', emailOrUsername);

    try {
      let loginEmail = emailOrUsername;

      if (!isEmail(emailOrUsername)) {
        console.log('Input is not an email, searching by username');
        const { email, isGoogleAccount } = await findEmailByUsername(emailOrUsername);
        console.log('Search result:', { email, isGoogleAccount });
        
        if (!email && !isGoogleAccount) {
          console.log('No account found');
          setError('No account found with this username');
          setIsLoading(false);
          return;
        }

        if (isGoogleAccount) {
          console.log('Found Google account');
          setError(
            <span className="error-with-button">
              This account uses Google Sign-In. 
              <button 
                onClick={handleGoogleSignIn}
                className="google-btn"
                style={{ marginLeft: '10px' }}
              >
                Sign in with Google
              </button>
            </span>
          );
          setIsLoading(false);
          return;
        }

        loginEmail = email;
      }

      console.log('Attempting login with email:', loginEmail);
      await signInWithEmailAndPassword(auth, loginEmail, password);
      setEmailOrUsername('');
      setPassword('');
      setError(null);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const hasUsername = await checkUserHasUsername(result.user.uid);
      
      if (!hasUsername) {
        setGoogleUser(result.user);
        setShowUsernamePrompt(true);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUsernameSet = () => {
    setShowUsernamePrompt(false);
    setGoogleUser(null);
  };

  if (showUsernamePrompt && googleUser) {
    return <UsernamePrompt user={googleUser} onComplete={handleUsernameSet} />;
  }

  return (
    <div className="login">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Email or Username"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <button onClick={handleGoogleSignIn} className="google-btn">
        Sign in with Google
      </button>
      <div className="auth-links">
        <Link to="/reset-password">Forgot Password?</Link>
        <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
      </div>
    </div>
  );
};

export default Login; 