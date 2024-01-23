// LoginPage.js
import React, { useState } from 'react';
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
 
    if (username === '123' && password === '123') {
      setError('');
      onLogin({ username });
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div>
      <h3>Infinicue Solution Data</h3>
      <div className="login-page-container">
        <div className="login-container">
          <h2>Login</h2>
          <p>Enter your credentials to log in.</p>
          <div className="input-group">
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button onClick={handleLogin}>Login</button>
          {error && <p className="error-message">{error}</p>}
        </div>
        {/* <div className="bottom-text">
          <p>Don't have an account? <a href="#">Sign up</a></p>
          <p>Forgot your password? <a href="#">Reset password</a></p>
        </div> */}
      </div>
    </div>
  );
};

export default LoginPage;
