// HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-container1"> 
      <h2>Welcome to Salvus SeQUr !</h2>
      <p className="home-paragraph1">Salvus SeQUr - world's first Anti-Cyber Fraud solution.</p>
      <nav>
        <ul className="home-ul1">
          <li className="home-li1">
            <div className="data-entry-box1"> 
              <Link to="/combined-data" className="data-entry-link1">Data Entry</Link> 
            </div>
          </li>
          <li className="home-li1">
            <div className="product-types-box"> 
              <Link to="/product-types" className="product-types-link">Product Types</Link>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default HomePage;
