// QuizView.js
import {showLoading} from './loading.js';
import {renderQuizDashboard} from '../views/quizDashboard.js';
import {saveQuizResult} from '../utils/cruds.js';
let currentQuestion = 0;
let quiz = null;
var correctAnswers = 0;
const successQuestionIds=[];
const coche='<svg class="icon-check" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#4caf50" viewBox="0 0 24 24" style="margin-left:8px;vertical-align:middle;"><path d="M20.285 6.709l-11.285 11.29-5.285-5.284 1.415-1.416 3.87 3.871 9.87-9.875z"/></svg>'
const croix='<svg class="icon-cross" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#ef5350" viewBox="0 0 24 24" style="margin-left:8px; vertical-align:middle;"><path d="M18.364 5.636a1 1 0 0 0-1.414 0L12 10.586 7.05 5.636A1 1 0 0 0 5.636 7.05L10.586 12l-4.95 4.95a1 1 0 1 0 1.414 1.414L12 13.414l4.95 4.95a1 1 0 0 0 1.414-1.414L13.414 12l4.95-4.95a1 1 0 0 0 0-1.414z"/></svg>'

export function renderQuestion(question, index, total) {
  return `
    <div class="question animate__animated animate__fadeIn">
      <p class="question-text"><strong>Question ${index + 1} / ${total} :</strong> ${question.text}</p>
      <div class="options" id="options-container">
        ${question.options.map((opt, i) => `
          <button class="option-btn animate__animated animate__jackInTheBox" 
                  style="animation-delay: ${i * 0.2}s" 
                  data-index="${i}">
            ${opt}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

export function loadQuestion() {
  const container = document.getElementById('quiz-question-container');
  const question = quiz.questions[currentQuestion];
  container.innerHTML = renderQuestion(question, currentQuestion, quiz.questions.length);

  // Animation des options une par une
  const buttons = container.querySelectorAll('.option-btn');
  buttons.forEach((btn, i) => {
    btn.classList.add('animate__animated');
    setTimeout(() => {
      btn.classList.add('animate__jackInTheBox');
      btn.style.visibility = 'visible';
    }, i * 200); // Délai progressif
  });

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const questionContainer=document.getElementById('quiz-question-container').firstElementChild
      btn.classList.remove('animate__jackInTheBox')
      btn.classList.add('animate__heartBeat')
      setTimeout(() => {
      questionContainer.classList.add('animate__fadeOut');
      setTimeout(() => {
        btn.classList.remove('animate__heartBeat')
      questionContainer.classList.remove('animate__fadeOut');
      const selected = parseInt(btn.dataset.index);
      const isCorrect = selected == question.correctAnswer;
      if (isCorrect) {correctAnswers++;successQuestionIds.push(question.id)}

      const isLast = currentQuestion === quiz.questions.length - 1;
      const anim = isCorrect ? 'animate__tada' : 'animate__bounce';
      console.log(correctAnswers)
      if(isLast){
        if( localStorage.getItem("uid") && window.userData.role!=="invité"){
        let resultData={
          quizId: quiz.id,
  score:  Math.round((correctAnswers / quiz.questions.length) * 100),
  successQuestionIds,
  timestamp: new Date().toISOString(), 
  userId:  localStorage.getItem("uid")
        }
        
        saveQuizResult(resultData)
      }
      }

      container.innerHTML = `${!isCorrect ? 
       '<p style="font-size: 1rem;color: white;margin: auto;font-weight: bold;background-color: #ffffff;border-radius: 10px;padding: 5px;">'+
  '<strong style="color: green; font-size: 2rem;">La réponse était :</strong><br>'+
  '<span style="color:rgb(19, 19, 18);">{{ '+question.options[question.correctAnswer]+' }}</span>'+
'</p>':''}
        <div class="feedback ${isCorrect ? 'correct' : 'incorrect'} animate__animated ${anim}">
          <p>${isCorrect ? 'Bonne réponse !' : 'Mauvaise réponse.'}</p>
          <button id="next-btn" class="next-btn">${isLast ? 'Voir le résultat final' : 'Suivant ➡️'}</button>
        </div>
      `;

      document.getElementById('next-btn').addEventListener('click', () => {
        if (!isLast) {
          
          currentQuestion++;
          loadQuestion();
        } else {
          renderSummary();
        }
      });
    },800)},1500)
    });
  });
}

