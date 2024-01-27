import React, { useState } from 'react';
import { useRoutes } from 'react-router-dom';
import DataEntryForm from './DataEntryForm';
import DataSearch from './DataSearch';
import './CombinedDataPage.css'; // Import CSS file for styling

const CombinedDataPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const routes = useRoutes([
    {
      path: '/',
      element: (
        <div className="combined-data-page">
          <header>
            <h1 className="company-name">Infinicue Solutions Data</h1>
            {/* Additional navigation components can be added here */}
          </header>
          <section className="data-entry-form">
            <DataEntryForm searchQuery={searchQuery} />
          </section>
          <section className="data-search">
            <DataSearch onSearch={handleSearch} />
          </section>
        </div>
      ),
    },
  ]);

  return <>{routes}</>;
};

export default CombinedDataPage;
