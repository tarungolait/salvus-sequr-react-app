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
      setSearchResult(response.data);
      setError(null);
    } catch (error) {
      console.error('Error searching data:', error);
      setSearchResult(null);
      setError('Error searching data. Please try again.');
    }
  };

  const renderSearchResults = () => {
    if (!searchResult || searchResult.length === 0) {
      return <div className="no-data-message">No matching data found for the entered query.</div>;
    }

    return (
      <>
        <div className="search-results shifted-container">
          <ul className="result-list">
            <li><span>BLE MAC ID:</span> {searchResult[0][8]}</li>
            <li><span>PRODUCT TYPE:</span> {searchResult[0][2]}</li>
            <li><span>WALLET COLOR:</span> {searchResult[0][3]}</li>
            <li><span>MANUFACTURING DATE:</span> {new Date(searchResult[0][4]).toDateString()}</li>
            <li><span>BATCH NUMBER:</span> {searchResult[0][5]}</li>
            <li><span>COUNTRY CODE:</span> {searchResult[0][6]}</li>
            <li><span>QR CODE:</span> {searchResult[0][7]}</li>
            <li><span>BARCODE NO:</span> {searchResult[0][1]}</li>
            <li><span>VERSION:</span> {searchResult[0][9]}</li>
          </ul>
        </div>

        <div className="data-preview-container">
          <div className="product-description-container">
            <strong>PRODUCT DESCRIPTION:</strong>
            <p>{searchResult[0][searchResult[0].length - 1] || 'N/A'}</p>
          </div>
          <div className="barcode-container">
            {searchResult[0][10] && <img src={searchResult[0][10]} alt="Barcode" className="barcode-image image-preview" />}
          </div>
          <div className="qrcode-container">
            {searchResult[0][11] && <img src={searchResult[0][11]} alt="QR Code" className="qrcode-image image-preview" />}
          </div>
        </div>
      </>
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

      {renderSearchResults()}
    </div>
  );
};

export default DataSearch;
