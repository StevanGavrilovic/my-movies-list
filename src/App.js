import { useEffect, useState } from "react";
import StarRating from "./StarRating";
import { NavigationMenu } from "./NavigationMenu";
import { UserProfile } from "./UserProfile";
import { NavBar } from "./NavBar";

const KEY = "d414d95";

function App() {
  const [searchQuery, setSearchQuery] = useState(""); // pretraga vrednosti API-a za filmove
  const [previewMoviesList, setPreviewMoviesList] = useState([]); // Filmovi koje dobijamo iz API-a
  const [selectedMovie, setSelectedMovie] = useState(null); // Objekat sa detaljima filma
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [homePage, setHomePage] = useState(true);

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

  function onSelectedMovie(movie) {
    setSelectedMovie(movie);
    setSearchQuery("");
  }

  useEffect(
    function () {
      const controller = new AbortController();
      async function getMovies() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `https://www.omdbapi.com/?apikey=${KEY}&s=${searchQuery}`,
            { signal: controller.signal }
          );
          if (!res.ok) throw new Error("Something is not ok with fetching");
          const data = await res.json();

          if (data.Response === "False") throw new Error("No results found.");

          setPreviewMoviesList(data.Search);
          setError("");
        } catch (err) {
          if (err.name !== "AbortError") setError(err.message);
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
      return function () {
        controller.abort();
      };
    },

    [searchQuery]
  );

  return (
    <div className="App">
      <NavBar>
        <>
          <UserProfile />
          <NavigationMenu onSetHomePage={setHomePage}></NavigationMenu>
          <NavigationImg />
        </>
      </NavBar>
      <MovieSearch searchQuery={searchQuery} onSearchQuery={setSearchQuery}>
        {!error && (
          <MovieResults>
            {previewMoviesList.map((movie) => (
              <MovieCard
                key={movie.imdbID}
                img={movie.Poster}
                imdbID={movie.imdbID}
                name={movie.Title}
                onSelectedMovie={onSelectedMovie}
                isLoading={isLoading}
                year={movie.Year}
              />
            ))}
          </MovieResults>
        )}
        {error && <ErrorMessage message={error} />}
      </MovieSearch>
      {homePage ? (
        <div className="main-container">
          <WatchList
            onSetIsLoading={setIsLoading}
            onSetError={setError}
            selectedMovie={selectedMovie}
            userAddedToWatchList={userAddedToWatchList}
            onAddToWatchList={addToWatchList}
            isLoading={isLoading}
            onSetHomePage={setHomePage}
            onSelectedMovie={setSelectedMovie}
          />
        </div>
      ) : (
        <HotMovies
          userAddedToWatchList={userAddedToWatchList}
          onSetPreviousPage={setHomePage}
          onSetHomePage={setHomePage}
          onSelectedMovie={setSelectedMovie}
        />
      )}
    </div>
  );
}

function HotMovies({ userAddedToWatchList, onSetHomePage, onSelectedMovie }) {
  const [imdbRating, setimdbRating] = useState("");
  const [isSorted, setIsSorted] = useState(false);

  const [...ratings] = userAddedToWatchList
    .map((item) => Math.floor(item.imdbRating))
    .filter((rating, index, self) => self.indexOf(rating) === index);

  let sortedRatings = userAddedToWatchList.filter((movie) =>
    imdbRating !== "All" ? movie.imdbRating >= imdbRating : movie
  );

  isSorted
    ? sortedRatings.sort((a, b) => a.imdbRating - b.imdbRating)
    : sortedRatings.sort((a, b) => b.imdbRating - a.imdbRating);

  return (
    <div className="hot-movies-container">
      <h2 className="my-list-title hot-movies-option">
        <i
          onClick={() => onSetHomePage((prev) => !prev)}
          className="fas fa-arrow-left back-arrow"
        ></i>
        Popular Movies
        <SortButton
          onClick={setIsSorted}
          sortStringValue={"Sort by IMDB rating"}
        />
        {userAddedToWatchList.length > 0 && (
          <SelectOption
            onChange={setimdbRating}
            moviesObject={ratings}
            optionName={"Rating:"}
            addPlus="+"
          />
        )}
      </h2>
      <div className="users-list-container">
        {sortedRatings.map((movie) => (
          <WatchListMovieCard
            img={movie.Poster}
            key={movie.imdbID}
            imdbRating={movie.imdbRating}
            name={movie.Title}
            imdbID={movie.imdbID}
            onSetHomePage={onSetHomePage}
            onSelectedMovie={onSelectedMovie}
          />
        ))}
      </div>
    </div>
  );
}
function WatchListMovieCard({
  img,
  name,
  userRating,
  imdbRating,
  onSetHomePage = false,
  imdbID,
  onSelectedMovie,
}) {
  function handleGetSelectedMovie() {
    const selectedMovieObject = {
      img,
      name,
      imdbID,
      user: "Stevan",
    };
    onSelectedMovie(selectedMovieObject);
    onSetHomePage(true);
  }

  const getFireBorder = (rating) => {
    switch (true) {
      case rating >= 8:
        return "red-fire";
      case rating >= 7:
        return "light-blue-fire";
      case rating >= 6:
        return "blue-fire";
      default:
        return "";
    }
  };

  const borderClass = imdbRating >= 6 ? getFireBorder(imdbRating) : "";

  return (
    <div
      className="user-movie-card-container"
      onClick={() => handleGetSelectedMovie()}
    >
      <h2 className="user-card-movie-name">{name}</h2>

      <div className={`user-movie-list-img-wrapper ${borderClass}`}>
        {imdbRating >= 6 && (
          <>
            <div className="animated-border-glow"></div>
            <div className="animated-border"></div>
          </>
        )}
        <img className="user-movie-list-img" src={img} alt={img} />
      </div>
      <div className="user-movie-details">
        <span>
          {imdbRating !== null ? (
            <div>{imdbRating}⭐️</div>
          ) : (
            <div>{userRating}🌟</div>
          )}
        </span>
      </div>
    </div>
  );
}
function SelectOption({ onChange, moviesObject, optionName, addPlus = "" }) {
  return (
    <div className="option-container">
      <h3>{optionName}</h3>
      <select
        className="select-genre"
        onChange={(e) => onChange(e.target.value)}
      >
        <option className="select-option" value={"All"}>
          All
        </option>
        {moviesObject.map((imdbRating, index) => (
          <>
            <option value={imdbRating} key={index}>
              {imdbRating}
              {addPlus}
            </option>
          </>
        ))}
      </select>
    </div>
  );
}

