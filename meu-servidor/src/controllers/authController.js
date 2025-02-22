const bcrypt = require('bcryptjs');
const { conectarAoBanco } = require('../config/dbConfig');
const jwt = require('jsonwebtoken');

const CHAVE_JWT = 'sua_chave_secreta'; // Em produção, use variáveis de ambiente!

const authController = {
    async registro(req, res) {
        try {
            const { nome, email, senha } = req.body;
            const db = await conectarAoBanco();
            const usuarios = db.collection('usuarios');

            // Verifica se o usuário já existe
            const usuarioExistente = await usuarios.findOne({ email });
            if (usuarioExistente) {
                return res.status(400).json({ mensagem: 'Email já cadastrado' });
            }

            // Criptografa a senha
            const senhaCriptografada = await bcrypt.hash(senha, 10);

            // Cria o novo usuário
            await usuarios.insertOne({
                nome,
                email,
                senha: senhaCriptografada,
                dataCriacao: new Date(),
                ultimoLogin: new Date()
            });

            res.status(201).json({ mensagem: 'Usuário criado com sucesso' });
        } catch (erro) {
            console.error(erro);
            res.status(500).json({ mensagem: 'Erro ao criar usuário' });
        }
    },

    async login(req, res) {
        try {
            const { email, senha } = req.body;
            const db = await conectarAoBanco();
            const usuarios = db.collection('usuarios');

            const usuario = await usuarios.findOne({ email });
            if (!usuario) {
                return res.status(401).json({ mensagem: 'Email ou senha inválidos' });
            }

            const senhaValida = await bcrypt.compare(senha, usuario.senha);
            if (!senhaValida) {
                return res.status(401).json({ mensagem: 'Email ou senha inválidos' });
            }

            // Atualiza último login
            await usuarios.updateOne(
                { _id: usuario._id },
                { $set: { ultimoLogin: new Date() } }
            );

            // Gera token JWT
            const token = jwt.sign(
                { id: usuario._id, email: usuario.email },
                CHAVE_JWT,
                { expiresIn: '24h' }
            );

            res.json({
                mensagem: 'Login realizado com sucesso',
                token,
                usuario: {
                    nome: usuario.nome,
                    email: usuario.email
                }
            });
        } catch (erro) {
            console.error(erro);
            res.status(500).json({ mensagem: 'Erro ao fazer login' });
        }
    }
};

module.exports = authController;