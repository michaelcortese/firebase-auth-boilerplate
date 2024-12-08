import { useState } from 'react';
import { auth } from '../../firebase/config';
import { sendPasswordResetEmail } from 'firebase/auth';
import './Auth.css';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Check your inbox.');
      setEmail('');
      setError(null);
    } catch (err) {
      setError(err.message);
      setMessage(null);
    }
  };

  return (
    <div className="reset-password">
      <h2>Reset Password</h2>
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Link</button>
      </form>
    </div>
  );
};

export default ResetPassword; 