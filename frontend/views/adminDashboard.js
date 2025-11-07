import { animateContentChange } from "../utils/animation.js";
import { addNewQuiz,deleteQuiz } from "../utils/cruds.js";
import { populateFilters,bindQuestevent, setupAllFilterEvents,filterAndRenderModules,filterAndRenderStreams, updateDependentFilters,  setupQuizFilterEvents,filterAndRenderQuizzes,returnData } from "../utils/filters.js";

export async function renderAdminDashboard(section="quiz") {
  const content =  renderAdminDashboardHtml(window.userData); 
          await animateContentChange(content); 
                    initAdminDashboard(section)
                   
                  }
 function renderAdminDashboardHtml(userData) {
  injectStyles();
   
  return `
   <main class="admin-content" id="admin-content" role="main">
  <!-- QUIZ -->
  <section class="crud-section" id="quiz-section">
    <h3>Gestion des Quiz</h3>
    
    <button class="add-btn" id="add-quiz-btn"><i class="material-icons">add</i> Ajouter un quiz</button>
    <div class="filters">

      <label>Niveau :
        <select class="filter-level" id="quiz-filter-level">
          <option value="">Tous</option>
        </select>
      </label>
      <label>Filière :
        <select class="filter-stream" id="quiz-filter-stream">
          <option value="">Toutes</option>
        </select>
      </label>
      <label>Module :
        <select class="filter-module" id="quiz-filter-module">
          <option value="">Tous</option>
        </select>
      </label>
    </div>
    <table class="data-table" aria-label="Liste des quiz">
      <thead>
        <tr>
          <th>Titre</th>
          <th>Module</th>
          <th>Nb Questions</th>
          <th>Publié</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="quiz-table-body">
        <!-- Données dynamiques -->
      </tbody>
    </table>
  </section>

  <!-- NIVEAUX -->
  <section class="crud-section" id="levels-section" style="display:none">
    <h3>Gestion des Niveaux</h3>
    <button class="add-btn" id="add-level-btn"><i class="material-icons">add</i> Ajouter un niveau</button>
    <table class="data-table" aria-label="Liste des niveaux">
      <thead>
        <tr><th>Nom</th><th>Actions</th></tr>
      </thead>
      <tbody id="level-table-body"></tbody>
    </table>
  </section>

  <!-- FILIÈRES -->
  <section class="crud-section" id="streams-section" style="display:none">
    <h3>Gestion des Filières</h3>
    
    <button class="add-btn" id="add-stream-btn"><i class="material-icons">add</i> Ajouter une filière</button>
    <div class="filters">
      <label>Niveau :
        <select class="filter-level" id="stream-filter-level">
          <option value="">Tous</option>
        </select>
      </label>
    </div>
    <table class="data-table" aria-label="Liste des filières">
      <thead>
        <tr><th>Nom</th><th>Actions</th></tr>
      </thead>
      <tbody id="stream-table-body"></tbody>
    </table>
  </section>

  <!-- MODULES -->
  <section class="crud-section" id="modules-section" style="display:none">
    <h3>Gestion des Modules</h3>
    
    <button class="add-btn" id="add-module-btn"><i class="material-icons">add</i> Ajouter un module</button>
    <div class="filters">
      <label>Niveau :
        <select class="filter-level" id="module-filter-level">
          <option value="">Tous</option>
        </select>
      </label>
      <label>Filière :
        <select  class="filter-stream" id="module-filter-stream">
          <option value="">Toutes</option>
        </select>
      </label>
    </div>
    <table class="data-table" aria-label="Liste des modules">
      <thead>
        <tr>
          <th>Nom</th>
          <th>Niveau</th>
          <th>Filière</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="module-table-body"></tbody>
    </table>
  </section>
</main>

<!-- Modal générique -->
<div class="modal-backdrop" id="modal" style="display:none" role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <div class="modal">
    <div class="modal-header">
      <span id="modal-title">Formulaire</span>
      <button type="button" class="close-btn" id="modal-close-btn" aria-label="Fermer">×</button>
    </div>
    <div class="modal-content">
      <form id="modal-form">
        <!-- Champs dynamiques -->
      </form>
      <div class="modal-buttons">
        <button type="submit" form="modal-form" class="btn-primary" id="modal-save-btn">Enregistrer</button>
        <button type="button" class="btn-secondary" id="modal-cancel-btn">Annuler</button>
      </div>
    </div>
  </div>
</div>

  `;
   // Initialisation
   
}
///// FILTERS

