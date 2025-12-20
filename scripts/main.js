/**
 * ISE-201 Web Teknolojileri Projesi 
 */

// DOM Elementleri
const mediaGrid = document.getElementById('mediaGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const personFilter = document.getElementById('personFilter');
const sortOrder = document.getElementById('sortOrder');
const gallerySection = document.getElementById('gallery-section');
const detailSection = document.getElementById('detail-section');
const favoritesSection = document.getElementById('favorites-section');
const favoritesGrid = document.getElementById('favoritesGrid');
const detailContent = document.getElementById('media-detail-content');
const backBtn = document.getElementById('backToListBtn');
const showFavoritesBtn = document.getElementById('showFavoritesBtn');

let allMedia = []; 

// 1. Veri Yükleme
async function loadData() {
    try {
        const response = await fetch('media.json');
        allMedia = await response.json();
        updatePersonFilter();
        handleFilter(); 
    } catch (error) {
        console.error("Veri hatası:", error);
    }
}

// 2. Kişi Filtresi Güncelleme
const updatePersonFilter = () => {
    const selectedCat = categoryFilter.value;
    personFilter.innerHTML = '<option value="all">Yönetmen / Yazar: Tümü</option>';
    const filteredPeople = [...new Set(allMedia
        .filter(item => selectedCat === 'all' || item.category === selectedCat)
        .map(item => item.director))];
    filteredPeople.sort().forEach(person => {
        const option = document.createElement('option');
        option.value = person;
        option.textContent = person;
        personFilter.appendChild(option);
    });
};

// 3. Ortak Filtreleme Mantığı (Hem Galeri hem Favoriler için)
const handleFilter = () => {
    const search = searchInput.value.toLowerCase();
    const cat = categoryFilter.value;
    const person = personFilter.value;
    const sort = sortOrder.value;

    
    const isFavPage = favoritesSection.style.display === 'block';
    let baseData = [];

    if (isFavPage) {
        const favIds = JSON.parse(localStorage.getItem('userFavIds')) || [];
        baseData = allMedia.filter(m => favIds.includes(m.id));
    } else {
        baseData = [...allMedia];
    }

    let filtered = baseData.filter(item => {
        const matchesCat = (cat === 'all' || item.category === cat);
        const matchesSearch = item.title.toLowerCase().includes(search);
        const matchesPerson = (person === 'all' || item.director === person);
        return matchesCat && matchesSearch && matchesPerson;
    });

    // Sıralama
    if (sort === 'ratingHigh') filtered.sort((a, b) => b.rating - a.rating);
    else if (sort === 'yearNew') filtered.sort((a, b) => b.year - a.year);
    else if (sort === 'yearOld') filtered.sort((a, b) => a.year - b.year);

    
    if (isFavPage) {
        renderFavorites(filtered);
    } else {
        renderMedia(filtered);
    }
};

// 4. Ana Galeri Kartları 
const renderMedia = (data) => {
    mediaGrid.innerHTML = '';
    data.forEach(item => {
        const article = document.createElement('article');
        article.className = 'media-card';
        article.innerHTML = `
            <img src="${item.image}" alt="${item.title}" onclick="showDetails(${item.id})" style="cursor:pointer">
            <div class="card-body">
                <h3>${item.title}</h3>
                <p>${item.year} | ${item.category.toUpperCase()}</p>
                <button onclick="toggleFav(${item.id})" title="Favorilere Ekle/Çıkar">⭐</button>
            </div>
        `;
        mediaGrid.appendChild(article);
    });
};

// 5. Favoriler Kartları 
const renderFavorites = (data) => {
    favoritesGrid.innerHTML = '';
    if (data.length === 0) {
        favoritesGrid.innerHTML = "<p>Sonuç bulunamadı.</p>";
        return;
    }
    data.forEach(item => {
        const article = document.createElement('article');
        article.className = 'media-card';
        article.innerHTML = `
            <img src="${item.image}" alt="${item.title}" onclick="showDetails(${item.id})" style="cursor:pointer">
            <div class="card-body">
                <h3>${item.title}</h3>
                <button onclick="toggleFav(${item.id})" class="btn-remove">❌ Çıkar</button>
            </div>
        `;
        favoritesGrid.appendChild(article);
    });
};

// 6. SPA Detay Sayfası
window.showDetails = (id) => {
    const item = allMedia.find(m => m.id === id);
    gallerySection.style.display = 'none';
    favoritesSection.style.display = 'none';
    detailSection.style.display = 'block';

    detailContent.innerHTML = `
        <div class="detail-container">
            <img src="${item.image}" alt="${item.title}">
            <div class="info">
                <h1>${item.title} (${item.year})</h1>
                <p><strong>Yönetmen/Yazar:</strong> ${item.director}</p>
                <p><strong>Puan:</strong> ⭐ ${item.rating}/10</p>
                <p><strong>Kadro:</strong> ${item.cast || 'Bilgi yok'}</p>
                <hr>
                <p class="description">${item.description}</p>
            </div>
        </div>
    `;
    window.location.hash = `detay/${item.id}`;
};

// 7. Favori Sistemi
window.toggleFav = (id) => {
    let favIds = JSON.parse(localStorage.getItem('userFavIds')) || [];
    if (favIds.includes(id)) {
        favIds = favIds.filter(fId => fId !== id);
    } else {
        favIds.push(id);
    }
    localStorage.setItem('userFavIds', JSON.stringify(favIds));
    handleFilter(); 
};

// Sayfa Geçişleri
const showFavoritesPage = () => {
    gallerySection.style.display = 'none';
    detailSection.style.display = 'none';
    favoritesSection.style.display = 'block';
    handleFilter(); 
};

window.backToGallery = () => {
    favoritesSection.style.display = 'none';
    detailSection.style.display = 'none';
    gallerySection.style.display = 'block';
    window.location.hash = '';
    handleFilter();
};


searchInput.addEventListener('input', handleFilter);
categoryFilter.addEventListener('change', () => { updatePersonFilter(); handleFilter(); });
personFilter.addEventListener('change', handleFilter);
sortOrder.addEventListener('change', handleFilter);
showFavoritesBtn.addEventListener('click', showFavoritesPage);
backBtn.addEventListener('click', backToGallery);

loadData();