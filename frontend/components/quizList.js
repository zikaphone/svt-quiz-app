
 import {startQuiz} from './quizView.js'
function getQuizByModuleId( moduleId) {
  for (const level of window.all) {
    for (const stream of level.streams) {
      for (const module of stream.modules) {
        if (module.id === moduleId) {
          return module.quizzes || [];
        }
      }
    }
  }
  return []; // Aucun module trouvé
}

export  function renderQuizList(moduleId) {
     const quizzes =  getQuizByModuleId( moduleId)

    if (!Array.isArray(quizzes)) throw new Error("Réponse inattendue du serveur");
    return `
          ${quizzes
            .map(
              (quiz) => 
                
                `<button id="quiz-${quiz.id}" class="quiz-button">${quiz.title}</button>`
            )
            .join("")}
    `;
  
}
export function attachQuizEvents() {
  
  // Attacher les événements aux boutons de niveau
    const buttons = document.querySelectorAll(".quiz-button");
  
    buttons.forEach((button) => {
      button.addEventListener("click", async(e) => {
        const quizId = e.target.id.replace("quiz-", "");
        setTimeout(()=>{
 startQuiz(quizId)
 },1000)
      });
    });
}
