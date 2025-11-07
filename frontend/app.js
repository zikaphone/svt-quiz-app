import { renderLoginForm, attachLoginEvents } from "./components/loginForm.js"
import {renderallList } from "./components/allList.js";
import { renderAdminDashboard } from "./views/adminDashboard.js";
import {renderQuizDashboard } from "./views/quizDashboard.js";
import { renderStudentDashboard } from "./views/studentDashboard.js";
import { renderHeader } from './components/header.js';
import { renderSideBar } from './components/sideBar.js';
import { animateContentChange,goToStep } from "./utils/animation.js";
async function   renderUser(){
   document.getElementById("main").parentNode.prepend(renderSideBar("quiz_tc_lit_2_4"));
     //   const content =  renderStudentDashboard(window.userData); 
     //   await animateContentChange(content); 
          renderQuizDashboard()        
        //attachStudentDashboardEvents(); 
        updateHeader(window.userData);     
}
async function   renderGuest(){
   document.getElementById("main").parentNode.prepend(renderSideBar("quiz_tc_lit_2_4"));
     //   const content =  renderStudentDashboard(window.userData); 
     //   await animateContentChange(content); 
          renderQuizDashboard()         
        updateHeader({name:"invité",email:"--"});     
}
async function   renderAdmin(){
  
   document.getElementById("main").parentNode.prepend(renderSideBar("quiz_tc_lit_2_4"));
          renderAdminDashboard(); 
        //attachStudentDashboardEvents(); 
        updateHeader(window.userData);     
}

export async function   renderMain(){
   window.all=  await renderallList();
   const token = localStorage.getItem("token");
  const uid = localStorage.getItem("uid");
  if (token && uid) {
    const res = await fetch(`http://localhost:3001/api/auth/user/?userId=${uid}&email=${localStorage.getItem("email")}`); // Assure-toi que cette route existe
    const userData =await res.json();

    window.userData=userData
   
 if (window.userData.role !== "admin") {  
        renderUser()              
      }else{
        renderAdmin()
      }

  }else{
  
  goToStep("levelList")    
      

    const html = renderLoginForm();
animateContentChange(html).then( () => {
  attachLoginEvents({
    onLoginSuccess: async () => {
       if(window.userData.role==="invité"){renderGuest()}

      else if (window.userData.role !== "admin") {  
        renderUser()      
      }else{
        renderAdmin()
      }
      // Tu peux faire pareil pour admin
    },
  })
});
  }
}

window.addEventListener("DOMContentLoaded",renderMain);

function updateHeader(currentUser = null) {
  const headerEl = document.getElementById('header');
  headerEl.innerHTML = renderHeader(currentUser);

  const avatar = document.getElementById('avatar');
  const dropdown = document.getElementById('dropdown-menu');

  if (avatar && dropdown) {
  let isVisible = false;

  avatar.addEventListener('click', () => {
    if (isVisible) {
      dropdown.classList.remove('flip-in');
      dropdown.classList.add('flip-out');
      setTimeout(() => {
        dropdown.classList.add('hidden');
      }, 300);
    } else {
      dropdown.classList.remove('hidden', 'flip-out');
      dropdown.classList.add('flip-in');
    }
    isVisible = !isVisible;
  });

  document.addEventListener('click', (e) => {
    if (!avatar.contains(e.target) && !dropdown.contains(e.target)) {
      if (isVisible) {
        dropdown.classList.remove('flip-in');
        dropdown.classList.add('flip-out');
        setTimeout(() => {
          dropdown.classList.add('hidden');
        }, 300);
        isVisible = false;
      }
    }
  });
}


  const logoutLink = document.getElementById('logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', async(e) => {
      e.preventDefault();
      localStorage.removeItem("token");
  localStorage.removeItem("uid");
   localStorage.removeItem("userData");
  localStorage.removeItem("all");
       window.location.reload();
       
    });
  }
}

updateHeader();







