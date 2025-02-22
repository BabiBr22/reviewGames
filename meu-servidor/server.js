const express = require('express');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { conectarAoBanco } = require('./src/config/dbConfig');
const { inicializarBancoDeDados } = require('./src/config/dbInit');
const authController = require('./src/controllers/authController');
const gameRoutes = require('./src/routes/gameRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');

const app = express();
const port = 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configurar rotas
app.use('/api/games', gameRoutes);
app.post('/api/registro', authController.registro);
app.post('/api/login', authController.login);
app.use('/api/reviews', reviewRoutes);

// Rota para páginas HTML
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Algo deu errado!' });
});

// Iniciar servidor
async function iniciarServidor() {
    try {
        await inicializarBancoDeDados();
        app.listen(port, () => {
            console.log(`Servidor rodando em http://localhost:${port}`);
        });
    } catch (erro) {
        console.error('Erro ao iniciar servidor:', erro);
        process.exit(1);
    }
}

iniciarServidor();