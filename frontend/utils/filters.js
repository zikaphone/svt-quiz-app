import {saveQuestionToQuiz} from "./cruds.js"
export function populateFilters() {
  const { levels } = returnData();

  // Appliquer les niveaux à tous les sélecteurs liés aux niveaux
  const levelSelects = document.querySelectorAll(
    '#quiz-filter-level, #stream-filter-level, #module-filter-level'
  );

  levelSelects.forEach(select => {
    levels.forEach(lvl => {
      const opt = document.createElement('option');
      opt.value = lvl.id;
      opt.textContent = lvl.name;
      select.appendChild(opt);
    });
  });

  // Démarrage initial : remplir les dépendants une fois
  updateAllDependentFilters();
}
export function updateAllDependentFilters() {
  updateQuizDependentFilters();
  updateModuleDependentFilters();
}
export function updateModuleDependentFilters() {
  const { streams } = returnData();
  const levelId = document.getElementById('module-filter-level').value;

  const streamSelect = document.getElementById('module-filter-stream');
  streamSelect.innerHTML = '<option value="">--Toutes les filières--</option>';

  const filteredStreams = streams.filter(s => !levelId || s.levelId === levelId);
  filteredStreams.forEach(str => {
    const opt = document.createElement('option');
    opt.value = str.id;
    opt.textContent = str.name;
    streamSelect.appendChild(opt);
  });
}
export function setupAllFilterEvents() {
  // Quiz
  document.getElementById('quiz-filter-level').addEventListener('change', () => {
    updateQuizDependentFilters();
    filterAndRenderQuizzes();
  });
  document.getElementById('quiz-filter-stream').addEventListener('change', () => {
    updateQuizDependentFilters();
    filterAndRenderQuizzes();
  });
  document.getElementById('quiz-filter-module').addEventListener('change', filterAndRenderQuizzes);

  // Streams (niveau seulement)
  document.getElementById('stream-filter-level').addEventListener('change', filterAndRenderStreams);

  // Modules
  document.getElementById('module-filter-level').addEventListener('change', () => {
    updateModuleDependentFilters();
    filterAndRenderModules();
  });
  document.getElementById('module-filter-stream').addEventListener('change', filterAndRenderModules);
}
export function filterAndRenderModules() {
  const levelId = document.getElementById('module-filter-level').value;
  const streamId = document.getElementById('module-filter-stream').value;
  const { modules, levels, streams } = returnData();

  const filtered = modules.filter(mod =>
    (!levelId || mod.levelId === levelId) &&
    (!streamId || mod.streamId === streamId)
  );

  const tbody = document.getElementById('module-table-body');
  tbody.innerHTML = '';
  filtered.forEach(mod => {
    const lvl = levels.find(l => l.id === mod.levelId);
    const str = streams.find(s => s.id === mod.streamId);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${mod.name}</td>
      <td>${lvl ? lvl.name : '---'}</td>
      <td>${str ? str.name : '---'}</td>
      <td>
        <button class="edit-btn" data-id="${mod.id}" data-type="module"><i class="material-icons">edit</i></button>
        <button class="delete-btn" data-id="${mod.id}" data-type="module"><i class="material-icons">delete</i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

export function filterAndRenderStreams() {
  const levelId = document.getElementById('stream-filter-level').value;
  const { streams, levels } = returnData();

  const filtered = streams.filter(str => !levelId || str.levelId === levelId);

  const tbody = document.getElementById('stream-table-body');
  tbody.innerHTML = '';
  filtered.forEach(str => {
    const lvl = levels.find(l => l.id === str.levelId);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${str.name}</td>
      <td>
        <button class="edit-btn" data-id="${str.id}" data-type="stream"><i class="material-icons">edit</i></button>
        <button class="delete-btn" data-id="${str.id}" data-type="stream"><i class="material-icons">delete</i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

export function updateDependentFilters() {
  const { levels, streams, modules } = returnData();

  const levelId = document.getElementById('quiz-filter-level').value;
  const streamId = document.getElementById('quiz-filter-stream').value;

  const streamSelect = document.getElementById('quiz-filter-stream');
  const moduleSelect = document.getElementById('quiz-filter-module');

  // Reset les sélecteurs
  streamSelect.innerHTML = '<option value="">--Toutes les filières--</option>';
  moduleSelect.innerHTML = '<option value="">--Tous les modules--</option>';

  // ✅ Filières compatibles avec le niveau sélectionné
  const filteredStreams = streams.filter(s => s.levelId === levelId);
  filteredStreams.forEach(str => {
    const opt = document.createElement('option');
    opt.value = str.id;
    opt.textContent = str.name;
    streamSelect.appendChild(opt);
  });

  // ✅ Modules compatibles avec niveau et filière
  const filteredModules = modules.filter(mod => {
    return (!levelId || mod.levelId === levelId) &&
           (!streamId || mod.streamId === streamId);
  });

  filteredModules.forEach(mod => {
    const opt = document.createElement('option');
    opt.value = mod.id;
    opt.textContent = mod.name;
    moduleSelect.appendChild(opt);
  });
}
export function setupQuizFilterEvents() {
  document.getElementById('quiz-filter-level').addEventListener('change', () => {
    updateDependentFilters();
    filterAndRenderQuizzes();
  });

  document.getElementById('quiz-filter-stream').addEventListener('change', () => {
    updateDependentFilters();
    filterAndRenderQuizzes();
  });

  document.getElementById('quiz-filter-module').addEventListener('change', () => {
    filterAndRenderQuizzes();
  });
}

export function filterAndRenderQuizzes() {
  const levelId = document.getElementById('quiz-filter-level').value;
  const streamId = document.getElementById('quiz-filter-stream').value;
  const moduleId = document.getElementById('quiz-filter-module').value;

  const { quizzes, modules, levels, streams } = returnData();
  let filteredQuizzes = quizzes.filter(qz => {
    const mod = modules.find(m => m.id === qz.moduleId);
    if (!mod) return false;

    const matchLevel = !levelId || mod.levelId === levelId;
    const matchStream = !streamId || mod.streamId === streamId;
    const matchModule = !moduleId || mod.id === moduleId;

    return matchLevel && matchStream && matchModule;
  });

  const tbody = document.getElementById('quiz-table-body');
  tbody.innerHTML = ''; // clear

   filteredQuizzes.forEach(qz => {
    const mod = modules.find(m => m.id === qz.moduleId);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${qz.title}</td>
      <td>${mod ? mod.name : '---'}</td>
      <td><i>${qz.questionCount}</i> (<a href="#" class="add-question-link" data-id="${qz.id}" style="margin-left: 8px; color: green;">Ajouter</a>)</td>
      <td>${qz.published ? 'Oui' : 'Non'}</td>
      <td>
      
        <button class="edit-btn" data-id="${qz.id}" data-type="quiz"><i class="material-icons">edit</i></button>
        <button class="delete-btn" data-id="${qz.id}" data-type="quiz"><i class="material-icons">delete</i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  bindQuestevent()
}
export function returnData(){
   let levels = [];
let streams = [];
let modules = [];
let quizzes = [];

window.all.forEach((levelItem, levelIndex) => {
  // Ajouter le niveau
  levels.push({ id: levelItem.id, name: levelItem.title });

  levelItem.streams.forEach((streamItem, streamIndex) => {
    streams.push({ id: streamItem.id, name: streamItem.title, levelId:levelItem.id });

    streamItem.modules.forEach((moduleItem, moduleIndex) => {
      modules.push({
        id: moduleItem.id,
        name: moduleItem.title,
        levelId:levelItem.id,
        streamId:streamItem.id
      });

      moduleItem.quizzes.forEach((quizItem, quizIndex) => {
        quizzes.push({
          id: quizItem.id,
          title: quizItem.title,
          moduleId:moduleItem.id,
          questionCount: quizItem.questions.length,
          published: quizItem.published
        });
      });
    });
  });
});
return { levels ,streams ,modules ,quizzes }
}
export function updateQuizDependentFilters() {
  const { streams, modules } = returnData();

  const levelId = document.getElementById('quiz-filter-level').value;
  const streamId = document.getElementById('quiz-filter-stream').value;
const prevStreamId = document.getElementById('quiz-filter-stream').value;
  const streamSelect = document.getElementById('quiz-filter-stream');
  const moduleSelect = document.getElementById('quiz-filter-module');

  // Reset
  streamSelect.innerHTML = '<option value="">--Toutes les filières--</option>';
  moduleSelect.innerHTML = '<option value="">--Tous les modules--</option>';

  // Filières par niveau
  const filteredStreams = streams.filter(s => !levelId || s.levelId === levelId);
  filteredStreams.forEach(str => {
    const opt = document.createElement('option');
    opt.value = str.id;
    opt.textContent = str.name;
    streamSelect.appendChild(opt);
  });
 if (filteredStreams.some(s=> s.id === prevStreamId) && levelId!="" ) {
    streamSelect.value = prevStreamId;
  }
  // Modules par niveau + filière
  const { modules: allModules } = returnData();
  const filteredModules = allModules.filter(mod =>
    (!levelId || mod.levelId === levelId) &&
    (!streamId || mod.streamId === streamId)
  );

  filteredModules.forEach(mod => {
    const opt = document.createElement('option');
    opt.value = mod.id;
    opt.textContent = mod.name;
    moduleSelect.appendChild(opt);
  });
}
export function bindQuestevent(){
document.querySelectorAll('.add-question-link').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    const quizId = this.dataset.id;
    openAddQuestionModal(quizId,this);
  });

function openAddQuestionModal(quizId,caller) {
 const counter=caller.previousSibling;
  const modal = document.getElementById('modal');
  modal.querySelector('.modal').classList.add("special-modal");
  const modalTitle = document.getElementById('modal-title');
  const modalForm = document.getElementById('modal-form');
 const modalSaveBtn = document.getElementById('modal-save-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
  modalTitle.textContent = "Ajouter une question";
  modalForm.innerHTML = `
      <div class="form-grid" style="max-height: 500px;overflow-y:auto;font-size: 12px!important;">
        <!-- Énoncé -->
        <label class="full-width" for="question-text">Énoncé de la question :</label>
        <input class="full-width" type="text" id="question-text" name="text" required />
<div>
        <!-- Difficulté -->
        <label for="difficulty">Difficulté :</label>
        <select id="difficulty" name="difficulty" required>
          <option value="">-- Choisir --</option>
          <option value="0">A (Très facile)</option>
          <option value="1">B (Facile)</option>
          <option value="2">C (Moyen)</option>
          <option value="3">D (Difficile)</option>
        </select>

        <!-- Type -->
        </div>
        <div>
        <label for="question-type">Type de question :</label>
        <select id="question-type" name="type" required>
          <option value="">-- Sélectionner --</option>
          <option value="2">QCM</option>
          <option value="1">Vrai / Faux</option>
        </select>
</div>
        <!-- Nombre de choix -->
        <div id="choices-config" class="full-width" style="display: none;">
          <label for="choice-count">Nombre de choix :</label>
          <input type="number" id="choice-count" min="2" max="6" value="4" />
        </div>

        <!-- Réponse correcte -->
        <div id="correct-answer-container" class="full-width">
          <label for="correct-answer">Réponse correcte :</label>
          <input type="text" id="correct-answer" name="correctAnswer" required />
        </div>

        <!-- Choix (dynamiques) -->
        <div id="choices-container" class="full-width"></div>

        <!-- Sélections multiples -->
        <div>
        <label for="skills">Compétences ciblées :</label>
        <select id="skills" name="cibledSkillsIndexes" multiple>
        </select>
        </div>
        <div>
        <label for="knowledge">Savoirs ciblés :</label>
        <select id="knowledge" name="cibledKnowledgeIndexes" multiple>

        </select>
</div>
        <div>
        <label for="attitudes">Attitudes ciblées :</label>
        <select id="attitudes" name="cibledAttitudesIndexs" multiple>

        </select>
</div>
        <div>
        <label for="prerequisites">Prérequis :</label>
        <select id="prerequisites" name="prerequisitesIndexes" multiple>
        </select>
        </div>
      </div>

    
  

  `;
  let data=skillsByQuizId(quizId);
  populateMultiSelect('skills', data.skills);
populateMultiSelect('knowledge', data.knowledge);
populateMultiSelect('attitudes', data.attitudes);
populateMultiSelect('prerequisites', data.prerequisites);
document.getElementById("question-type").addEventListener("change", (e) => {
  const type = e.target.value;
  const choicesConfig = document.getElementById("choices-config");
  const choicesContainer = document.getElementById("choices-container");

  if (type === "2") {
    choicesConfig.style.display = "block";
    generateChoiceInputs(parseInt(document.getElementById("choice-count").value || 4));
  } else if (type === "1") {
    choicesConfig.style.display = "none";
    generateVFInputs();
  } else {
    choicesConfig.style.display = "none";
    choicesContainer.innerHTML = "";
    renderCorrectAnswerInput("text");
  }
});

document.getElementById("choice-count").addEventListener("input", (e) => {
  const count = parseInt(e.target.value || 0);
  generateChoiceInputs(count);
});

function generateChoiceInputs(count) {
  const container = document.getElementById("choices-container");
  container.classList.add("choices-container")
  container.innerHTML = "";

  for (let i = 1; i <= count; i++) {
    const input = document.createElement("input");
    input.type = "text";
    input.name = `choice-${i}`;
    input.placeholder = `Choix ${i}`;
    input.required = true;
    container.appendChild(input);
  }

  // Mettre à jour le champ correct-answer en mode select
  renderCorrectAnswerInput("select", count);
}

function generateVFInputs() {
  const container = document.getElementById("choices-container");
  container.innerHTML = "";

  // Select entre Vrai / Faux
  renderCorrectAnswerInput("select", 2, ["Vrai", "Faux"]);
}

function renderCorrectAnswerInput(type, count = 0, values = []) {
  const container = document.getElementById("correct-answer-container");
  container.innerHTML = "";

  const label = document.createElement("label");
  label.setAttribute("for", "correct-answer");
  label.textContent = "Réponse correcte :";

  if (type === "select") {
    const select = document.createElement("select");
    select.id = "correct-answer";
    select.name = "correctAnswer";
    select.required = true;

    for (let i = 1; i <= count; i++) {
      const opt = document.createElement("option");
      opt.value =  i-1;
      opt.textContent = values.length ? values[i - 1] : `Choix ${i}`;
      select.appendChild(opt);
    }

    container.appendChild(label);
    container.appendChild(select);
  } else {
    const input = document.createElement("input");
    input.type = "text";
    input.id = "correct-answer";
    input.name = "correctAnswer";
    input.required = true;

    container.appendChild(label);
    container.appendChild(input);
  }
}

function populateMultiSelect(selectId, items) {
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = ''; // vider options existantes

  items.forEach((item,index )=> {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = "- "+selectId+ " "+(index+1)+ " : "+item;
    select.appendChild(option);
  });
}
function getSelectedValues(selectElement) {
  return Array.from(selectElement.selectedOptions).map(opt => opt.value);
}
function collectOptionsFromForm(elemId) {
  const options = [];
const formElement = document.getElementById(elemId)
  // Sélectionner tous les champs dont le nom commence par "choix-"
  const choixInputs = formElement.querySelectorAll("input[name^='choice-']");

  choixInputs.forEach(input => {
    const value = input.value.trim();
    if (value) {
      options.push(value);
    }
  });

  return options;
}


  modalSaveBtn.onclick = function (e) {
    e.preventDefault;
    if(document.getElementById("question-text")){
    const formData = new FormData(modalForm);
    const formEntries = Object.fromEntries(formData.entries());
  let questionData={}
  questionData.correctIndex =document.getElementById("correct-answer").value; 
  questionData.text=formEntries.text;
  questionData.point=document.getElementById("difficulty").value
  questionData.type=document.getElementById("question-type").value
  questionData.options=questionData.type==="2"?collectOptionsFromForm("choices-container"):(questionData.type==="1"?["vrai","faux"]:[])
  questionData.cibledSkillsIndexes=getSelectedValues(document.getElementById("skills"))
  questionData.cibledKnowledgeIndexes= getSelectedValues(document.getElementById("knowledge"))
  questionData.cibledAttitudesIndexs= getSelectedValues(document.getElementById("attitudes"))
  questionData.prerequisitesIndexes= getSelectedValues(document.getElementById("prerequisites"))


 
    const errors = validateQuestionData(questionData);

if (errors.length > 0) {
  alert("Erreur(s) :\n" + errors.join("\n"));
} else {
  saveQuestionToQuiz(questionData, quizId,counter);
  modal.style.display = 'none';
}
  };
  }
  modal.style.display = 'flex';
}
});
function validateQuestionData(questionData) {
  const errors = [];

  if (!questionData.text || questionData.text.trim() === "") {
    errors.push("L'énoncé de la question est requis.");
  }

  if (!questionData.point || !["0", "1", "2", "3"].includes(questionData.point)) {
    errors.push("Veuillez choisir une difficulté valide.");
  }

  if (!questionData.type || !["1", "2"].includes(questionData.type)) {
    errors.push("Le type de question est requis (1 = Vrai/Faux, 2 = QCM).");
  }

  if (questionData.type === "2") {
    if (!Array.isArray(questionData.options) || questionData.options.length < 2) {
      errors.push("Au moins deux options sont requises pour un QCM.");
    }
  }

  if (questionData.correctIndex === undefined || questionData.correctIndex === "") {
    errors.push("Réponse correcte non définie.");
  } else {
    const index = parseInt(questionData.correctIndex);
    if (questionData.type === "2" && (isNaN(index) || index < 0 || index >= questionData.options.length)) {
      errors.push("Index de la bonne réponse invalide pour un QCM.");
    } else if (questionData.type === "1" && ![0, 1].includes(index)) {
      errors.push("La bonne réponse doit être 0 (vrai) ou 1 (faux) pour une question vrai/faux.");
    }
  }

  return errors;
}

}
 function skillsByQuizId(quizId) {
  for (const level of window.all) {
    for (const stream of level.streams) {
      for (const module of stream.modules) {
        if (!module.quizzes) continue;
        for (const quiz of module.quizzes) {
          if (quiz.id === quizId) {
            let prerequisites= typeof module.prerequisites === 'string' ? module.prerequisites.split(",") : []
            return { skills:module.skills, knowledge:module.knowledge, attitudes:module.attitudes, prerequisites };
          }
        }
      }
    }
  }
  return null; // pas trouvé
}