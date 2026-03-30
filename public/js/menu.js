// ============================================================
//  menu.js — Menu Page JavaScript
//  Handles: fetching menu from API, rendering by category,
//           filtering by dietary tag, results count
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ── DOM REFERENCES ────────────────────────────────────────
  const menuContent  = document.getElementById('menuContent');
  const filterBtns   = document.querySelectorAll('.filter-btn');
  const filterCount  = document.getElementById('filterCount');
  const noResults    = document.getElementById('noResults');
  const clearFilter  = document.getElementById('clearFilter');

  // ── STATE ─────────────────────────────────────────────────
  // allItems stores every menu item fetched from the API
  // activeFilter tracks which filter button is currently selected
  let allItems     = [];
  let activeFilter = 'all';

  // Map category names to Font Awesome icons
  const categoryIcons = {
    'Burgers':   'fa-burger',
    'Starters':  'fa-drumstick-bite',
    'Sides':     'fa-bowl-food',
    'Desserts':  'fa-ice-cream',
    'Beverages': 'fa-mug-saucer',
  };

  // ── FETCH MENU FROM API ───────────────────────────────────
  async function loadMenu() {
    try {
      const response = await fetch('/api/menu');

      if (!response.ok) throw new Error('Failed to fetch menu');

      allItems = await response.json();

      // Render all items on first load
      renderMenu(allItems);

    } catch (error) {
      console.error('Error loading menu:', error);
      menuContent.innerHTML = `
        <p style="text-align:center; color:var(--color-mid); padding: 4rem 0;">
          <i class="fa-solid fa-triangle-exclamation" style="font-size:2rem; display:block; margin-bottom:1rem;"></i>
          Unable to load the menu right now. Please try again later.
        </p>
      `;
    }
  }

  // ── RENDER MENU ───────────────────────────────────────────
  // Takes an array of items, groups them by category, and renders
  function renderMenu(items) {

    // Show/hide no results message
    if (items.length === 0) {
      menuContent.innerHTML = '';
      noResults.style.display = 'block';
      filterCount.textContent = '0 dishes found';
      return;
    }

    noResults.style.display = 'none';

    // Update results count
    filterCount.textContent = `${items.length} dish${items.length !== 1 ? 'es' : ''} found`;

    // Group items by their category name
    // reduce() builds an object like { Burgers: [...], Starters: [...] }
    const grouped = items.reduce((acc, item) => {
      const cat = item.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});

    // Clear current content
    menuContent.innerHTML = '';

    // Render one category block per group
    Object.entries(grouped).forEach(([categoryName, categoryItems]) => {
      const block = createCategoryBlock(categoryName, categoryItems);
      menuContent.appendChild(block);
    });
  }

  // ── CREATE CATEGORY BLOCK ─────────────────────────────────
  // Builds a full category section with heading and item grid
  function createCategoryBlock(categoryName, items) {
    const block = document.createElement('div');
    block.className = 'menu-category-block';

    // Pick icon for this category, default to utensils
    const iconClass = categoryIcons[categoryName] || 'fa-utensils';

    block.innerHTML = `
      <div class="category-header">
        <div class="category-icon">
          <i class="fa-solid ${iconClass}"></i>
        </div>
        <h2 class="category-title">${categoryName}</h2>
        <span class="category-count">${items.length} item${items.length !== 1 ? 's' : ''}</span>
      </div>
      <div class="menu-items-grid" id="grid-${categoryName.replace(/\s+/g, '-')}">
      </div>
    `;

    // Get the grid inside this block and populate it
    const grid = block.querySelector('.menu-items-grid');
    items.forEach(item => {
      grid.appendChild(createMenuItemCard(item));
    });

    return block;
  }

  // ── CREATE MENU ITEM CARD ─────────────────────────────────
  function createMenuItemCard(item) {
    const card = document.createElement('div');
    card.className = `menu-item-card${!item.isAvailable ? ' unavailable' : ''}`;

    // Build image or icon placeholder
    const imgHTML = item.imagePath
      ? `<img src="${item.imagePath}" alt="${item.name}" loading="lazy"
             onerror="this.parentElement.innerHTML='<i class=\\'fa-solid fa-burger\\'></i>'">`
      : `<i class="fa-solid fa-burger"></i>`;

    // Build dietary tag badges
    const tagsHTML = buildTagsHTML(item.dietaryTags);

    // Show unavailable badge if item is not available
    const availabilityHTML = !item.isAvailable
      ? `<span class="unavailable-badge">Currently Unavailable</span>`
      : '';

    card.innerHTML = `
      <div class="menu-item-img">${imgHTML}</div>
      <div class="menu-item-body">
        <h3 class="menu-item-name">${item.name}</h3>
        <p class="menu-item-desc">${item.description || ''}</p>
        <div class="menu-item-tags">${tagsHTML}</div>
        <div class="menu-item-footer">
          <span class="menu-item-price">R ${parseFloat(item.price).toFixed(2)}</span>
          ${availabilityHTML}
        </div>
      </div>
    `;

    return card;
  }

  // ── BUILD TAG BADGES ──────────────────────────────────────
  function buildTagsHTML(tagsString) {
    if (!tagsString) return '';

    return tagsString.split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .map(tag => {
        let cssClass = '';
        const lower = tag.toLowerCase();
        if (lower.includes('vegetarian'))  cssClass = 'vegetarian';
        else if (lower.includes('gluten')) cssClass = 'gluten-free';
        else if (lower.includes('spicy'))  cssClass = 'spicy';
        return `<span class="tag ${cssClass}">${tag}</span>`;
      })
      .join('');
  }

  // ── FILTER LOGIC ──────────────────────────────────────────
  // Called whenever a filter button is clicked
  function applyFilter(filter) {
    activeFilter = filter;

    if (filter === 'all') {
      // Show everything
      renderMenu(allItems);
      return;
    }

    // Keep only items whose dietaryTags includes the filter string
    const filtered = allItems.filter(item => {
      if (!item.dietaryTags) return false;
      // Case-insensitive check — does the tag string contain the filter word?
      return item.dietaryTags.toLowerCase().includes(filter.toLowerCase());
    });

    renderMenu(filtered);
  }

  // ── FILTER BUTTON EVENT LISTENERS ────────────────────────
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      filterBtns.forEach(b => b.classList.remove('active'));

      // Add active to clicked button
      btn.classList.add('active');

      // Apply the filter
      applyFilter(btn.dataset.filter);
    });
  });

  // Clear filter button inside the no-results message
  if (clearFilter) {
    clearFilter.addEventListener('click', () => {
      // Reset all filter buttons
      filterBtns.forEach(b => b.classList.remove('active'));
      document.querySelector('[data-filter="all"]').classList.add('active');
      applyFilter('all');
    });
  }

  // ── INITIALISE ────────────────────────────────────────────
  loadMenu();

});