///////////////////////////////


export function initAdminDashboard(selectedSection){
 // Données simulées en mémoire
  
const { levels ,streams ,modules ,quizzes }=returnData()
    // Utilitaires
    function generateId(prefix = 'id') {
      return prefix + Math.random().toString(36).substring(2, 9);
    }

    // Sélection éléments UI
    const sections = ['quiz', 'levels', 'streams', 'modules'];
    const adminContent = document.getElementById('admin-content');
    const sidebarButtons = document.querySelectorAll('.admin-sidebar nav button');
    const modal = document.getElementById('modal');
    const modalForm = document.getElementById('modal-form');
    const modalTitle = document.getElementById('modal-title');
    const modalSaveBtn = document.getElementById('modal-save-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');

    // Table bodies
    const quizTableBody = document.getElementById('quiz-table-body');
    const levelTableBody = document.getElementById('level-table-body');
    const streamTableBody = document.getElementById('stream-table-body');
    const moduleTableBody = document.getElementById('module-table-body');

    // Section elements
    const sectionEls = {
      quiz: document.getElementById('quiz-section'),
      levels: document.getElementById('levels-section'),
      streams: document.getElementById('streams-section'),
      modules: document.getElementById('modules-section'),
    };

    // Current context for modal: {type, mode, id}
    let currentContext = null;

    // Affiche une section et cache les autres
    function showSection(section) {
      sections.forEach(sec => {
        sectionEls[sec].style.display = (sec === section) ? 'flex' : 'none';
      });
      sidebarButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === section);
      });
      // Recharger le contenu du tableau
      switch(section) {
        case 'quiz': renderQuizTable(); break;
        case 'levels': renderLevelTable(); break;
        case 'streams': renderStreamTable(); break;
        case 'modules': renderModuleTable(); break;
      }
    }

    // ================== RENDER TABLES ======================

    // Récupère nom module par id
    function getModuleNameById(id) {
      const m = modules.find(m => m.id === id);
      return m ? m.name : '—';
    }
    // Récupère nom niveau par id
    function getLevelNameById(id) {
      const l = levels.find(l => l.id === id);
      return l ? l.name : '—';
    }
    // Récupère nom filière par id
    function getStreamNameById(id) {
      const s = streams.find(s => s.id === id);
      return s ? s.name : '—';
    }

    // Quiz table
    function renderQuizTable() {
      const { quizzes }=returnData()
      quizTableBody.innerHTML = '';
      if (quizzes.length === 0) {
        quizTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#888;">Aucun quiz</td></tr>`;
        return;
      }
      quizzes.forEach(q => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${q.title}</td>
          <td>${getModuleNameById(q.moduleId)}</td>
          <td><i>${q.questionCount}</i> (<a href="#" class="add-question-link" data-id="${q.id}" style="margin-left: 8px; color: green;">Ajouter</a>) </td>
          <td>${q.published ? 'Oui' : 'Non'}</td>
          <td style="text-align: center;width: 200px;">
            <button class="edit-btn" data-id="${q.id}" data-type="quiz"><i class="material-icons">edit</i></button>
            <button class="delete-btn" data-id="${q.id}" data-type="quiz"><i class="material-icons">delete</i></button>
          </td>
        `;
        quizTableBody.appendChild(tr);
        bindQuestevent()
      });
    }

    // Niveaux
    function renderLevelTable() {
      levelTableBody.innerHTML = '';
      if (levels.length === 0) {
        levelTableBody.innerHTML = `<tr><td colspan="2" style="text-align:center; color:#888;">Aucun niveau</td></tr>`;
        return;
      }
      levels.forEach(l => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${l.name}</td>
           <td style="text-align: center;width: 200px;">
            <button class="edit-btn" data-id="${l.id}" data-type="level"><i class="material-icons">edit</i></button>
            <button class="delete-btn" data-id="${l.id}" data-type="level"><i class="material-icons">delete</i></button>
          </td>
        `;
        levelTableBody.appendChild(tr);
      });
    }

    // Filières
    function renderStreamTable() {
      streamTableBody.innerHTML = '';
      if (streams.length === 0) {
        streamTableBody.innerHTML = `<tr><td colspan="2" style="text-align:center; color:#888;">Aucune filière</td></tr>`;
        return;
      }
      streams.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${s.name}</td>
           <td style="text-align: center;width: 200px;">
            <button class="edit-btn" data-id="${s.id}" data-type="stream"><i class="material-icons">edit</i></button>
            <button class="delete-btn" data-id="${s.id}" data-type="stream"><i class="material-icons">delete</i></button>
          </td>
        `;
        streamTableBody.appendChild(tr);
      });
    }

    // Modules
    function renderModuleTable() {
      moduleTableBody.innerHTML = '';
      if (modules.length === 0) {
        moduleTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#888;">Aucun module</td></tr>`;
        return;
      }
      modules.forEach(m => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${m.name}</td>
          <td>${getLevelNameById(m.levelId)}</td>
          <td>${getStreamNameById(m.streamId)}</td>
           <td style="text-align: center;width: 200px;">
            <button class="edit-btn" data-id="${m.id}" data-type="module"><i class="material-icons">edit</i></button>
            <button class="delete-btn" data-id="${m.id}" data-type="module"><i class="material-icons">delete</i></button>
          </td>
        `;
        moduleTableBody.appendChild(tr);
      });
    }

    // =================== MODAL FORM ========================

    // Ouvre le modal pour ajouter ou éditer
      function  openModal(type, mode, id = null) {
      currentContext = { type, mode, id };
      modalForm.innerHTML = '';
      modalTitle.textContent = (mode === 'add' ? 'Ajouter ' : 'Modifier ') + {
        quiz: 'un quiz',
        level: 'un niveau',
        stream: 'une filière',
        module: 'un module'
      }[type];
      // Créer champs selon le type
      if (type === 'level' || type === 'stream') {
        modalForm.innerHTML = `
          <label for="name-input">Nom :</label>
          <input type="text" id="name-input" name="name" required minlength="2" maxlength="50" />
        `;
      } else if (type === 'module') {
        // Pour module : nom + niveau + filière
        modalForm.innerHTML = `
          <label for="name-input">Nom :</label>
          <input type="text" id="name-input" name="name" required minlength="2" maxlength="50" />
          <label for="level-select">Niveau :</label>
          <select id="level-select" name="levelId" required>
            <option value="">-- Sélectionner --</option>
            ${levels.map(l => `<option value="${l.id}">${l.name}</option>`).join('')}
          </select>
          <label for="stream-select">Filière :</label>
          <select id="stream-select" name="streamId" required>
            <option value="">-- Sélectionner --</option>
            ${streams.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
          </select>
        `;
      } else if (type === 'quiz') {
  const { levels, streams, modules } = returnData();

  modalForm.innerHTML = `
    <label for="title-input">Titre :</label>
    <input type="text" id="title-input" name="title" required minlength="2" maxlength="100" />

    <label for="quiz-level-select">Niveau :</label>
    <select id="quiz-level-select" required>
      <option value="">-- Sélectionner un niveau --</option>
      ${levels.map(lvl => `<option value="${lvl.id}">${lvl.name}</option>`).join('')}
    </select>

    <label for="quiz-stream-select">Filière :</label>
    <select id="quiz-stream-select" required disabled>
      <option value="">-- Sélectionner une filière --</option>
    </select>

    <label for="quiz-module-select">Module :</label>
    <select id="quiz-module-select" name="moduleId" required disabled>
      <option value="">-- Sélectionner un module --</option>
    </select>

    <label for="published-checkbox">Publié :</label>
    <input type="checkbox" id="published-checkbox" name="published" />
  `;

  // ⚙️ Ajout dynamique des filtres dépendants
  const levelSelect = modalForm.querySelector('#quiz-level-select');
  const streamSelect = modalForm.querySelector('#quiz-stream-select');
  const moduleSelect = modalForm.querySelector('#quiz-module-select');

  levelSelect.addEventListener('change', () => {
    const selectedLevel = levelSelect.value;

    // 🔄 Mise à jour des filières
    const filteredStreams = streams.filter(str => str.levelId === selectedLevel);
    streamSelect.innerHTML = '<option value="">-- Sélectionner une filière --</option>';
    filteredStreams.forEach(str => {
      const opt = document.createElement('option');
      opt.value = str.id;
      opt.textContent = str.name;
      streamSelect.appendChild(opt);
    });
    streamSelect.disabled = false;

    // Réinitialiser modules
    moduleSelect.innerHTML = '<option value="">-- Sélectionner un module --</option>';
    moduleSelect.disabled = true;
  });

  streamSelect.addEventListener('change', () => {
    const selectedLevel = levelSelect.value;
    const selectedStream = streamSelect.value;

    // 🔄 Mise à jour des modules
    const filteredModules = modules.filter(mod => 
      mod.levelId === selectedLevel && mod.streamId === selectedStream
    );
    moduleSelect.innerHTML = '<option value="">-- Sélectionner un module --</option>';
    filteredModules.forEach(mod => {
      const opt = document.createElement('option');
      opt.value = mod.id;
      opt.textContent = mod.name;
      moduleSelect.appendChild(opt);
    });
    moduleSelect.disabled = false;
  });
}


      // Si mode edit, préremplir les données
      if (mode === 'edit' && id) {
        let item;
        if (type === 'level') item = levels.find(l => l.id === id);
        else if (type === 'stream') item = streams.find(s => s.id === id);
        else if (type === 'module') item = modules.find(m => m.id === id);
        else if (type === 'quiz') item = quizzes.find(q => q.id === id);
        if (item) {
          if (type === 'level' || type === 'stream') {
            modalForm.elements['name'].value = item.name;
          } else if (type === 'module') {
            modalForm.elements['name'].value = item.name;
            modalForm.elements['levelId'].value = item.levelId;
            modalForm.elements['streamId'].value = item.streamId;
          } else if (type === 'quiz') {
            modalForm.elements['title'].value = item.title;
            modalForm.elements['moduleId'].value = item.moduleId;
            modalForm.elements['questionCount'].value = item.questionCount;
            modalForm.elements['published'].checked = item.published;
          }
        }
      }
      modal.style.display = 'flex';
      modalSaveBtn.focus();
      modalForm.addEventListener('submit', async e => {
      e.preventDefault();
      if (!currentContext) return;

      const formData = new FormData(modalForm);
      const data = Object.fromEntries(formData.entries());

      // Correction type pour checkbox published
      if (currentContext.type === 'quiz') {
        data.published = modalForm.elements['published'].checked;
        data.questionCount = Number(data.questionCount);
      }

      if (currentContext.mode === 'add') {
        // Créer nouvel objet
        const newItem = { id: generateId(currentContext.type.substring(0,3)) };
        if (currentContext.type === 'level' || currentContext.type === 'stream') {
          newItem.name = data.name.trim();
          if (!newItem.name) {
            alert('Le nom est requis.');
            return;
          }
        } else if (currentContext.type === 'module') {
          newItem.name = data.name.trim();
          newItem.levelId = data.levelId;
          newItem.streamId = data.streamId;
          if (!newItem.name || !newItem.levelId || !newItem.streamId) {
            alert('Tous les champs sont requis.');
            return;
          }
        } else if (currentContext.type === 'quiz') {
          newItem.title = data.title.trim();
          newItem.moduleId = data.moduleId;
          newItem.published = data.published;
          if (!newItem.title || !newItem.moduleId ) {
            alert('Tous les champs sont requis.');
            return;
          }
        }
        // Ajouter à la liste
        console.log(newItem)
        if (currentContext.type === 'level') levels.push(newItem);
        else if (currentContext.type === 'stream') streams.push(newItem);
        else if (currentContext.type === 'module') modules.push(newItem);
        else if (currentContext.type === 'quiz')  {await addNewQuiz(newItem)};
      } else if (currentContext.mode === 'edit' && currentContext.id) {
        // Modifier existant
        let list = null;
        if (currentContext.type === 'level') list = levels;
        else if (currentContext.type === 'stream') list = streams;
        else if (currentContext.type === 'module') list = modules;
        else if (currentContext.type === 'quiz') list = quizzes;

        if (list) {
          const idx = list.findIndex(i => i.id === currentContext.id);
          if (idx !== -1) {
            if (currentContext.type === 'level' || currentContext.type === 'stream') {
              list[idx].name = data.name.trim();
            } else if (currentContext.type === 'module') {
              list[idx].name = data.name.trim();
              list[idx].levelId = data.levelId;
              list[idx].streamId = data.streamId;
            } else if (currentContext.type === 'quiz') {
              list[idx].title = data.title.trim();
              list[idx].moduleId = data.moduleId;
              list[idx].questionCount = data.questionCount;
              list[idx].published = data.published;
            }
          }
        }
      }
     
      // Rafraîchir la table selon le contexte
      switch(currentContext.type) {
        case 'quiz': renderQuizTable(); break;
        case 'level': renderLevelTable(); break;
        case 'stream': renderStreamTable(); break;
        case 'module': renderModuleTable(); break;
      }
       closeModal();
    });
     // Annuler modal
    modalCancelBtn.addEventListener('click', e => {
      e.preventDefault();
      closeModal();
    });
    }

    // Fermer modal
    function closeModal() {
      modal.style.display = 'none';
      modal.querySelector('.modal').classList.remove("special-modal");
      currentContext = null;
    }
document.getElementById('modal-close-btn').onclick =
document.getElementById('modal-cancel-btn').onclick = function () {
   document.getElementById('modal').querySelector('.modal').classList.remove("special-modal");
  document.getElementById('modal').style.display = 'none';
};
    // ================== CRUD OPERATIONS =====================

    // Ajouter ou modifier élément
    

   

    // Supprimer élément
    async function deleteItem(type, id) {
      if (!confirm('Confirmer la suppression ?')) return;
      let list = null;
      if (type === 'level') list = levels;
      else if (type === 'stream') list = streams;
      else if (type === 'module') list = modules;
      else if (type === 'quiz') {list = quizzes; await deleteQuiz(id);renderQuizTable()}

      if (list) {
        const idx = list.findIndex(i => i.id === id);
        if (idx !== -1) {
          list.splice(idx, 1);
          // Si module supprimé, supprimer aussi les quiz liés
          if (type === 'module') {
            quizzes = quizzes.filter(q => q.moduleId !== id);
           
          }
        }
      }
      // Rafraîchir la table selon le type
      switch(type) {
        case 'quiz': renderQuizTable(); break;
        case 'level': renderLevelTable(); break;
        case 'stream': renderStreamTable(); break;
        case 'module': renderModuleTable(); break;
      }
    }

    // =================== EVENTS ========================

    // Sidebar navigation
    sidebarButtons.forEach(btn => {
      btn.addEventListener('click', async() => {
        renderAdminDashboard(btn.dataset.section); 
      });
    });

    // Boutons ajouter
    document.getElementById('add-level-btn').addEventListener('click', () => openModal('level', 'add'));
    document.getElementById('add-stream-btn').addEventListener('click', () => openModal('stream', 'add'));
    document.getElementById('add-module-btn').addEventListener('click', () => openModal('module', 'add'));
    document.getElementById('add-quiz-btn').addEventListener('click', () => openModal('quiz', 'add'));

    // Délégation des boutons éditer et supprimer dans les tables
    adminContent.addEventListener('click', e => {
      if (e.target.classList.contains('edit-btn')) {
        const id = e.target.dataset.id;
        const type = e.target.dataset.type;
        openModal(type, 'edit', id);
      } else if (e.target.classList.contains('delete-btn')) {
        const id = e.target.dataset.id;
        const type = e.target.dataset.type;
        deleteItem(type, id);
      }
    });
    //init
     showSection(selectedSection);
       populateFilters();
  setupAllFilterEvents();
  filterAndRenderQuizzes();
  filterAndRenderModules();
  filterAndRenderStreams();
  bindQuestevent()
  }
///traitement spe pour ajout question

/////////////////

function injectStyles() {
  if (document.getElementById('adminDashboard-styles')) return; // éviter les doublons

  const style = document.createElement('style');
  style.id = 'adminDashboard-styles';
  style.textContent = `
   .admin-sidebar {
     width: 100%;
         height: 100%;
      background: #1e293b;
      color: white;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      border-right: 2px solid #ccc;
      user-select: none;
    }

    .admin-sidebar h2 {
     align-self: flex-start;
    width: unset;
    margin: 4px;
    padding: 6px 10px;
    border: none;
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    letter-spacing: 1px;
    color: #fff;
    }
.admin-sidebar h2 .material-icons {
  font-size: 24px;
}
    .admin-sidebar nav button {
      background: none;
      border: none;
      color: white;
      font-size: 1rem;
      font-weight: normal;
      text-align: left;
      padding: 0.7rem 1rem;
      cursor: pointer;
      transition: background 0.2s;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: .3rem;
    }

    .admin-sidebar nav button svg {
      width: 20px;
      height: 20px;
      fill: white;
    }

    .admin-sidebar nav button:hover,
    .admin-sidebar nav button.active {
      background: #334155;
    }

    /* Main content */
    .admin-content {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
      width:100%;
      height:100%;
    }

    .crud-section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
      min-height: 70vh;
      display: flex;
      flex-direction: column;
    }

    .crud-section h3 {
      margin-top: 0;
      font-size: 1.8rem;
      margin-bottom: 1rem;
      color: #1e293b;
    }
.material-icons {
  font-size: 1rem;
  pointer-events: none;
}
    .add-btn {
      background-color: rgb(31, 159, 9);
    color: white;
    font-weight: 600;
    align-self: flex-start;
    width: unset;
    margin: 4px;
    padding: 6px 10px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: background-color 0.2s ease;
    }
    .add-btn:hover {
      background-color: rgb(23, 97, 10);
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
      overflow: auto;
    }

    .data-table th,
    .data-table td {
      border: 1px solid #ddd;
      padding: 0.75rem 1rem;
      text-align: left;
      vertical-align: middle;
    }

    .data-table th {
      background-color: #f1f5f9;
      font-weight: 700;
      color: #334155;
      top: 0;
      z-index: 1;
    }

    .data-table td button {
      background-color: transparent;
      color: white;
      border: none;
      padding: 0.3rem 0.7rem;
      border-radius: 6px;
      margin-right: 0.3rem;
      cursor: pointer;
      font-size: 0.9rem;
          width: unset;

      transition: background-color 0.3s;
    }

    .data-table td button.edit-btn {
      color:rgb(170, 170, 170);
    }
    .data-table td button.edit-btn:hover {
      color: rgb(115, 115, 115);
    }
    .data-table td button.delete-btn {
      color: #dc2626;
    }
    .data-table td button.delete-btn:hover {
      color: #a21e1e;
    }

   /* Backdrop */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 20000;
}

