import { renderLevelList, attachLevelEvents } from "../components/levelList.js";
import { renderModuleList, attachModuleEvents } from "../components/moduleList.js";
import {  renderStreamList,attachStreamEvents } from "../components/streamList.js";
import {  renderQuizList,attachQuizEvents } from "../components/quizList.js";
import { goToStep } from "../utils/animation.js";
export function renderBreadcrumb({  currentQuizId, containerId }) {
  injectBreadcrumbStyles(); // injecte le style s'il n'est pas encore présent

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id "${containerId}" not found.`);
    return;
  }
  let structureData=window.all
  container.innerHTML = ''; // Nettoyer le conteneur

  const path = findBreadcrumbPath(structureData, currentQuizId);
  if (!path) {
    console.warn('Aucun chemin trouvé pour le quiz ID :', currentQuizId);
    return;
  }

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'breadcrumb');
  nav.className = 'breadcrumb';
  
  
  //first elem 
  const span = document.createElement('span');
    span.textContent = "Niveau";
    span.className = 'breadcrumb-item';
      nav.appendChild(span);
       span.addEventListener('click', (e) => {
    
    // Remplacer le contenu principal par la structure d'affichage initiale
    document.getElementById("main").innerHTML = `
      <div class="step-container-vertical">
        <div class="organigram-vertical">
          <div class="organigram-block visible" id="levelList">
            <h3>Niveaux :</h3>
            <div id="levelList-content"></div>
          </div>
          <div class="organigram-block" id="streamList">
            <h3></h3>
            <p>Sélectionnez votre filière :</p>
            <div id="streamList-content"></div>
          </div>
          <div class="organigram-block" id="moduleList">
            <h3></h3>
            <p>Sélectionnez un module :</p>
            <div id="moduleList-content"></div>
          </div>
          <div class="organigram-block" id="quizList">
            <h3></h3>
            <p>Sélectionnez un quiz :</p>
            <div id="quizList-content"></div>
          </div>
        </div>
      </div>
    `;


    // On va à l'étape suivante dans l'organigramme
let htmlToRender  = renderLevelList(); 
  const containerContent = document.getElementById('levelList-content');
  if (containerContent) {
    containerContent.innerHTML = htmlToRender;
  }

goToStep( "levelList")
    // Attacher les événements sur les streams / modules selon la vue
   
      attachLevelEvents();
   
  });
const separator = document.createElement('span');
      separator.textContent = ' › ';
      separator.className = 'breadcrumb-separator';
      nav.appendChild(separator);
//fin first

  path.forEach((item, index) => {
    const isLast = index === path.length - 1;
    const span = document.createElement('span');
    span.textContent = item.title;
    span.className = isLast ? 'breadcrumb-item active' : 'breadcrumb-item';

    if (!isLast) {
  span.addEventListener('click', (e) => {
    
    // Remplacer le contenu principal par la structure d'affichage initiale
    document.getElementById("main").innerHTML = `
      <div class="step-container-vertical">
        <div class="organigram-vertical">
          <div class="organigram-block visible" id="levelList">
            <h3>Niveaux :</h3>
            <div id="levelList-content"></div>
          </div>
          <div class="organigram-block" id="streamList">
            <h3></h3>
            <p>Sélectionnez votre filière :</p>
            <div id="streamList-content"></div>
          </div>
          <div class="organigram-block" id="moduleList">
            <h3></h3>
            <p>Sélectionnez un module :</p>
            <div id="moduleList-content"></div>
          </div>
          <div class="organigram-block" id="quizList">
            <h3></h3>
            <p>Sélectionnez un quiz :</p>
            <div id="quizList-content"></div>
          </div>
        </div>
      </div>
    `;


    // On va à l'étape suivante dans l'organigramme
    const ids = ['levelList', 'streamList', 'moduleList', 'quizList', 'questionView'];
let htmlToRender = '';

// index correspond à la position dans path (donc breadcrumb)

for (let i = 0; i <= index+1; i++) {
  const containerId = ids[i];        // ex: 'levelList', 'streamList', ...
  let dataId =0;
  if(i>0)
   dataId = path[i-1].id;          // id correspondant à ce niveau dans path

   
  switch (containerId) {
    case 'levelList':
      htmlToRender = renderLevelList(); // Pas besoin d'ID ici si c'est la racine
      break;

    case 'streamList':
      htmlToRender = renderStreamList(dataId);
      break;

    case 'moduleList':
      htmlToRender = renderModuleList(dataId);
      break;

    case 'quizList':
      htmlToRender = renderQuizList(dataId);
      break;
  }
  // Injecter dans la bonne section
  const containerContent = document.getElementById(containerId + '-content');
  if (containerContent) {
    containerContent.innerHTML = htmlToRender;
  }
}
goToStep( ids[index+1])
    // Attacher les événements sur les streams / modules selon la vue
   
      attachLevelEvents();
   
      attachStreamEvents();
   
      attachModuleEvents();
   
      attachQuizEvents();
   
  });
}


    nav.appendChild(span);

    if (!isLast) {
      const separator = document.createElement('span');
      separator.textContent = ' › ';
      separator.className = 'breadcrumb-separator';
      nav.appendChild(separator);
    }
  });

  container.appendChild(nav);
}
function findBreadcrumbPath(data, quizId) {
  for (const level of data) {
    for (const stream of level.streams) {
      for (const module of stream.modules) {
        for (const quiz of module.quizzes) {
          if (quiz.id === quizId) {
            return [
              { id: level.id, title: level.title, type: 'level' },
              { id: stream.id, title: stream.title, type: 'stream' },
              { id: module.id, title: module.title, type: 'module' },
              { id: quiz.id, title: quiz.title, type: 'quiz' }
            ];
          }
        }
      }
    }
  }
  return null;
}
function injectBreadcrumbStyles() {
  if (document.getElementById('breadcrumb-styles')) return; // éviter les doublons

  const style = document.createElement('style');
  style.id = 'breadcrumb-styles';
  style.textContent = `
  #breadcrumb-container{width:100%}
    .breadcrumb {
      font-family: sans-serif;
      font-size: 14px;
      margin: 10px 0;
      color: #333;
    }
    .breadcrumb-item {
      color: #E65100;
      cursor: pointer;
    }
    .breadcrumb-item.active {
      color: #000;
      cursor: default;
    }
    .breadcrumb-separator {
      margin: 0 5px;
      color: #888;
    }
  `;
  document.head.appendChild(style);
}

