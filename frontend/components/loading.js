// frontend/components/Loading.js

 function renderLoading() {
  return `
    <div class="loader-container">
      <div class="loader"></div>
      <p>Chargement en cours...</p>
    </div>
  `;
}
export function showLoading() {
  const main = document.getElementById('main');
  main.innerHTML = renderLoading();
}