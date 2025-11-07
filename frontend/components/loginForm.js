import { animateContentChange } from "../utils/animation.js";
import {showLoading} from './loading.js';
export function renderLoginForm() {
  injectStyles();
  return `
  <div  class="login-page">
  <div class="login-left">  </div>

  <div id="login-main" class="login-form-container">
    <div class="login centerBox">
      <div class="login-logo">
        <img class="app-logo" src="./assets/images/logo.png" alt="Logo de l'application">
      </div>
      
      <h2>Connexion</h2>

      <form id="loginForm">
        <input type="email" id="email" placeholder="Email" required><br>
        <input type="password" id="password" placeholder="Mot de passe" required><br>
        <div id="loginError" class="error-message" style="display:none;"></div>
        <button type="submit" class="primary-btn">Se connecter</button>
      </form>

      <button id="guestLoginBtn" class="guest-btn">Continuer en tant qu'invité</button>

      <p>Pas encore inscrit ? <button id="registerBtn" class="link-btn">S'inscrire</button></p>
    </div>
  </div>
</div>

`;

}

export function attachLoginEvents({ onLoginSuccess }) {
  const loginError = document.getElementById("loginError");
["email", "password"].forEach((id) => {
  document.getElementById(id).addEventListener("input", () => {
    if (loginError.style.display === "block") {
      loginError.style.display = "none";
      loginError.textContent = "";
    }
  });
});
  document.getElementById("email").focus();
  document.getElementById("guestLoginBtn").addEventListener("click", async (e) => {
    e.preventDefault();
     window.userData={name:"Invité",email:"--",role:"invité"}
   onLoginSuccess();
    
  });
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch(
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyD8KP2cOGob0JQ-ohLKx5BLF3sqF57k0X0",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        console.log("Connexion réussie !", data);
        // Stocke le token si nécessaire
        localStorage.setItem("token", data.idToken);
        localStorage.setItem("uid", data.localId);
         localStorage.setItem("email", email);
     showLoading();   
    const res = await fetch(`http://localhost:3001/api/auth/user/?userId=${data.localId}&email=${email}`); // Assure-toi que cette route existe
    const userData =await res.json();
    window.userData=userData;
    localStorage.setItem("userData", JSON.stringify(userData));
         if (onLoginSuccess) onLoginSuccess();
      } else {
       document.getElementById("loginError").style.display = "block";
document.getElementById("loginError").textContent = "Échec de la connexion : " + data.error.message;

      }
    } catch (error) {
      console.error("Erreur de connexion :", error);
document.getElementById("loginError").style.display = "block";
document.getElementById("loginError").textContent = "Erreur réseau. Veuillez réessayer.";


    }
  });
  document.getElementById("registerBtn").addEventListener("click", (e) => {
    e.preventDefault();

    // Suppose que tu as une fonction `renderRegisterForm` et `attachRegisterEvents`
    import("./register.js").then((module) => {
      const registerHTML = module.renderRegisterForm();
       animateContentChange(registerHTML,"login-main").then(() => {
       module.attachRegisterEvents();
      });
    });
  });
}
function injectStyles() {
  if (document.getElementById('login-styles')) return; // éviter les doublons

  const style = document.createElement('style');
  style.id = 'login-styles';
  style.textContent = `
  .login-page {
  display: flex;
  height: 100vh;
  background-color: #fff;
  width:100%
}
#main{padding:0%!important}
.login-left {
  width: 20%;
  background-image: url('./assets/images/fond.png'); /* ou autre image */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: beige;

}

.login-left img {
  max-width: 100%;
  height: auto;
  object-fit: contain;
}

.login-form-container {
  width: 80%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login.centerBox {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  text-align: center;
}

.login-logo .app-logo {
  margin-bottom: 20px;
}

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

  `
  document.head.appendChild(style);
}

