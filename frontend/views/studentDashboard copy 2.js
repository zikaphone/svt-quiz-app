export function renderStudentDashboard(userData) {
  injectStyles();
  return `
    <div class="dashboard-container">
      <h1 class="dashboard-title">👋 Bonjour, ${userData.name || 'Élève'}</h1>

      <div class="dashboard-grid">
        <section class="dashboard-section">
          <div class="content">
            <h2>📌 Quiz en cours</h2>
            <p>${userData.currentQuiz?.title || 'Aucun quiz en cours.'}</p>
          </div>
          <button onclick="loadQuiz('${userData.currentQuiz?.id || ''}')">Continuer</button>
        </section>

        <section class="dashboard-section">
          <div class="content">
            <h2>⏭️ Quiz suivant</h2>
            <p>${userData.nextQuiz?.title || 'Aucun quiz planifié.'}</p>
          </div>
          <button onclick="loadQuiz('${userData.nextQuiz?.id || ''}')">Prévisualiser</button>
        </section>

        <section class="dashboard-section">
          <div class="content">
            <h2>📈 Statistiques</h2>
            <ul>
              <li class="colorized">Quiz terminés : ${userData.stats?.completedQuizzes || 0}</li>
              <li class="colorized">Moyenne : ${userData.stats?.averageScore || '-'}%</li>
              <li class="colorized">Compétences acquises : ${userData.stats?.skillsMastered || 0}</li>
            </ul>
          </div>
        </section>

        <section class="dashboard-section">
          <div class="content">
            <h2>📚 Derniers quiz passés</h2>
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

         <section class="dashboard-section">
          <div class="content">
            <h2>🎯 Évaluation des acquis</h2>
            ${renderModulesAcquisition(userData)}
          </div>
        </section>
      </div>
    </div>
  `;
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
        <li class="quiz-item">
          <h4>${domainLabels[domain]}</h4>
          ${items}
        </li>
      `;
    }).join('');

    return `
      <ul>
        <h3 class="module-title">📘 ${mod.moduleTitle}</h3>
       ${domainBlocks}
      </ul>
    `;
  }).join('');
}
function renderModulesAcquisitionWithdetails(userData) {
  const modules = userData.stats?.acquisitionPercentage || [];

  return modules.map(mod => {
    const domains = ['knowledge', 'skills', 'attitudes'];
    const domainLabels = {
      knowledge: '🧠 Connaissances',
      skills: '🛠️ Compétences',
      attitudes: '💡 Attitudes'
    };

    const domainBlocks = domains.map(domain => {
      const items = mod.stats?.[domain] || [];
      if (items.length === 0) return '';

      const progressItems = items.map(item => {
        const percent = item.percentage ?? 0;
        return `
          <li class="quiz-item">
            <span class="label">${item.label}</span>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${percent}%; background-color: ${getProgressColor(percent)};"></div>
            </div>
            <span class="percent">${percent}%</span>
          </li>
        `;
      }).join('');

      return `
         <ul>
          <h4>${domainLabels[domain]}</h4>
          ${progressItems}
        </ul>
      `;
    }).join('');

    return `
      <div class="content">
        <h3 class="module-title">📘 ${mod.moduleTitle}</h3>
       ${domainBlocks}
      </div>
    `;
  }).join('');
}
function getProgressColor(percentage) {
  if (percentage >= 80) return '#4CAF50';     // vert
  if (percentage >= 50) return '#FFC107';     // orange
  return '#F44336';                           // rouge
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
  background-color: #f3f4f6;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
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
  `;
  document.head.appendChild(style);
}