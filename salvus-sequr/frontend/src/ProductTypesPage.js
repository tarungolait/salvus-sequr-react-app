import React, { useState, useEffect } from 'react';
import './ProductTypesPage.css';

const ProductTypesPage = () => {
  const [productTypes, setProductTypes] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data from the backend when the component mounts
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/new-product-types');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch product types. Status: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Invalid data structure received. Expected an array.');
      }

      setProductTypes(data);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error fetching data:', error);
      setProductTypes([]); // Clear productTypes in case of an error
      setError('Failed to fetch product types. Please try again later.');
    }
  };

  const renderTableRows = () => {
    return productTypes.map((productType) => (
      <tr key={productType.id}>
        <td>
          <input
            type="text"
            name={`productType${productType.id}`}
            value={productType.wallet_type}
            readOnly
          />
        </td>
        <td>
          <textarea
            name={`description${productType.id}`}
            value={productType.description}
            readOnly
          ></textarea>
        </td>
      </tr>
    ));
  };

  return (
    <div className="product-types-container">
      <h2>Product Types</h2>

      {error && <div className="error-message">{error}</div>}

      <form className="product-types-form">
        <table>
          <thead>
            <tr>
              <th>Product Type</th>
              <th>Description</th>
              {/* Add more table headers if needed */}
            </tr>
          </thead>
          <tbody>{renderTableRows()}</tbody>
        </table>
      </form>
    </div>
  );
};

export default ProductTypesPage;
