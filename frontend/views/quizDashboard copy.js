function renderAllQuizView(data) {
    const container = document.createElement("div");
    container.className = "quiz-container";

    // --- Barre de recherche sticky ---
    const searchBarWrapper = document.createElement("div");
    searchBarWrapper.style = `
    position: sticky;
    top: 0;
    z-index: 100;
    background-color: #ffffff;
    padding: 16px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  `;

    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "🔍 Rechercher un quiz...";
    searchInput.style = `
    padding: 12px 16px;
    width: 100%;
    max-width: 400px;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 16px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  `;

    searchBarWrapper.appendChild(searchInput);
    container.appendChild(searchBarWrapper);

    const resultsContainer = document.createElement("div");
    container.appendChild(resultsContainer);

    function displayFilteredQuizzes(filter = "") {
        resultsContainer.innerHTML = "";

        data.forEach(level => {
            const levelDiv = document.createElement("div");
            levelDiv.className = "level-section";

            const levelTitle = document.createElement("div");
            levelTitle.className = "level-title";
            levelTitle.textContent = level.title;
            levelDiv.appendChild(levelTitle);

            let levelHasResults = false;

            level.streams.forEach(stream => {
                const streamDiv = document.createElement("div");
                streamDiv.className = "stream-section";

                const streamTitle = document.createElement("div");
                streamTitle.className = "stream-title";
                streamTitle.textContent = stream.title;
                streamDiv.appendChild(streamTitle);

                let streamHasResults = false;

                stream.modules.forEach(module => {
                    const moduleDiv = document.createElement("div");
                    moduleDiv.className = "module-section";

                    const moduleTitle = document.createElement("div");
                    moduleTitle.className = "module-title";
                    moduleTitle.textContent = module.title;
                    moduleDiv.appendChild(moduleTitle);

                    const quizGrid = document.createElement("div");
                    quizGrid.className = "quiz-grid";

                    const quizzes = (module.quizzes || []).filter(quiz =>
                        quiz.title.toLowerCase().includes(filter.toLowerCase())
                    );

                    quizzes.forEach(quiz => {
                        const quizCard = document.createElement("div");
                        quizCard.className = "quiz-card";

                        quizCard.innerHTML = `
                        <img src="./assets/images/pics/${Math.floor(Math.random() * 11) + 1}.jpg" alt="Quiz cover" class="quiz-card-img">                        
            <div class="quiz-card-body">
              <h5>${quiz.title}</h5>
              <p>${quiz.description || ""}</p>
              <div class="quiz-meta">${quiz.questions?.length || 0} question(s)</div>
            </div>
                        `;

                        quizCard.addEventListener("click", () => {
                            alert(`Quiz sélectionné : ${quiz.title}`);
                        });

                        quizGrid.appendChild(quizCard);
                    });

                    if (quizzes.length > 0) {
                        moduleDiv.appendChild(quizGrid);
                        streamDiv.appendChild(moduleDiv);
                        streamHasResults = true;
                        levelHasResults = true;
                    }
                });

                if (streamHasResults) {
                    levelDiv.appendChild(streamDiv);
                }
            });

            if (levelHasResults) {
                resultsContainer.appendChild(levelDiv);
            }
        });
    }

    displayFilteredQuizzes();

    searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim();
        displayFilteredQuizzes(query);
    });

    const target = document.getElementById("quizListContainer");
    if (target) {
        target.innerHTML = "";
        target.appendChild(container);
    }
}


function injectStyles() {
    if (document.getElementById('quizDashboard-styles')) return; // éviter les doublons

    const style = document.createElement('style');
    style.id = 'quizDashboard-styles';
    style.textContent = `
 @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
    @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
 #quizListContainer{width: 100%;
    height: 100%;
    overflow-y: auto;}
    .quiz-container {
      padding: 24px;
    }

    .level-title {
      font-size: 2em;
    font-weight: bolder;
    margin: 40px 0 5px;
    color: #607D8B;
    text-transform: uppercase;
    }

    .stream-title {
      font-size: 1.3em;
      font-weight: 600;
      margin: 16px 0 8px;
      color: #333;
    }

    .module-title {
      font-size: 1.2em;
      font-weight: 500;
      margin: 16px 0 8px;
      color: #555;
    }

    .quiz-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 20px;
      margin-top: 12px;
    }

    .quiz-card {
      background: #fff;
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
      transition: transform 0.25s ease, box-shadow 0.25s ease;
      display: flex;
      flex-direction: column;
      align-items: start;
      gap: 12px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }
.quiz-card-body h5 {
      margin: 0 0 8px;
      font-size: 18px;
      color: #2c3e50;
    }

    .quiz-card-body p {
      font-size: 14px;
      color: #666;
      margin-bottom: 12px;
    }
    .quiz-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    }

    .quiz-icon {
      font-size: 40px;
      color:rgb(182, 183, 190);
      background:rgb(246, 246, 250);
      border-radius: 50%;
      padding: 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
 .quiz-card-img {
      width: 100%;
      height: 140px;
      object-fit: cover;
      background: #e0e0e0;
    }
    quiz-card.title {
      font-size: 1.1em;
      font-weight: 600;
      color: #1a237e;
    }

    .quiz-meta {
      font-size: 0.9em;
      color: #666;
    }

    /* Barre de recherche sticky */
    .quiz-search-bar {
      position: sticky;
      top: 0;
      background: #ffffffcc;
      backdrop-filter: blur(6px);
      z-index: 100;
      padding: 16px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }

    .quiz-search-bar input {
      width: 100%;
      max-width: 500px;
      padding: 12px 18px;
      border: 1px solid #ccc;
      border-radius: 12px;
      font-size: 16px;
      transition: border 0.2s ease;
    }

    .quiz-search-bar input:focus {
      border-color: #3f51b5;
      outline: none;
    }
  `;
    document.head.appendChild(style);
}
export function renderQuizDashboard() {
    injectStyles();

    const allData = window.all;
    const main = document.getElementById("main");
    main.innerHTML = ""
    let quizListContainer = document.createElement("div");
    quizListContainer.id = "quizListContainer";
    main.appendChild(quizListContainer)
    renderAllQuizView(allData);
}