/* Fenêtre */
.modal {
  background: #f8fafc;
  width: 460px;
  max-width: 95vw;
  border: 1px solid #94a3b8;
  border-radius: 6px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  font-family: system-ui, sans-serif;
  overflow: hidden;
  position: relative;
}

/* Barre d’en-tête */
.modal-header {
  background: #e2e8f0;
    padding: 0.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #cbd5e1;
    font-weight: bold;
    color: #1e293b;
    font-size: 1rem;
}

/* Bouton fermer */
.close-btn {
  background: transparent;
  border: none;
  border-radius: 0px;
  font-size: 1.2rem;
  color: #334155;
  cursor: pointer;
  transition: color 0.2s;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
color:#fff;
  background-color: #ef4444;
}

/* Contenu */
.modal-content {
  padding: 1.5rem;
}

/* Formulaire */
.modal-content form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-content form label {
  font-weight: 600;
  color: #334155;
}

.modal-content form input,
.modal-content form select {
  padding: 0.5rem 0.75rem;
    border: 1.5px solid #cbd5e1;
    border-radius: 4px;
    font-size: 13px;
    transition: border-color 0.3s;
    margin: 0px;
}
.modal-content form input:focus,
.modal-content form select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 5px #2563eb88;
}

/* Boutons */
.modal-buttons {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.btn-secondary {
  background-color: #e2e8f0;
  color: #1e293b;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
}
.btn-secondary:hover {
  background-color: #cbd5e1;
}


   

    .btn-secondary {
      background-color: #64748b;
      border: none;
      color: white;
      padding: 0.5rem 1.2rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    .btn-secondary:hover {
      background-color: #475569;
    }

    /* Responsive */
    @media (max-width: 600px) {
      .admin-dashboard {
        flex-direction: column;
      }
      .admin-sidebar {
        width: 100%;
        display: flex;
        overflow-x: auto;
        padding: 0.5rem;
        border-right: none;
        border-bottom: 2px solid #ccc;
      }
      .admin-sidebar nav button {
        flex: 1;
        text-align: center;
        font-size: 1rem;
        padding: 0.5rem 0;
      }
      .admin-content {
        padding: 1rem;
        height: calc(100vh - 60px);
      }
    }
    .filters {
  padding: 6px 10px;
  margin: 0 10px 0px 0;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #f9f9f9;
  transition: border-color 0.2s, box-shadow 0.2s;
  text-align:right
}

.filters:focus {
  border-color: #4CAF50;
  box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
}
.filter-level{
max-width:200px;
min-width:200px
}
.filter-stream{
max-width:250px;
min-width:250px
}
.filter-module{
max-width:350px;
min-width:350px
}
.choices-container{
max-height: 220px;
    overflow-y: auto;
}
.special-modal{
    width: 50vw!important;
    max-width: 95vh!important;
}
    .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }

  .form-grid label {
    font-weight: bold;
  }

  .full-width {
    grid-column: 1 / -1;
  }

  select[multiple], input[type="text"], input[type="number"], select {
    width: 100%;
    box-sizing: border-box;
  }

  #choices-container, #correct-answer-container {
    grid-column: 1 / -1;
  }
  `;
  document.head.appendChild(style);
}