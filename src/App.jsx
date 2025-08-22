import React, { useState, useEffect, FormEvent } from 'react';
import SearchBar from './components/SearchBar';
import MovieCard from './components/MovieCard';

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
