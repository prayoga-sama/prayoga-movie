import React, { useState, useEffect, FormEvent } from 'react';

// Main App Component
function App() {
  // State variables for managing application data
  const [movies, setMovies] = useState([]); // Stores search results
  const [favorites, setFavorites] = useState([]); // Stores user's favorite movies
  const [loading, setLoading] = useState(false); // Indicates if an API call is in progress
  const [error, setError] = useState(null); // Stores any error messages
  const [query, setQuery] = useState(''); // Stores the current search query
  const [viewFavorites, setViewFavorites] = useState(false); // Toggles between search results and favorites view

  // OMDB API Key - Replace 'YOUR_OMDB_API_KEY' with your actual API key
  // You can get one from: https://www.omdbapi.com/
  const OMDB_API_KEY = '29757f48'; // Using the API key from your previous immersive

  // useEffect to load favorites from localStorage when the component mounts
  useEffect(() => {
    try {
      const storedFavorites = JSON.parse(localStorage.getItem('movieFavorites') || '[]');
      setFavorites(storedFavorites);
    } catch (e) {
      console.error("Failed to parse favorites from localStorage:", e);
      setFavorites([]); // Reset favorites if parsing fails
    }
  }, []); // Empty dependency array means this runs only once on mount

  // useEffect to save favorites to localStorage whenever the 'favorites' state changes
  useEffect(() => {
    try {
      localStorage.setItem('movieFavorites', JSON.stringify(favorites));
    } catch (e) {
      console.error("Failed to save favorites to localStorage:", e);
    }
  }, [favorites]); // Runs whenever the 'favorites' array is updated

  // Function to handle movie search
  const handleSearch = async (searchQuery) => {
    // Clear previous search results and error, set loading to true
    setMovies([]);
    setError(null);
    setLoading(true);
    setQuery(searchQuery); // Update the query state
    setViewFavorites(false); // Switch to search results view

    if (!searchQuery.trim()) {
      setError('Please enter a movie title to search.');
      setLoading(false);
      return;
    }

    try {
      // Construct the API URL
      const apiUrl = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${searchQuery}`;
      const response = await fetch(apiUrl);

      // Check for network errors
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Handle OMDB API response (success or failure)
      if (data.Response === 'True') {
        setMovies(data.Search);
      } else {
        setError(data.Error || 'No movies found.');
        setMovies([]); // Ensure movies array is empty on error
      }
    } catch (err) {
      // Catch any errors during the fetch operation
      setError('Failed to fetch movies. Please check your network connection or API key.');
      console.error("Search error:", err);
    } finally {
      setLoading(false); // Always set loading to false after the operation
    }
  };

  // Function to add or remove a movie from favorites
  const toggleFavorite = (movie) => {
    // Check if the movie is already in favorites
    const isFavorite = favorites.some((fav) => fav.imdbID === movie.imdbID);

    if (isFavorite) {
      // If already a favorite, remove it
      setFavorites(favorites.filter((fav) => fav.imdbID !== movie.imdbID));
    } else {
      // If not a favorite, add it
      setFavorites([...favorites, movie]);
    }
  };

  // Component for displaying a single movie card
  // This component now includes Gemini API integration for plot summaries and reviews
  const MovieCard = ({ movie, isFavorite, onToggleFavorite }) => {
    const [showLlmModal, setShowLlmModal] = useState(false);
    const [llmModalTitle, setLlmModalTitle] = useState('');
    const [llmModalContent, setLlmModalContent] = useState('');
    const [llmLoading, setLlmLoading] = useState(false);
    const [llmError, setLlmError] = useState(null);

    return (
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden relative transform transition-transform duration-300 hover:scale-105">
        {/* Movie poster. Using a placeholder if poster is N/A or empty */}
        <img
          src={movie.Poster !== 'N/A' ? movie.Poster : `https://placehold.co/300x450/333/eee?text=${movie.Title.replace(/\s/g, '+')}`}
          alt={`${movie.Title} poster`}
          className="w-full h-72 object-cover" // Fixed height for consistency
          onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/300x450/333/eee?text=${movie.Title.replace(/\s/g, '+')}`; }}
        />
        <div className="p-4">
          <h3 className="text-xl font-semibold text-white truncate mb-2">{movie.Title}</h3>
          <p className="text-gray-400 mb-4">{movie.Year}</p>

          {/* Favorite button */}
          <button
            onClick={() => onToggleFavorite(movie)}
            className="absolute top-2 right-2 p-2 bg-gray-900 bg-opacity-75 rounded-full text-red-500 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="m11.645 20.917-7.393-7.393a4.72 4.72 0 0 1 0-6.68 4.72 4.72 0 0 1 6.68 0L12 6.137l1.079-1.079a4.72 4.72 0 0 1 6.68 0 4.72 4.72 0 0 1 0 6.68l-7.393 7.393a.75.75 0 0 1-1.06 0Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
            )}
          </button>
        </div>

        {/* LLM Content Modal */}
        {showLlmModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
              <h2 className="text-2xl font-bold text-white mb-4">{llmModalTitle}</h2>
              {llmLoading && <p className="text-blue-300">Generating content...</p>}
              {llmError && <p className="text-red-500">{llmError}</p>}
              {!llmLoading && llmModalContent && (
                <p className="text-gray-300 whitespace-pre-wrap">{llmModalContent}</p>
              )}
              <button
                onClick={() => setShowLlmModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white focus:outline-none"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // SearchBar component
  const SearchBar = ({ onSearch, currentQuery }) => {
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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 font-sans antialiased">
      {/* Header section */}
      <header className="text-center mb-8">
        <h1 className="text-5xl font-extrabold text-blue-400 tracking-tight mb-4">Movie Explorer</h1>
        <SearchBar onSearch={handleSearch} currentQuery={query} />
        {/* Navigation buttons */}
        <div className="flex justify-center space-x-4 mt-4">
          <button
            onClick={() => setViewFavorites(false)}
            className={`px-6 py-3 rounded-lg font-medium transition duration-300 ${!viewFavorites ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-700 hover:bg-gray-600'} text-white focus:outline-none focus:ring-2 focus:ring-purple-500`}
          >
            Search Results
          </button>
          <button
            onClick={() => setViewFavorites(true)}
            className={`px-6 py-3 rounded-lg font-medium transition duration-300 ${viewFavorites ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-700 hover:bg-gray-600'} text-white focus:outline-none focus:ring-2 focus:ring-purple-500`}
          >
            My Favorites
          </button>
        </div>
      </header>

      {/* Main content area */}
      <main className="container mx-auto p-4">
        {loading && <p className="text-center text-xl text-blue-300">Loading movies...</p>}
        {error && <p className="text-center text-xl text-red-500">{error}</p>}

        {/* Conditional rendering for Search Results or Favorites */}
        {!loading && !error && (
          <>
            {viewFavorites ? (
              // Display Favorites
              <section className="mt-8">
                <h2 className="text-3xl font-bold text-center text-purple-400 mb-6">Your Favorite Movies</h2>
                {favorites.length === 0 ? (
                  <p className="text-center text-gray-400 text-lg">You haven't added any favorites yet. Start searching!</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {favorites.map((movie) => (
                      <MovieCard
                        key={movie.imdbID}
                        movie={movie}
                        isFavorite={true} // Always true when displayed in favorites list
                        onToggleFavorite={toggleFavorite}
                      />
                    ))}
                  </div>
                )}
              </section>
            ) : (
              // Display Search Results
              <section className="mt-8">
                <h2 className="text-3xl font-bold text-center text-blue-400 mb-6">
                  {query ? `Search Results for "${query}"` : 'Start by searching for movies!'}
                </h2>
                {movies.length === 0 && query && !loading && !error ? (
                  <p className="text-center text-gray-400 text-lg">No movies found for your search. Try a different title!</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {movies.map((movie) => (
                      <MovieCard
                        key={movie.imdbID}
                        movie={movie}
                        isFavorite={favorites.some((fav) => fav.imdbID === movie.imdbID)}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
