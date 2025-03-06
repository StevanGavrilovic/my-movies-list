import { useEffect, useState } from "react";
import StarRating from "./StarRating";
import { NavigationMenu } from "./NavigationMenu";
import { UserProfile } from "./UserProfile";
import { NavBar } from "./NavBar";

const KEY = "d414d95";

function App() {
  const [togglePage, setTogglePage] = useState(false); // Odredjujemo koju stranicu prikazujemo
  const [searchQuery, setSearchQuery] = useState(""); // pretraga vrednosti API-a za filmove
  const [previewMoviesList, setPreviewMoviesList] = useState([]); // Filmovi koje dobijamo iz API-a
  const [selectedMovie, setSelectedMovie] = useState(null); // Objekat sa detaljima filma
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [userAddedToWatchList, setUserAddedToWatchList] = useState([]);

  function addToWatchList(moviesObject) {
    setUserAddedToWatchList((prev) =>
      prev.some((movie) => movie.imdbID === moviesObject.imdbID)
        ? prev.map((movie) =>
            movie.imdbID === moviesObject.imdbID
              ? { ...movie, userRating: moviesObject.userRating }
              : movie
          )
        : [...prev, moviesObject]
    );
  }

  function selectMovie(movie) {
    setSelectedMovie(movie);
  }

  useEffect(
    function () {
      async function getMovies() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${searchQuery}`
          );
          if (!res.ok) throw new Error("Something is not ok with fetching");
          const data = await res.json();

          if (data.Response === "False") throw new Error("Movie not found");

          setPreviewMoviesList(data.Search);
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }

      if (searchQuery.length > 3) {
        setError("");
        getMovies();
      } else {
        setPreviewMoviesList([]);
      }
    },

    [searchQuery]
  );

  return (
    <div className="App">
      <NavBar>
        <>
          <UserProfile />
          <NavigationMenu onToggleView={setTogglePage} />
        </>
      </NavBar>

      <div className="main-container">
        <MovieSearch searchQuery={searchQuery} onSearchQuery={setSearchQuery} />

        {togglePage && selectedMovie !== null ? (
          <WatchList
            onSetIsLoading={setIsLoading}
            onSetError={setError}
            selectedMovie={selectedMovie}
            userAddedToWatchList={userAddedToWatchList}
            onAddToWatchList={addToWatchList}
            isLoading={isLoading}
          />
        ) : (
          <>
            {isLoading && <Loader />}
            {!error && !isLoading && (
              <MovieResults
                previewMoviesList={previewMoviesList}
                onToggleView={setTogglePage}
                onSelectedMovie={selectMovie}
                searchQuery={searchQuery}
                isLoading={isLoading}
              />
            )}
            {error && <ErrorMessage message={error} />}
          </>
        )}
      </div>
    </div>
  );
}

function ErrorMessage({ message }) {
  return <p className="error">{message}</p>;
}

function MovieResults({
  onToggleView,
  onSelectedMovie,
  previewMoviesList,
  isLoading,
}) {
  const styleObject = {
    gridTemplateRows: "repeat(auto-fill, 280px)",
  };

  return (
    <>
      {!previewMoviesList || previewMoviesList.length === 0 ? (
        <p style={{ fontSize: "25px", textAlign: "center", marginTop: "20%" }}>
          Search movies and add some cool ones!
        </p>
      ) : (
        <div className="users-list-container" style={styleObject}>
          {previewMoviesList.map((movie) => (
            <MovieCard
              key={movie.imdbID}
              img={movie.Poster}
              imdbID={movie.imdbID}
              onToggleView={onToggleView}
              onSelectedMovie={onSelectedMovie}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </>
  );
}

function MovieCard({ img, imdbID, onToggleView, onSelectedMovie, isLoading }) {
  const spinnerStyles = {
    width: "50px",
    height: "50px",
    borderTopColor: "#3498db",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  };

  const [isImgLoading, setIsImgLoading] = useState(true);
  function selectedMovie() {
    const handleMovieSection = {
      img,
      imdbID,
      userRating: 0,
      user: "Stevan",
    };

    onSelectedMovie(handleMovieSection);
    onToggleView(true);
  }

  return (
    <>
      {isLoading && <Loader />}

      <img
        className="user-movie-list-img"
        src={img}
        alt="Movie Poster"
        onLoad={() => setIsImgLoading(false)}
        onError={() => setIsImgLoading(false)}
        style={isImgLoading ? spinnerStyles : { display: "block" }}
        onClick={selectedMovie}
      />
    </>
  );
}

function MovieSearch({ searchQuery, onSearchQuery }) {
  return (
    <div className="search-input-container">
      <input
        className="search-input"
        type="text"
        placeholder="Search movie"
        value={searchQuery}
        onChange={(e) => onSearchQuery(e.target.value)}
      />
      <p className="search-input-text">Sign in</p>
    </div>
  );
}

function WatchList({
  selectedMovie,
  userAddedToWatchList,
  onAddToWatchList,
  onSetError,
  onSetIsLoading,
  isLoading,
}) {
  const [selectGenre, setSelectGenre] = useState("");
  const [isSorted, setIsSorted] = useState(false);

  let genres = userAddedToWatchList
    .flatMap((movie) => movie.Genre.split(", "))
    .filter((genre, index, self) => self.indexOf(genre) === index);

  let sortedGenres = userAddedToWatchList.filter((movie) =>
    selectGenre !== "All" ? movie.Genre.includes(selectGenre) : movie
  );

  isSorted
    ? sortedGenres.sort((a, b) => a.userRating - b.userRating)
    : sortedGenres.sort((a, b) => b.userRating - a.userRating);

  const styledHeight = {
    height: "500px",
  };

  return (
    <div className="main-container">
      <div className="user-main-container">
        {selectedMovie === null ? (
          <p className="user-home">
            No movies in watchlist. Start adding some!
          </p>
        ) : (
          <MovieDetails
            selectedMovie={selectedMovie}
            onAddToWatchList={onAddToWatchList}
            userAddedToWatchList={userAddedToWatchList}
            onSetError={onSetError}
            onSetIsLoading={onSetIsLoading}
            isLoading={isLoading}
          />
        )}

        <div className="users-list-main-container">
          <h2 className="my-list-title">
            {selectedMovie.user}'s list of added movies
            <button
              className="btn"
              onClick={() => setIsSorted((prev) => !prev)}
            >
              Sort
            </button>
            {userAddedToWatchList.length === 0 ? (
              <div key={21}></div>
            ) : (
              <div>
                <div>
                  <h3>Movie genre:</h3>
                  <select
                    className="select-genre"
                    onChange={(e) => setSelectGenre(e.target.value)}
                  >
                    <option className="select-option" value={"All"}>
                      All
                    </option>
                    {genres.map((movieGenre, index) => (
                      <>
                        <option value={movieGenre} key={index}>
                          {movieGenre}
                        </option>
                      </>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </h2>
          <div className="users-list-container" style={styledHeight}>
            {sortedGenres.map((movie) => (
              <WatchListMovieCard
                key={movie.imdbID}
                img={movie.Poster}
                genre={movie.Genre}
                name={movie.Title}
                userRating={movie.userRating}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function WatchListMovieCard({ img, name, userRating }) {
  return (
    <div className="user-movie-card-container">
      <h2 className="user-card-movie-name">{name}</h2>
      <img className="user-movie-list-img" src={img} alt={img} />
      <div className="user-movie-details">
        <span>🌟{userRating}</span>
      </div>
    </div>
  );
}

function MovieDetails({
  selectedMovie,
  onAddToWatchList,
  userAddedToWatchList,
  onSetError,
  onSetIsLoading,
  isLoading,
}) {
  const [selectedMovieDetails, setSlectedMovieDetails] = useState("");
  const [userRating, setUserRating] = useState(0);

  useEffect(
    function () {
      async function getMovieDetails() {
        try {
          onSetIsLoading(true);
          onSetError("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedMovie.imdbID}`
          );

          if (!res.ok)
            throw new Error("Something is wrong with fetching movie");

          const data = await res.json();
          setSlectedMovieDetails(data);
        } catch (err) {
          onSetError(err.message);
        } finally {
          onSetIsLoading(false);
        }
      }
      getMovieDetails();
    },
    [selectedMovie, onSetError, onSetIsLoading]
  );

  useEffect(
    function () {
      const existingMovie = userAddedToWatchList.find(
        (movie) => movie.imdbID === selectedMovie.imdbID
      );

      if (existingMovie) setUserRating(existingMovie.userRating);
    },
    [selectedMovie, userAddedToWatchList]
  );

  const {
    Actors: actors,
    Plot: description,
    Title: title,
    imdbRating: imdb_rating,
    Genre: genre,
    Year: year,
    Poster: img,
    Runtime: runtime,
  } = selectedMovieDetails;

  if (!selectedMovie) {
    return (
      <div className="user-home">
        <p>No movies in watchlist. Start adding some!</p>
      </div>
    );
  }

  const isAdded = userAddedToWatchList.some(
    (movie) => movie.imdbID === selectedMovie.imdbID
  );

  return (
    <div className="user-home">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <div className="user-home-image-container">
            <img className="user-home-img" src={img} alt={title} />
          </div>

          <div className="user-home-movie-description">
            <div className="user-home-movie-info-container">
              <h2>
                <span>Movie name: </span>{" "}
                <span className="user-home-movie-title"> {title}</span>
              </h2>
              <p className="user-home-movie-text">
                Actors: <span>{actors}</span>
              </p>
              <p className="user-home-movie-text">
                Description: <span>{description}</span>
              </p>
              <p className="user-home-movie-text">
                Year: <span>{year}</span>
              </p>
              <p className="user-home-movie-text">
                Runtime: <span>{runtime}</span>
              </p>
              <p className="user-home-movie-text">
                Genre: <span>{genre}</span>
              </p>
            </div>

            <div className="user-home-movie-info-container">
              <p className="user-home-movie-text">
                IMDB-Rating: <span>{imdb_rating}</span> ⭐️
              </p>
              <p className="user-home-movie-text">
                {selectedMovie.user}'s rating: <span>{userRating}</span> 🌟
              </p>
              {!isAdded && (
                <>
                  <StarRating size={20} onSetRating={setUserRating} />
                  {userRating > 0 ? (
                    <button
                      className="user-btn"
                      onClick={() =>
                        onAddToWatchList({
                          ...selectedMovieDetails,
                          userRating,
                        })
                      }
                    >
                      Add movie to list
                    </button>
                  ) : (
                    ""
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Loader() {
  return <div className="spinner"></div>;
}

export default App;
