import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import CombinedDataPage from './CombinedDataPage';
import HomePage from './HomePage';
import DataEntryForm from './DataEntryForm';
import ProductTypesPage from './ProductTypesPage';
import LoginPage from './LoginPage';
import './App.css';

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = () => {
    setLoggedIn(true);
  };

  const handleLogout = () => {
    setLoggedIn(false);
  };

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route
            path="/"
            element={loggedIn ? <HomePageWithHeader onLogout={handleLogout} /> : <LoginPage onLogin={handleLogin} />}
          />
          {/* Update the parent <Route> path to include a trailing "*" */}
          <Route path="/combined-data/*" element={loggedIn ? <CombinedDataPage /> : <Navigate to="/" />} />
          <Route path="/data-entry" element={loggedIn ? <DataEntryForm /> : <Navigate to="/" />} />
          <Route path="/product-types" element={loggedIn ? <ProductTypesPage /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

const HomePageWithHeader = ({ onLogout }) => {
  return (
    <div>
      <header>
        <div className="header-content">
          <h1>Infinicue Solutions Data</h1>
          <nav>
            <button onClick={onLogout}>Logout</button>
          </nav>
        </div>
      </header>
      <main>
        <HomePage />
      </main>
    </div>
  );
};

export default App;
