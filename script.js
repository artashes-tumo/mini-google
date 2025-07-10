document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById("toggle-theme");
  const searchBtn = document.getElementById('search');
  const input = document.querySelector('.search-box input');
  const resultContainer = document.querySelector('.result-container');
  const loader = document.getElementById('loader');

  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  const pageNumber = document.getElementById('pageNumber');

  let currentQuery = '';
  let currentPage = 1;
  let totalPages = 1;

  // Theme persistence
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
  }

  btn.onclick = () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  };

  function clearResults() {
    resultContainer.innerHTML = '';
  }

  function showResults(results) {
    resultContainer.innerHTML = '';
    results.forEach(({ image, description }) => {
      const card = document.createElement('div');
      card.classList.add('result-box');

      const img = document.createElement('img');
      img.src = image;
      img.alt = description;

      const desc = document.createElement('p');
      desc.textContent = description;

      card.appendChild(img);
      card.appendChild(desc);
      resultContainer.appendChild(card);
    });
  }

  async function doSearch(page = 1) {
    const query = input.value.trim().toLowerCase();
    if (!query) {
      alert('Please enter something to search.');
      return;
    }

    currentQuery = query;
    currentPage = page;
    loader.style.display = 'block';

    const url = `https://pixabay.com/api/?key=51175945-3a453382a3779e2c97686ca48&q=${encodeURIComponent(query)}&image_type=photo&per_page=12&page=${page}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      loader.style.display = 'none';

      const filtered = data.hits.map(hit => ({
        image: hit.webformatURL,
        description: hit.tags || `Photo by ${hit.user}`,
      }));

      showResults(filtered);
      totalPages = Math.ceil(data.totalHits / 12);
      updatePaginationButtons();
      updatePageNumber();

      if (filtered.length === 0 && page === 1) {
        resultContainer.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">No results found.</p>';
      }
    } catch (error) {
      loader.style.display = 'none';
      console.error('Search failed:', error);
    }
  }

  function updatePaginationButtons() {
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
  }

  function updatePageNumber() {
    pageNumber.textContent = `Page ${currentPage}`;
  }

  searchBtn.addEventListener('click', () => doSearch(1));
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      doSearch(1);
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      doSearch(currentPage - 1);
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      doSearch(currentPage + 1);
    }
  });
});
