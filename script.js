const API_URL = 'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=3fd2be6f0c70a2a598f084ddfb75487c&page=1'
const IMG_PATH = 'https://image.tmdb.org/t/p/w1280'
const SEARCH_API = 'https://api.themoviedb.org/3/search/movie?api_key=3fd2be6f0c70a2a598f084ddfb75487c&query="'

const main = document.getElementById('main')
const form = document.getElementById('form')
const search = document.getElementById('search')
const loader = document.getElementById('loader')

getMovies(API_URL)

function showLoader() {
  loader.style.display = 'flex';
}

function hideLoader() {
  loader.style.display = 'none';
}

async function getMovies(url) {
  showLoader();
  const res = await fetch(url);
  const data = await res.json();
  hideLoader();
  showMovies(data.results);
}

function showMovies(movies) {
    main.innerHTML = ''
  
    movies.forEach((movie) => {
      const movieEl = document.createElement('div')
      movieEl.classList.add('movie')
  
      movieEl.innerHTML = `
        <img src="${IMG_PATH + movie.poster_path}" alt="${movie.title}">
        <div class="movie-info">
          <h3>${movie.title}</h3>
          <span class="${getClassByRate(movie.vote_average)}">${movie.vote_average}</span>
        </div>
        <div class="overview">
          <h3>Overview</h3>
          ${movie.overview}
        </div>
      `
  
      // ici, movie est complet avec son id
      movieEl.addEventListener('click', () => openModal(movie));
      main.appendChild(movieEl)
    })
  }

function getClassByRate(vote) {
  if (vote >= 8) return 'green'
  if (vote >= 5) return 'orange'
  return 'red'
}

form.addEventListener('submit', (e) => {
  e.preventDefault()

  const searchTerm = search.value
  if (searchTerm && searchTerm !== '') {
    getMovies(SEARCH_API + searchTerm)
    search.value = ''
  } else {
    window.location.reload()
  }
  suggestionsBox.innerHTML = '';
})

// --- Modal logic ---
const modal = document.getElementById('movieModal');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalVote = document.getElementById('modal-vote');
const modalDate = document.getElementById('modal-date');
const modalOverview = document.getElementById('modal-overview');
const closeButton = document.querySelector('.close-button');

async function openModal(movie) {
  modalImg.src = IMG_PATH + movie.poster_path;
  modalTitle.textContent = movie.title;
  modalVote.textContent = movie.vote_average;
  modalDate.textContent = movie.release_date;
  modalOverview.textContent = movie.overview;

  const res = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=3fd2be6f0c70a2a598f084ddfb75487c`);
  const data = await res.json();
  const trailer = data.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');

  const trailerFrame = document.getElementById('modal-trailer');
  if (trailer) {
    trailerFrame.src = `https://www.youtube.com/embed/${trailer.key}`;
    trailerFrame.style.display = 'block';
  } else {
    trailerFrame.src = '';
    trailerFrame.style.display = 'none';
  }

  modal.classList.add('show');
}

closeButton.addEventListener('click', () => {
  document.getElementById('modal-trailer').src = '';
  modal.classList.remove('show');
});

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    document.getElementById('modal-trailer').src = '';
    modal.classList.remove('show');
  }
});


const suggestionsBox = document.getElementById('suggestions');

search.addEventListener('input', async () => {
  const query = search.value.trim();

  if (query.length < 2) {
    suggestionsBox.innerHTML = '';
    return;
  }

  const res = await fetch(SEARCH_API + encodeURIComponent(query));
  const data = await res.json();

  const suggestions = data.results.slice(0, 5); // top 5 suggestions
  suggestionsBox.innerHTML = suggestions
    .map(movie => `<div class="suggestion-item" data-title="${movie.title}">${movie.title}</div>`)
    .join('');
});

suggestionsBox.addEventListener('click', (e) => {
  if (e.target.classList.contains('suggestion-item')) {
    const title = e.target.getAttribute('data-title');
    search.value = title;
    suggestionsBox.innerHTML = '';
    getMovies(SEARCH_API + encodeURIComponent(title));
  }
});

// Fermer la boîte de suggestions si on clique ailleurs
document.addEventListener('click', (e) => {
    if (!suggestionsBox.contains(e.target) && e.target !== search) {
      suggestionsBox.innerHTML = '';
    }
  });
  
  document.getElementById('home-button').addEventListener('click', () => {
    getMovies(API_URL);
    search.value = '';
    suggestionsBox.innerHTML = '';
  });