 import React, { useState } from 'react';
 // Component for displaying a single movie card
  // This component now includes Gemini API integration for plot summaries and reviews
  
  function  MovieCard({ movie, isFavorite, onToggleFavorite }) {
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

  export default MovieCard;