function NavigationImg() {
  return (
    <img className="popcorn-img" src="./popcorn.webp" alt="popcorn-img"></img>
  );
}

function ErrorMessage({ message }) {
  return <p className="error">{message}</p>;
}

function MovieResults({ children }) {
  return <div className="movie-results">{children}</div>;
}

function MovieCard({ img, imdbID, onSelectedMovie, name, isLoading, year }) {
  function selectedMovie() {
    const handleMovieSection = {
      img,
      imdbID,
      userRating: 0,
      user: "Stevan",
    };
    onSelectedMovie(handleMovieSection);
  }

  return (
    <div
      className="searched-movie-img-contrainer"
      onClick={() => selectedMovie()}
    >
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <img className="searched-movie-img" src={img} alt={img} />
          <div>
            <p>{name}</p>
            <p>{year}</p>
          </div>
        </>
      )}
    </div>
  );
}

function MovieSearch({ searchQuery, onSearchQuery, children }) {
  return (
    <div className="search-input-container">
      <div className="search-and-movies-container">
        <input
          className="search-input"
          type="text"
          placeholder="Search movie"
          value={searchQuery}
          onChange={(e) => onSearchQuery(e.target.value)}
        />
        {children}
      </div>
      <p className="search-input-text sign-in user-btn">
        Sign in <i class="far fa-user"></i>
      </p>
    </div>
  );
}

