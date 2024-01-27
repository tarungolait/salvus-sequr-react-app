import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-container">
      <h2>Welcome to Salvus SeQUr!</h2>
      <p className="home-paragraph">Salvus SeQUr - world's first Anti-Cyber Fraud solution.</p>
      <nav>
        <ul className="home-ul">
          <li className="home-li">
            <div className="data-entry-box"> 
              <Link to="/combined-data" className="home-link">Data Entry</Link> 
            </div>
          </li>
          <li className="home-li">
            <div className="product-types-box"> 
              <Link to="/product-types" className="home-link">Product Types</Link>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default HomePage;
