// SearchBar component

import React, { useState } from 'react';

function  SearchBar({ onSearch, currentQuery }) {
    const [input, setInput] = useState(currentQuery);

    const handleSubmit = (e) => {
      e.preventDefault();
      onSearch(input);
    };

    return (
      <form onSubmit={handleSubmit} className="flex justify-center my-6 space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search for a movie..."
          className="p-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-md"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Search
        </button>
      </form>
    );
  };

  export default SearchBar;
