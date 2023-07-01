
const searchButton = document.querySelector('#searchButton');
const searchResultsComponent = document.querySelector('#searchResultsComponent');
const searchResultsTitle = document.querySelector('#searchResultsTitle');
const searchResultsList = document.querySelector('#searchResultsList');
const loadingSpinner = document.querySelector('#loadingSpinner');
const searchError = document.querySelector('#searchError');
const getWhatsOnToday = document.querySelector('#getWhatsOnToday');
const whatsOnTodayComponent = document.querySelector('#whatsOnTodayComponent');
const whatsOnTodayTitle = document.querySelector('#whatsOnTodayTitle');
const whatsOnTodayList = document.querySelector('#whatsOnTodayList');
const randomTVShowsList = document.querySelector('#randomTVShowsList');
const TVShowsDetailsModal = new bootstrap.Modal(document.querySelector('#TVShowsDetailsModal'));
const TVShowsDetailsModalContent = document.querySelector('#TVShowsDetailsModalContent');

searchButton.onclick = async () => {
    const searchType = document.querySelector('#searchType').value;
    const searchInput = document.querySelector('#searchInput').value
    const sanitizedSearchInput = searchInput.replace(/[^a-zA-Z0-9 ]/g, ''); // sanitize the input
    
    if (sanitizedSearchInput === '') { // if the input is empty
        searchError.textContent = 'Please enter a valid search term';
        return;
    }

    showLoadingSpinner(); // show the loading spinner

    let response;
    let searchResults;

    if(searchType == 'tv') {
        response = await fetch(`https://api.tvmaze.com/search/shows?q=${sanitizedSearchInput}`);
    } else if (searchType == 'movie') {
        response = await fetch(`https://www.omdbapi.com/?s=${sanitizedSearchInput}&type=movie&apikey=5c316190`);
    }
    
    if (!response.ok) {
        searchError.textContent = 'Something went wrong. Please try again later.';
        hideLoadingSpinner(); // hide the loading spinner
        return;
    }
    searchResults = await response.json();
    if(searchResults.length === 0) {
        searchError.textContent = 'No results found. Please try again.';
        hideLoadingSpinner(); // hide the loading spinner
        return;
    }
    searchResultsComponent.classList.remove('d-none');
    searchResultsComponent.scrollIntoView({behavior: 'smooth'});
    searchResultsTitle.textContent = `Search Results for "${sanitizedSearchInput}"`;
    searchResultsList.innerHTML = '';
    hideLoadingSpinner(); // hide the loading spinner

    if(searchType == 'tv') {
        printTVSearchResults(searchResults);
    } else if (searchType == 'movie') {
        printMovieSearchResults(searchResults);
    }
}

const printTVSearchResults = (searchResults) => {
    for (let tvShow in searchResults) {
        if(searchResults[tvShow].show.image === null) {
            searchResults[tvShow].show.image = 'https://via.placeholder.com/400x600?text=No+Poster+Available';
        }
        searchResultsList.innerHTML += `
        <div class="card mb-3 col-lg-4 col-md-12 border-0">
            <div class="row g-0">
                <div class="col-md-6">
                    <img src="${searchResults[tvShow].show.image.medium}" alt="${searchResults[tvShow].show.name}" width="200px">
                </div>
                <div class="col-md-6">
                    <div class="card-body">
                    <h5 class="card-title">${searchResults[tvShow].show.name}</h5>
                    <p class="card-text fs-5">${searchResults[tvShow].show.summary.split(' ').slice(0, 15).join(' ')}...</p>
                    <p class="small">Rating: ${searchResults[tvShow].show.rating.average} / 10</p>
                    <a class="small link-dark link-underline-opacity-0" onclick="showTVShowsDetails(${searchResults[tvShow].show.id})">
                    <i class="fas fa-info-circle mx-1"></i>Find out more</a>
                </div>
            </div>
        </div>
    `;
    }
}

const printMovieSearchResults = (searchResults) => {
    for (let movie in searchResults.Search) {
        if(searchResults.Search[movie].Poster === 'N/A') {
            searchResults.Search[movie].Poster = 'https://via.placeholder.com/400x600?text=No+Poster+Available';
        }
        searchResultsList.innerHTML += `
            <div class="card mb-3 col-lg-4 col-md-12 border-0">
                <div class="row g-0">
                    <div class="col-md-6">
                        <img src="${searchResults.Search[movie].Poster}" alt="${searchResults.Search[movie].Title}" width="200px">
                    </div>
                    <div class="col-md-6">
                        <div class="card-body">
                        <p class="card-title h5">${searchResults.Search[movie].Title}</p>
                        <p class="card-text lead">${searchResults.Search[movie].Year}</p>
                        <a href="https://www.imdb.com/title/${searchResults.Search[movie].imdbID}" target="_blank" class="small link-dark link-underline-opacity-0">
                        <i class="fab fa-imdb me-2"></i>IMDb</a>

                    </div>
                </div>
            </div>
        `;
    }
}


const showLoadingSpinner = () => {
    loadingSpinner.classList.remove('d-none');
}
const hideLoadingSpinner = () => {
    loadingSpinner.classList.add('d-none');
}

