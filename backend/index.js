const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/authRoutes');
const levelRoutes = require('./routes/levelRoutes');
const streamRoutes = require('./routes/streamRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const quizRoutes = require('./routes/quizRoutes');

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/streams', streamRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/quizzes', quizRoutes);
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Serveur backend lancé sur http://localhost:${PORT}`);
});
