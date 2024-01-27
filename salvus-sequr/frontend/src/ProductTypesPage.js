import React, { useState, useEffect } from 'react';
import './ProductTypesPage.css';

const ProductTypesPage = () => {
  const [productTypes, setProductTypes] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
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
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch product types. Please try again later.');
    }
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const handleInputChange = (e, id, field) => {
    const updatedProductTypes = productTypes.map((productType) => {
      if (productType.id === id) {
        return {
          ...productType,
          [field]: e.target.value,
        };
      }
      return productType;
    });

    setProductTypes(updatedProductTypes);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/new-product-types', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productTypes),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to update product types. Status: ${response.status}. Message: ${errorMessage}`);
      }

      setEditMode(false);
      setError(null);
    } catch (error) {
      console.error('Error submitting changes:', error);
      setError('Failed to submit changes. Please try again later.');
    }
  };

  const renderTableRows = () => {
    return productTypes.map((productType) => (
      <tr key={productType.id}>
        <td>
          {editMode ? (
            <input
              type="text"
              value={productType.wallet_type}
              onChange={(e) => handleInputChange(e, productType.id, 'wallet_type')}
            />
          ) : (
            productType.wallet_type
          )}
        </td>
        <td>
          {editMode ? (
            <textarea
              value={productType.description}
              onChange={(e) => handleInputChange(e, productType.id, 'description')}
            ></textarea>
          ) : (
            productType.description
          )}
        </td>
      </tr>
    ));
  };

  return (
    <div className="product-types-container">
      <h2>Product Types</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="edit-mode-toggle">
        <button onClick={toggleEditMode}>
          {editMode ? 'Save Changes' : 'Edit Mode'}
        </button>
        {editMode && <button onClick={handleSubmit}>Submit Changes</button>}
      </div>

      <form className="product-types-form">
        <table>
          <thead>
            <tr>
              <th>Product Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>{renderTableRows()}</tbody>
        </table>
      </form>
    </div>
  );
};

export default ProductTypesPage;