getWhatsOnToday.onclick = async () => {
    const today = new Date();
    // date format: iso3166-1
    const date = today.toISOString().split('T')[0];
    showLoadingSpinner(); // show the loading spinner
    const response = await fetch(`https://api.tvmaze.com/schedule/?date=${date}`);
    if (!response.ok) {
        whatsOnTodayList.textContent = 'Something went wrong. Please try again later.';
        hideLoadingSpinner(); // hide the loading spinner
        return;
    }
    const whatsOnTV = await response.json();

    whatsOnTodayComponent.classList.remove('d-none');
    whatsOnTodayComponent.scrollIntoView({behavior: 'smooth'});
    whatsOnTodayTitle.textContent = `What's on Today (${today.toDateString()})`;

    hideLoadingSpinner(); // hide the loading spinner

    for(let tvShow in whatsOnTV) {

        if (whatsOnTV[tvShow].image === null) {
            whatsOnTV[tvShow].image = 'https://via.placeholder.com/400x600?text=No+Poster+Available';
        }

        whatsOnTodayList.innerHTML += `
            <div class="card mb-3 col-lg-4 col-md-12 border-0">
                <div class="row g-0">
                    <div class="col-md-6">
                        <img src="${whatsOnTV[tvShow].show.image.medium}" alt="${whatsOnTV[tvShow].show.name}" width="200px">
                    </div>
                    <div class="col-md-6">
                        <div class="card-body">
                            <p class="h5 card-title">${whatsOnTV[tvShow].show.name}</p>
                            <p class="small">Rating: ${whatsOnTV[tvShow].show.rating.average ? whatsOnTV[tvShow].show.rating.average : 'N/A'}</p>
                            <p class="small card-text">Genre: ${whatsOnTV[tvShow].show.genres.join(', ')}</p>
                            <p class="card-text small">Network: ${whatsOnTV[tvShow].show.network.name}</p>
                            <p><a href="${whatsOnTV[tvShow].show.officialSite}" target="_blank" class="small fw-bold link-dark link-underline-opacity-0">
                                <i class="fas fa-play mx-1"></i>Watch</a></p>
                            
                            <a class="small link-dark link-underline-opacity-0" onclick="showTVShowsDetails(${whatsOnTV[tvShow].show.id})"><i class="fas fa-info-circle mx-1"></i>Find out more</a>
                        </div>
                    </div>
                </div>
            </div>

        `;
    }
}

const randomTVShows = async () => {

    for (let i = 0; i <= 8; i++) {

        let randomID = Math.floor(Math.random() * 100) + 1;
        // check if the randomID is already in the array
        const response = await fetch(`https://api.tvmaze.com/shows/${randomID}`);
        const tvShow = await response.json();
        // if the response is not ok, skip this iteration of the loop
        if (!response.ok) {
            i--;
            continue;
        }
        
        randomTVShowsList.innerHTML += `
            <div class="card mb-3 col-lg-4 col-md-12 border-0 text-light">
                <div class="row g-0 bg-gradient bg-black rounded-5">
                    <div class="col-md-6">
                        <img src="${tvShow.image.medium}" class="rounded-5" alt="${tvShow.name}" width="200px">
                    </div>
                    <div class="col-md-6">
                        <div class="card-body d-flex flex-column justify-content-between">
                            <h5 class="card-title">${tvShow.name}</h5>
                            <p class="small">Rating: ${tvShow.rating.average} / 10</p>
                            <p class="small">Status: ${tvShow.status}</p>
                            <p class="small">Premiered on: ${tvShow.premiered}</p>
                            <p class="small">Genres: ${tvShow.genres.join(', ')}</p>
                            <a class="small link-light link-underline-opacity-0 justify-self-end" onclick="showTVShowsDetails(${tvShow.id})">
                                <i class="fas fa-info-circle me-2"></i>Find out more</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

const showTVShowsDetails = async (tvShowID) => {
    const response = await fetch(`https://api.tvmaze.com/shows/${tvShowID}`);
    const tvShow = await response.json();

    const responseCast = await fetch(`https://api.tvmaze.com/shows/${tvShowID}/cast`);
    const castList = await responseCast.json();

    // store cast members in a string
    let castMembers = '';
    for (let cast in castList) {
        castMembers += castList[cast].person.name + ', ';
    }

    console.log(tvShow);
    console.log(castList);
    

    TVShowsDetailsModal.show()

    TVShowsDetailsModalContent.innerHTML = `
        <div class="modal-header">
            <h5 class="modal-title" id="TVShowsDetailsModalLabel">${tvShow.name}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <div class="modal-body p-4">
            <div class="row">
                <div class="col-md-6 d-flex flex-column justify-content-center align-items-center">
                    <img src="${tvShow.image.medium}" alt="${tvShow.name}" width="300px">
                    <p class="small">${tvShow.summary}</p>
                </div>
                <div class="col-md-6">
                    <p class="card-text">Rating: ${tvShow.rating.average? tvShow.rating.average : 'N/A'}</p>
                    <p class="card-text">Language: ${tvShow.language? tvShow.language : 'N/A'}</p>
                    <p class="card-text">Genres: ${tvShow.genres.join(', ')}</p>
                    <p class="card-text">Status: ${tvShow.status}</p>
                    <p class="card-text">Runtime: ${tvShow.runtime} minutes</p>
                    <p class="card-text">Premiered: ${tvShow.premiered}</p>
                    <p class="card-text">Network: ${tvShow.network.name}</p>
                    <p class="card-text">Cast: ${castMembers}</p>
                    <p class="card-text">Official Site: <a href="${tvShow.officialSite}" target="_blank">${tvShow.officialSite}</a></p>

                    <p class="card-text mt-2">Get more info on <a href="https://www.imdb.com/title/${tvShow.externals.imdb}" target="_blank" class="link-dark link-underline-opacity-0">
                        <i class="fab fa-imdb mx-1"></i> IMDB</a></p>
                </div>
            </div>
        </div>
    `;
}  
        
randomTVShows();
