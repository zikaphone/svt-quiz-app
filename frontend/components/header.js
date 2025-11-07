// frontend/components/Header.js

export function renderHeader(user) {
  if (!user) {
    return `
      <div class="header-content">
        <img src="./assets/images/logo.png" alt="Logo" class="app-logo">
        <h1>Bienvenue sur Quiz App</h1>
      </div>
    `;
  }

  return `
    <div class="header-content">
      <div class="header-left">
        <img src="./assets/images/logo.png" alt="Logo" class="app-logo">
        <div class="app-name">Bienvenue sur Quiz App</div>
      </div>
      <div class="header-user">
        <span>Bienvenue, <strong>${user.name}</strong></span>
        <div class="avatar-wrapper">
          <img src="${user.photoURL || './assets/images/default-avatar.png'}" alt="Avatar" class="avatar" id="avatar">
          <div class="dropdown-menu hidden" id="dropdown-menu">
            <p class="name"><strong>${user.name}</strong></p>
            <p class="email">${user.email}</p>
            <hr>
            <a href="#" class="menu-item">
              <span class="material-icons"></span> Mon compte
            </a>
            <a href="javascript:returnToQDashboard()" class="menu-item">
              <span class="material-icons"></span> Liste des quiz
            </a>
            ${user.role === "admin" ? `` : `
              <a href="javascript:viewAllStats()" class="menu-item">
                <span class="material-icons"></span> Mes statistiques
              </a>
            `}
            <a href="#" id="logout-link" class="menu-item logout">
              <span class="material-icons"></span> Se déconnecter
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}

