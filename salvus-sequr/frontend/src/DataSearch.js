// DataSearch.js

import React, { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import './DataSearch.css';

const DataSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/search-data/${searchQuery}`);
      console.log(response.data);  
      setSearchResult(response.data);
      setError(null);
    } catch (error) {
      console.error('Error searching data:', error);
      setSearchResult(null);
      setError('Error searching data. Please try again.');
    }
  };

  const renderSearchResult = () => {
    if (!searchResult || searchResult.length === 0) return null;
  
    const data = searchResult[0];
    const productDescriptionIndex = searchResult[0].length - 1;
  
    return (
      <div className="search-results shifted-container">
       <ul className="result-list">
    <li><span>BLE MAC ID:</span> {data[8]}</li>
    <li><span>PRODUCT TYPE:</span> {data[2]}</li>
    <li><span>WALLET COLOR:</span> {data[3]}</li>
    <li><span>MANUFACTURING DATE:</span> {new Date(data[4]).toDateString()}</li>
    <li><span>BATCH NUMBER:</span> {data[5]}</li>
    <li><span>COUNTRY CODE:</span> {data[6]}</li>
    <li><span>QR CODE:</span> {data[7]}</li>
    <li><span>BARCODE NO:</span> {data[1]}</li>
    <li><span>VERSION:</span> {data[9]}</li>
  </ul>
  
        <div className="product-description-container">
          <strong>PRODUCT DESCRIPTION:</strong>
          <p>{data[productDescriptionIndex] || 'N/A'}</p>
        </div>
  
        <div className="barcode-container">
          {data[10] && <img src={data[10]} alt="Barcode" className="barcode-image image-preview" />}
        </div>
  
        <div className="qrcode-container">
          {data[11] && <img src={data[11]} alt="QR Code" className="qrcode-image image-preview" />}
        </div>
      </div>
    );
  };
  
  return (
    <div className="data-search-container">
      <div className="search-section">
        <label className="search-label">
          <input
            type="text"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </label>
        <button className="search-button" onClick={handleSearch}>
          <FontAwesomeIcon icon={faSearch} />
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {renderSearchResult()}
    </div>
  );
};

export default DataSearch;
