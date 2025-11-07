import { renderModuleList, attachModuleEvents } from "../components/moduleList.js";
import { goToStep } from "../utils/animation.js";

function getStreamsByLevelId( levelId) {
  const level = window.all.find(l => l.id === levelId);
  return level ? level.streams.map(stream => ({
    id: stream.id,
    title: stream.title,
    description: stream.description,
    moduleCount:stream.modules?stream.modules.length:0
  })) : [];
}
export  function renderStreamList(levelId) {

   const streams = getStreamsByLevelId(levelId);
    if (!Array.isArray(streams)) throw new Error("Réponse inattendue du serveur");
    return `
          ${streams
            .map(
              (stream) => 
                
                `<button ${stream.moduleCount === 0 ? 'disabled' : ''}  id="stream-${stream.id}" class="stream-button">${stream.title}</button>`
            )
            .join("")}
    `;
 
}
export function attachStreamEvents() {
  
  // Attacher les événements aux boutons de niveau
    const buttons = document.querySelectorAll(".stream-button");
  
    buttons.forEach((button) => {
      button.addEventListener("click", async(e) => {
       goToStep("moduleList")
        const streamId = e.target.id.replace("stream-", "");
        const modulesHtml =   renderModuleList(streamId);
         document.getElementById("moduleList-content").innerHTML=modulesHtml;
        document.getElementById("moduleList").querySelector("h3").innerText=e.target.innerText

        attachModuleEvents()
      });
    });
}