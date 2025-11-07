import { animateContentChange } from "../utils/animation.js";
import { renderAcquisitionBar } from "../components/acquisitionBar.js";
export function renderStudentDashboard(userData) {
  injectStyles();
  return `
    <div class="dashboard-container">
      <h1 class="dashboard-title">👋 Bonjour, ${userData.name || 'Élève'}</h1>

      <div class="dashboard-grid">
        <section class="dashboard-section">
          <div class="content">
            <h2><span class="material-icons" style="vertical-align: middle; color: #1976d2;">push_pin</span> Quiz en cours</h2>
            <p>${userData.currentQuiz?.title || 'Aucun quiz en cours.'}</p>
          </div>
          <button onclick="loadQuiz('${userData.currentQuiz?.id || ''}')">Continuer</button>
        </section>

        <section class="dashboard-section">
          <div class="content">
            <h2><span class="material-icons" style="vertical-align: middle; color: #1976d2;">skip_next</span> Quiz suivant</h2>
            <p>${userData.nextQuiz?.title || 'Aucun quiz planifié.'}</p>
          </div>
          <button onclick="loadQuiz('${userData.nextQuiz?.id || ''}')">Prévisualiser</button>
        </section>

        <section class="dashboard-section">
          <div class="content">
            <h2><span class="material-icons" style="vertical-align: middle; color:rgb(181, 173, 11);">trending_up</span> Statistiques</h2>
            <ul>
              <li class="colorized">Quiz terminés : ${userData.stats?.completedQuizzes || 0}</li>
              <li class="colorized">Moyenne : ${userData.stats?.averageScore || '-'}%</li>
              <li class="colorized">Compétences acquises : ${userData.stats?.skillsMastered || 0}</li>
            </ul>
          </div>
        </section>

        <section class="dashboard-section">
          <div class="content">
            <h2><span class="material-icons" style="vertical-align: middle; color:rgb(123, 94, 54);">assignment</span> Derniers quiz passés</h2>
            <ul>
              ${userData.pastQuizzes?.slice(0, 3).map(quiz => `
                <li class="quiz-item">
                  ${quiz.title} - ${quiz.score}% 
                  <button onclick="viewQuizResults('${quiz.id}')">Voir</button>
                </li>
              `).join('') || '<li>Aucun quiz passé</li>'}
            </ul>
          </div>
        </section>
${renderModulesAcquisition(userData)}
        
      </div>
    </div>
  `;
}
export function renderModuleDetails(moduleName) {
  const data = window.userData.stats?.acquisitionPercentage || [];

  // Filtrer uniquement les données du module demandé
  const filtered = data.find(m => m.moduleTitle === moduleName);
  if (!filtered) return `<p>Aucune donnée trouvée pour le module "${moduleName}".</p>`;

  const rows = filtered.stats;

  // Dictionnaire de traduction
  const domainLabels = {
    knowledge: 'Savoirs',
    skills: 'Compétences',
    attitudes: 'Attitudes'
  };

  // Grouper les lignes par domaine
  const grouped = Object.entries(rows).reduce((acc, [domainKey, items]) => {
    if (!items || items.length === 0) return acc;
    acc[domainKey] = items;
    return acc;
  }, {});

  // Génération des lignes HTML avec fusion
  let html = `
    <div style=" margin: 10px 50px; padding-top:100px">
  <button onclick="viewAllStats()" aria-label="Retour" style="height: 40px;background: #6e7a88b8;border: none;cursor: pointer;padding: 8px;width: 40px;position: absolute;border-radius: 50%;left:10px;top: 10px;">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
  </svg>
  </button>
  <h3 style="margin: 0;">Détails des statistiques d'acquisition pour le module : <em>${moduleName}</em></h3>
</div>



    <table class="modern-table">
      <thead>
        <tr>
          <th>Domaine</th>
          <th>Intitulé</th>
          <th>Pourcentage d'acquisition</th>
        </tr>
      </thead>
      <tbody>
  `;

  for (const [domainKey, items] of Object.entries(grouped)) {
    items.forEach((item, index) => {
      html += '<tr>';

      // 1ère colonne fusionnée (rowspan)
      if (index === 0) {
        html += `<td rowspan="${items.length}" style="vertical-align: middle;font-weight: bold;">${domainLabels[domainKey] || domainKey}</td>`;
      }

      const isTotal = item.label === "Total";
      html += `<td><strong>${isTotal ? "Total" : item.label}</strong></td>`;
      html += `<td style="min-width:110px;text-align:center;position:relative">${renderAcquisitionBar(item.percentage !== null ? item.percentage  : 0)}</td>`;

      html += '</tr>';
    });
  }

  html += `</tbody></table>`;
  return html;
}

