const accesskey = "_vMNRizf6HO8PUhC0LHToeIrt4HAtax_iEkwmcT-fNc";
// WARNING: Exposing API keys on the client-side is a security risk.
// In a production application, these should be handled by a backend server.

// Popular Indian places for autocomplete
const places = [
  "Delhi", "Mumbai", "Kolkata", "Chennai", "Bangalore", "Hyderabad", "Jaipur", "Agra", "Goa", "Varanasi",
  "Leh", "Ladakh", "Shimla", "Manali", "Darjeeling", "Udaipur", "Jaisalmer", "Rishikesh", "Haridwar", "Mysore",
  "Kerala", "Ooty", "Kodaikanal", "Pune", "Ahmedabad", "Surat", "Bhopal", "Indore", "Amritsar", "Chandigarh"
];

// Autocomplete feature
const searchInput = document.getElementById('search-input');
const autocompleteDiv = document.createElement('div');
autocompleteDiv.style.position = 'absolute';
autocompleteDiv.style.background = '#fff';
autocompleteDiv.style.borderRadius = '10px';
autocompleteDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
autocompleteDiv.style.zIndex = '10';
autocompleteDiv.style.width = searchInput.offsetWidth + 'px';
autocompleteDiv.style.maxHeight = '180px';
autocompleteDiv.style.overflowY = 'auto';
autocompleteDiv.style.display = 'none';
autocompleteDiv.id = 'autocomplete-list';
searchInput.parentNode.appendChild(autocompleteDiv);

let selectedIndex = -1;
let currentMatches = [];

searchInput.addEventListener('input', function() {
  const val = this.value.trim().toLowerCase();
  autocompleteDiv.innerHTML = '';
  selectedIndex = -1;
  currentMatches = [];
  if (!val) {
    autocompleteDiv.style.display = 'none';
    return;
  }
  const matches = places.filter(place => place.toLowerCase().startsWith(val));
  currentMatches = matches;
  if (matches.length === 0) {
    autocompleteDiv.style.display = 'none';
    return;
  }
  matches.forEach((place, idx) => {
    const item = document.createElement('div');
    item.textContent = place;
    item.style.padding = '8px 14px';
    item.style.cursor = 'pointer';
    item.style.fontSize = '1rem';
    item.style.color = '#222';
    item.addEventListener('mousedown', function(e) {
      searchInput.value = place;
      autocompleteDiv.style.display = 'none';
    });
    autocompleteDiv.appendChild(item);
  });
  // Position below input
  autocompleteDiv.style.top = (searchInput.offsetTop + searchInput.offsetHeight) + 'px';
  autocompleteDiv.style.left = searchInput.offsetLeft + 'px';
  autocompleteDiv.style.width = searchInput.offsetWidth + 'px';
  autocompleteDiv.style.display = 'block';
});

// Keyboard navigation for autocomplete
searchInput.addEventListener('keydown', function(e) {
  const items = autocompleteDiv.querySelectorAll('div');
  if (autocompleteDiv.style.display === 'block' && items.length > 0) {
    if (e.key === 'ArrowDown') {
      selectedIndex = (selectedIndex + 1) % items.length;
      items.forEach((item, idx) => {
        item.style.background = idx === selectedIndex ? '#ffd700' : '';
      });
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      selectedIndex = (selectedIndex - 1 + items.length) % items.length;
      items.forEach((item, idx) => {
        item.style.background = idx === selectedIndex ? '#ffd700' : '';
      });
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < items.length) {
        searchInput.value = items[selectedIndex].textContent;
        autocompleteDiv.style.display = 'none';
        triggerSearch();
        e.preventDefault();
      } else {
        triggerSearch();
      }
    }
  } else if (e.key === 'Enter') {
    triggerSearch();
  }
});

// Hide autocomplete on blur
searchInput.addEventListener('blur', function() {
  setTimeout(() => autocompleteDiv.style.display = 'none', 150);
});

// Search function
function triggerSearch() {
  const query = searchInput.value.trim();
  const resultDiv = document.getElementById('search-result');
  const contentSection = document.querySelector('.content');
  const popularSection = document.getElementById('popular-destinations');
  if (contentSection) contentSection.style.display = "none";
  if (popularSection) popularSection.style.display = "none";

  if (!query) {
    resultDiv.innerHTML = "<span style='color:red;'>Please enter a place name.</span>";
    if (contentSection) contentSection.style.display = "";
    if (popularSection) popularSection.style.display = "";
    return;
  }

  fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=10`, {
    headers: {
      Authorization: pexelsApiKey
    }
  })
    .then(res => res.json())
    .then(data => {
      if (data.photos && data.photos.length > 0) {
        let cardsHtml = `<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:30px;">`;
        data.photos.forEach(photo => {
  const placeName = photo.alt ? photo.alt : query;
  cardsHtml += `
    <div style="width:45%;min-width:280px;max-width:420px;display:flex;flex-direction:column;align-items:center;">
      <img src="${photo.src.large}" alt="${placeName}" style="width:100%;height:220px;object-fit:cover;border-radius:12px 12px 0 0;box-shadow:0 2px 8px rgba(0,0,0,0.3);">
      <div class="place-title" style="background:#111;color:#ffd700;font-size:1.2rem;font-weight:bold;padding:12px 0 10px 0;width:100%;text-align:center;">
        ${placeName}
      </div>
      <button class="visit-btn" style="background:#ffd700;color:#222;border:none;border-radius:12px;padding:12px 36px;font-size:1.2rem;font-weight:bold;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.3);margin:14px 0 18px 0;">Visit</button>
    </div>
  `;
});
        cardsHtml += `</div>`;
        resultDiv.innerHTML = cardsHtml;
      } else {
        resultDiv.innerHTML = "<span style='color:red;'>No image found for this place.</span>";
        if (contentSection) contentSection.style.display = "";
        if (popularSection) popularSection.style.display = "";
      }
    })
    .catch(() => {
      resultDiv.innerHTML = "<span style='color:red;'>Error fetching image.</span>";
      if (contentSection) contentSection.style.display = "";
      if (popularSection) popularSection.style.display = "";
    });
}