function renderSummary() {
  const container = document.getElementById('quiz-question-container');
  const total = quiz.questions.length;
  const percent = Math.round((correctAnswers / total) * 100);

  const summaryHTML = quiz.questions.map((q, i) => {
    const userCorrect = i < currentQuestion && quiz.questions[i].correctAnswer !== undefined;
    return `<li class="${userCorrect ? 'correct' : 'incorrect'}">Question ${i + 1} - ${userCorrect ? coche : croix}
      </li>`;
  }).join('');

  container.innerHTML = `
    <div class="quiz-summary animate__animated animate__fadeInUp">
      <h3>🎉 Quiz terminé !</h3>
      <p>Tu as répondu correctement à ${correctAnswers} / ${total} questions.</p>
      <p>Score : <strong>${percent}%</strong></p>
      <ul>${summaryHTML}</ul>
      <button id="next-quiz-btn" class="next-btn">➡️ Passer au quiz suivant</button>
    </div>
  `;

  document.getElementById('next-quiz-btn').addEventListener('click', () => {
    returnToQDashboard()
  });
}
export default function renderQuizView(quizData) {
  const { title, module, level, stream, description } = quizData;

  return `
  <div style="
    top: -20px;
    position: sticky;
    width: 100%;
    padding-top: 5px;
    z-index: 1000;
    background-color: #fff;
    margin-bottom: 10px;
">
  <div style="background-color: #fffefe;padding: 5px;box-shadow: rgba(0, 0, 0, 0.05) 0px 4px 6px;border-radius: 40px;">
   <button onclick="returnToQDashboard()" aria-label="Retour" style="height: 40px;background: #6e7a88b8;border: none;cursor: pointer;padding: 8px;width: 40px;border-radius: 50%;margin: 5px;">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
  </svg>
  </button>
    </div></div>
    <div class="quiz-layout">
      <!-- Colonne gauche -->
      <aside class="quiz-sidebar-left">
        <p><strong>Niveau :</strong> ${level}</p>
        <p><strong>Filière :</strong> ${stream}</p>
        <p><strong>Unité :</strong> ${module}</p>
        <p><strong>Description :</strong><br> ${description}</p>
      </aside>

      <!-- Zone centrale -->
      <main class="quiz-question-area">
        <h2 class="quiz-title">${title}</h2>
        <div id="quiz-question-container" class="question-container-centered animate__animated animate__fadeIn"></div>
      </main>

      <!-- Colonne droite (métadonnées pédagogiques) -->
       <aside class="quiz-sidebar-right" id="quiz-meta"></aside>
    </div>
  `;
}
function renderMeta({ competencies = [], attitudes = [], knowledge = [] }) {
  const container = document.getElementById("quiz-meta");
  container.innerHTML = ''; // Nettoyer le contenu

  const createSection = (label, items) => {
    if (!items || items.length === 0) return;

    const section = document.createElement("div");

    const title = document.createElement("p");
    title.innerHTML = `<strong>${label} :</strong>`;

    const list = document.createElement("ul");
    list.className = "quiz-meta-list";
    items.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });

    section.appendChild(title);
    section.appendChild(list);
    container.appendChild(section);
  };

  createSection("Compétences", competencies);
  createSection("Attitudes", attitudes);
  createSection("Savoirs", knowledge);
}

export async function startQuiz(quizId) {
  showLoading();   
  const res = await fetch(`http://localhost:3001/api/quizzes/quiz/${quizId}`);
  const quizData = await res.json();
quizData.id=quizId;
  quiz = quizData;
  currentQuestion = 0;
  correctAnswers = 0;

  document.getElementById('main').innerHTML = renderQuizView(quizData);
 // renderBreadcrumb({currentQuizId: quizId, containerId: 'breadcrumb-container'});
  renderMeta(quizData);

  // Ajout de l'écran d'introduction
  const container = document.getElementById('quiz-question-container');
  container.innerHTML = `
    <div class="quiz-intro animate__animated animate__fadeIn">
      <p><i class="material-icons">book</i> Ce quiz contient ${quiz.questions.length} questions. Bonne chance !</p>
      <button id="start-quiz-btn" class="next-btn">Commencer</button>
    </div>
  `;
  document.getElementById('start-quiz-btn').addEventListener('click', loadQuestion);
}
 window.returnToQDashboard= async function() {
renderQuizDashboard()
 }