import { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './Profile.css';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

const UserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    displayName: '',
    phoneNumber: '',
    address: '',
    username: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          // Initialize with default values if document doesn't exist
          setProfile({
            displayName: user.displayName || '',
            phoneNumber: '',
            address: '',
            username: ''
          });
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Error fetching profile: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to update your profile');
      return;
    }

    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, {
        ...profile,
        updatedAt: new Date().toISOString()
      });
      setMessage('Profile updated successfully!');
      setError(null);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Error updating profile: ' + err.message);
      setMessage(null);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in to view your profile</div>;
  if (error) return (
    <div className="profile">
      <h2>Error</h2>
      <p className="error">{error}</p>
      <button onClick={() => window.location.reload()}>Try Again</button>
    </div>
  );

  return (
    <div className="profile">
      <div className="profile-header">
        <Link to="/home" className="back-link">← Back to Home</Link>
        <h2>User Profile</h2>
      </div>
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}
      <div className="username-display">
        <label>Username</label>
        <input
          type="text"
          value={profile.username}
          disabled
          className="readonly-input"
        />
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Display Name"
          value={profile.displayName}
          onChange={(e) => setProfile({...profile, displayName: e.target.value})}
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={profile.phoneNumber}
          onChange={(e) => setProfile({...profile, phoneNumber: e.target.value})}
        />
        <textarea
          placeholder="Address"
          value={profile.address}
          onChange={(e) => setProfile({...profile, address: e.target.value})}
        />
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default UserProfile; 