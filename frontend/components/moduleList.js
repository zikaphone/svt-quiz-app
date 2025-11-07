import { renderQuizList, attachQuizEvents } from "../components/quizList.js";
import { goToStep } from "../utils/animation.js";

function getModuleByStreamId( streamId) {
  for (const level of window.all) {
    for (const stream of level.streams) {
      if (stream.id === streamId) {
        return stream.modules || [];
      }
    }
  }
  return []; // Aucun stream trouvé
}

export  function renderModuleList(streamId) {
     const modules =  getModuleByStreamId(streamId)

    if (!Array.isArray(modules)) throw new Error("Réponse inattendue du serveur");
    return `
          ${modules
            .map(
              (module) => 
                
                `<button id="module-${module.id}" class="module-button">${module.title}</button>`
            )
            .join("")}
    `;
  
}
export function attachModuleEvents() {
  
  // Attacher les événements aux boutons de niveau
    const buttons = document.querySelectorAll(".module-button");
  
    buttons.forEach((button) => {
      button.addEventListener("click", async(e) => {
       goToStep("quizList")
        const moduleId = e.target.id.replace("module-", "");
        const quizzesHtml =   renderQuizList(moduleId);
         document.getElementById("quizList-content").innerHTML=quizzesHtml;
        document.getElementById("quizList").querySelector("h3").innerText=e.target.innerText

        attachQuizEvents()
      });
    });
}
