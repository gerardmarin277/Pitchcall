const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes.js');
const teamRoutes = require('./routes/teamRoutes.js');

// Conectar a MongoDB Atlas
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.use('/api/teams', teamRoutes);

app.get('/', (req, res) => {
  res.json({ message: '¡Bienvenido a la API de PitchCall!' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});