window.addEventListener('DOMContentLoaded', function() {
  const lastQuery = localStorage.getItem('lastSearchQuery');
  if (lastQuery) {
    searchInput.value = lastQuery;
    triggerSearch();
  }
});

// Use event delegation for all "Visit" buttons (for both popular and search results)
document.body.addEventListener('click', function(event) {
  if (event.target.classList.contains('visit-btn')) {
    // Find the closest parent card, whether it's a popular card or a search result card
    const card = event.target.closest('.popular-card, div[style*="width:45%"]');
    if (card) {
      // Get place name from either h3 (popular) or .place-title (search)
      const placeElement = card.querySelector('h3') || card.querySelector('.place-title');
      let place = placeElement ? placeElement.innerText : 'Unknown Place';
      // Clean the place name to get only the main location (e.g., "Jaipur" from "Jaipur, pink city")
      place = place.split(',')[0].trim();
      const image = card.querySelector('img') ? card.querySelector('img').src : ''; // Handle cards without images
      localStorage.setItem('selectedPlace', JSON.stringify({ place, image }));
      window.location.href = 'your destination.html';
    }
  }
});

// Add a click listener to the search button
document.getElementById('search-btn').addEventListener('click', triggerSearch);





// Pixabay API key
const pixabayApiKey = "52405082-6932ac13272147b346df732b6";
// Pexels API key
const pexelsApiKey = "qcymZkRN7rOWGOjrYIWm9UTuYlpqcPgfRr0csh511cq3f3vJLgqCXZGL";
// Unsplash API key
const unsplashApiKey = "unqJhVejdhuPw_L6HJ1g-JEMdGYheeu40j-ZzXj_wxc";

// Wikimedia Commons Images
async function getWikimediaImages(place) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(place)}&gsrlimit=4&prop=imageinfo&iiprop=url&format=json&origin=*`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.query && data.query.pages) {
    return Object.values(data.query.pages)
      .map(page => page.imageinfo && page.imageinfo[0] ? page.imageinfo[0].url : null)
      .filter(Boolean);
  }
  return [];
}

// Pixabay Images
async function getPixabayImages(place) {
  const url = `https://pixabay.com/api/?key=${pixabayApiKey}&q=${encodeURIComponent(place)}&image_type=photo&per_page=4`;
  const res = await fetch(url);
  const data = await res.json();
  return data.hits.map(img => img.webformatURL);
}

// Pixabay Videos
async function getPixabayVideos(place) {
  const url = `https://pixabay.com/api/videos/?key=${pixabayApiKey}&q=${encodeURIComponent(place)}&per_page=2`;
  const res = await fetch(url);
  const data = await res.json();
  return data.hits.map(vid => vid.videos.medium.url);
}

// Unsplash Images
async function getUnsplashImages(place) {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(place)}&client_id=${unsplashApiKey}&per_page=4`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results.map(img => img.urls.small);
}

// Pexels Images
async function getPexelsImages(place) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(place)}&per_page=4`;
  const res = await fetch(url, {
    headers: { Authorization: pexelsApiKey }
  });
  const data = await res.json();
  return data.photos.map(photo => photo.src.medium);
}

// Pexels Videos
async function getPexelsVideos(place) {
  const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(place)}&per_page=2`;
  const res = await fetch(url, {
    headers: { Authorization: pexelsApiKey }
  });
  const data = await res.json();
  return data.videos.map(video => video.video_files[0].link);
}

// Show all images/videos in search result
async function showAllMedia(place) {
  const [wikimediaImgs, pixabayImgs, pixabayVids, unsplashImgs, pexelsImgs, pexelsVids] = await Promise.all([
    getWikimediaImages(place),
    getPixabayImages(place),
    getPixabayVideos(place),
    getUnsplashImages(place),
    getPexelsImages(place),
    getPexelsVideos(place)
  ]);

  const resultDiv = document.getElementById('search-result');
  resultDiv.innerHTML = `<h3>Images & Videos for "${place}"</h3>`;

  wikimediaImgs.forEach(url => {
    resultDiv.innerHTML += `<img src="${url}" style="max-width:180px;margin:8px;border-radius:8px;">`;
  });
  pixabayImgs.forEach(url => {
    resultDiv.innerHTML += `<img src="${url}" style="max-width:180px;margin:8px;border-radius:8px;">`;
  });
  unsplashImgs.forEach(url => {
    resultDiv.innerHTML += `<img src="${url}" style="max-width:180px;margin:8px;border-radius:8px;">`;
  });
  pexelsImgs.forEach(url => {
    resultDiv.innerHTML += `<img src="${url}" style="max-width:180px;margin:8px;border-radius:8px;">`;
  });
  pixabayVids.forEach(url => {
    resultDiv.innerHTML += `<video src="${url}" controls style="max-width:220px;margin:8px;border-radius:8px;"></video>`;
  });
  pexelsVids.forEach(url => {
    resultDiv.innerHTML += `<video src="${url}" controls style="max-width:220px;margin:8px;border-radius:8px;"></video>`;
  });
}

// Search button logic
document.getElementById('search-btn').onclick = function() {
  const place = document.getElementById('search-input').value.trim();
  if (place) showAllMedia(place);
};