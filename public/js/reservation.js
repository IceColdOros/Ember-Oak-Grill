// ============================================================
//  reservation.js — Reservation Page JavaScript
//  Handles: form validation, API submission, success display
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ── DOM REFERENCES ────────────────────────────────────────
  const form             = document.getElementById('reservationForm');
  const submitBtn        = document.getElementById('submitBtn');
  const submittingState  = document.getElementById('submittingState');
  const successPanel     = document.getElementById('successPanel');
  const successDetails   = document.getElementById('successDetails');
  const newReservationBtn = document.getElementById('newReservationBtn');

  // Set minimum date to today so users cannot pick a past date
  const dateInput = document.getElementById('date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  // ── VALIDATION RULES ──────────────────────────────────────
  // Each rule has the field ID, its error element ID, and a validate function
  const validationRules = [
    {
      fieldId: 'guestName',
      errorId: 'guestNameError',
      validate: (value) => value.trim().length >= 2,
    },
    {
      fieldId: 'email',
      errorId: 'emailError',
      // Regex checks for basic email format: something@something.something
      validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
    },
    {
      fieldId: 'phone',
      errorId: 'phoneError',
      // Allows formats like: 083 123 4567, 0831234567, +27831234567
      validate: (value) => /^[\d\s\+\-]{9,15}$/.test(value.trim()),
    },
    {
      fieldId: 'date',
      errorId: 'dateError',
      validate: (value) => {
        if (!value) return false;
        // Check date is today or in the future
        const selected = new Date(value);
        const today    = new Date();
        today.setHours(0, 0, 0, 0); // reset time to midnight for fair comparison
        return selected >= today;
      },
    },
    {
      fieldId: 'time',
      errorId: 'timeError',
      validate: (value) => value !== '',
    },
    {
      fieldId: 'partySize',
      errorId: 'partySizeError',
      validate: (value) => value !== '',
    },
  ];

  // ── VALIDATE A SINGLE FIELD ───────────────────────────────
  // Returns true if valid, false if not
  // Also adds/removes CSS error classes and shows/hides error message
  function validateField(rule) {
    const field = document.getElementById(rule.fieldId);
    const error = document.getElementById(rule.errorId);

    if (!field || !error) return true;

    const isValid = rule.validate(field.value);

    if (isValid) {
      field.classList.remove('error');
      error.classList.remove('visible');
    } else {
      field.classList.add('error');
      error.classList.add('visible');
    }

    return isValid;
  }

  // ── VALIDATE ALL FIELDS ───────────────────────────────────
  // Runs every validation rule and returns true only if ALL pass
  function validateAll() {
    let allValid = true;

    validationRules.forEach(rule => {
      const isValid = validateField(rule);
      if (!isValid) allValid = false;
    });

    return allValid;
  }

  // ── LIVE VALIDATION ───────────────────────────────────────
  // Validate each field as the user types/changes it
  // This gives instant feedback rather than waiting for submit
  validationRules.forEach(rule => {
    const field = document.getElementById(rule.fieldId);
    if (!field) return;

    // Use 'input' for text fields and 'change' for selects/date
    const eventType = field.tagName === 'SELECT' || field.type === 'date'
      ? 'change'
      : 'input';

    field.addEventListener(eventType, () => {
      // Only validate if the field has been touched (has a value or was blurred)
      if (field.value !== '') {
        validateField(rule);
      }
    });

    // Also validate on blur (when user clicks away from the field)
    field.addEventListener('blur', () => {
      validateField(rule);
    });
  });

  // ── GENERATE RESERVATION ID ───────────────────────────────
  // Creates a unique ID like RES-1704067200000
  function generateReservationId() {
    return `RES-${Date.now()}`;
  }

  // ── FORMAT DATE FOR DISPLAY ───────────────────────────────
  function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // ── SHOW SUCCESS PANEL ────────────────────────────────────
  function showSuccess(data) {
    // Hide the form
    form.style.display = 'none';

    // Build the booking summary
    successDetails.innerHTML = `
      <p><i class="fa-solid fa-hashtag"></i> <strong>Booking ID:</strong> ${data.reservationId}</p>
      <p><i class="fa-solid fa-user"></i> <strong>Name:</strong> ${data.guestName}</p>
      <p><i class="fa-solid fa-calendar"></i> <strong>Date:</strong> ${formatDate(data.date)}</p>
      <p><i class="fa-solid fa-clock"></i> <strong>Time:</strong> ${data.time}</p>
      <p><i class="fa-solid fa-users"></i> <strong>Guests:</strong> ${data.partySize}</p>
      ${data.specialRequests ? `<p><i class="fa-solid fa-note-sticky"></i> <strong>Requests:</strong> ${data.specialRequests}</p>` : ''}
    `;

    // Show success panel
    successPanel.style.display = 'block';

    // Scroll to success panel
    successPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── RESET FORM ────────────────────────────────────────────
  function resetForm() {
    form.reset();
    form.style.display = 'block';
    successPanel.style.display = 'none';

    // Clear all error states
    validationRules.forEach(rule => {
      const field = document.getElementById(rule.fieldId);
      const error = document.getElementById(rule.errorId);
      if (field) field.classList.remove('error');
      if (error) error.classList.remove('visible');
    });
  }

  // ── FORM SUBMIT ───────────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    // Prevent default browser form submission
    e.preventDefault();

    // Run validation — stop if any field is invalid
    if (!validateAll()) {
      // Scroll to first error
      const firstError = form.querySelector('.form-input.error, .form-select.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      return;
    }

    // Build the reservation data object from form values
    const reservationData = {
      reservationId:   generateReservationId(),
      guestName:       document.getElementById('guestName').value.trim(),
      email:           document.getElementById('email').value.trim(),
      phone:           document.getElementById('phone').value.trim(),
      date:            document.getElementById('date').value,
      time:            document.getElementById('time').value,
      partySize:       parseInt(document.getElementById('partySize').value),
      specialRequests: document.getElementById('specialRequests').value.trim(),
    };

    // Show loading state
    submitBtn.style.display = 'none';
    submittingState.style.display = 'flex';

    try {
      // Send data to the API
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservationData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Reservation failed');
      }

      // Show success panel with booking details
      showSuccess(reservationData);

    } catch (error) {
      console.error('Reservation error:', error);
      alert('Something went wrong. Please try again or call us directly.');

      // Reset button state
      submitBtn.style.display = 'flex';
      submittingState.style.display = 'none';
    }
  });

  // ── NEW RESERVATION BUTTON ────────────────────────────────
  if (newReservationBtn) {
    newReservationBtn.addEventListener('click', resetForm);
  }

});