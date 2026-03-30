// ============================================================
//  home.js — Homepage JavaScript
//  Handles: carousel, featured dishes from API, testimonials
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ── CAROUSEL ──────────────────────────────────────────────
  const slides     = document.querySelectorAll('.carousel-slide');
  const dots       = document.querySelectorAll('.dot');
  const prevBtn    = document.getElementById('carouselPrev');
  const nextBtn    = document.getElementById('carouselNext');
  let currentSlide = 0;
  let autoPlayTimer;

  // go to a specific slide
  function goToSlide(index) {
    // Remove active from current slide and dot
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');

    // update index (wrap around)
    currentSlide = (index + slides.length) % slides.length;

    // add active to new slide and dot
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }

  // auto advance every 5 seconds
  function startAutoPlay() {
    autoPlayTimer = setInterval(() => {
      goToSlide(currentSlide + 1);
    }, 5000);
  }

  // stop autoplay (used when user manually clicks)
  function stopAutoPlay() {
    clearInterval(autoPlayTimer);
  }

  // previous button
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      stopAutoPlay();
      goToSlide(currentSlide - 1);
      startAutoPlay();
    });
  }

  // next button
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      stopAutoPlay();
      goToSlide(currentSlide + 1);
      startAutoPlay();
    });
  }

  // dot buttons
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      stopAutoPlay();
      goToSlide(parseInt(dot.dataset.index));
      startAutoPlay();
    });
  });

  // start autoplay on load
  if (slides.length > 0) {
    startAutoPlay();
  }

  // ── FEATURED DISHES FROM API ──────────────────────────────
  // fetches the first 6 menu items from the database and renders cards
  const featuredContainer = document.getElementById('featuredDishes');

  async function loadFeaturedDishes() {
    try {
      const response = await fetch('/api/menu');

      if (!response.ok) {
        throw new Error('Failed to fetch menu data');
      }

      const items = await response.json();

      // take only the first 6 items for the homepage
      const featured = items.slice(0, 6);

      // clear loading spinner
      featuredContainer.innerHTML = '';

      // render each dish card
      featured.forEach(item => {
        const card = createDishCard(item);
        featuredContainer.appendChild(card);
      });

    } catch (error) {
      console.error('Error loading featured dishes:', error);
      featuredContainer.innerHTML = `
        <p style="text-align:center; color: var(--color-mid); grid-column: 1/-1;">
          Unable to load dishes right now. Please try again later.
        </p>
      `;
    }
  }

  // creates a dish card DOM element from a menu item object
  function createDishCard(item) {
    const card = document.createElement('div');
    card.className = 'dish-card';

    // build dietary tags HTML
    const tagsHTML = buildTagsHTML(item.dietaryTags);

    // build image or icon placeholder
    const imgHTML = item.imagePath
      ? `<img src="${item.imagePath}" alt="${item.name}" loading="lazy" onerror="this.parentElement.innerHTML='<i class=\\'fa-solid fa-burger\\'></i>'">`
      : `<i class="fa-solid fa-burger"></i>`;

    card.innerHTML = `
      <div class="dish-card-img">${imgHTML}</div>
      <div class="dish-card-body">
        <p class="dish-card-category">${item.category}</p>
        <h3 class="dish-card-name">${item.name}</h3>
        <p class="dish-card-desc">${item.description}</p>
        <div class="dish-card-footer">
          <span class="dish-card-price">R ${parseFloat(item.price).toFixed(2)}</span>
          <div class="dish-card-tags">${tagsHTML}</div>
        </div>
      </div>
    `;

    return card;
  }

  // converts comma-separated tag string into tag badge HTML
  function buildTagsHTML(tagsString) {
    if (!tagsString) return '';

    return tagsString.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .map(tag => {
        // assign CSS class based on tag name
        let cssClass = '';
        if (tag.toLowerCase().includes('vegetarian')) cssClass = 'vegetarian';
        else if (tag.toLowerCase().includes('gluten')) cssClass = 'gluten-free';
        else if (tag.toLowerCase().includes('spicy')) cssClass = 'spicy';

        return `<span class="tag ${cssClass}">${tag}</span>`;
      })
      .join('');
  }

  // load featured dishes on page load
  if (featuredContainer) {
    loadFeaturedDishes();
  }

  // ── TESTIMONIALS FROM API ─────────────────────────────────
  const testimonialsGrid = document.getElementById('testimonialsGrid');

  async function loadTestimonials() {
    try {
      const response = await fetch('/api/testimonials');

      if (!response.ok) throw new Error('Failed to fetch testimonials');

      const testimonials = await response.json();

      testimonialsGrid.innerHTML = '';

      testimonials.forEach(t => {
        const card = document.createElement('div');
        card.className = 'testimonial-card';

        // build star rating
        const stars = '★'.repeat(t.rating) + '☆'.repeat(5 - t.rating);

        // avatar image or icon fallback
        const avatarHTML = t.avatarPath
          ? `<img src="${t.avatarPath}" alt="${t.guestName}" onerror="this.parentElement.innerHTML='<i class=\\'fa-solid fa-user\\'></i>'">`
          : `<i class="fa-solid fa-user"></i>`;

        card.innerHTML = `
          <div class="testimonial-quote-icon">"</div>
          <p class="testimonial-text">${t.quote}</p>
          <div class="testimonial-footer">
            <div class="testimonial-avatar">${avatarHTML}</div>
            <div>
              <p class="testimonial-name">${t.guestName}</p>
              <p class="testimonial-stars">${stars}</p>
            </div>
          </div>
        `;

        testimonialsGrid.appendChild(card);
      });

    } catch (error) {
      console.error('Error loading testimonials:', error);
      // fall back to static testimonials if API fails
      testimonialsGrid.innerHTML = `
        <div class="testimonial-card">
          <div class="testimonial-quote-icon">"</div>
          <p class="testimonial-text">Best burgers in Joburg! The smash burger is absolutely incredible.</p>
          <div class="testimonial-footer">
            <div class="testimonial-avatar"><i class="fa-solid fa-user"></i></div>
            <div>
              <p class="testimonial-name">Sarah M.</p>
              <p class="testimonial-stars">★★★★★</p>
            </div>
          </div>
        </div>
        <div class="testimonial-card">
          <div class="testimonial-quote-icon">"</div>
          <p class="testimonial-text">Great family atmosphere, the kids loved it. Will definitely be back!</p>
          <div class="testimonial-footer">
            <div class="testimonial-avatar"><i class="fa-solid fa-user"></i></div>
            <div>
              <p class="testimonial-name">John D.</p>
              <p class="testimonial-stars">★★★★★</p>
            </div>
          </div>
        </div>
        <div class="testimonial-card">
          <div class="testimonial-quote-icon">"</div>
          <p class="testimonial-text">Huge portions and great value. The wings are a must try!</p>
          <div class="testimonial-footer">
            <div class="testimonial-avatar"><i class="fa-solid fa-user"></i></div>
            <div>
              <p class="testimonial-name">Priya K.</p>
              <p class="testimonial-stars">★★★★☆</p>
            </div>
          </div>
        </div>
      `;
    }
  }

  if (testimonialsGrid) {
    loadTestimonials();
  }

});