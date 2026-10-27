const User = require('../models/User.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const register = async (req, res) => {
    try{
        const {name, email, password, role, dorsal} = req.body;

        const existingUser = await User.findOne({ email });

        if(existingUser){
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        //Cifrar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'player',
            dorsal
        });

        await newUser.save();

        res.status(201).json({ message: 'Usuario registrado correctamente con éxito.' });

    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor al registrar el usuario', error: error.message });
    }
};


const login = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const identifier = username || email;

        if (typeof identifier !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ message: 'Credenciales inválidas (usuario o contraseña incorrectos).' });
        }

        const user = await User.findOne({ email: identifier });

        if (!user) {
            return res.status(400).json({ message: 'Credenciales inválidas (usuario o contraseña incorrectos).' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas (usuario o contraseña incorrectos).' });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'clave_secreta_temporal',
            { expiresIn: '7d' }
        );


        res.json({
            message: 'Inicio de sesión exitoso',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor al iniciar sesión', error: error.message });
    }
}

module.exports = {register, login};