function WatchList({
  selectedMovie,
  onSelectedMovie,
  userAddedToWatchList,
  onAddToWatchList,
  onSetError,
  onSetIsLoading,
  isLoading,
  onSetHomePage,
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

  // const styledHeight = {
  //   height: "505px",
  //   maxHeight: "510px",
  // };

  const isAdded = userAddedToWatchList.some(
    (movie) => movie.imdbID === selectedMovie.imdbID
  );

  if (selectedMovie === null) {
    return (
      <p className="user-home">No movies in watchlist. Start adding some!</p>
    );
  }

  return (
    <div className="main-container">
      <div className="user-main-container">
        <MovieDetails
          selectedMovie={selectedMovie}
          onAddToWatchList={onAddToWatchList}
          userAddedToWatchList={userAddedToWatchList}
          onSetError={onSetError}
          onSetIsLoading={onSetIsLoading}
          isLoading={isLoading}
          isAdded={isAdded}
          onSelectedMovie={onSelectedMovie}
        />

        {isAdded ? (
          <div className="users-list-main-container">
            <h2 className="my-list-title">
              {selectedMovie?.user}'s watchlist
              <SortButton
                onClick={setIsSorted}
                sortStringValue={"Sort by user rating"}
              />
              {userAddedToWatchList.length > 0 && (
                <SelectOption
                  onChange={setSelectGenre}
                  moviesObject={genres}
                  optionName={"Genre:"}
                />
              )}
            </h2>
          </div>
        ) : null}
        <div className="users-list-container">
          {sortedGenres.map((movie) => (
            <WatchListMovieCard
              key={movie.imdbID}
              img={movie.Poster}
              genre={movie.Genre}
              name={movie.Title}
              imdbID={movie.imdbID}
              userRating={movie.userRating}
              imdbRating={null}
              onSetHomePage={onSetHomePage}
              onSelectedMovie={onSelectedMovie}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SortButton({ onClick, sortStringValue }) {
  return (
    <div className="option-container">
      <h3>{sortStringValue}</h3>

      <button
        className="user-btn sort-btn"
        onClick={() => onClick((prev) => !prev)}
      >
        Sort
      </button>
    </div>
  );
}

function MovieDetails({
  selectedMovie,
  onAddToWatchList,
  userAddedToWatchList,
  onSetError,
  isAdded,
}) {
  const [selectedMovieDetails, setSelectedMovieDetails] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [isMovieDetailsLoading, setIsMovieDetailsLoading] = useState(false);

  useEffect(() => {
    async function getMovieDetails() {
      try {
        setIsMovieDetailsLoading(true);
        onSetError("");
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=${KEY}&i=${selectedMovie.imdbID}`
        );
        if (!res.ok) throw new Error("Something is wrong with fetching movie");
        const data = await res.json();
        setSelectedMovieDetails(data);
      } catch (err) {
        onSetError(err.message);
      } finally {
        setIsMovieDetailsLoading(false);
      }
    }
    getMovieDetails();
  }, [selectedMovie, onSetError, setIsMovieDetailsLoading]);

  useEffect(() => {
    const existingMovie = userAddedToWatchList.find(
      (movie) => movie.imdbID === selectedMovie.imdbID
    );
    if (existingMovie) {
      setUserRating(existingMovie.userRating);
    } else {
      setUserRating(0);
    }
  }, [selectedMovie, userAddedToWatchList]);

  if (!selectedMovie)
    return (
      <div>
        <p className="user-home">No movies in watchlist. Start adding some!</p>
      </div>
    );

  const { Actors, Plot, Title, imdbRating, Genre, Year, Poster, Runtime } =
    selectedMovieDetails;

  return (
    <div className="user-home">
      <>
        {isMovieDetailsLoading ? (
          <Loader />
        ) : (
          <MoviePoster img={Poster} title={Title} />
        )}
        <div className="user-home-movie-description">
          {isMovieDetailsLoading ? (
            <Loader />
          ) : (
            <MovieInfo
              title={Title}
              actors={Actors}
              description={Plot}
              year={Year}
              runtime={Runtime}
              genre={Genre}
            />
          )}
          <MovieRatings
            imdb_rating={imdbRating}
            userRating={userRating}
            isAdded={isAdded}
            setUserRating={setUserRating}
            onAddToWatchList={onAddToWatchList}
            selectedMovieDetails={selectedMovieDetails}
          />
        </div>
      </>
    </div>
  );
}

function MoviePoster({ img, title }) {
  return (
    <div className="user-home-image-container">
      <img className="user-home-img" src={img} alt={title} />
    </div>
  );
}

function MovieInfo({ title, actors, description, year, runtime, genre }) {
  return (
    <div className="user-home-movie-info-container">
      <p>
        Movie name:
        <span className="user-home-movie-text"> {title}</span>
      </p>
      <p>
        Actors: <span className="user-home-movie-text">{actors}</span>
      </p>
      <p>
        Description: <span className="user-home-movie-text">{description}</span>
      </p>
      <p>
        Year: <span className="user-home-movie-text"> {year}</span>
      </p>
      <p>
        Runtime: <span className="user-home-movie-text">{runtime}</span>
      </p>
      <p>
        Genre: <span className="user-home-movie-text">{genre}</span>
      </p>
    </div>
  );
}

function MovieRatings({
  imdb_rating,
  userRating,
  isAdded,
  setUserRating,
  onAddToWatchList,
  selectedMovieDetails,
}) {
  return (
    <div className="user-home-movie-info-container">
      <p>
        IMDB-Rating: <span className="user-home-movie-text">{imdb_rating}</span>
        ⭐️
      </p>
      <p>
        Your rating: <span className="user-home-movie-text">{userRating}</span>
        🌟
      </p>
      {!isAdded ? (
        <UserRating
          userRating={userRating}
          setUserRating={setUserRating}
          onAddToWatchList={onAddToWatchList}
          selectedMovieDetails={selectedMovieDetails}
        />
      ) : (
        <div></div>
      )}
    </div>
  );
}

function UserRating({
  userRating,
  setUserRating,
  onAddToWatchList,
  selectedMovieDetails,
}) {
  return (
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
  );
}

function Loader() {
  return <div className="spinner"></div>;
}

export default App;