function renderModulesAcquisition(userData) {
  const modules = userData.stats?.acquisitionPercentage || [];

  return modules.map(mod => {
    const domains = ['knowledge', 'skills', 'attitudes'];
    const domainLabels = {
      knowledge: '🧠 Connaissances',
      skills: '🛠️ Compétences',
      attitudes: '💡 Attitudes'
    };

    const domainBlocks = domains.map(domain => {
      const items = mod.averages?.[domain] ;   
      return `
        <li class="quiz-item" style="position:relative">
          <h4>${domainLabels[domain]}</h4>
          ${renderAcquisitionBar(items !== null ? items  : 0)}
        </li>
      `;
    }).join('');

    return `
     <section class="dashboard-section">
          <div class="content">
            <h2><span class="material-icons" style="vertical-align: middle; color: #E57373;">menu_book</span> ${mod.moduleTitle}</h2>
      <ul>
       ${domainBlocks}
      </ul>
      </div>
      <button onclick="viewModuleStats('${mod.moduleTitle}')">Détails</button>
        </section>
    `;
  }).join('');
}
 window.viewModuleStats= function(moduleName) {
const html=renderModuleDetails(moduleName) 
  animateContentChange(html);   
}
 window.viewAllStats= async function() {
   const res = await fetch(`http://localhost:3001/api/auth/user/?userId=${localStorage.getItem("uid")}&email=${localStorage.getItem("email")}`); // Assure-toi que cette route existe
     userData =await res.json();
const html=renderStudentDashboard(userData) 
  animateContentChange(html);   
}


function injectStyles() {
  if (document.getElementById('studentDashboard-styles')) return; // éviter les doublons

  const style = document.createElement('style');
  style.id = 'studentDashboard-styles';
  style.textContent = `
  .dashboard-container {
  padding: 2rem;
}

.dashboard-title {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.dashboard-section {
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Espace entre contenu et bouton */
  height: 100%; /* ou une hauteur fixe si nécessaire (ex: 400px) */
  padding: 1rem;
  border-radius: 12px;
      background-color: #ffffff;
    box-shadow: 0 2px 18px rgba(0, 0, 0, 0.05);
    position: relative;
}

.dashboard-section .content {
  flex-grow: 1;
}

.dashboard-section button {
  align-self: flex-end; 
  margin-top: 1rem;
  padding: 0.6rem 1.2rem;
  background-color: #607D8B;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.dashboard-section button:hover {
  background-color: rgb(77, 99, 110);
}


.dashboard-section h2 {
  margin-top: 0;
}
.dashboard-section ul {
  list-style: none;
  padding: 1rem;
  margin: 1rem 0;
  background-color: #f9fafb;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  font-family: 'Segoe UI', sans-serif;
  font-size: 1rem;
}

.dashboard-section ul li {
  padding: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 13px;
}

.dashboard-section ul li.colorized:first-child {
  color: #16a34a; /* Vert */
  font-weight: 600;
}

.dashboard-section ul li.colorized:last-child {
  color: #eab308; /* Jaune/orange */
  font-weight: 600;
}
.quiz-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #fff;
  border-radius: 6px;
  margin-bottom: 0.5rem;
}

.quiz-item button {
  padding: 0.4rem;
    background-color: #10b981;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.3s;
    width: 40px;
    margin: .5rem;
}

.quiz-item button:hover {
  background-color: #059669;
}
  table.modern-table {
    width: 80%;
    border-collapse: collapse;
    margin-top: 1rem;
    font-family: 'Segoe UI', sans-serif;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    font-size:13px;
  }

  .modern-table thead {
    background-color: #f5f7fa;
    color: #000;
    font-weight: bold;
  }

  .modern-table th, .modern-table td {
    padding: 12px 16px;
    text-align: left;
    border: 1px solid #e5e7eb;
  }

  .modern-table th {
    font-weight: 600;
    color: #374151;
  }

  .modern-table tbody tr:hover {
    background-color: #f0f4f8;
  }

  .modern-table td {
    color: #374151;
  }

  .modern-table td strong {
    font-weight: 500;
  }

  .modern-table td[colspan] {
    text-align: center;
    font-style: italic;
    background-color: #f9fafb;
  }
  `;
  document.head.appendChild(style);
}