const jwt = require('jsonwebtoken');
const CHAVE_JWT = 'sua_chave_secreta'; // Use a mesma chave do controller

const verificarToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ mensagem: 'Token não fornecido' });
    }

    try {
        const decoded = jwt.verify(token, CHAVE_JWT);
        req.usuario = decoded;
        next();
    } catch (erro) {
        res.status(401).json({ mensagem: 'Token inválido' });
    }
};

module.exports = verificarToken; 