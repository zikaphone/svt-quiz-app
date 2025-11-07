const { app, BrowserWindow ,Menu} = require('electron');
const path = require('path');
require('./backend/index');
let mainWindow;
let splash;

app.whenReady().then(() => {
  // Créer la fenêtre de splash, mais ne pas l'afficher tout de suite
  splash = new BrowserWindow({
    width: 400,
    height: 300,
    
      icon: path.join(__dirname, 'frontend/assets/logo.png'),
    show: false,
    frame: false,
    alwaysOnTop: true,
    transparent: false,
  });

  splash.loadFile(path.join(__dirname, 'frontend/splash.html'));

  // Créer la fenêtre principale
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 800,
      icon: path.join(__dirname, 'frontend/assets/logo.png'),
    show: false, // ne pas afficher immédiatement
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'frontend/index.html'));
   splash.once('ready-to-show', () => {
    splash.show(); // Affiche la fenêtre splash dès qu'elle est prête
  });
Menu.setApplicationMenu(null);
  // Une fois la fenêtre principale prête
  mainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      splash.destroy(); // Fermer le splash
      setTimeout(() => {
      mainWindow.show(); // Afficher la fenêtre principale
      },300)
    }, 5000); // délai (ajustable)
  });
});

