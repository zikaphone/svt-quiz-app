const { db } = require('../firebase/firebase.config');
const MODULES_COLLECTION = 'modules';

exports.addModule = async (req, res) => {
  try {
    const { title, description } = req.body;
    const newModule = { title, description, createdAt: new Date() };
    const docRef = await db.collection(MODULES_COLLECTION).add(newModule);
    res.status(201).json({ id: docRef.id, ...newModule });
  } catch (error) {
    console.error("Erreur lors de l'ajout du module:", error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.getModules = async (req, res) => {
  try {
    const snapshot = await db.collection(MODULES_COLLECTION).get();
    const modules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(modules);
  } catch (error) {
    console.error("Erreur lors de la récupération des modules:", error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.deleteModule = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection(MODULES_COLLECTION).doc(id).delete();
    res.status(200).json({ message: 'Module supprimé' });
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
