const players = [
    { name: 'Lahcen', dorsal: 1 },
    { name: 'Josua', dorsal: 2 },
    { name: 'John', dorsal: 3 },
    { name: 'Hicham', dorsal: 4 },
    { name: 'Nacho', dorsal: 5 },
    { name: 'Luchas', dorsal: 6 },
    { name: 'Lukitas', dorsal: 7 },
    { name: 'Alejo', dorsal: 8 },
    { name: 'Bruno', dorsal: 9 },
    { name: 'Abuba', dorsal: 10 },
    { name: 'Angelo', dorsal: 11 },
    { name: 'Aitor', dorsal: 13 },
    { name: 'Fede', dorsal: 14 },
    { name: 'Ezequiel', dorsal: 16 },
    { name: 'Manolo', dorsal: 17 },
    { name: 'Joel', dorsal: 18 },
    { name: 'Gianni', dorsal: 19 },
    { name: 'Kevin', dorsal: 20 },
    { name: 'Miguel', dorsal: 21 },
    { name: 'Boxi', dorsal: 22 },
    { name: 'Gerard', dorsal: 23 },
    { name: 'Kevin F', dorsal: 24 }
];

const coach = { name: 'Jordi', role: 'coach' };

const getTeamCredentials = ({ name, dorsal }) => {
    const credentialBase = `${name}${dorsal || ''}`;
    return {
        username: `${credentialBase}-2026`,
        password: credentialBase
    };
};

const teamUsers = [
    ...players.map((player) => ({ ...player, role: 'player' })),
    coach
].map((user) => ({ ...user, ...getTeamCredentials(user) }));

module.exports = { teamUsers, getTeamCredentials };
