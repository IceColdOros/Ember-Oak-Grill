// ============================================================
//  about.js — About Page JavaScript
//  Handles: loading team members from the API
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  const teamGrid = document.getElementById('teamGrid');

  // ── LOAD TEAM MEMBERS ─────────────────────────────────────
  async function loadTeam() {
    try {
      const response = await fetch('/api/team');

      if (!response.ok) throw new Error('Failed to fetch team');

      const members = await response.json();

      // Clear loading spinner
      teamGrid.innerHTML = '';

      if (members.length === 0) {
        teamGrid.innerHTML = '<p style="text-align:center; color:var(--color-mid);">No team members found.</p>';
        return;
      }

      // Render each team member card
      members.forEach(member => {
        teamGrid.appendChild(createTeamCard(member));
      });

    } catch (error) {
      console.error('Error loading team:', error);

      // Fall back to static cards if API fails
      teamGrid.innerHTML = `
        <div class="team-card">
          <div class="team-card-photo"><i class="fa-solid fa-user-tie"></i></div>
          <div class="team-card-body">
            <h3 class="team-card-name">Chef Marco Rossini</h3>
            <p class="team-card-role">Head Chef</p>
            <p class="team-card-bio">Marco brings 15 years of grill mastery to every dish at Ember and Oak.</p>
          </div>
        </div>
        <div class="team-card">
          <div class="team-card-photo"><i class="fa-solid fa-user-tie"></i></div>
          <div class="team-card-body">
            <h3 class="team-card-name">Lisa van Wyk</h3>
            <p class="team-card-role">Restaurant Manager</p>
            <p class="team-card-bio">Lisa ensures every guest leaves with a smile and a full stomach.</p>
          </div>
        </div>
        <div class="team-card">
          <div class="team-card-photo"><i class="fa-solid fa-user-tie"></i></div>
          <div class="team-card-body">
            <h3 class="team-card-name">Sipho Dlamini</h3>
            <p class="team-card-role">Sous Chef</p>
            <p class="team-card-bio">Sipho is the creative force behind our rotating seasonal specials.</p>
          </div>
        </div>
      `;
    }
  }

  // ── CREATE TEAM CARD ──────────────────────────────────────
  function createTeamCard(member) {
    const card = document.createElement('div');
    card.className = 'team-card';

    // Photo or icon placeholder
    const photoHTML = member.photoPath
      ? `<img src="${member.photoPath}" alt="${member.name}"
             onerror="this.parentElement.innerHTML='<i class=\\'fa-solid fa-user-tie\\'></i>'">`
      : `<i class="fa-solid fa-user-tie"></i>`;

    card.innerHTML = `
      <div class="team-card-photo">${photoHTML}</div>
      <div class="team-card-body">
        <h3 class="team-card-name">${member.name}</h3>
        <p class="team-card-role">${member.role || ''}</p>
        <p class="team-card-bio">${member.bio || ''}</p>
      </div>
    `;

    return card;
  }

  // Load team on page load
  if (teamGrid) {
    loadTeam();
  }

});