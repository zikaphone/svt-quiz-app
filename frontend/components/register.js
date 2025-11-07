import { animateContentChange } from "../utils/animation.js";
import { renderMain } from "../app.js";
export function renderRegisterForm() {
    injectStyles();
  return `
   

  <div id="login-main" class="login-form-container">
    <div class="register centerBox">
      <div class="login-logo">
    <img class="app-logo" src="./assets/images/logo.png" alt="Logo de l'application">
  </div>
  <h2>Inscription</h2>
  <form id="registerForm">
    <input type="text" id="regFirstName" placeholder="Prénom" required><br>
    <input type="text" id="regLastName" placeholder="Nom" required><br>
    <input type="email" id="regEmail" placeholder="Email" required><br>
    <input type="password" id="regPassword" placeholder="Mot de passe" required><br>

    <select id="regLevel" required>
      <option value="">-- Choisir le niveau --</option>
      <option value="1ère année bac">1ère année bac</option>
      <option value="2ème année bac">2ème année bac</option>
    </select><br>

    <select id="regStream" required disabled>
      <option value="">-- Choisir la filière --</option>
    </select><br>

    <button type="submit" class="primary-btn">S'inscrire</button>
  </form>

  <p>Vous avez déjà un compte ? <button id="loginBtn" class="link-btn">Se connecter</button></p>
</div>

  `;
}

export function attachRegisterEvents() {
   const allData = window.all; // contient niveaux + streams

  const levelSelect = document.getElementById("regLevel");
  const streamSelect = document.getElementById("regStream");
  const registerForm = document.getElementById("registerForm");
 function populateLevels() {
    levelSelect.innerHTML = '<option value="">-- Choisir le niveau --</option>';
    allData.forEach(level => {
      const option = document.createElement("option");
      option.value = level.title;
      option.textContent = level.title;
      levelSelect.appendChild(option);
    });
  }

  populateLevels();
  // 🔁 Mettre à jour les filières selon le niveau sélectionné
  levelSelect.addEventListener("change", () => {
  const selectedLevelTitle = levelSelect.value;

  streamSelect.innerHTML = '<option value="">-- Choisir la filière --</option>';
  streamSelect.disabled = true;

  // Trouver le niveau sélectionné
  const selectedLevel = allData.find(level => level.title === selectedLevelTitle);

  if (selectedLevel && Array.isArray(selectedLevel.streams)) {
    // 🔍 Filtrer les filières avec au moins un module
    const validStreams = selectedLevel.streams.filter(stream =>
      Array.isArray(stream.modules) && stream.modules.length > 0
    );

    if (validStreams.length > 0) {
      validStreams.forEach(stream => {
        const option = document.createElement("option");
        option.value = stream.id;
        option.textContent = stream.title;
        streamSelect.appendChild(option);
      });
      streamSelect.disabled = false;
    }
  }
});

  // 📨 Soumission du formulaire
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      name: document.getElementById("regFirstName").value.trim(),
      lastName: document.getElementById("regLastName").value.trim(),
      email: document.getElementById("regEmail").value.trim(),
      streamId: streamSelect.value,
      actualQuiz:0,
      role:"student",
    };
 
    const password = document.getElementById("regPassword").value;

    try {
      const res = await fetch(
        "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyD8KP2cOGob0JQ-ohLKx5BLF3sqF57k0X0",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email:payload.email,
            password,
            returnSecureToken: true,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Inscription réussie !");
        console.log("Utilisateur inscrit :", data);
         payload.uid=data.localId
        // Facultatif : stocker UID/email dans Firestore avec un rôle
        await fetch("http://localhost:3001/api/auth/save-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
renderMain()
      } else {
        alert("Échec de l'inscription : " + data.error.message);
      }
    } catch (err) {
      console.error("Erreur réseau :", err);
      alert("Erreur réseau.");
    }
  });

   document.getElementById("loginBtn").addEventListener("click", renderMain);




}

function injectStyles() {
  if (document.getElementById('register-styles')) return; // éviter les doublons

  const style = document.createElement('style');
  style.id = 'register-styles';
  style.textContent = `
  .login {
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  margin: auto;
  text-align: center;
}

.login input {
  width: 100%;
  padding: 0.75rem;
  margin: 0.5rem 0;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.login input:focus {
  border-color: #2196F3;
  outline: none;
}

.primary-btn {
  width: 100%;
  padding: 0.75rem;
  margin-top: 1rem;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.primary-btn:hover {
  background: #1565c0;
}

.guest-btn {
  width: 100%;
  padding: 0.7rem;
  margin-top: 0.5rem;
  background: #e0e0e0;
  color: #333;
  border: none;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
}

.guest-btn:hover {
  background: #d5d5d5;
}

.link-btn {
  background: none;
  border: none;
  color: #1976d2;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-size: 1rem;
  transition: color 0.3s ease;
}

.link-btn:hover {
  color: #0d47a1;
}
.register {
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
  margin: auto;
  text-align: center;
}

.register input,
.register select {
  width: 100%;
  padding: 0.75rem;
  margin: 0.5rem 0;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.register input:focus,
.register select:focus {
  border-color: #1976d2;
  outline: none;
}

  `
  document.head.appendChild(style);
}