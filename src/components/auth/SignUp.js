import './Auth.css';
import { useState } from 'react';
import { auth, googleProvider, db } from '../../firebase/config';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsChecking(true);

    try {
      // Check if username is available (case insensitive)
      const usernameLower = username.toLowerCase();
      const usernameDoc = doc(db, 'usernames', usernameLower);
      const usernameSnapshot = await getDoc(usernameDoc);

      if (usernameSnapshot.exists()) {
        setError('Username is already taken');
        setIsChecking(false);
        return;
      }

      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Reserve the username with both original and lowercase versions
      await setDoc(doc(db, 'usernames', usernameLower), {
        uid: user.uid,
        username: username,
        usernameLower: usernameLower,
        email: email,
        provider: 'email',
        isGoogleAccount: false,
        createdAt: new Date().toISOString()
      });

      // Create user profile
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: email,
        username: username,
        usernameLower: usernameLower,
        createdAt: new Date().toISOString(),
        displayName: '',
        phoneNumber: '',
        address: ''
      });

      setEmail('');
      setPassword('');
      setUsername('');
      setError(null);
    } catch (err) {
      console.error('Error during signup:', err);
      setError(err.message);
    } finally {
      setIsChecking(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user already exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        // User already exists, they should log in instead
        setError(
          <div>
            Account already exists. Please 
            <Link to="/login" style={{ margin: '0 5px' }}>
              log in
            </Link>
            instead.
          </div>
        );
        return;
      }

      // New user, proceed with username prompt
      // The ProtectedRoute component will handle the username prompt
    } catch (err) {
      console.error('Error during Google sign-up:', err);
      setError(err.message);
    }
  };

  const handleUsernameChange = (e) => {
    // Only allow letters, numbers, and underscores
    const value = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
    setUsername(value);
  };

  return (
    <div className="signup">
      <h2>Sign Up</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={handleUsernameChange}
          pattern="[a-zA-Z0-9_]+"
          title="Username can only contain letters, numbers, and underscores"
          required
          minLength={3}
          maxLength={20}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <button type="submit" disabled={isChecking}>
          {isChecking ? 'Checking...' : 'Sign Up'}
        </button>
      </form>
      <button onClick={handleGoogleSignUp} className="google-btn">
        Sign up with Google
      </button>
      <div className="auth-links">
        <p>Already have an account? <Link to="/login">Log In</Link></p>
      </div>
    </div>
  );
};

export default SignUp; 