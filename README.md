# 🧬 Application d’évaluation formative en SVT

> Une application interactive et pédagogique destinée aux élèves du lycée marocain pour l’autoévaluation en Sciences de la Vie et de la Terre (SVT).
créée par : https://www.yazawaj.com company
---

## 🎯 Objectif du projet

L’application **vise à renforcer l’apprentissage autonome** des élèves à travers :
- des **quiz interactifs** adaptés aux programmes de SVT,
- un **suivi des performances**,
- et une **interface intuitive** pensée pour un usage éducatif numérique.

Elle contribue à promouvoir **l’évaluation formative** dans le cadre de l’enseignement des SVT à l’ère du numérique.

---

## 🧱 Structure du projet
quiz-app/
├── backend/
│ ├── firebase/
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ └── index.js
│
├── frontend/
│ ├── assets/
│ ├── components/
│ ├── views/
│ ├── App.js
│ └── index.html
│
├── main.js
├── package.json
└── README.md

---

## 🧩 Technologies utilisées

- **Electron.js** → pour l’interface de bureau multiplateforme  
- **Node.js** → pour la logique backend  
- **Firebase** → pour la base de données distante et l’authentification  
- **HTML / CSS / JS** → pour le frontend sans framework lourd  
- **PlantUML** → pour la modélisation UML (diagrammes de conception)

---

## 👨‍🏫 Fonctionnalités principales

- 🔐 Authentification des utilisateurs (élève / administrateur)  
- 🧪 Sélection de modules et de quiz par thématique  
- 📊 Résultats détaillés avec score et progression  
- 🧠 Ciblage pédagogique des questions  
- 🧾 Gestion des quiz par l’administrateur  
- ☁️ Synchronisation avec Firebase

---

## 📸 Aperçu (exemple)

![Interface Quiz SVT](https://via.placeholder.com/800x400.png?text=Interface+Quiz+SVT)

---

## 🧠 Exemple de module

**Module : Biologie cellulaire et moléculaire**  
> Quiz sur la structure de la cellule, les acides nucléiques et la synthèse des protéines.  
Chaque question est liée à des objectifs pédagogiques et compétences spécifiques.

---

## 🧑‍💻 Installation locale

```bash
# Cloner le dépôt
git clone https://github.com/TON_PSEUDO/quiz-app.git

# Accéder au dossier
cd quiz-app

# Installer les dépendances
npm install

# Lancer l'application
npm start


