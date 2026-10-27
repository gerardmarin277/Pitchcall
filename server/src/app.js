const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes.js');
const teamRoutes = require('./routes/teamRoutes.js');
const eventRoutes = require('./routes/eventRoutes.js');
const responseRoutes = require('./routes/responseRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const { startEventCleanup } = require('./services/eventCleanup.js');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.use('/api/teams', teamRoutes);

app.use('/api/events', eventRoutes);

app.use('/api/responses', responseRoutes);

app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.json({ message: '¡Bienvenido a la API de PitchCall!' });
});

connectDB().then(() => {
  startEventCleanup();
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
});