const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token de autenticación.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta_temporal');
        req.user = verified;
        next(); 
    } catch (error) {
        res.status(403).json({ message: 'Token inválido o expirado.' });
    }
};

const verifyCoach = (req, res, next) => {
    verifyToken(req, res, () => {
        if(req.user.role === 'coach') {
            next();
        } else {
            res.status(403).json({ message: 'Acceso denegado. Se requiere rol de Entrenador.' });
        }
    });
};


module.exports = { verifyToken, verifyCoach };