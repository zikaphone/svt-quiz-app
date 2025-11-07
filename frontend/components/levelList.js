import { renderStreamList, attachStreamEvents } from "../components/streamList.js";
import { goToStep } from "../utils/animation.js";
export  function renderLevelList() {
  
   let levels=window.all.map(level => ({
  id: level.id,
  title: level.title,
  description: level.description
}));

    if (!Array.isArray(levels)) throw new Error("Réponse inattendue du serveur");
    return `
          ${levels
            .map(
              (level) => 
                
                `<button id="level-${level.id}" class="level-button">${level.title}</button>`
            )
            .join("")}
    `;
 
}
export function attachLevelEvents() {
  

  // Attacher les événements aux boutons de niveau
  const buttons = document.querySelectorAll(".level-button");

  buttons.forEach((button) => {
    button.addEventListener("click", async(e) => {
     goToStep("streamList")
      const levelId = e.target.id.replace("level-", "");
      const streamsHtml =   renderStreamList(levelId);
       document.getElementById("streamList-content").innerHTML=streamsHtml;
       document.getElementById("streamList").querySelector("h3").innerText=e.target.innerText
      attachStreamEvents()
    });
  });
}
