import { useState } from 'react';
import { db } from '../../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import './Auth.css';

const UsernamePrompt = ({ user, onComplete }) => {
  const { setNeedsUsername } = useAuth();
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsChecking(true);

    try {
      const usernameLower = username.toLowerCase();
      const usernameDoc = doc(db, 'usernames', usernameLower);
      const usernameSnapshot = await getDoc(usernameDoc);

      if (usernameSnapshot.exists()) {
        setError('Username is already taken');
        return;
      }

      await setDoc(usernameDoc, {
        uid: user.uid,
        username: username,
        usernameLower: usernameLower,
        email: user.email,
        provider: 'google',
        isGoogleAccount: true,
        createdAt: new Date().toISOString()
      });

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        username: username,
        usernameLower: usernameLower,
        createdAt: new Date().toISOString(),
        displayName: user.displayName || '',
        phoneNumber: '',
        address: '',
        provider: 'google',
        isGoogleAccount: true
      });

      setNeedsUsername(false);
      onComplete?.();
    } catch (err) {
      console.error('Error setting username:', err);
      setError(err.message);
    } finally {
      setIsChecking(false);
    }
  };

  const handleUsernameChange = (e) => {
    // Only allow letters, numbers, and underscores
    const value = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
    setUsername(value);
  };

  return (
    <div className="username-prompt">
      <h2>Choose a Username</h2>
      <p>Please choose a unique username for your account.</p>
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
        <button type="submit" disabled={isChecking}>
          {isChecking ? 'Checking...' : 'Set Username'}
        </button>
      </form>
    </div>
  );
};

export default UsernamePrompt; 