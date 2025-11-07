export function renderAcquisitionBar(percentage) {
    injectStyles();
  const color = percentageToColor(percentage);
  return `
    <div class="acquisition-bar-container">
      <div class="acquisition-bar-fill" style="width: ${percentage}%; background-color: ${color};">
      </div>
      <div style="
    color: ${color};
    position: absolute;
    top: -15px;
    width: 100px;
">${percentage}%</div>
    </div>
    
  `;
}

function percentageToColor(percentage) {
  const startColor = { r: 110, g: 122, b: 136 }; // gris clair
  const endColor = { r: 0, g: 200, b: 0 };       // vert

  const r = Math.round(startColor.r + (endColor.r - startColor.r) * (percentage / 100));
  const g = Math.round(startColor.g + (endColor.g - startColor.g) * (percentage / 100));
  const b = Math.round(startColor.b + (endColor.b - startColor.b) * (percentage / 100));

  return `rgb(${r}, ${g}, ${b})`;
}

function injectStyles() {
  if (document.getElementById('acquisitionBar-styles')) return; // éviter les doublons

  const style = document.createElement('style');
  style.id = 'acquisitionBar-styles';
  style.textContent = `
  .acquisition-bar-container {
  width: 100px;
  background-color: #eee;
  border-radius: 8px;
  position: relative;
  height: 5px;
  font-size: 12px;
     margin: 4px 0;
    display: inline-block;
}

.acquisition-bar-fill {
  height: 2.5px;
    color: white;
    font-weight: bold;
    text-align: center;
    line-height: 20px;
    transition: width 0.3s ease;
    border-radius: 8px;
    margin-top: 1.25px;
}
  `
  document.head.appendChild(style);
}