// ============================================================
//  contact.js — Contact Page JavaScript
//  Handles: loading branches, contact form validation + submit
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ── LOAD BRANCHES ─────────────────────────────────────────
  const branchesGrid = document.getElementById('branchesGrid');

  async function loadBranches() {
    try {
      const response = await fetch('/api/branches');
      if (!response.ok) throw new Error('Failed to fetch branches');

      const branches = await response.json();
      branchesGrid.innerHTML = '';
      branches.forEach(branch => {
        branchesGrid.appendChild(createBranchCard(branch));
      });

    } catch (error) {
      console.error('Error loading branches:', error);

      // Static fallback if API fails
      branchesGrid.innerHTML = `
        <div class="branch-card">
          <div class="branch-card-header">
            <div class="branch-card-icon"><i class="fa-solid fa-location-dot"></i></div>
            <div>
              <h3>Sandton Branch</h3>
              <span class="branch-main-badge">Main Branch</span>
            </div>
          </div>
          <div class="branch-card-body">
            <div class="branch-detail"><i class="fa-solid fa-map-pin"></i><span>12 Maude Street, Sandton, Johannesburg</span></div>
            <div class="branch-detail"><i class="fa-solid fa-phone"></i><span>011 234 5678</span></div>
            <div class="branch-detail"><i class="fa-solid fa-envelope"></i><span>sandton@emberandoak.co.za</span></div>
            <div class="branch-detail"><i class="fa-solid fa-clock"></i><span>Mon–Sun: 11:00 – 22:00</span></div>
          </div>
          <div class="branch-card-footer">
            <a href="#" class="branch-directions-btn"><i class="fa-solid fa-diamond-turn-right"></i> Get Directions <i class="fa-solid fa-arrow-right"></i></a>
          </div>
        </div>
        <div class="branch-card">
          <div class="branch-card-header">
            <div class="branch-card-icon"><i class="fa-solid fa-location-dot"></i></div>
            <div><h3>Rosebank Branch</h3></div>
          </div>
          <div class="branch-card-body">
            <div class="branch-detail"><i class="fa-solid fa-map-pin"></i><span>7 Bath Avenue, Rosebank, Johannesburg</span></div>
            <div class="branch-detail"><i class="fa-solid fa-phone"></i><span>011 987 6543</span></div>
            <div class="branch-detail"><i class="fa-solid fa-envelope"></i><span>rosebank@emberandoak.co.za</span></div>
            <div class="branch-detail"><i class="fa-solid fa-clock"></i><span>Mon–Sun: 10:00 – 22:00</span></div>
          </div>
          <div class="branch-card-footer">
            <a href="#" class="branch-directions-btn"><i class="fa-solid fa-diamond-turn-right"></i> Get Directions <i class="fa-solid fa-arrow-right"></i></a>
          </div>
        </div>
      `;
    }
  }

  // Build a branch card element from branch data
  function createBranchCard(branch) {
    const card = document.createElement('div');
    card.className = 'branch-card';

    const mainBadge = branch.isMainBranch
      ? `<span class="branch-main-badge">Main Branch</span>`
      : '';

    const mapsLink = branch.mapEmbedUrl
      ? branch.mapEmbedUrl.replace('output=embed', 'output=search')
      : '#';

    card.innerHTML = `
      <div class="branch-card-header">
        <div class="branch-card-icon">
          <i class="fa-solid fa-location-dot"></i>
        </div>
        <div>
          <h3>${branch.name}</h3>
          ${mainBadge}
        </div>
      </div>
      <div class="branch-card-body">
        <div class="branch-detail">
          <i class="fa-solid fa-map-pin"></i>
          <span>${branch.address}</span>
        </div>
        <div class="branch-detail">
          <i class="fa-solid fa-phone"></i>
          <span><a href="tel:${branch.phone}">${branch.phone}</a></span>
        </div>
        <div class="branch-detail">
          <i class="fa-solid fa-envelope"></i>
          <span><a href="mailto:${branch.email}">${branch.email}</a></span>
        </div>
        <div class="branch-detail">
          <i class="fa-solid fa-clock"></i>
          <span>${branch.openingHours}</span>
        </div>
      </div>
      <div class="branch-card-footer">
        <a href="${mapsLink}" target="_blank" class="branch-directions-btn">
          <i class="fa-solid fa-diamond-turn-right"></i>
          Get Directions
          <i class="fa-solid fa-arrow-right"></i>
        </a>
      </div>
    `;

    return card;
  }

  if (branchesGrid) loadBranches();

  // ── CONTACT FORM ──────────────────────────────────────────
  const form          = document.getElementById('contactForm');
  const submitBtn     = document.getElementById('contactSubmitBtn');
  const submitting    = document.getElementById('contactSubmitting');
  const successMsg    = document.getElementById('contactSuccess');

  // Validation rules for the contact form
  const rules = [
    {
      fieldId: 'contactName',
      errorId: 'contactNameError',
      validate: v => v.trim().length >= 2,
    },
    {
      fieldId: 'contactEmail',
      errorId: 'contactEmailError',
      validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    },
    {
      fieldId: 'contactSubject',
      errorId: 'contactSubjectError',
      validate: v => v !== '',
    },
    {
      fieldId: 'contactMessage',
      errorId: 'contactMessageError',
      validate: v => v.trim().length >= 10,
    },
  ];

  // Validate a single field and toggle error visibility
  function validateField(rule) {
    const field = document.getElementById(rule.fieldId);
    const error = document.getElementById(rule.errorId);
    if (!field || !error) return true;

    const isValid = rule.validate(field.value);
    field.classList.toggle('error', !isValid);
    error.classList.toggle('visible', !isValid);
    return isValid;
  }

  // Validate all fields — returns true only if all pass
  function validateAll() {
    return rules.map(validateField).every(Boolean);
  }

  // Live validation on input and blur
  rules.forEach(rule => {
    const field = document.getElementById(rule.fieldId);
    if (!field) return;
    const event = field.tagName === 'SELECT' ? 'change' : 'input';
    field.addEventListener(event, () => { if (field.value) validateField(rule); });
    field.addEventListener('blur', () => validateField(rule));
  });

  // Form submit handler
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!validateAll()) {
        // Scroll to first error field
        const firstError = form.querySelector('.error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstError.focus();
        }
        return;
      }

      // Build the payload
      const payload = {
        name:    document.getElementById('contactName').value.trim(),
        email:   document.getElementById('contactEmail').value.trim(),
        subject: document.getElementById('contactSubject').value,
        message: document.getElementById('contactMessage').value.trim(),
      };

      // Show loading state
      submitBtn.style.display = 'none';
      submitting.style.display = 'flex';

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) throw new Error(result.error || 'Submission failed');

        // Show success message and reset form
        form.reset();
        successMsg.classList.add('visible');
        submitting.style.display = 'none';
        submitBtn.style.display = 'flex';

        // Hide success message after 6 seconds
        setTimeout(() => {
          successMsg.classList.remove('visible');
        }, 6000);

      } catch (error) {
        console.error('Contact form error:', error);
        alert('Something went wrong. Please try again or call us directly.');
        submitting.style.display = 'none';
        submitBtn.style.display = 'flex';
      }
    });
  }

});