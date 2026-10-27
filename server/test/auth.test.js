const assert = require('node:assert/strict');
const test = require('node:test');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User.js');
const { login } = require('../src/controllers/authController.js');
const { teamUsers } = require('../src/data/teamUsers.js');

const invokeLogin = async (body) => {
    const response = {
        statusCode: 200,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(bodyValue) {
            this.body = bodyValue;
            return this;
        }
    };

    await login({ body }, response);
    return response;
};

test('team credentials authenticate, while invalid and legacy credentials behave correctly', async () => {
    const originalFindOne = User.findOne;
    const users = await Promise.all(teamUsers.map(async (user, index) => ({
        ...user,
        _id: `test-user-${index}`,
        email: user.username,
        plainPassword: user.password,
        password: await bcrypt.hash(user.password, 4)
    })));
    assert.equal(users.length, 23);

    User.findOne = async ({ email }) => users.find((user) => user.email === email);

    try {
        for (const expectedUser of users) {
            const response = await invokeLogin({
                username: expectedUser.username,
                password: expectedUser.plainPassword
            });

            assert.equal(response.statusCode, 200, expectedUser.username);
            assert.equal(response.body.user.name, expectedUser.name);
            assert.equal(response.body.user.role, expectedUser.role);
        }

        const invalidPasswordResponse = await invokeLogin({
            username: users[0].username,
            password: 'incorrecta'
        });
        assert.equal(invalidPasswordResponse.statusCode, 400);
        assert.match(invalidPasswordResponse.body.message, /Credenciales inválidas/);

        const missingCredentialsResponse = await invokeLogin({});
        assert.equal(missingCredentialsResponse.statusCode, 400);

        const legacyUser = {
            _id: 'legacy-user',
            name: 'Usuario anterior',
            email: 'legacy@example.com',
            role: 'player',
            password: await bcrypt.hash('password-anterior', 4)
        };
        const findUser = User.findOne;
        User.findOne = async ({ email }) => email === legacyUser.email
            ? legacyUser
            : users.find((user) => user.email === email);
        const legacyResponse = await invokeLogin({
            email: legacyUser.email,
            password: 'password-anterior'
        });
        User.findOne = findUser;

        assert.equal(legacyResponse.statusCode, 200);
        assert.equal(legacyResponse.body.user.email, legacyUser.email);
    } finally {
        User.findOne = originalFindOne;
    }
});
