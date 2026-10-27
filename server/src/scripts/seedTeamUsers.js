require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User.js');
const { teamUsers } = require('../data/teamUsers.js');

const seedTeamUsers = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI no está configurado');
    }

    await mongoose.connect(process.env.MONGO_URI);

    for (const teamUser of teamUsers) {
        const { name, dorsal, role, username, password } = teamUser;
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.updateOne(
            { email: username },
            {
                $set: { name, dorsal, role, password: hashedPassword },
                $setOnInsert: { email: username }
            },
            { upsert: true }
        );
    }

    const accounts = await User.find({ email: { $in: teamUsers.map(({ username }) => username) } });
    if (accounts.length !== teamUsers.length) {
        throw new Error(`Se esperaban ${teamUsers.length} cuentas y se encontraron ${accounts.length}`);
    }

    for (const teamUser of teamUsers) {
        const account = accounts.find(({ email }) => email === teamUser.username);
        const validAccount = account
            && account.name === teamUser.name
            && account.role === teamUser.role
            && account.dorsal === teamUser.dorsal
            && await bcrypt.compare(teamUser.password, account.password);

        if (!validAccount) {
            throw new Error(`No se pudo verificar la cuenta ${teamUser.username}`);
        }
    }

    console.log(`Cuentas de equipo verificadas: ${accounts.length}`);
};

seedTeamUsers()
    .catch((error) => {
        console.error('Error al preparar las cuentas del equipo:', error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
