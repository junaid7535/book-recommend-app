// App.js
import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch books from Google Books API
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        // Using Google Books API with multiple search terms to get diverse books
        const responses = await Promise.all([
          fetch('https://www.googleapis.com/books/v1/volumes?q=fiction&maxResults=20'),
          fetch('https://www.googleapis.com/books/v1/volumes?q=science&maxResults=20'),
          fetch('https://www.googleapis.com/books/v1/volumes?q=programming&maxResults=20')
        ]);

        const data = await Promise.all(responses.map(response => response.json()));
        
        // Combine and process book data
        const allBooks = data.flatMap(categoryData => 
          categoryData.items ? categoryData.items.map(item => ({
            id: item.id,
            title: item.volumeInfo.title,
            author: item.volumeInfo.authors ? item.volumeInfo.authors[0] : 'Unknown Author',
            genre: item.volumeInfo.categories ? item.volumeInfo.categories[0] : 'General',
            rating: item.volumeInfo.averageRating || Math.floor(Math.random() * 3) + 3,
            description: item.volumeInfo.description || 'No description available',
            image: item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : 'https://via.placeholder.com/150x200?text=No+Image',
            publishedDate: item.volumeInfo.publishedDate || 'Unknown'
          })) : []
        );

        // Remove duplicates and limit to 30 books
        const uniqueBooks = allBooks.filter((book, index, self) => 
          index === self.findIndex(b => b.id === book.id)
        ).slice(0, 30);

        setBooks(uniqueBooks);
        setFilteredBooks(uniqueBooks);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch books. Please try again later.');
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Filter books based on search term and genre
  useEffect(() => {
    let results = books;

    if (searchTerm) {
      results = results.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.genre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedGenre !== 'All') {
      results = results.filter(book =>
        book.genre.toLowerCase().includes(selectedGenre.toLowerCase())
      );
    }

    setFilteredBooks(results);
  }, [searchTerm, selectedGenre, books]);

  // Get unique genres for filter dropdown
  const genres = ['All', ...new Set(books.map(book => book.genre).filter(genre => genre))];

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
  };

  const renderStars = (rating) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading books...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <h1>📚 Book Recommendation App</h1>
        <p className="subtitle">Discover your next favorite read</p>
      </header>

      <div className="search-filter-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by title, author, or genre..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>

        <div className="filter-box">
          <select
            value={selectedGenre}
            onChange={handleGenreChange}
            className="genre-select"
          >
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="books-count">
        {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'} found
      </div>

      <div className="books-grid">
        {filteredBooks.length > 0 ? (
          filteredBooks.map(book => (
            <div key={book.id} className="book-card">
              <div className="book-image">
                <img src={book.image} alt={book.title} />
              </div>
              <div className="book-info">
                <h3 className="book-title">{book.title}</h3>
                <p className="book-author">by {book.author}</p>
                <p className="book-genre">{book.genre}</p>
                <div className="book-rating">
                  <span className="stars">{renderStars(book.rating)}</span>
                  <span className="rating-value">({book.rating})</span>
                </div>
                <p className="book-description">
                  {book.description.length > 150 
                    ? `${book.description.substring(0, 150)}...` 
                    : book.description
                  }
                </p>
                <div className="book-meta">
                  Published: {book.publishedDate}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-books">
            <p>No books found matching your criteria.</p>
            <p>Try adjusting your search or filter.</p>
          </div>
        )}
      </div>

      <footer>
        <p>Built with React • Deployed on Render</p>
      </footer>
    </div>
  );
};

export default App;